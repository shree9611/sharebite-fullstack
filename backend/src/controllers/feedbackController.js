const Feedback = require("../models/Feedback");
const Request = require("../models/Request");
const Donation = require("../models/Donation");
const { donationWithCompatFields } = require("../utils/responseTransformers");

const enrichFeedbackDonation = (req, feedbackDoc) => {
  const row = feedbackDoc?.toObject ? feedbackDoc.toObject() : { ...feedbackDoc };
  if (!row.donation) return row;

  return {
    ...row,
    donation: donationWithCompatFields(req, row.donation),
  };
};

exports.addFeedback = async (req, res) => {
  try {
    const requestId = req.body?.requestId || req.body?.request;
    if (!requestId) {
      return res.status(400).json({ message: "requestId is required" });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (String(request.receiver) !== String(req.user?.id)) {
      return res.status(403).json({ message: "Only the receiver can submit feedback for this request" });
    }

    const donation = await Donation.findById(request.donation).select("_id donor foodName image location");
    if (!donation) {
      return res.status(404).json({ message: "Donation not found for this request" });
    }

    const rating = Number(req.body.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be a number between 1 and 5" });
    }

    const fb = await Feedback.create({
      request: request._id,
      donation: donation._id,
      donor: donation.donor,
      receiver: request.receiver,
      rating,
      comment: req.body.comment || "",
    });

    return res.status(201).json(fb);
  } catch {
    return res.status(500).json({ message: "Failed to submit feedback" });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    let query = {};

    if (req.user?.role === "donor") {
      query = { donor: req.user.id };
    } else if (req.user?.role === "receiver") {
      query = { receiver: req.user.id };
    }

    const list = await Feedback.find(query)
      .populate("donation", "foodName image location")
      .populate("donor", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    return res.json(list.map((item) => enrichFeedbackDonation(req, item)));
  } catch {
    return res.status(500).json({ message: "Failed to fetch feedback" });
  }
};

exports.getCommunityFeedback = async (req, res) => {
  try {
    const list = await Feedback.find({})
      .populate("donation", "foodName image location")
      .populate("donor", "name")
      .populate("receiver", "name")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json(list.map((item) => enrichFeedbackDonation(req, item)));
  } catch {
    return res.status(500).json({ message: "Failed to fetch community feedback" });
  }
};
