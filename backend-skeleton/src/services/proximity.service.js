const { User } = require("../models/user.model");

async function findNearbyReceivers(lng, lat, radiusMeters = 5000) {
  return User.find({
    role: "receiver",
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radiusMeters,
      },
    },
  })
    .select("_id")
    .lean();
}

module.exports = { findNearbyReceivers };

