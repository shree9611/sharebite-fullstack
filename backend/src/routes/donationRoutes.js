const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const upload = require("../middleware/uploadMiddleware");
const { createDonation, getDonations, getDonationHistory, getMyDonations } = require("../controllers/donationController");

router.post("/", auth, upload.any(), asyncHandler(createDonation));
router.get("/mine", auth, asyncHandler(getMyDonations));
router.get("/history", asyncHandler(getDonationHistory));
router.get("/", asyncHandler(getDonations));

module.exports = router;
