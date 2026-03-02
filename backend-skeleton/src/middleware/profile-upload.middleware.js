const multer = require("multer");

const allowedMimeTypes = new Set(["image/jpeg", "image/jpg", "image/png"]);

const profileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mimeType = String(file?.mimetype || "").toLowerCase();
    if (allowedMimeTypes.has(mimeType)) {
      return cb(null, true);
    }
    return cb(new Error("Only JPG, JPEG, and PNG files are allowed."));
  },
});

module.exports = { profileUpload };
