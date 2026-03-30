require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const start = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, HOST, () =>
      console.log(`Server running on http://${HOST}:${PORT}`)
    );
    server.on("error", (error) => {
      console.error("Server failed to start:", error?.message || error);
      process.exit(1);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

start();
