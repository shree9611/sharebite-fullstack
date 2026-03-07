const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const upload = require("../middleware/uploadMiddleware");
const { createDonation, getDonations } = require("../controllers/donationController");

router.post("/", auth, upload.any(), asyncHandler(createDonation));
router.get("/", asyncHandler(getDonations));

module.exports = router;
