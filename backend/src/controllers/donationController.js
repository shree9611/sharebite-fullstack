const Donation = require("../models/Donation");
const ImageAsset = require("../models/ImageAsset");
const { donationWithCompatFields } = require("../utils/responseTransformers");

exports.createDonation = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body = req.body || {};
    const uploadedFile = req.file || (Array.isArray(req.files) ? req.files[0] : null);

    let image = body.image || body.imageUrl || body.foodImage || body.picture || "";

    if (uploadedFile?.buffer?.length) {
      const savedImage = await ImageAsset.create({
        filename: uploadedFile.originalname || "",
        contentType: uploadedFile.mimetype || "application/octet-stream",
        size: uploadedFile.size || uploadedFile.buffer.length,
        data: uploadedFile.buffer,
      });
      image = `/api/images/${savedImage._id}`;
    }

    const donation = await Donation.create({ ...body, image, donor: req.user.id });
    return res.status(201).json(donationWithCompatFields(req, donation));
  } catch (error) {
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to submit donation" });
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
