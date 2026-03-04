const { Donation } = require("../models/donation.model");
const { Request } = require("../models/request.model");
const { eventBus } = require("../events/bus");
const SAFE_DATA_IMAGE_RE = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i;
const REQUEST_STATUS_VALUES = new Set(["pending", "approved", "declined", "completed"]);

const normalizeRequestStatus = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return REQUEST_STATUS_VALUES.has(normalized) ? normalized : "pending";
};

function toAbsoluteImageUrl(req, imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  if (imagePath.startsWith("data:")) return SAFE_DATA_IMAGE_RE.test(imagePath) ? imagePath : "";
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
      donationFoodName: donation.foodName || "",
      donationImage: donation.image || "",
      donationOriginalQuantity: Number(donation.quantity || 0),
      peopleCount: qty,
      requestedLocation: requestedLocation || "",
      logistics: logistics || "pickup",
      deliveryAddress: deliveryAddress || "",
      deliveryStatus: (logistics || "pickup") === "delivery" ? "unassigned" : "not_applicable",
      foodPreference: foodPreference || "any",
      status: "pending",
    });

    eventBus.emit("request.created", {
      donorId: donation.donorId,
      requestId: request._id,
      foodName: donation.foodName,
      logistics: request.logistics,
      donationId: donation._id,
    });

    return res.status(201).json(request);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to create request." });
  }
}

async function listRequests(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const role = String(req.user?.role || "").toLowerCase();
    let query = {};
    if (role === "donor") {
      query = { donorId: req.user.id };
    } else if (role === "receiver") {
      query = { receiverId: req.user.id };
    } else if (role === "admin") {
      // Volunteers (admin role) should see active delivery missions.
      query = {
        logistics: "delivery",
        status: { $in: ["approved", "completed"] },
        deliveryStatus: { $in: ["unassigned", "accepted", "picked_up"] },
      };
    } else {
      return res.status(403).json({ message: "Not authorized to view requests." });
    }

    const statusParam = req.query?.status;
    const rawStatusFilter = String(Array.isArray(statusParam) ? statusParam.join(",") : statusParam || "")
      .trim()
      .toLowerCase();
    if (rawStatusFilter) {
      const statusValues = rawStatusFilter
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter((value) => REQUEST_STATUS_VALUES.has(value));
      if (statusValues.length > 0) {
        const regexes = statusValues.map((value) => new RegExp(`^${value}$`, "i"));
        query.status = regexes.length === 1 ? regexes[0] : { $in: regexes };
      }
    }

    const limitParam = Array.isArray(req.query?.limit) ? req.query.limit[0] : req.query?.limit;
    const requestedLimit = Number(limitParam);
    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(Math.floor(requestedLimit), 200)
        : 100;

    let requestQuery = Request.find(query)
      .maxTimeMS(8000)
      .populate("donationId", "foodName quantity locationText image")
      .populate("donorId", "name email phone")
      .populate("receiverId", "name email phone")
      .populate("volunteerId", "name email phone")
      .sort({ updatedAt: -1 });
    requestQuery = requestQuery.limit(limit);
    const rows = await requestQuery.lean();
    if (!rows || rows.length === 0) {
      return res.json([]);
    }

    const payload = rows.map((row) => ({
      _id: row._id,
      status: normalizeRequestStatus(row.status),
      peopleCount: row.peopleCount,
      foodPreference: row.foodPreference,
      requestedLocation: row.requestedLocation,
      logistics: row.logistics,
      deliveryAddress: row.deliveryAddress,
      deliveryStatus: row.deliveryStatus || "not_applicable",
      volunteer: row.volunteerId
        ? {
            _id: row.volunteerId._id,
            name: row.volunteerId.name,
            email: row.volunteerId.email,
            phone: row.volunteerId.phone || "",
          }
        : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      donationImage: toAbsoluteImageUrl(req, row?.donationId?.image || row.donationImage || ""),
      donationImageUrl: toAbsoluteImageUrl(req, row?.donationId?.image || row.donationImage || ""),
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
            image: toAbsoluteImageUrl(req, row.donationId.image),
            imageUrl: toAbsoluteImageUrl(req, row.donationId.image),
          }
        : {
            _id: row.donationId || row.donationId?._id || null,
            foodName: row.donationFoodName || "Food",
            quantity: Number(row.donationOriginalQuantity || 0),
            location: "",
            image: toAbsoluteImageUrl(req, row.donationImage || ""),
            imageUrl: toAbsoluteImageUrl(req, row.donationImage || ""),
          },
    }));

    return res.json(payload || []);
  } catch (error) {
    const message = error?.message || "Failed to list requests.";
    const isTimeout =
      error?.name === "MongooseError" ||
      error?.name === "MongoServerError" ||
      /timed out|maxTimeMS/i.test(message);
    if (isTimeout && /timed out|maxTimeMS/i.test(message)) {
      return res.status(503).json({ message: "Request query timed out. Please retry." });
    }
    return res.status(500).json({ message });
  }
}

async function acceptMission(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only volunteer can accept mission." });
    }

    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Mission not found." });
    if (request.logistics !== "delivery") {
      return res.status(400).json({ message: "Only delivery requests are missions." });
    }
    if (!["approved", "completed"].includes(request.status)) {
      return res.status(400).json({ message: "Mission can be accepted only after donor approval." });
    }
    if (request.deliveryStatus === "delivered") {
      return res.status(400).json({ message: "Mission already delivered." });
    }
    if (request.volunteerId && String(request.volunteerId) !== String(req.user.id)) {
      return res.status(400).json({ message: "Mission already accepted by another volunteer." });
    }

    request.volunteerId = req.user.id;
    request.deliveryStatus = "accepted";
    await request.save();

    eventBus.emit("mission.accepted", {
      requestId: request._id,
      donorId: request.donorId,
      receiverId: request.receiverId,
      volunteerId: req.user.id,
    });

    return res.json({ message: "Mission accepted successfully.", request });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to accept mission." });
  }
}

async function completeMission(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only volunteer can confirm delivery." });
    }

    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Mission not found." });
    if (request.logistics !== "delivery") {
      return res.status(400).json({ message: "Only delivery requests can be completed." });
    }
    if (!["approved", "completed"].includes(request.status)) {
      return res.status(400).json({ message: "Mission can be completed only after donor approval." });
    }
    if (request.deliveryStatus === "delivered") {
      return res.status(400).json({ message: "Mission already delivered." });
    }
    if (!request.volunteerId || String(request.volunteerId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only assigned volunteer can confirm this delivery." });
    }

    const donation = await Donation.findById(request.donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found." });
    }

    request.status = "completed";
    request.deliveryStatus = "delivered";
    donation.status = Number(donation.quantity || 0) > 0 ? "active" : "delivered";

    await Promise.all([request.save(), donation.save()]);

    eventBus.emit("mission.delivered", {
      requestId: request._id,
      donorId: request.donorId,
      receiverId: request.receiverId,
      volunteerId: req.user.id,
    });

    return res.json({
      message: "Delivery confirmed successfully.",
      request,
      donation: {
        _id: donation._id,
        status: donation.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to confirm delivery." });
  }
}

module.exports = {
  createRequest,
  listRequests,
  acceptMission,
  completeMission,
};
