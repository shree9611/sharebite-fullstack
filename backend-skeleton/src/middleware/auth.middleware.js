function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // TODO: Replace with real JWT verification.
  // Temporary expected headers for local testing:
  // x-user-id, x-user-role
  req.user = {
    id: req.headers["x-user-id"] || "mock-user-id",
    role: req.headers["x-user-role"] || "receiver",
  };

  return next();
}

module.exports = { authMiddleware };

