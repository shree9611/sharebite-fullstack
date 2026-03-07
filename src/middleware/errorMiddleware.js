const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

const errorHandler = (err, req, res, next) => {
  if (!err) return next();

  // Always log server-side errors for observability (Render/production logs).
  // Avoid logging request headers/body to reduce risk of leaking sensitive data.
  try {
    const prefix = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`;
    // eslint-disable-next-line no-console
    console.error(prefix, err && (err.stack || err.message || err));
  } catch {
    // ignore logging failures
  }

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
    ...(process.env.NODE_ENV !== "production" ? { error: err.message, stack: err.stack } : {}),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
