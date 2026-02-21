const { Donation } = require("../models/donation.model");
const { Request } = require("../models/request.model");
const { eventBus } = require("../events/bus");

async function approveRequest(req, res) {
  try {
    if (req.user.role !== "donor") {
      return res.status(403).json({ message: "Only donor can approve request." });
    }

    const { requestId } = req.params;
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found." });
    if (String(request.donorId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed." });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending request can be approved." });
    }

    request.status = "approved";
    const donation = await Donation.findById(request.donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found." });
    }
    if (donation.status !== "active") {
      return res.status(400).json({ message: "Donation is no longer active." });
    }

    const requestedQty = Number(request.peopleCount);
    if (!Number.isFinite(requestedQty) || requestedQty <= 0) {
      return res.status(400).json({ message: "Invalid requested quantity." });
    }
    if (requestedQty > donation.quantity) {
      return res.status(400).json({ message: "Requested quantity exceeds remaining donation quantity." });
    }

    donation.quantity = donation.quantity - requestedQty;
    donation.status = donation.quantity > 0 ? "active" : "claimed";

    await donation.save();
    await request.save();

    eventBus.emit("request.updated", {
      receiverId: request.receiverId,
      requestId: request._id,
      status: "approved",
    });

    return res.json({
      message: donation.status === "active"
        ? `Request approved. ${donation.quantity} portions still available.`
        : "Request approved. Donation fully claimed.",
      request,
      donation: {
        _id: donation._id,
        quantity: donation.quantity,
        status: donation.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to approve request." });
  }
}

async function declineRequest(req, res) {
  try {
    if (req.user.role !== "donor") {
      return res.status(403).json({ message: "Only donor can decline request." });
    }

    const { requestId } = req.params;
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found." });
    if (String(request.donorId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed." });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending request can be declined." });
    }

    request.status = "declined";
    await request.save();

    eventBus.emit("request.updated", {
      receiverId: request.receiverId,
      requestId: request._id,
      status: "declined",
    });

    return res.json({ message: "Request declined.", request });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to decline request." });
  }
}

module.exports = {
  approveRequest,
  declineRequest,
};
