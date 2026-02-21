const crypto = require("crypto");
const { User } = require("../models/user.model");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? "" : "sharebite-dev-secret");
const JWT_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required in production.");
}

const base64UrlEncode = (value) =>
  Buffer.from(value).toString("base64url");

const signToken = (payload) => {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const hashPassword = (password, salt) => {
  return crypto.scryptSync(password, salt, 64).toString("hex");
};

const createPasswordHash = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);
  return `${salt}:${hash}`;
};

const verifyPassword = (password, combinedHash) => {
  const [salt, storedHash] = String(combinedHash || "").split(":");
  if (!salt || !storedHash) return false;
  const calculatedHash = hashPassword(password, salt);
  const a = Buffer.from(storedHash, "hex");
  const b = Buffer.from(calculatedHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();
  if (value === "volunteer") return "admin";
  if (["donor", "receiver", "admin"].includes(value)) return value;
  return null;
};

const issueAuthResponse = (res, user, statusCode = 200) => {
  const now = Math.floor(Date.now() / 1000);
  const token = signToken({
    sub: String(user._id),
    id: String(user._id),
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + JWT_EXPIRY_SECONDS,
  });

  return res.status(statusCode).json({
    token,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      city,
      pincode,
      locationName,
      latitude,
      longitude,
    } = req.body || {};

    const normalizedRole = normalizeRole(role);
    if (!name || !email || !password || !normalizedRole) {
      return res.status(400).json({ message: "name, email, password and role are required." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return res.status(409).json({ message: "Email already registered. Please login." });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const hasValidCoords = Number.isFinite(lat) && Number.isFinite(lng);

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: createPasswordHash(String(password)),
      role: normalizedRole,
      phone: phone ? String(phone).trim() : "",
      address: address ? String(address).trim() : "",
      city: city ? String(city).trim() : "",
      pincode: pincode ? String(pincode).trim() : "",
      locationName: locationName ? String(locationName).trim() : "",
      location: hasValidCoords
        ? { type: "Point", coordinates: [lng, lat] }
        : { type: "Point", coordinates: [0, 0] },
    });

    return issueAuthResponse(res, user, 201);
  } catch (error) {
    return res.status(500).json({ message: "Server error while creating account. Please try again." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
    if (!user || !verifyPassword(String(password), user.passwordHash)) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return issueAuthResponse(res, user, 200);
  } catch (error) {
    return res.status(500).json({ message: "Server error while logging in. Please try again." });
  }
};

module.exports = {
  register,
  login,
};
