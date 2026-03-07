const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const { getImageById } = require("../controllers/imageController");

router.get("/:id", asyncHandler(getImageById));

module.exports = router;
