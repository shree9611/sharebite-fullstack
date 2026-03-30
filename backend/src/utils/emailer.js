const nodemailer = require("nodemailer");

const parseBoolean = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
};

const isEmailEnabled = () => {
  const flag = String(process.env.EMAIL_NOTIFICATIONS || "").trim();
  if (flag) return parseBoolean(flag);
  // Default to enabled when SMTP is configured, even if the flag is omitted.
  return Boolean(getSmtpConfig());
};

const pickEnv = (...keys) => {
  for (const key of keys) {
    const value = String(process.env[key] || "").trim();
    if (value) return value;
  }
  return "";
};

const getSmtpConfig = () => {
  const host = pickEnv("SMTP_HOST", "MAIL_HOST");
  const port = Number(pickEnv("SMTP_PORT", "MAIL_PORT") || 0);
  const user = pickEnv("SMTP_USER", "SMTP_USERNAME", "MAIL_USER", "MAIL_USERNAME", "EMAIL_USER");
  const pass = pickEnv("SMTP_PASS", "SMTP_PASSWORD", "MAIL_PASS", "MAIL_PASSWORD", "EMAIL_PASS");
  const from = pickEnv("EMAIL_FROM", "SMTP_FROM", "MAIL_FROM", "FROM_EMAIL");
  const secure = parseBoolean(process.env.SMTP_SECURE);

  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return { host, port, user, pass, from, secure };
};

let cachedTransport = null;
let cachedTransportKey = "";

const getTransport = () => {
  const smtp = getSmtpConfig();
  if (!smtp) return null;

  const key = `${smtp.host}:${smtp.port}:${smtp.user}:${smtp.secure}`;
  if (cachedTransport && cachedTransportKey === key) {
    return { transport: cachedTransport, from: smtp.from };
  }

  cachedTransport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });
  cachedTransportKey = key;
  return { transport: cachedTransport, from: smtp.from };
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!isEmailEnabled()) return { skipped: true, reason: "disabled" };

  const toValue = String(to || "").trim();
  const subjectValue = String(subject || "").trim();
  if (!toValue || !subjectValue) return { skipped: true, reason: "missing_to_or_subject" };

  const transportBundle = getTransport();
  if (!transportBundle) return { skipped: true, reason: "smtp_not_configured" };

  const { transport, from } = transportBundle;

  try {
    const info = await transport.sendMail({
      from,
      to: toValue,
      subject: subjectValue,
      text: text ? String(text) : undefined,
      html: html ? String(html) : undefined,
    });
    return { ok: true, messageId: info?.messageId };
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  }
};

module.exports = {
  isEmailEnabled,
  sendEmail,
};
