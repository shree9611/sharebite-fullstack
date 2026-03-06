const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const { addFeedback, getFeedback, getCommunityFeedback } = require("../controllers/feedbackController");

// Submit feedback
router.post("/", auth, asyncHandler(addFeedback));
router.get("/", auth, asyncHandler(getFeedback));
router.get("/community", asyncHandler(getCommunityFeedback));

module.exports = router;
