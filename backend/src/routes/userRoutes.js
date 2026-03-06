const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");

router.get("/profile", auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json(user);
}));

router.get("/", auth, asyncHandler(async (_req, res) => {
  const users = await User.find().select("_id name email role locationName city state");
  return res.json(users);
}));

module.exports = router;
