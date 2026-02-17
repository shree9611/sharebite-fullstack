const {
  listNotifications,
  markAsRead,
} = require("../services/notification.service");

async function getNotifications(req, res) {
  try {
    const rows = await listNotifications(req.user.id);
    return res.json(rows);
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

module.exports = {
  getNotifications,
  readNotification,
};

