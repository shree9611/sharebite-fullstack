const mongoose = require("mongoose");
const { app } = require("./app");
const { registerEventHandlers } = require("./events/handlers");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sharebite";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

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
  await mongoose.connect(MONGO_URI);
  registerEventHandlers();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`ShareBite backend running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  process.exit(1);
});
