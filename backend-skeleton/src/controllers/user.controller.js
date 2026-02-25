const crypto = require("crypto");
const { User } = require("../models/user.model");
const { Request } = require("../models/request.model");
const { Feedback } = require("../models/feedback.model");

const hashPassword = (password, salt) => crypto.scryptSync(password, salt, 64).toString("hex");

const createPasswordHash = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);
  return `${salt}:${hash}`;
};

const verifyPassword = (password, combinedHash) => {
  const [salt, storedHash] = String(combinedHash || "").split(":");
  if (!salt || !storedHash) return false;
  const calculatedHash = hashPassword(password, salt);
  const a = Buffer.from(storedHash, "hex");
  const b = Buffer.from(calculatedHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

const toAbsoluteImageUrl = (req, imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  if (imagePath.startsWith("/")) {
    const host = req.get("host");
    if (!host) return imagePath;
    const forwardedProto = req.headers["x-forwarded-proto"];
    const proto =
      process.env.NODE_ENV === "production"
        ? "https"
        : (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) || req.protocol || "http";
    return `${proto}://${host}${encodeURI(imagePath)}`;
  }
  return imagePath;
};

const toAvatarPath = (file) => {
  if (!file?.path) return "";
  const normalizedPath = String(file.path).replace(/\\/g, "/");
  const marker = "/uploads/";
  const markerIndex = normalizedPath.lastIndexOf(marker);
  if (markerIndex >= 0) return normalizedPath.slice(markerIndex);
  return `/uploads/profiles/${file.filename}`;
};

async function getCurrentUserProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: "User not found." });

    const role = String(user.role || "");
    const profile = {
      id: String(user._id),
      fullName: user.name || "",
      email: user.email || "",
      phoneNumber: user.phone || "",
      address: user.address || "",
      accountType: role === "admin" ? "Volunteer" : role === "donor" ? "Donor" : "Receiver",
      city: user.city || "",
      state: user.state || "",
      userId: String(user._id),
      profileImage: user.avatar || "",
      profileImageUrl: toAbsoluteImageUrl(req, user.avatar || ""),
      organizationName: user.organizationName || "",
      foodTypeUsuallyDonated: user.foodTypeUsuallyDonated || "",
      totalDonationsCount: Number(user.totalDonationsCount || 0),
      donorRating: Number(user.donorRating || 0),
      receiverOrganizationName: user.receiverOrganizationName || "",
      peopleServed: Number(user.peopleServed || 0),
      totalFoodReceived: Number(user.totalFoodReceived || 0),
      receiverRating: Number(user.receiverRating || 0),
    };

    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load profile." });
  }
}

async function updateCurrentUserProfile(req, res) {
  try {
    const patch = req.body || {};
    const update = {
      name: patch.fullName ?? patch.name ?? undefined,
      phone: patch.phoneNumber ?? patch.phone ?? undefined,
      address: patch.address ?? undefined,
      city: patch.city ?? undefined,
      state: patch.state ?? undefined,
      organizationName: patch.organizationName ?? undefined,
      foodTypeUsuallyDonated: patch.foodTypeUsuallyDonated ?? undefined,
      receiverOrganizationName: patch.receiverOrganizationName ?? undefined,
      peopleServed: Number.isFinite(Number(patch.peopleServed)) ? Number(patch.peopleServed) : undefined,
      totalFoodReceived: Number.isFinite(Number(patch.totalFoodReceived)) ? Number(patch.totalFoodReceived) : undefined,
    };

    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

    if (req.file) {
      update.avatar = toAvatarPath(req.file);
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).lean();
    if (!user) return res.status(404).json({ message: "User not found." });

    return res.json({
      message: "Profile updated successfully.",
      profileImage: user.avatar || "",
      profileImageUrl: toAbsoluteImageUrl(req, user.avatar || ""),
      fullName: user.name || "",
      phoneNumber: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      organizationName: user.organizationName || "",
      foodTypeUsuallyDonated: user.foodTypeUsuallyDonated || "",
      receiverOrganizationName: user.receiverOrganizationName || "",
      peopleServed: Number(user.peopleServed || 0),
      totalFoodReceived: Number(user.totalFoodReceived || 0),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update profile." });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ message: "Current password and valid new password are required." });
    }

    const user = await User.findById(req.user.id).select("+passwordHash");
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!verifyPassword(String(currentPassword), user.passwordHash)) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    user.passwordHash = createPasswordHash(String(newPassword));
    await user.save();

    return res.json({ message: "Password changed successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to change password." });
  }
}

async function deleteAccount(req, res) {
  try {
    await Promise.all([
      Request.deleteMany({ $or: [{ donorId: req.user.id }, { receiverId: req.user.id }, { volunteerId: req.user.id }] }),
      Feedback.deleteMany({ $or: [{ donorId: req.user.id }, { receiverId: req.user.id }] }),
      User.findByIdAndDelete(req.user.id),
    ]);
    return res.json({ message: "Account deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to delete account." });
  }
}

module.exports = {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  changePassword,
  deleteAccount,
};
