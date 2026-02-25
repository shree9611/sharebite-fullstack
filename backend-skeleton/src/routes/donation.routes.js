const express = require("express");
const { createDonation, listDonations, listMyDonations } = require("../controllers/donation.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/", listDonations);
router.get("/mine", authMiddleware, listMyDonations);
router.post("/", authMiddleware, (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }
    return res.status(400).json({ message: error.message || "Invalid image upload." });
  });
}, createDonation);

module.exports = router;
