const { Donation } = require("../models/donation.model");
const { Request } = require("../models/request.model");
const { eventBus } = require("../events/bus");
const SAFE_DATA_IMAGE_RE = /^data:image\/(jpeg|jpg|png|webp);base64,/i;

function toAbsoluteImageUrl(req, imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  if (imagePath.startsWith("data:")) return SAFE_DATA_IMAGE_RE.test(imagePath) ? imagePath : "";
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto =
    process.env.NODE_ENV === "production"
      ? "https"
      : (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) || req.protocol || "http";
  const host = req.get("host");
  if (!host) return imagePath;
  return `${proto}://${host}${encodeURI(imagePath)}`;
}

async function createRequest(req, res) {
  try {
    if (req.user.role !== "receiver") {
      return res.status(403).json({ message: "Only receiver can request donation." });
    }

    const { donationId, peopleCount, requestedLocation, logistics, deliveryAddress, foodPreference } = req.body;
    const qty = Number(peopleCount);
    if (!donationId || !qty || qty < 1) {
      return res.status(400).json({ message: "donationId and valid peopleCount are required." });
    }

    const donation = await Donation.findById(donationId);
    if (!donation || donation.status !== "active") {
      return res.status(404).json({ message: "Donation not available." });
    }
    if (qty > donation.quantity) {
      return res.status(400).json({ message: "Requested quantity exceeds available quantity." });
    }

    const request = await Request.create({
      donationId: donation._id,
      donorId: donation.donorId,
      receiverId: req.user.id,
      peopleCount: qty,
      requestedLocation: requestedLocation || "",
      logistics: logistics || "pickup",
      deliveryAddress: deliveryAddress || "",
      foodPreference: foodPreference || "any",
      status: "pending",
    });

    eventBus.emit("request.created", {
      donorId: donation.donorId,
      requestId: request._id,
      foodName: donation.foodName,
    });

    return res.status(201).json(request);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to create request." });
  }
}

async function listRequests(req, res) {
  try {
    let query = {};
    if (req.user.role === "donor") {
      query = { donorId: req.user.id };
    } else if (req.user.role === "receiver") {
      query = { receiverId: req.user.id };
    } else if (req.user.role === "admin") {
      // Volunteers (admin role) should see active delivery missions.
      query = {
        logistics: "delivery",
        status: { $in: ["pending", "approved"] },
      };
    } else {
      return res.status(403).json({ message: "Not authorized to view requests." });
    }

    const rows = await Request.find(query)
      .populate("donationId", "foodName quantity locationText image")
      .populate("donorId", "name email phone")
      .populate("receiverId", "name email phone")
      .sort({ updatedAt: -1 })
      .lean();

    const payload = rows.map((row) => ({
      _id: row._id,
      status: row.status,
      peopleCount: row.peopleCount,
      foodPreference: row.foodPreference,
      requestedLocation: row.requestedLocation,
      logistics: row.logistics,
      deliveryAddress: row.deliveryAddress,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      donor: row.donorId
        ? {
            _id: row.donorId._id,
            name: row.donorId.name,
            email: row.donorId.email,
            phone: row.donorId.phone || "",
          }
        : null,
      receiver: row.receiverId
        ? {
            _id: row.receiverId._id,
            name: row.receiverId.name,
            email: row.receiverId.email,
            phone: row.receiverId.phone || "",
          }
        : null,
      donation: row.donationId
        ? {
            _id: row.donationId._id,
            foodName: row.donationId.foodName,
            quantity: row.donationId.quantity,
            location: row.donationId.locationText,
            image: row.donationId.image,
            imageUrl: toAbsoluteImageUrl(req, row.donationId.image),
          }
        : null,
    }));

    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to list requests." });
  }
}

module.exports = {
  createRequest,
  listRequests,
};
