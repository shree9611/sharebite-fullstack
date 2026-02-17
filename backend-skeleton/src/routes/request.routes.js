const express = require("express");
const { createRequest, listRequests } = require("../controllers/request.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", listRequests);
router.post("/", createRequest);

module.exports = router;

