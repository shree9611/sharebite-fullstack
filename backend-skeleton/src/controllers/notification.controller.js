const {
  listNotifications,
  markAsRead,
  markAllAsRead,
} = require("../services/notification.service");

async function getNotifications(req, res) {
  try {
    const rows = await listNotifications(req.user.id);
    const normalized = rows.map((row) => ({
      ...row,
      receiverUserId: row.receiverUserId || row.userId,
      message: row.message || row.body || row.title || "",
      relatedDonationId: row.relatedDonationId || row?.data?.donationId || null,
    }));
    const unreadCount = normalized.reduce((count, row) => count + (row.isRead ? 0 : 1), 0);
    return res.json({ items: normalized, unreadCount });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load notifications." });
  }
}

async function readNotification(req, res) {
  try {
    const updated = await markAsRead(req.params.id, req.user.id);
    if (!updated) return res.status(404).json({ message: "Notification not found." });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update notification." });
  }
}

async function readAllNotifications(req, res) {
  try {
    const updatedCount = await markAllAsRead(req.user.id);
    return res.json({ updatedCount });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update notifications." });
  }
}

module.exports = {
  getNotifications,
  readNotification,
  readAllNotifications,
};
