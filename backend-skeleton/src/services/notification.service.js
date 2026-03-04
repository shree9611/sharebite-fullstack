const { Notification } = require("../models/notification.model");

const buildDedupeKey = ({ receiverUserId, type, relatedDonationId, requestId, status, message }) => {
  return [
    String(receiverUserId || ""),
    String(type || ""),
    String(relatedDonationId || ""),
    String(requestId || ""),
    String(status || ""),
    String(message || ""),
  ].join("|");
};

async function createNotification({
  userId,
  receiverUserId,
  type,
  title,
  body,
  message,
  relatedDonationId = null,
  data = {},
  enableDedupe = true,
}) {
  const targetUserId = receiverUserId || userId;
  if (!targetUserId) {
    throw new Error("receiverUserId is required for notifications.");
  }
  const requestId = data?.requestId || "";
  const status = data?.status || "";
  const safeMessage = message || body || title || "";
  const dedupeKey = enableDedupe
    ? buildDedupeKey({
        receiverUserId: targetUserId,
        type,
        relatedDonationId,
        requestId,
        status,
        message: safeMessage,
      })
    : "";

  return Notification.findOneAndUpdate(
    dedupeKey
      ? { receiverUserId: targetUserId, dedupeKey }
      : { _id: null },
    {
      $setOnInsert: {
        receiverUserId: targetUserId,
        userId: targetUserId,
        type,
        message: safeMessage,
        relatedDonationId: relatedDonationId || null,
        title,
        body: body || safeMessage,
        data,
        isRead: false,
        dedupeKey,
      },
    },
    { new: true, upsert: true }
  );
}

async function listNotifications(userId) {
  const safeLimit = 40;
  return Notification.find({
    $or: [{ receiverUserId: userId }, { userId }],
  })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();
}

async function markAsRead(notificationId, userId) {
  return Notification.findOneAndUpdate(
    {
      _id: notificationId,
      $or: [{ receiverUserId: userId }, { userId }],
    },
    { isRead: true },
    { new: true }
  );
}

async function markAllAsRead(userId) {
  const result = await Notification.updateMany(
    { $or: [{ receiverUserId: userId }, { userId }], isRead: false },
    { $set: { isRead: true } }
  );
  return result.modifiedCount || 0;
}

module.exports = {
  createNotification,
  listNotifications,
  markAsRead,
  markAllAsRead,
};
