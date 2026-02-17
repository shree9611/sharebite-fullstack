const { Donation } = require("../models/donation.model");
const { Request } = require("../models/request.model");
const { eventBus } = require("../events/bus");

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
    const query = req.user.role === "donor" ? { donorId: req.user.id } : { receiverId: req.user.id };

    const rows = await Request.find(query)
      .populate("donationId", "foodName quantity locationText image")
      .sort({ updatedAt: -1 })
      .lean();

    const payload = rows.map((row) => ({
      _id: row._id,
      status: row.status,
      peopleCount: row.peopleCount,
      requestedLocation: row.requestedLocation,
      logistics: row.logistics,
      deliveryAddress: row.deliveryAddress,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      donation: row.donationId
        ? {
            _id: row.donationId._id,
            foodName: row.donationId.foodName,
            quantity: row.donationId.quantity,
            location: row.donationId.locationText,
            image: row.donationId.image,
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

