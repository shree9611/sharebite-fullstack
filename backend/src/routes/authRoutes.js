const router = require("express").Router();
const asyncHandler = require("../middleware/asyncHandler");
const { register, login } = require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");

router.post("/register", upload.any(), asyncHandler(register));
router.post("/login", asyncHandler(login));

module.exports = router;
