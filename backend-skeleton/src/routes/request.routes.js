const express = require("express");
const { createRequest, listRequests, acceptMission } = require("../controllers/request.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", listRequests);
router.post("/", createRequest);
router.patch("/:requestId/accept-mission", acceptMission);

module.exports = router;
