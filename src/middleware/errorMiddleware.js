const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

const errorHandler = (err, req, res, next) => {
  if (!err) return next();

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Image size must be 5MB or less" });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ message: "Unexpected file field in upload" });
  }

  if (String(err.message || "").includes("Only image files are allowed")) {
    return res.status(400).json({ message: "Only image files are allowed" });
  }

  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    message: statusCode >= 500 ? "Server error" : err.message,
    ...(process.env.NODE_ENV !== "production" ? { error: err.message } : {}),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
