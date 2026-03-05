const { Donation } = require("../models/donation.model");
const { Request } = require("../models/request.model");
const { User } = require("../models/user.model");
const { eventBus } = require("../events/bus");

const normalizeStatus = (value) => String(value || "").trim().toLowerCase();

const getDonorOwnedPendingRequest = async (requestId, donorId) => {
  const request = await Request.findById(requestId);
  if (!request) return { error: { code: 404, message: "Request not found." } };
  if (String(request.donorId) !== String(donorId)) {
    return { error: { code: 403, message: "Not allowed." } };
  }
  if (normalizeStatus(request.status) !== "pending") {
    return { error: { code: 400, message: "Only pending request can be updated." } };
  }
  return { request };
};

async function approveRequest(req, res) {
  try {
    if (req.user.role !== "donor") {
      return res.status(403).json({ message: "Only donor can approve request." });
    }

    const { requestId } = req.params;
    const { request, error: requestError } = await getDonorOwnedPendingRequest(requestId, req.user.id);
    if (requestError) {
      return res.status(requestError.code).json({ message: requestError.message });
    }

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

    const allocatedDonation = await Donation.findOneAndUpdate(
      {
        _id: donation._id,
        status: "active",
        quantity: { $gte: requestedQty },
      },
      { $inc: { quantity: -requestedQty } },
      { new: true }
    );
    if (!allocatedDonation) {
      return res.status(400).json({ message: "Requested quantity is no longer available." });
    }

    if (allocatedDonation.quantity <= 0 && allocatedDonation.status !== "claimed") {
      allocatedDonation.status = "claimed";
      await allocatedDonation.save();
    }

    request.status = "approved";
    if (request.logistics === "delivery" && request.deliveryStatus === "not_applicable") {
      request.deliveryStatus = "unassigned";
    }
    await request.save();

    eventBus.emit("request.updated", {
      receiverId: request.receiverId,
      requestId: request._id,
      status: "approved",
    });

    if (request.logistics === "delivery") {
      const donor = await User.findById(request.donorId).select("city state").lean();
      const coordinates = Array.isArray(donation.location?.coordinates)
        ? donation.location.coordinates
        : [];
      eventBus.emit("delivery.request.approved", {
        donorId: request.donorId,
        receiverId: request.receiverId,
        requestId: request._id,
        donationId: allocatedDonation._id,
        city: donor?.city || "",
        state: donor?.state || "",
        lng: coordinates[0],
        lat: coordinates[1],
      });
    }

    return res.status(200).json({
      message: "Request approved.",
      request: {
        _id: request._id,
        status: request.status,
        deliveryStatus: request.deliveryStatus,
      },
      donation: {
        _id: allocatedDonation._id,
        quantity: allocatedDonation.quantity,
        status: allocatedDonation.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error?.message || "Failed to approve request." });
  }
}

async function declineRequest(req, res) {
  try {
    if (req.user.role !== "donor") {
      return res.status(403).json({ message: "Only donor can decline request." });
    }

    const { requestId } = req.params;
    const { request, error: requestError } = await getDonorOwnedPendingRequest(requestId, req.user.id);
    if (requestError) {
      return res.status(requestError.code).json({ message: requestError.message });
    }

    request.status = "declined";
    await request.save();

    eventBus.emit("request.updated", {
      receiverId: request.receiverId,
      requestId: request._id,
      status: "declined",
    });

    return res.status(200).json({
      message: "Request rejected.",
      request: {
        _id: request._id,
        status: request.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error?.message || "Failed to reject request." });
  }
}

module.exports = {
  approveRequest,
  declineRequest,
};
