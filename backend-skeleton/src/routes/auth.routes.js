const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const { profileUpload } = require("../middleware/profile-upload.middleware");

const router = express.Router();

router.post("/register", (req, res, next) => {
  profileUpload.single("avatar")(req, res, (error) => {
    if (!error) return next();
    return res.status(400).json({ message: error.message || "Invalid image upload." });
  });
}, register);
router.post("/login", login);

module.exports = router;
