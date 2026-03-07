const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const crypto = require("crypto");
const corsOptions = require("./config/corsOptions");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.set("trust proxy", 1);
// Avoid conditional GETs (ETag/If-None-Match -> 304) for dynamic APIs.
app.set("etag", false);

// CORS first, then preflight handling.
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use((req, res, next) => {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
});

// Dynamic API responses should never be cached by browsers/CDNs.
app.use("/api", (req, res, next) => {
  // Ignore cache validators some clients/proxies send by default.
  delete req.headers["if-none-match"];
  delete req.headers["if-modified-since"];
  delete req.headers["if-match"];
  delete req.headers["if-unmodified-since"];

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  if (typeof res.vary === "function") {
    res.vary("Origin");
    res.vary("Authorization");
  } else {
    res.setHeader("Vary", "Origin, Authorization");
  }
  next();
});

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Backward compatibility for old /uploads/* data.
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.send("ShareBite backend running");
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    dbConnected: mongoose.connection.readyState === 1,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/images", require("./routes/imageRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/donations", require("./routes/donationRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/approvals", require("./routes/approvalRoutes"));
app.use("/api/pickups", require("./routes/pickupRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
