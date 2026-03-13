const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const {
  getMyNotifications,
  markNotificationRead,
  markAllRead,
} = require("../controllers/notificationController");

router.get("/", auth, asyncHandler(getMyNotifications));
router.patch("/:id/read", auth, asyncHandler(markNotificationRead));
router.patch("/read-all", auth, asyncHandler(markAllRead));

module.exports = router;
