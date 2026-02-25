const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["donor", "receiver", "admin"], required: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    locationName: { type: String, default: "" },
    avatar: { type: String, default: "" },
    organizationName: { type: String, default: "" },
    foodTypeUsuallyDonated: { type: String, default: "" },
    totalDonationsCount: { type: Number, default: 0 },
    donorRating: { type: Number, default: 0 },
    receiverOrganizationName: { type: String, default: "" },
    peopleServed: { type: Number, default: 0 },
    totalFoodReceived: { type: Number, default: 0 },
    receiverRating: { type: Number, default: 0 },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
module.exports = { User };
