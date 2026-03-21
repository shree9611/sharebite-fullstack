const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    foodName: String,
    // Optional client-facing fields (kept for compatibility with multiple frontends).
    foodTitle: { type: String, default: "" },
    quantity: Number,
    quantityRemaining: { type: Number, default: null },
    location: String,
    pickupLocation: { type: String, default: "" },
    expiryTime: Date,
    bestBefore: { type: String, default: "" },
    image: { type: String, default: "" },
    dietaryType: { type: String, default: "" },
    bakedType: { type: String, default: "" },
    status: { type: String, default: "available" },
  },
  { timestamps: true }
);

donationSchema.pre("validate", function syncRemainingQuantity() {
  const total = Number(this.quantity);
  const remainingRaw = this.quantityRemaining;
  const hasRemaining = Number.isFinite(Number(remainingRaw));
  if (!hasRemaining) {
    this.quantityRemaining = Number.isFinite(total) ? total : null;
    return;
  }
  const remaining = Number(remainingRaw);
  if (Number.isFinite(total)) {
    this.quantityRemaining = Math.max(0, Math.min(remaining, total));
  } else {
    this.quantityRemaining = Math.max(0, remaining);
  }
  return;
});

module.exports = mongoose.model("Donation", donationSchema);
