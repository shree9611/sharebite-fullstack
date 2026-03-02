const { Donation } = require("../models/donation.model");
const { User } = require("../models/user.model");
const { eventBus } = require("../events/bus");
const SAFE_DATA_IMAGE_RE = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i;

function toAbsoluteImageUrl(req, imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  if (imagePath.startsWith("data:")) {
    return SAFE_DATA_IMAGE_RE.test(imagePath) ? imagePath : "";
  }
  const normalizedPath = imagePath.startsWith("/")
    ? imagePath
    : `/${String(imagePath).replace(/^\/+/, "")}`;
  const forwardedHost = req.headers["x-forwarded-host"];
  const host =
    (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ||
    req.get("host");
  if (!host) return normalizedPath;
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto =
    process.env.NODE_ENV === "production"
      ? "https"
      : (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) || req.protocol || "http";
  return `${proto}://${host}${encodeURI(normalizedPath)}`;
}

function buildImageValue(file) {
  if (!file) return "";
  if (file.buffer && file.mimetype && file.mimetype.startsWith("image/")) {
    const base64 = file.buffer.toString("base64");
    return `data:${file.mimetype};base64,${base64}`;
  }
  if (file.path) {
    const normalizedPath = String(file.path).replace(/\\/g, "/");
    const marker = "/uploads/";
    const markerIndex = normalizedPath.lastIndexOf(marker);
    if (markerIndex >= 0) {
      return normalizedPath.slice(markerIndex);
    }
    return `/uploads/donations/${file.filename}`;
  }
  return "";
}

async function createDonation(req, res) {
  try {
    if (req.user.role !== "donor") {
      return res.status(403).json({ message: "Only donor can create donation." });
    }

    const { foodName, quantity, location, expiryTime, latitude, longitude } = req.body;
    const qty = Number(quantity);
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!foodName || !qty || qty < 1 || !expiryTime) {
      return res.status(400).json({ message: "foodName, quantity, expiryTime are required." });
    }

    // Prevent accidental double-click submit: block only near-identical payloads in a short window.
    const duplicateWindowMs = 4000;
    const recentCutoff = new Date(Date.now() - duplicateWindowMs);
    const recentDuplicate = await Donation.findOne({
      donorId: req.user.id,
      foodName: String(foodName || "").trim(),
      quantity: qty,
      locationText: String(location || "").trim(),
      expiryTime: new Date(expiryTime),
      createdAt: { $gte: recentCutoff },
    }).lean();
    if (recentDuplicate) {
      return res.status(429).json({
        message: "Looks like a duplicate click. Please wait a few seconds before submitting again.",
      });
    }

    const donation = await Donation.create({
      donorId: req.user.id,
      foodName,
      quantity: qty,
      locationText: location || "",
      location: Number.isFinite(lat) && Number.isFinite(lng)
        ? { type: "Point", coordinates: [lng, lat] }
        : { type: "Point", coordinates: [0, 0] },
      image: buildImageValue(req.file),
      expiryTime: new Date(expiryTime),
      status: "active",
    });
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalDonationsCount: 1 } }).catch(() => null);

    eventBus.emit("donation.created", {
      donationId: donation._id,
      foodName: donation.foodName,
      lng,
      lat,
    });

    return res.status(201).json({
      ...donation.toObject(),
      image: toAbsoluteImageUrl(req, donation.image),
      imageUrl: toAbsoluteImageUrl(req, donation.image),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to create donation." });
  }
}

async function listDonations(req, res) {
  try {
    const now = new Date();
    const items = await Donation.find({
      status: "active",
      quantity: { $gt: 0 },
      expiryTime: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .lean();

    const payload = items.map((item) => ({
      _id: item._id,
      donorId: item.donorId,
      foodName: item.foodName,
      quantity: item.quantity,
      location: item.locationText,
      image: toAbsoluteImageUrl(req, item.image),
      imageUrl: toAbsoluteImageUrl(req, item.image),
      latitude: item.location?.coordinates?.[1],
      longitude: item.location?.coordinates?.[0],
      status: item.status,
      createdAt: item.createdAt,
      expiryTime: item.expiryTime,
    }));

    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load donations." });
  }
}

async function listMyDonations(req, res) {
  try {
    if (req.user.role !== "donor") {
      return res.status(403).json({ message: "Only donor can view own donations." });
    }

    const items = await Donation.find({ donorId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const payload = items.map((item) => ({
      _id: item._id,
      donorId: item.donorId,
      foodName: item.foodName,
      quantity: item.quantity,
      location: item.locationText,
      image: toAbsoluteImageUrl(req, item.image),
      imageUrl: toAbsoluteImageUrl(req, item.image),
      latitude: item.location?.coordinates?.[1],
      longitude: item.location?.coordinates?.[0],
      status: item.status,
      createdAt: item.createdAt,
      expiryTime: item.expiryTime,
    }));

    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load donor donations." });
  }
}

module.exports = {
  createDonation,
  listDonations,
  listMyDonations,
};
