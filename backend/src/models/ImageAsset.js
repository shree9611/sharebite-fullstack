const mongoose = require("mongoose");

const imageAssetSchema = new mongoose.Schema(
  {
    filename: { type: String, default: "" },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImageAsset", imageAssetSchema);
