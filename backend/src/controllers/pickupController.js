const Pickup = require("../models/Pickup");
const Request = require("../models/Request");
const Donation = require("../models/Donation");
const { notifyUser } = require("../utils/notifier");
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
  }).populate({ path: "receiver", select: "name" });
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  const pickup = await Pickup.create({
    request: requestId,
    volunteer: req.user?.role === "volunteer" ? req.user.id : null,
  });

  if (pickup?.volunteer) {
    await notifyUser({
      userId: pickup.volunteer,
      title: "Mission accepted",
      message: `You accepted the pickup for ${request.donation?.foodName || "a donation"}.`,
      type: "mission_accepted",
      metadata: {
        pickupId: pickup._id,
        requestId: request._id,
        donationId: request.donation?._id,
      },
    });
  }

  if (request?.donation?.donor) {
    await notifyUser({
      userId: request.donation.donor._id,
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

  if (request?.receiver?._id) {
    await notifyUser({
      userId: request.receiver._id,
      title: "Volunteer assigned",
      message: `A volunteer accepted your request for ${request.donation?.foodName || "your food"}.`,
      type: "volunteer_assigned",
      metadata: {
        pickupId: pickup._id,
        requestId: request._id,
        donationId: request.donation?._id,
      },
    });
  }

  return res.json(pickup);
};

exports.completePickup = async (req, res) => {
  // Explicit audit log: pickup completion must only happen via a verified user action.
  // eslint-disable-next-line no-console
  console.log("Pickup completion triggered:", {
    userId: req.user?.id,
    role: req.user?.role,
    pickupId: req.params.id,
    timestamp: new Date().toISOString(),
    requestId: req.requestId || "",
  });

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
    // eslint-disable-next-line no-console
    console.log("Pickup completion rejected (unauthorized role):", {
      userId: req.user?.id,
      role: actorRole,
      pickupId: req.params.id,
      timestamp: new Date().toISOString(),
      requestId: req.requestId || "",
    });
    return res.status(403).json({ message: "Only volunteer or admin can confirm delivery" });
  }

  pickup.status = "completed";
  pickup.completedAt = new Date();
  if (!pickup.volunteer && actorRole === "volunteer") {
    pickup.volunteer = req.user.id;
  }
  await pickup.save();

  if (pickup?.volunteer) {
    await notifyUser({
      userId: pickup.volunteer,
      title: "Pickup completed",
      message: `Delivery marked completed for ${pickup.request?.donation?.foodName || "a donation"}.`,
      type: "pickup_completed",
      metadata: {
        pickupId: pickup._id,
        requestId: pickup.request?._id,
        donationId: pickup.request?.donation?._id,
      },
    });
  }

  const request = pickup.request;
  if (request) {
    request.status = "completed";
    await request.save();

    if (request.donation?._id) {
      const donation = await Donation.findById(request.donation._id);
      if (donation) {
        const total = Number(donation.quantity);
        const hasRemaining = Number.isFinite(Number(donation.quantityRemaining));
        const currentRemaining = hasRemaining
          ? Number(donation.quantityRemaining)
          : (Number.isFinite(total) ? total : 0);
        const requested = Math.max(1, Number(request.peopleCount) || 1);
        const nextRemaining = Math.max(0, currentRemaining - requested);

        donation.quantityRemaining = nextRemaining;
        donation.status = nextRemaining <= 0 ? "delivered" : "available";
        await donation.save();
      }
    }

    if (request.donation?.donor?._id) {
      await notifyUser({
        userId: request.donation.donor._id,
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

    if (request.receiver?._id) {
      await notifyUser({
        userId: request.receiver._id,
        title: "Delivery confirmed",
        message: `Volunteer confirmed delivery for ${request.donation?.foodName || "your request"}.`,
        type: "delivery_confirmed_receiver",
        metadata: {
          pickupId: pickup._id,
          requestId: request._id,
          donationId: request.donation?._id,
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
    if (!req.query?.status) {
      query.status = "scheduled";
    }
  }

  if (req.query?.status && ["scheduled", "completed"].includes(String(req.query.status))) {
    query.status = String(req.query.status);
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
