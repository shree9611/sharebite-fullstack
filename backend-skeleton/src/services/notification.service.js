const { Notification } = require("../models/notification.model");

async function createNotification({ userId, type, title, body, data = {} }) {
  return Notification.create({ userId, type, title, body, data });
}

async function listNotifications(userId) {
  return Notification.find({ userId }).sort({ createdAt: -1 }).lean();
}

async function markAsRead(notificationId, userId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
}

module.exports = {
  createNotification,
  listNotifications,
  markAsRead,
};

