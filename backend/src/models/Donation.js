const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  foodName: String,
  // Optional client-facing fields (kept for compatibility with multiple frontends).
  foodTitle: { type: String, default: "" },
  quantity: Number,
  location: String,
  pickupLocation: { type: String, default: "" },
  expiryTime: Date,
  bestBefore: { type: String, default: "" },
  image: { type: String, default: "" },
  dietaryType: { type: String, default: "" },
  bakedType: { type: String, default: "" },
  status: { type: String, default: "available" }
});

module.exports = mongoose.model("Donation", donationSchema);
