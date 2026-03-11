const router = require("express").Router();
const asyncHandler = require("../middleware/asyncHandler");
const upload = require("../middleware/uploadMiddleware");
const { register, login, resetPassword } = require("../controllers/authController");

// Frontend sends multipart/form-data (FormData) for registration to support avatars.
router.post("/register", upload.any(), asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/reset-password", asyncHandler(resetPassword));

module.exports = router;
