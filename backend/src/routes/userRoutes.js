const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const upload = require("../middleware/uploadMiddleware");
const User = require("../models/User");
const Donation = require("../models/Donation");
const Request = require("../models/Request");
const ImageAsset = require("../models/ImageAsset");
const bcrypt = require("bcryptjs");
const { userWithCompatFields } = require("../utils/responseTransformers");

router.get("/profile", auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json(userWithCompatFields(req, user));
}));

router.patch("/profile", auth, upload.any(), asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const body = req.body || {};
  const fullName = String(body.fullName || body.name || "").trim();
  if (fullName) user.name = fullName;

  const phoneNumber = String(body.phoneNumber || body.phone || "").trim();
  if (phoneNumber) user.phone = phoneNumber;

  if (body.address !== undefined) user.address = String(body.address || "").trim();
  if (body.city !== undefined) user.city = String(body.city || "").trim();
  if (body.state !== undefined) user.state = String(body.state || "").trim();
  if (body.pincode !== undefined) user.pincode = String(body.pincode || "").trim();
  if (body.locationName !== undefined) user.locationName = String(body.locationName || "").trim();

  const avatarFile = req.file || (Array.isArray(req.files) ? req.files.find((f) => f?.fieldname === "avatar") : null);
  if (avatarFile?.buffer?.length) {
    const savedImage = await ImageAsset.create({
      filename: avatarFile.originalname || "",
      contentType: avatarFile.mimetype || "application/octet-stream",
      size: avatarFile.size || avatarFile.buffer.length,
      data: avatarFile.buffer,
    });
    user.profileImage = `/api/images/${savedImage._id}`;
  }

  await user.save();
  const updated = await User.findById(user._id).select("-password");
  return res.json(userWithCompatFields(req, updated));
}));

router.patch("/profile/password", auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const currentPassword = String(req.body?.currentPassword || "");
  const newPassword = String(req.body?.newPassword || "");
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "currentPassword and newPassword are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }
  if (!user.password || typeof user.password !== "string") {
    return res.status(400).json({ message: "Password cannot be changed for this account" });
  }
  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return res.json({ message: "Password changed successfully" });
}));

router.delete("/profile", auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await Request.deleteMany({ receiver: user._id });
  const donorDonations = await Donation.find({ donor: user._id }).select("_id");
  if (donorDonations.length > 0) {
    const donationIds = donorDonations.map((d) => d._id);
    await Request.deleteMany({ donation: { $in: donationIds } });
    await Donation.deleteMany({ _id: { $in: donationIds } });
  }

  await User.deleteOne({ _id: user._id });
  return res.json({ message: "Account deleted" });
}));

router.get("/", auth, asyncHandler(async (_req, res) => {
  const users = await User.find().select("_id name email role locationName city state");
  return res.json(users);
}));

module.exports = router;
