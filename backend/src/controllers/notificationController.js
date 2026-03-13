const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    const items = notifications.map((item) => {
      const record = item.toObject();
      return {
        ...record,
        isRead: Boolean(record.read),
      };
    });

    const unreadCount = items.reduce((count, item) => count + (item?.read ? 0 : 1), 0);

    return res.json({ items, unreadCount });
  } catch {
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    const record = notification.toObject();
    return res.json({ ...record, isRead: true });
  } catch {
    return res.status(500).json({ message: "Failed to update notification" });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ message: "Failed to update notifications" });
  }
};
