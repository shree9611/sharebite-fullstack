const nodemailer = require("nodemailer");

const parseBoolean = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
};

const isEmailEnabled = () => parseBoolean(process.env.EMAIL_NOTIFICATIONS);

const getSmtpConfig = () => {
  const host = String(process.env.SMTP_HOST || "").trim();
  const port = Number(process.env.SMTP_PORT || 0);
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "").trim();
  const from = String(process.env.EMAIL_FROM || "").trim();
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

