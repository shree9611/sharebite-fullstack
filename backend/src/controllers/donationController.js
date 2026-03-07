const Donation = require("../models/Donation");
const ImageAsset = require("../models/ImageAsset");
const { donationWithCompatFields } = require("../utils/responseTransformers");
const mongoose = require("mongoose");

const ensureDbReady = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ message: "Database unavailable. Please try again shortly." });
    return false;
  }
  return true;
};

exports.createDonation = async (req, res) => {
  if (!ensureDbReady(res)) return;
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body = req.body || {};
    const uploadedFile = req.file || (Array.isArray(req.files) ? req.files[0] : null);

    let image = body.image || body.imageUrl || body.foodImage || body.picture || "";

    const foodName = String(body.foodName || body.title || "").trim();
    const quantityRaw = body.quantity ?? body.qty ?? "";
    const quantity = typeof quantityRaw === "number" ? quantityRaw : Number(String(quantityRaw).trim());
    const location = String(body.location || body.pickupLocation || "").trim();
    const expiryTimeRaw = body.expiryTime || body.bestBefore || body.expiry || "";
    const expiryTime = expiryTimeRaw ? new Date(String(expiryTimeRaw)) : null;

    if (!foodName || !Number.isFinite(quantity) || quantity <= 0 || !location) {
      return res.status(400).json({ message: "foodName, quantity (> 0), and location are required" });
    }
    if (!(expiryTime instanceof Date) || Number.isNaN(expiryTime.getTime())) {
      return res.status(400).json({ message: "expiryTime must be a valid date" });
    }
    if (expiryTime.getTime() <= Date.now()) {
      return res.status(400).json({ message: "expiryTime must be in the future" });
    }

    if (uploadedFile?.buffer?.length) {
      try {
        const savedImage = await ImageAsset.create({
          filename: uploadedFile.originalname || "",
          contentType: uploadedFile.mimetype || "application/octet-stream",
          size: uploadedFile.size || uploadedFile.buffer.length,
          data: uploadedFile.buffer,
        });
        image = `/api/images/${savedImage._id}`;
      } catch (imageError) {
        console.error(
          `[${req.requestId || "n/a"}] Donation image save failed:`,
          imageError?.stack || imageError?.message || imageError
        );
        // Continue without a stored image; donation creation should still succeed.
      }
    }

    const donation = await Donation.create({
      donor: req.user.id,
      foodName,
      quantity,
      location,
      expiryTime,
      image,
    });
    return res.status(201).json(donationWithCompatFields(req, donation));
  } catch (error) {
    console.error(`[${req.requestId || "n/a"}] Donation create failed:`, error?.stack || error?.message || error);
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    // Include request id so you can correlate with Render logs without leaking stack traces to users.
    return res.status(500).json({ message: "Failed to submit donation", requestId: req.requestId || "" });
  }
};

exports.getDonations = async (req, res) => {
  try {
    const data = await Donation.find().populate("donor", "name email locationName address city state coordinates");
    return res.json(data.map((item) => donationWithCompatFields(req, item)));
  } catch {
    return res.status(500).json({ message: "Failed to fetch donations" });
  }
};

exports.getMyDonations = async (req, res) => {
  if (!ensureDbReady(res)) return;
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const limitRaw = Array.isArray(req.query?.limit) ? req.query.limit[0] : req.query?.limit;
    const requestedLimit = Number(limitRaw);
    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(Math.floor(requestedLimit), 100)
        : 40;

    const rows = await Donation.find({ donor: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json(rows.map((item) => donationWithCompatFields(req, item)));
  } catch (error) {
    console.error(`[${req.requestId || "n/a"}] Donation list mine failed:`, error?.message || error);
    return res.status(500).json({ message: "Failed to fetch donations" });
  }
};
