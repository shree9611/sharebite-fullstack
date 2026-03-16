const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const { approveRequest, declineRequest } = require("../controllers/approvalController");

// Donor/admin approves request (frontend uses PATCH; keep PUT for backward compatibility)
router.patch("/:id", auth, asyncHandler(approveRequest));
router.patch("/:id/decline", auth, asyncHandler(declineRequest));
router.put("/:id", auth, asyncHandler(approveRequest));
router.put("/:id/decline", auth, asyncHandler(declineRequest));

module.exports = router;
