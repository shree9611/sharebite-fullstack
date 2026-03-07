const Request = require("../models/Request");
const Donation = require("../models/Donation");
const User = require("../models/User");
const { donationWithCompatFields, pickUserLocation } = require("../utils/responseTransformers");

const formatRequestResponse = (req, requestDoc) => {
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

exports.createRequest = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!["receiver", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Only receiver can create request" });
  }

  if (!req.body?.donationId) {
    return res.status(400).json({ message: "donationId is required" });
  }

  const donation = await Donation.findById(req.body.donationId).select("_id status");
  if (!donation) {
    return res.status(404).json({ message: "Donation not found" });
  }
  if (donation.status && donation.status !== "available") {
    return res.status(400).json({ message: "Donation is not available for request" });
  }

  const receiver = await User.findById(req.user.id).select("locationName address city state");

  const createdRequest = await Request.create({
    donation: req.body.donationId,
    receiver: req.user.id,
    peopleCount: Number(req.body.peopleCount) || 1,
    foodPreference: req.body.foodPreference || "any",
    requestedLocation: req.body.requestedLocation || pickUserLocation(receiver),
    logistics: req.body.logistics || "pickup",
    deliveryAddress: req.body.deliveryAddress || req.body.requestedLocation || pickUserLocation(receiver),
    status: "pending",
  });

  const created = await Request.findById(createdRequest._id)
    .populate({
      path: "donation",
      populate: { path: "donor", select: "name email locationName address city state coordinates" },
    })
    .populate("receiver", "name email locationName address city state coordinates");

  return res.status(201).json(formatRequestResponse(req, created));
};

exports.getRequests = async (req, res) => {
  let query = {};

  if (req.user?.role === "receiver") {
    query = { receiver: req.user.id };
  } else if (req.user?.role === "donor") {
    const donations = await Donation.find({ donor: req.user.id }).select("_id");
    const donationIds = donations.map((item) => item._id);
    query = { donation: { $in: donationIds } };
  }

  const requests = await Request.find(query)
    .populate({
      path: "donation",
      populate: { path: "donor", select: "name email locationName address city state coordinates" },
    })
    .populate("receiver", "name email locationName address city state coordinates");

  const enriched = requests.map((item) => formatRequestResponse(req, item));

  return res.json(enriched);
};
