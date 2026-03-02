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

const defaultFrontendOrigin = "https://sharebite-beta.vercel.app";
const allowedOrigins = Array.from(
  new Set([...parseAllowedOrigins(), defaultFrontendOrigin])
);
const isProduction = process.env.NODE_ENV === "production";

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    if (!isProduction) {
      callback(null, true);
      return;
    }
    callback(new Error("CORS policy: origin not allowed."), false);
  },
  credentials: true,
  exposedHeaders: ["Access-Control-Allow-Origin"],
};
app.use(cors(corsOptions));

// handle CORS preflight explicitly so all requested headers/methods are exposed
app.options("/*", (req, res) => {
  res.header("Access-Control-Allow-Origin", allowedOrigins.join(", "));
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    req.header("Access-Control-Request-Headers") || "Content-Type, Authorization"
  );
  return res.sendStatus(204);
});
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
