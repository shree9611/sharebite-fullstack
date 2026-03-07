const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth.routes");
const donationRoutes = require("./routes/donation.routes");
const requestRoutes = require("./routes/request.routes");
const approvalRoutes = require("./routes/approval.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const notificationRoutes = require("./routes/notification.routes");
const userRoutes = require("./routes/user.routes");

const app = express();
// Avoid conditional GETs (ETag/If-None-Match -> 304) for dynamic APIs.
app.set("etag", false);

const normalizeOrigin = (origin) => String(origin || "").trim().replace(/\/+$/, "");

const parseAllowedOrigins = () => {
  const raw =
    process.env.CORS_ORIGINS ||
    process.env.CORS_ORIGIN ||
    process.env.FRONTEND_URL ||
    "";
  return raw
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);
};

const defaultFrontendOrigin = "https://sharebite-beta.vercel.app";
const allowedOrigins = Array.from(
  new Set([...parseAllowedOrigins(), normalizeOrigin(defaultFrontendOrigin)])
);
const isProduction = process.env.NODE_ENV === "production";
const vercelSharebiteOriginRe = /^https:\/\/sharebite-beta(?:-[a-z0-9-]+)?\.vercel\.app$/i;

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const requestOrigin = normalizeOrigin(origin);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(requestOrigin) || vercelSharebiteOriginRe.test(requestOrigin)) {
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
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Access-Control-Allow-Origin"],
};
app.use(cors(corsOptions));

// Preflight handling should use the same CORS policy logic.
app.options(/.*/, cors(corsOptions));

app.use((req, res, next) => {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  const buildId =
    process.env.RENDER_GIT_COMMIT ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT ||
    "";
  if (buildId) {
    res.setHeader("x-app-build", String(buildId).slice(0, 12));
  }
  res.on("finish", () => {
    const elapsedMs = Date.now() - startedAt;
    // eslint-disable-next-line no-console
    console.info(`[${requestId}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${elapsedMs}ms)`);
  });
  next();
});

// Dynamic API responses should never be cached by browsers/CDNs.
app.use("/api", (req, res, next) => {
  // Some clients/proxies still send validation headers; ignore them for dynamic APIs.
  delete req.headers["if-none-match"];
  delete req.headers["if-modified-since"];
  delete req.headers["if-match"];
  delete req.headers["if-unmodified-since"];

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  // Prevent any shared cache from serving authenticated content across users.
  if (typeof res.vary === "function") {
    res.vary("Origin");
    res.vary("Authorization");
  } else {
    res.setHeader("Vary", "Origin, Authorization");
  }
  next();
});

app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  // eslint-disable-next-line no-console
  console.error(`[${req.requestId || "n/a"}] DB not ready. readyState=${mongoose.connection.readyState}`);
  return res.status(503).json({
    message: "Database is reconnecting. Please retry in a moment.",
  });
});

app.use("/api", (req, res, next) => {
  res.setTimeout(25000, () => {
    if (res.headersSent) return;
    // eslint-disable-next-line no-console
    console.error(`[${req.requestId || "n/a"}] API response timeout on ${req.method} ${req.originalUrl}`);
    res.status(503).json({ message: "Request timed out. Please retry." });
  });
  next();
});

// Allow JSON payloads large enough for base64 image fallback (multipart is still preferred).
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));
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

app.use("/api", (_req, res) => {
  return res.status(404).json({ message: "API route not found." });
});

app.use((error, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled API error:", error);
  const statusCode = Number(error?.status || error?.statusCode) || 500;
  if (res.headersSent) return;
  res.status(statusCode).json({
    message: error?.message || "Internal server error.",
  });
});

module.exports = { app };
