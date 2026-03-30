const router = require("express").Router();
const asyncHandler = require("../middleware/asyncHandler");
const { sendAppEmail } = require("../services/emailService");

const safeString = (value) => String(value || "").trim();

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

    const result = await sendAppEmail({
      to,
      subject: "ShareBite test email",
      title: "ShareBite test email",
      subtitle: "If you received this, your email notifications are configured correctly.",
      rows: [
        { label: "Timestamp", value: new Date().toISOString() },
        { label: "Request ID", value: req.requestId || "" },
      ],
      ctaText: "Open ShareBite",
    });

    // eslint-disable-next-line no-console
    console.log("[test-email] to=", to, "result=", result);

    return res.json({ ok: true, to, result });
  })
);

module.exports = router;
