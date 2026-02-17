const express = require("express");
const { createFeedback, listFeedback } = require("../controllers/feedback.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", listFeedback);
router.post("/", createFeedback);

module.exports = router;

