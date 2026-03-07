const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: "Request" },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  status: { type: String, enum: ["scheduled", "completed"], default: "scheduled" },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Pickup", pickupSchema);
