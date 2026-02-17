const express = require("express");
const { getNotifications, readNotification } = require("../controllers/notification.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getNotifications);
router.patch("/:id/read", readNotification);

module.exports = router;

