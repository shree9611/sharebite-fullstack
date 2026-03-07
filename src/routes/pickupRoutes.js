const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const { createPickup, getPickups, completePickup } = require("../controllers/pickupController");

// Schedule pickup
router.get("/", auth, asyncHandler(getPickups));
router.post("/", auth, asyncHandler(createPickup));
router.patch("/:id/complete", auth, asyncHandler(completePickup));

module.exports = router;
