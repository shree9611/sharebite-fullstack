const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const { report } = require("../controllers/reportController");

// Generate report
router.get("/", auth, asyncHandler(report));

module.exports = router;
