const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const { approveRequest, declineRequest } = require("../controllers/approvalController");

// Admin approves request
router.put("/:id", auth, asyncHandler(approveRequest));
router.put("/:id/decline", auth, asyncHandler(declineRequest));

module.exports = router;
