const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  foodName: String,
  quantity: Number,
  location: String,
  expiryTime: Date,
  image: { type: String, default: "" },
  status: { type: String, default: "available" },
  // GeoJSON point for geospatial queries (2dsphere index).
  // Keep optional: if no coordinates provided, omit the field entirely.
  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      validate: {
        validator(value) {
          if (value === undefined || value === null) return true;
          if (!Array.isArray(value) || value.length !== 2) return false;
          const [lng, lat] = value;
          return (
            Number.isFinite(lng) &&
            Number.isFinite(lat) &&
            lng >= -180 &&
            lng <= 180 &&
            lat >= -90 &&
            lat <= 90
          );
        },
        message: "coordinates must be [longitude, latitude]",
      },
    },
  },
});

donationSchema.index({ coordinates: "2dsphere" });

module.exports = mongoose.model("Donation", donationSchema);
