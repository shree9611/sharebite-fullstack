const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: "Request" },
  donation: { type: mongoose.Schema.Types.ObjectId, ref: "Donation" },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: Number,
  comment: String
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
