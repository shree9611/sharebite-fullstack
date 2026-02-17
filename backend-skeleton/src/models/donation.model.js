const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    foodName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    locationText: { type: String, default: "" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },
    image: { type: String, default: "" },
    expiryTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "claimed", "expired"],
      default: "active",
    },
  },
  { timestamps: true }
);

donationSchema.index({ location: "2dsphere" });

const Donation = mongoose.model("Donation", donationSchema);
module.exports = { Donation };

