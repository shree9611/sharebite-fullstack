const express = require("express");
const { createDonation, listDonations } = require("../controllers/donation.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/", listDonations);
router.post("/", authMiddleware, upload.single("image"), createDonation);

module.exports = router;

