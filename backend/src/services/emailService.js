const https = require("https");
const { sendEmail } = require("../utils/emailer");
const { renderShareBiteEmail } = require("./emailTemplates");

const safeString = (value) => String(value || "").trim();

const parseEmailFrom = (rawValue) => {
  const value = safeString(rawValue);
  if (!value) return { name: "", email: "" };
  const match = value.match(/^(.*)<([^>]+)>$/);
  if (!match) return { name: "", email: value };
  return { name: safeString(match[1]).replace(/^"|"$/g, ""), email: safeString(match[2]) };
};

const getEmailProvider = () => {
  const provider = safeString(process.env.EMAIL_PROVIDER).toLowerCase();
  if (provider) return provider;
  if (safeString(process.env.BREVO_API_KEY)) return "brevo_api";
  return "smtp";
};

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

const sendViaBrevoApi = async ({ to, subject, html, text }) => {
  const apiKey = safeString(process.env.BREVO_API_KEY);
  if (!apiKey) return { skipped: true, reason: "brevo_api_key_missing" };

  const fromValue = safeString(process.env.EMAIL_FROM);
  const sender = parseEmailFrom(fromValue);
  if (!sender.email) return { skipped: true, reason: "missing_email_from" };

  const payload = JSON.stringify({
    sender: sender.name ? { name: sender.name, email: sender.email } : { email: sender.email },
    to: [{ email: safeString(to) }],
    subject: safeString(subject),
    htmlContent: html ? String(html) : undefined,
    textContent: text ? String(text) : undefined,
  });

  return new Promise((resolve) => {
    const hardTimeoutMs = 15000;
    let settled = false;
    const settle = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const req = https.request(
      {
        method: "POST",
        hostname: "api.brevo.com",
        path: "/v3/smtp/email",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": apiKey,
          "content-length": Buffer.byteLength(payload),
        },
        timeout: hardTimeoutMs,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          const ok = res.statusCode >= 200 && res.statusCode < 300;
          if (ok) return settle({ ok: true, provider: "brevo_api", status: res.statusCode });
          return settle({
            ok: false,
            provider: "brevo_api",
            status: res.statusCode,
            error: body ? String(body).slice(0, 500) : `HTTP ${res.statusCode}`,
          });
        });
      }
    );

    const timer = setTimeout(() => {
      try {
        req.destroy(new Error("timeout"));
      } catch {
        // ignore
      }
      settle({ ok: false, provider: "brevo_api", error: `Connection timeout after ${hardTimeoutMs}ms` });
    }, hardTimeoutMs);

    req.on("timeout", () => {
      clearTimeout(timer);
      try {
        req.destroy(new Error("timeout"));
      } catch {
        // ignore
      }
      settle({ ok: false, provider: "brevo_api", error: `Connection timeout after ${hardTimeoutMs}ms` });
    });
    req.on("error", (error) => {
      clearTimeout(timer);
      settle({ ok: false, provider: "brevo_api", error: error?.message || String(error) });
    });
    req.on("close", () => {
      clearTimeout(timer);
    });

    req.write(payload);
    req.end();
  });
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
  const provider = getEmailProvider();
  if (provider === "brevo_api") {
    return sendViaBrevoApi({ to: toValue, subject: subjectValue, text: textFallback, html });
  }
  const smtpResult = await sendEmail({ to: toValue, subject: subjectValue, text: textFallback, html });
  return { ...smtpResult, provider: "smtp" };
};

module.exports = {
  buildDashboardUrl,
  sendAppEmail,
};
