const express = require("express");
const { approveRequest, declineRequest } = require("../controllers/approval.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);
router.patch("/:requestId", approveRequest);
router.patch("/:requestId/decline", declineRequest);

module.exports = router;

