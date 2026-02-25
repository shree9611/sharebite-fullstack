const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/auth.routes");
const donationRoutes = require("./routes/donation.routes");
const requestRoutes = require("./routes/request.routes");
const approvalRoutes = require("./routes/approval.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const notificationRoutes = require("./routes/notification.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

const parseAllowedOrigins = () => {
  const raw =
    process.env.CORS_ORIGINS ||
    process.env.CORS_ORIGIN ||
    process.env.FRONTEND_URL ||
    "";
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();
const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server and local tools with no Origin header.
      if (!origin) return callback(null, true);

      // If no allowlist is configured, allow all origins to avoid accidental lockout.
      if (allowedOrigins.length === 0) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development, do not block requests even if allowlist is present/mismatched.
      if (!isProduction) {
        return callback(null, true);
      }

      return callback(new Error("CORS policy: origin not allowed."), false);
    },
    credentials: true,
  })
);
app.use(express.json());
const uploadsDir = path.resolve(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

module.exports = { app };
