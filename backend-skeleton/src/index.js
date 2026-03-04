require("dotenv").config();
const mongoose = require("mongoose");
const { app } = require("./app");
const { registerEventHandlers } = require("./events/handlers");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sharebite";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const MONGO_RETRY_DELAY_MS = 5000;

function validateRuntimeConfig() {
  if (!process.env.MONGO_URI && IS_PRODUCTION) {
    throw new Error("Missing required environment variable: MONGO_URI");
  }
  if (!process.env.JWT_SECRET && IS_PRODUCTION) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }
}

async function start() {
  validateRuntimeConfig();
  mongoose.connection.on("error", (error) => {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error:", error?.message || error);
  });
  mongoose.connection.on("disconnected", () => {
    // eslint-disable-next-line no-console
    console.warn("MongoDB disconnected.");
  });

  // Keep retrying DB connection instead of crashing startup on transient failures.
  // Render/managed Mongo networks can briefly fail during deploy/boot windows.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await mongoose.connect(MONGO_URI);
      break;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("MongoDB connect failed, retrying in 5s:", error?.message || error);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, MONGO_RETRY_DELAY_MS));
    }
  }

  registerEventHandlers();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`ShareBite backend running on http://localhost:${PORT}`);
  });
}

process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  // eslint-disable-next-line no-console
  console.error("Uncaught exception:", error);
});

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  process.exit(1);
});
