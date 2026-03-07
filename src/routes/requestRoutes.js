const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const { createRequest, getRequests } = require("../controllers/requestController");

// Receiver requests food
router.post("/", auth, asyncHandler(createRequest));
router.get("/", auth, asyncHandler(getRequests));

module.exports = router;
