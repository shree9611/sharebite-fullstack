const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "sharebite-dev-secret";

const verifyToken = (token) => {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  const a = Buffer.from(encodedSignature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    if (payload?.exp && now > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
};

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const payload = verifyToken(token);
  if (!payload?.sub && !payload?.id) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }

  req.user = {
    id: payload.sub || payload.id,
    role: payload.role || "receiver",
    email: payload.email || "",
  };

  return next();
}

module.exports = { authMiddleware };
