const mongoose = require("mongoose");
const ImageAsset = require("../models/ImageAsset");

exports.getImageById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Image not found" });
  }

  const image = await ImageAsset.findById(id).select("contentType data filename size updatedAt");
  if (!image) {
    return res.status(404).json({ message: "Image not found" });
  }

  res.setHeader("Content-Type", image.contentType || "application/octet-stream");
  res.setHeader("Content-Length", String(image.size || image.data?.length || 0));
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  if (image.filename) {
    res.setHeader("Content-Disposition", `inline; filename=\"${image.filename}\"`);
  }

  return res.send(image.data);
};
