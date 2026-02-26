const express = require("express");
const { createRequest, listRequests, acceptMission, completeMission } = require("../controllers/request.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", listRequests);
router.post("/", createRequest);
router.patch("/:requestId/accept-mission", acceptMission);
router.patch("/:requestId/complete-delivery", completeMission);

module.exports = router;
