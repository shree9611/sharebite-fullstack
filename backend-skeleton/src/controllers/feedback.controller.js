const { Feedback } = require("../models/feedback.model");
const { Request } = require("../models/request.model");
const { eventBus } = require("../events/bus");

async function createFeedback(req, res) {
  try {
    if (req.user.role !== "receiver") {
      return res.status(403).json({ message: "Only receiver can submit feedback." });
    }

    const { requestId, rating, comment } = req.body;
    const stars = Number(rating);
    if (!requestId) return res.status(400).json({ message: "requestId is required" });
    if (!stars || stars < 1 || stars > 5) return res.status(400).json({ message: "Valid rating is required" });

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found." });
    if (String(request.receiverId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed." });
    }
    if (!["approved", "completed"].includes(request.status)) {
      return res.status(400).json({ message: "Feedback allowed only for approved/completed requests." });
    }

    const feedback = await Feedback.create({
      requestId: request._id,
      donationId: request.donationId,
      donorId: request.donorId,
      receiverId: request.receiverId,
      rating: stars,
      comment: comment || "",
      photo: "",
    });

    eventBus.emit("feedback.created", {
      donorId: request.donorId,
      feedbackId: feedback._id,
    });

    return res.status(201).json(feedback);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to submit feedback." });
  }
}

async function listFeedback(req, res) {
  try {
    const filter = req.user.role === "donor" ? { donorId: req.user.id } : {};
    const rows = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load feedback." });
  }
}

module.exports = {
  createFeedback,
  listFeedback,
};

