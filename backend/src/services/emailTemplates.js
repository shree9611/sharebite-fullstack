const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatRows = (rows) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  const rendered = safeRows
    .filter((row) => row && (row.label || row.value))
    .map((row) => {
      const label = escapeHtml(row.label);
      const value = escapeHtml(row.value);
      return `
        <tr>
          <td style="padding:10px 0; color:#667085; font-size:13px; width:140px; vertical-align:top;">${label}</td>
          <td style="padding:10px 0; color:#101828; font-size:13px; font-weight:600;">${value}</td>
        </tr>
      `.trim();
    })
    .join("");

  if (!rendered) return "";
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-top:1px solid #EAECF0; margin-top:14px;">
      ${rendered}
    </table>
  `.trim();
};

const renderShareBiteEmail = ({ title, subtitle, rows, ctaUrl, ctaText }) => {
  const safeTitle = escapeHtml(title);
  const safeSubtitle = escapeHtml(subtitle);
  const safeCtaUrl = String(ctaUrl ?? "").trim();
  const safeCtaText = escapeHtml(ctaText || "View Dashboard");
  const detailsHtml = formatRows(rows);

  const ctaHtml = safeCtaUrl
    ? `
      <div style="margin-top:18px;">
        <a href="${escapeHtml(safeCtaUrl)}"
           style="display:inline-block; background:#12c76a; color:#ffffff; text-decoration:none; padding:12px 16px; border-radius:999px; font-size:13px; font-weight:700;">
          ${safeCtaText}
        </a>
      </div>
    `.trim()
    : "";

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${safeTitle}</title>
    </head>
    <body style="margin:0; padding:0; background:#f6faf8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
      <div style="padding:24px 12px;">
        <div style="max-width:560px; margin:0 auto;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
            <div style="width:38px; height:38px; border-radius:12px; background:#12c76a;"></div>
            <div style="line-height:1.1;">
              <div style="font-weight:900; color:#0a3b23; font-size:16px;">ShareBite</div>
              <div style="color:#667085; font-size:12px;">Food sharing updates</div>
            </div>
          </div>

          <div style="background:#ffffff; border:1px solid #e7efe9; border-radius:18px; padding:18px 18px;">
            <div style="font-size:18px; font-weight:900; color:#101828;">${safeTitle}</div>
            ${safeSubtitle ? `<div style="margin-top:6px; font-size:13px; color:#475467;">${safeSubtitle}</div>` : ""}
            ${detailsHtml ? `<div style="margin-top:6px;">${detailsHtml}</div>` : ""}
            ${ctaHtml}
          </div>

          <div style="margin-top:12px; color:#667085; font-size:11px; text-align:center;">
            You are receiving this email because you have an account on ShareBite.
          </div>
        </div>
      </div>
    </body>
  </html>
  `.trim();
};

module.exports = {
  renderShareBiteEmail,
};

