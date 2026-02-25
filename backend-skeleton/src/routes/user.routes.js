const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/user.controller");
const { profileUpload } = require("../middleware/profile-upload.middleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/me", getCurrentUserProfile);
router.patch("/me", (req, res, next) => {
  profileUpload.single("avatar")(req, res, (error) => {
    if (!error) return next();
    return res.status(400).json({ message: error.message || "Invalid image upload." });
  });
}, updateCurrentUserProfile);
router.patch("/me/password", changePassword);
router.delete("/me", deleteAccount);

module.exports = router;

