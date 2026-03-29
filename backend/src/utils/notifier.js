const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendEmail } = require("./emailer");

const safeString = (value) => String(value || "").trim();
const EMAIL_DEBUG = String(process.env.EMAIL_DEBUG || "").trim() === "1";

const resolveUserEmail = async (userId, providedEmail) => {
  const candidate = safeString(providedEmail);
  if (candidate) return candidate;
  if (!userId) return "";
  const user = await User.findById(userId).select("email").lean();
  return safeString(user?.email);
};

const notifyUser = async ({
  userId,
  title = "",
  message,
  type = "general",
  metadata = {},
  emailSubject,
  emailText,
  emailHtml,
  userEmail,
}) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    metadata,
  });

  try {
    const to = await resolveUserEmail(userId, userEmail);
    if (to) {
      const result = await sendEmail({
        to,
        subject: safeString(emailSubject) || safeString(title) || "ShareBite notification",
        text: safeString(emailText) || safeString(message),
        html: emailHtml ? String(emailHtml) : undefined,
      });
      if (EMAIL_DEBUG) {
        // eslint-disable-next-line no-console
        console.log(`[notifyUser] email to=${to} result=`, result);
      }
    }
  } catch {
    // Never fail the API call due to email issues.
  }

  return notification;
};

module.exports = { notifyUser };
