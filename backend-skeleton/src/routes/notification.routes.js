const express = require("express");
const {
  getNotifications,
  readNotification,
  readAllNotifications,
} = require("../controllers/notification.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getNotifications);
router.patch("/read-all", readAllNotifications);
router.patch("/:id/read", readNotification);

module.exports = router;
