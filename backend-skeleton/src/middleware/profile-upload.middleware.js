const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadsRoot = path.resolve(__dirname, "..", "..", "uploads", "profiles");
fs.mkdirSync(uploadsRoot, { recursive: true });

const sanitizeName = (filename = "avatar") => {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || "avatar";
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsRoot),
  filename: (_req, file, cb) => {
    const original = sanitizeName(file?.originalname || "avatar");
    const ext = path.extname(file?.originalname || "").toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${original}${ext}`);
  },
});

const profileUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file?.mimetype?.startsWith("image/")) return cb(null, true);
    return cb(new Error("Only image uploads are allowed."));
  },
});

module.exports = { profileUpload };

