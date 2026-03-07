const Donation = require("../models/Donation");

exports.report = async (req, res) => {
  const count = await Donation.countDocuments();
  res.json({ totalDonations: count });
};
