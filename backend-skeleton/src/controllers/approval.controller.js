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
    await request.save();

    const donation = await Donation.findById(request.donationId);
    if (donation) {
      donation.status = "claimed";
      await donation.save();
    }

    eventBus.emit("request.updated", {
      receiverId: request.receiverId,
      requestId: request._id,
      status: "approved",
    });

    return res.json({ message: "Request approved.", request });
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

