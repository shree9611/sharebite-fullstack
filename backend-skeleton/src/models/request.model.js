const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", required: true },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    peopleCount: { type: Number, required: true, min: 1 },
    foodPreference: { type: String, default: "any" },
    requestedLocation: { type: String, default: "" },
    logistics: { type: String, enum: ["pickup", "delivery"], default: "pickup" },
    deliveryAddress: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "declined", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);
module.exports = { Request };
