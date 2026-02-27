const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    receiverUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, required: true },
    message: { type: String, required: true },
    relatedDonationId: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", default: null },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
    dedupeKey: { type: String, default: "", index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ receiverUserId: 1, createdAt: -1 });
notificationSchema.index(
  { receiverUserId: 1, dedupeKey: 1 },
  { unique: true, partialFilterExpression: { dedupeKey: { $type: "string", $ne: "" } } }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = { Notification };
