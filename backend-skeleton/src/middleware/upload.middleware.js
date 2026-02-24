const multer = require("multer");

const storage = multer.memoryStorage();
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file?.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only JPG, PNG, and WEBP uploads are allowed."));
  },
});

module.exports = { upload };
