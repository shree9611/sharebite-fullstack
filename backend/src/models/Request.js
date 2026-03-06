const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  donation: { type: mongoose.Schema.Types.ObjectId, ref: "Donation" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  peopleCount: { type: Number, default: 1 },
  foodPreference: {
    type: String,
    enum: ["veg", "non-veg", "any"],
    default: "any",
  },
  requestedLocation: { type: String, default: "" },
  logistics: { type: String, enum: ["pickup", "delivery"], default: "pickup" },
  deliveryAddress: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "approved", "declined", "completed"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);
