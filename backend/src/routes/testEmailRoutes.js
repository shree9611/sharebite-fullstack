const router = require("express").Router();
const asyncHandler = require("../middleware/asyncHandler");
const { sendAppEmail } = require("../services/emailService");

const safeString = (value) => String(value || "").trim();
const parseBoolean = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
};

const requireTestToken = (req, res, next) => {
  const expected = safeString(process.env.TEST_EMAIL_TOKEN);
  if (!expected) {
    return res.status(503).json({ message: "TEST_EMAIL_TOKEN is not configured on the server." });
  }
  const provided = safeString(req.query?.token);
  if (!provided || provided !== expected) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};

router.get(
  "/",
  requireTestToken,
  asyncHandler(async (req, res) => {
    const to = safeString(req.query?.to || process.env.EMAIL_USER || process.env.SMTP_USER);
    if (!to) {
      return res.status(400).json({ message: "Provide ?to=email@example.com" });
    }

    const shouldWait = parseBoolean(req.query?.wait);

    const sendPromise = sendAppEmail({
      to,
      subject: "ShareBite test email",
      title: "ShareBite test email",
      subtitle: "If you received this, your email notifications are configured correctly.",
      rows: [
        { label: "Timestamp", value: new Date().toISOString() },
        { label: "Request ID", value: req.requestId || "" },
      ],
      ctaText: "Open ShareBite",
    }).catch((error) => ({ ok: false, error: error?.message || String(error) }));

    if (!shouldWait) {
      void sendPromise.then((result) => {
        // eslint-disable-next-line no-console
        console.log("[test-email] async to=", to, "result=", result, "requestId=", req.requestId || "");
      });
      return res.json({ ok: true, accepted: true, to, requestId: req.requestId || "" });
    }

    const timeoutMs = 25000;
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ ok: false, error: `Request timed out after ${timeoutMs}ms` }), timeoutMs)
    );

    const result = await Promise.race([sendPromise, timeoutPromise]);

    // eslint-disable-next-line no-console
    console.log("[test-email] waited to=", to, "result=", result, "requestId=", req.requestId || "");

    return res.json({ ok: true, to, requestId: req.requestId || "", result });
  })
);

module.exports = router;
