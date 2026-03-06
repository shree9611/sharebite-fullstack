const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const corsOptions = require("./config/corsOptions");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.set("trust proxy", 1);

// CORS first, then preflight handling.
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

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
