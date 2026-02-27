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

async function findNearbyVolunteers({ lng, lat, city = "", state = "", radiusMeters = 15000 }) {
  const hasCoords = Number.isFinite(Number(lng)) && Number.isFinite(Number(lat));
  if (hasCoords) {
    const volunteers = await User.find({
      role: "admin",
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: radiusMeters,
        },
      },
    })
      .select("_id city state")
      .lean();
    if (volunteers.length > 0) return volunteers;
  }

  const fallbackQuery = { role: "admin" };
  if (state) fallbackQuery.state = state;
  if (city) fallbackQuery.city = city;

  const volunteersByCityState = await User.find(fallbackQuery).select("_id city state").lean();
  if (volunteersByCityState.length > 0) return volunteersByCityState;

  return User.find({ role: "admin" }).select("_id city state").limit(25).lean();
}

module.exports = { findNearbyReceivers, findNearbyVolunteers };
