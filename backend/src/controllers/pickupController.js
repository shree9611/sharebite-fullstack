const Pickup = require("../models/Pickup");
const Request = require("../models/Request");
const Donation = require("../models/Donation");
const Notification = require("../models/Notification");
const { donationWithCompatFields, pickUserLocation } = require("../utils/responseTransformers");

exports.createPickup = async (req, res) => {
  const requestId = req.body?.requestId;
  if (!requestId) {
    return res.status(400).json({ message: "requestId is required" });
  }

  const request = await Request.findById(requestId).populate({
    path: "donation",
    select: "foodName donor",
    populate: { path: "donor", select: "name" },
  });
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  const pickup = await Pickup.create({
    request: requestId,
    volunteer: req.user?.role === "volunteer" ? req.user.id : null,
  });

  if (request?.donation?.donor) {
    await Notification.create({
      user: request.donation.donor._id,
      title: "Pickup scheduled",
      message: `Pickup scheduled for ${request.donation.foodName || "your donation"}.`,
      type: "pickup_scheduled",
      metadata: {
        pickupId: pickup._id,
        requestId: request._id,
        donationId: request.donation._id,
      },
    });
  }

  return res.json(pickup);
};

exports.completePickup = async (req, res) => {
  const pickup = await Pickup.findById(req.params.id).populate({
    path: "request",
    populate: {
      path: "donation",
      select: "foodName donor",
      populate: { path: "donor", select: "name" },
    },
  });

  if (!pickup) {
    return res.status(404).json({ message: "Pickup not found" });
  }

  if (pickup.status === "completed") {
    return res.json(pickup);
  }

  const actorRole = req.user?.role;
  const canComplete = actorRole === "volunteer" || actorRole === "admin";
  if (!canComplete) {
    return res.status(403).json({ message: "Only volunteer or admin can confirm delivery" });
  }

  pickup.status = "completed";
  pickup.completedAt = new Date();
  if (!pickup.volunteer && actorRole === "volunteer") {
    pickup.volunteer = req.user.id;
  }
  await pickup.save();

  const request = pickup.request;
  if (request) {
    request.status = "completed";
    await request.save();

    if (request.donation?._id) {
      await Donation.findByIdAndUpdate(request.donation._id, { status: "delivered" });
    }

    if (request.donation?.donor?._id) {
      await Notification.create({
        user: request.donation.donor._id,
        title: "Donation delivered",
        message: `Volunteer confirmed delivery for ${request.donation.foodName || "your donation"}.`,
        type: "delivery_confirmed",
        metadata: {
          pickupId: pickup._id,
          requestId: request._id,
          donationId: request.donation._id,
          confirmedBy: req.user.id,
        },
      });
    }
  }

  return res.json(pickup);
};

exports.getPickups = async (req, res) => {
  const query = {};

  if (req.user?.role === "volunteer") {
    query.$or = [{ volunteer: req.user.id }, { volunteer: null }];
  }

  const pickups = await Pickup.find(query)
    .sort({ createdAt: -1 })
    .populate({
      path: "request",
      populate: [
        {
          path: "donation",
          populate: { path: "donor", select: "name email locationName address city state coordinates" },
        },
        { path: "receiver", select: "name email locationName address city state coordinates" },
      ],
    })
    .populate("volunteer", "name email");

  const payload = pickups.map((item) => {
    const pickup = item.toObject();
    const request = pickup.request || {};
    const donation = request.donation ? donationWithCompatFields(req, request.donation) : null;

    return {
      ...pickup,
      request: {
        ...request,
        donation,
      },
      donorLocation: donation?.location || pickUserLocation(donation?.donor) || "",
      receiverLocation:
        request.requestedLocation ||
        request.deliveryAddress ||
        pickUserLocation(request.receiver) ||
        "",
    };
  });

  return res.json(payload);
};
