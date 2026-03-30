const { sendEmail } = require("../utils/emailer");
const { renderShareBiteEmail } = require("./emailTemplates");

const safeString = (value) => String(value || "").trim();

const getFrontendBaseUrl = () => {
  return (
    safeString(process.env.PUBLIC_FRONTEND_URL) ||
    safeString(process.env.FRONTEND_URL) ||
    safeString(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
  );
};

const buildDashboardUrl = (path = "/dashboard") => {
  const base = getFrontendBaseUrl();
  if (!base) return "";
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${normalizedPath}`;
};

const sendAppEmail = async ({ to, subject, title, subtitle, rows, ctaUrl, ctaText }) => {
  const toValue = safeString(to);
  const subjectValue = safeString(subject);
  if (!toValue || !subjectValue) return { skipped: true, reason: "missing_to_or_subject" };

  const html = renderShareBiteEmail({
    title: title || subjectValue,
    subtitle: subtitle || "",
    rows: Array.isArray(rows) ? rows : [],
    ctaUrl: ctaUrl || buildDashboardUrl(),
    ctaText: ctaText || "View Dashboard",
  });

  const textFallback = [subjectValue, subtitle].filter(Boolean).join("\n\n");
  return sendEmail({ to: toValue, subject: subjectValue, text: textFallback, html });
};

module.exports = {
  buildDashboardUrl,
  sendAppEmail,
};

