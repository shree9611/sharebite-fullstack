const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const ensureDbReady = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ message: "Database unavailable. Please try again shortly." });
    return false;
  }
  return true;
};

exports.register = async (req, res) => {
  if (!ensureDbReady(res)) return;
  try {
    const {
      name,
      email,
      password,
      role,
      locationName,
      location,
      address,
      city,
      state,
      pincode,
      zip,
      latitude,
      longitude,
      lat,
      lng,
      coords,
    } = req.body || {};

    const normalizedRole = String(role || "").trim().toLowerCase();
    const latValue = latitude ?? lat ?? coords?.latitude ?? coords?.lat;
    const lngValue = longitude ?? lng ?? coords?.longitude ?? coords?.lng;
    const parsedLat = latValue === undefined || latValue === null || latValue === "" ? null : Number(latValue);
    const parsedLng = lngValue === undefined || lngValue === null || lngValue === "" ? null : Number(lngValue);

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password, role are required" });
    }
    if (!["donor", "receiver", "volunteer", "admin"].includes(normalizedRole)) {
      return res.status(400).json({ message: "role must be donor, receiver, volunteer, or admin" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (parsedLat !== null && (!Number.isFinite(parsedLat) || parsedLat < -90 || parsedLat > 90)) {
      return res.status(400).json({ message: "latitude must be between -90 and 90" });
    }
    if (parsedLng !== null && (!Number.isFinite(parsedLng) || parsedLng < -180 || parsedLng > 180)) {
      return res.status(400).json({ message: "longitude must be between -180 and 180" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email: normalizedEmail,
      password: hashed,
      role: normalizedRole,
      locationName: locationName || location || "",
      address: address || "",
      city: city || "",
      state: state || "",
      pincode: pincode || zip || "",
      coordinates: {
        latitude: parsedLat,
        longitude: parsedLng,
      },
    });
    return res.status(201).json({ message: "Registered" });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    if (err?.name === "ValidationError" || err?.name === "CastError") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: err?.message || "Registration failed" });
  }
};

exports.login = async (req, res) => {
  if (!ensureDbReady(res)) return;
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server auth configuration missing" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    return res.json({ token });
  } catch {
    return res.status(500).json({ message: "Login failed" });
  }
};
