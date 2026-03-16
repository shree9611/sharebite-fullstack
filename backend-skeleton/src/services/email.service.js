let nodemailer = null;

try {
  // Optional dependency: if nodemailer isn't installed, email notifications stay disabled.
  // This prevents runtime crashes in environments where deps haven't been installed yet.
  // eslint-disable-next-line global-require
  nodemailer = require("nodemailer");
} catch {
  nodemailer = null;
}

let cachedTransporter = null;

const toBool = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return false;
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
};

const isEmailConfigured = () => {
  return Boolean(process.env.EMAIL_FROM && process.env.SMTP_HOST && nodemailer);
};

const isEmailNotificationsEnabled = () => {
  if (String(process.env.EMAIL_NOTIFICATIONS_ENABLED || "").trim() !== "") {
    return toBool(process.env.EMAIL_NOTIFICATIONS_ENABLED);
  }
  return isEmailConfigured();
};

const getTransporter = () => {
  if (!nodemailer) return null;
  if (cachedTransporter) return cachedTransporter;

  const host = String(process.env.SMTP_HOST || "").trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = toBool(process.env.SMTP_SECURE) || port === 465;
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "").trim();

  const auth = user && pass ? { user, pass } : undefined;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth,
  });

  return cachedTransporter;
};

async function sendMail({ to, subject, text, html }) {
  if (!isEmailNotificationsEnabled()) return { ok: false, skipped: true, reason: "disabled" };
  if (!isEmailConfigured()) return { ok: false, skipped: true, reason: "not_configured" };
  const transporter = getTransporter();
  if (!transporter) return { ok: false, skipped: true, reason: "no_transporter" };

  const from = String(process.env.EMAIL_FROM || "").trim();
  const replyTo = String(process.env.EMAIL_REPLY_TO || "").trim();
  const safeTo = String(to || "").trim();
  if (!from || !safeTo) return { ok: false, skipped: true, reason: "missing_to_or_from" };

  const info = await transporter.sendMail({
    from,
    to: safeTo,
    subject: String(subject || "ShareBite notification"),
    text: text ? String(text) : undefined,
    html: html ? String(html) : undefined,
    replyTo: replyTo || undefined,
  });

  return { ok: true, info };
}

module.exports = {
  isEmailNotificationsEnabled,
  sendMail,
};

