const Notification = require("../models/Notification");
const User = require("../models/User");
const { isEmailNotificationsEnabled, sendMail } = require("./emailService");

const buildEmailText = ({ title, body }) => {
  const lines = [String(title || "").trim(), "", String(body || "").trim()].filter(Boolean);
  lines.push("", "— ShareBite");
  return lines.join("\n");
};

async function createNotification({ userId, title, message, type = "general", metadata = {}, sendEmail = true }) {
  if (!userId) throw new Error("userId is required");

  const safeTitle = String(title || "Notification").trim();
  const safeMessage = String(message || "").trim();

  const notification = await Notification.create({
    user: userId,
    title: safeTitle,
    message: safeMessage,
    type,
    metadata,
  });

  if (sendEmail && isEmailNotificationsEnabled()) {
    try {
      const user = await User.findById(userId).select("email").lean();
      const to = String(user?.email || "").trim();
      if (to) {
        await sendMail({
          to,
          subject: `ShareBite: ${safeTitle}`,
          text: buildEmailText({ title: safeTitle, body: safeMessage }),
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Email notification failed:", error?.message || error);
    }
  }

  return notification;
}

module.exports = {
  createNotification,
};

