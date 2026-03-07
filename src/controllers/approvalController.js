const Request = require("../models/Request");
const { donationWithCompatFields, pickUserLocation } = require("../utils/responseTransformers");

const buildApprovalResponse = (req, requestDoc) => {
  const request = requestDoc?.toObject ? requestDoc.toObject() : { ...requestDoc };
  const donation = request.donation ? donationWithCompatFields(req, request.donation) : null;

  return {
    ...request,
    donation,
    donorLocation: donation?.location || pickUserLocation(donation?.donor) || "",
    receiverLocation:
      request.requestedLocation ||
      request.deliveryAddress ||
      pickUserLocation(request.receiver) ||
      "",
  };
};

const canModerateRequest = (requestDoc, user) => {
  if (!user?.id) return false;
  if (user.role === "admin") return true;
  if (user.role !== "donor") return false;
  return String(requestDoc?.donation?.donor?._id || requestDoc?.donation?.donor) === String(user.id);
};

const updateRequestStatus = async (req, res, nextStatus) => {
  const requestDoc = await Request.findById(req.params.id)
    .populate({
      path: "donation",
      populate: { path: "donor", select: "name email locationName address city state coordinates" },
    })
    .populate("receiver", "name email locationName address city state coordinates");

  if (!requestDoc) {
    return res.status(404).json({ message: "Request not found" });
  }

  if (!canModerateRequest(requestDoc, req.user)) {
    return res.status(403).json({ message: "Not allowed to approve/decline this request" });
  }

  if (requestDoc.status === "completed") {
    return res.status(400).json({ message: "Completed request cannot be modified" });
  }

  requestDoc.status = nextStatus;
  await requestDoc.save();

  const refreshed = await Request.findById(requestDoc._id)
    .populate({
      path: "donation",
      populate: { path: "donor", select: "name email locationName address city state coordinates" },
    })
    .populate("receiver", "name email locationName address city state coordinates");

  return res.json(buildApprovalResponse(req, refreshed));
};

exports.approveRequest = async (req, res) => {
  return updateRequestStatus(req, res, "approved");
};

exports.declineRequest = async (req, res) => {
  return updateRequestStatus(req, res, "declined");
};
