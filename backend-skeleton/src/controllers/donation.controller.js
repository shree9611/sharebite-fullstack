const { Donation } = require("../models/donation.model");
const { eventBus } = require("../events/bus");

function toAbsoluteImageUrl(req, imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.get("host");
  if (!host) return imagePath;
  return `${proto}://${host}${imagePath}`;
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

    const donation = await Donation.create({
      donorId: req.user.id,
      foodName,
      quantity: qty,
      locationText: location || "",
      location: Number.isFinite(lat) && Number.isFinite(lng)
        ? { type: "Point", coordinates: [lng, lat] }
        : { type: "Point", coordinates: [0, 0] },
      image: req.file ? `/uploads/${req.file.filename}` : "",
      expiryTime: new Date(expiryTime),
      status: "active",
    });

    eventBus.emit("donation.created", {
      donationId: donation._id,
      foodName: donation.foodName,
      lng,
      lat,
    });

    return res.status(201).json({
      ...donation.toObject(),
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
      expiryTime: { $gte: now },
    })
      .sort({ createdAt: -1 })
      .lean();

    const payload = items.map((item) => ({
      _id: item._id,
      donorId: item.donorId,
      foodName: item.foodName,
      quantity: item.quantity,
      location: item.locationText,
      image: item.image,
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

module.exports = {
  createDonation,
  listDonations,
};
