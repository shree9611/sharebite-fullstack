const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  foodName: String,
  quantity: Number,
  location: String,
  expiryTime: Date,
  image: { type: String, default: "" },
  status: { type: String, default: "available" }
});

module.exports = mongoose.model("Donation", donationSchema);
