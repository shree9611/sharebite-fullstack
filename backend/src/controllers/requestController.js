const Request = require("../models/Request");
const Donation = require("../models/Donation");
const User = require("../models/User");
const { notifyUser } = require("../utils/notifier");
const { donationWithCompatFields, pickUserLocation } = require("../utils/responseTransformers");
const { buildDashboardUrl, sendAppEmail } = require("../services/emailService");

const formatRequestResponse = (req, requestDoc) => {
  const request = requestDoc?.toObject ? requestDoc.toObject() : { ...requestDoc };
  const donation = request.donation ? donationWithCompatFields(req, request.donation) : null;

  return {
    ...request,
    donation,
    donorLocation: donation?.location || pickUserLocation(donation?.donor) || "",
    receiverLocation:
      request.requestedLocation ||
      request.deliveryAddress ||
      pickUserLocation(request.receiver) ||
      "",
  };
};

exports.createRequest = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!["receiver", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Only receiver can create request" });
  }

  if (!req.body?.donationId) {
    return res.status(400).json({ message: "donationId is required" });
  }

  const donation = await Donation.findById(req.body.donationId).select(
    "_id status donor foodName quantity quantityRemaining"
  );
  if (!donation) {
    return res.status(404).json({ message: "Donation not found" });
  }
  const donationStatus = String(donation.status || "").trim().toLowerCase();
  if (donationStatus && donationStatus !== "available" && donationStatus !== "active") {
    return res.status(400).json({ message: "Donation is not available for request" });
  }

  const requestedCount = Number(req.body.peopleCount) || 1;
  const remaining =
    Number.isFinite(Number(donation.quantityRemaining)) ? Number(donation.quantityRemaining) : Number(donation.quantity);
  if (Number.isFinite(remaining) && remaining > 0 && requestedCount > remaining) {
    return res.status(400).json({ message: `Only ${remaining} portion(s) are still available.` });
  }

  const receiver = await User.findById(req.user.id).select("locationName address city state");

  const createdRequest = await Request.create({
    donation: req.body.donationId,
    receiver: req.user.id,
    peopleCount: requestedCount,
    foodPreference: req.body.foodPreference || "any",
    requestedLocation: req.body.requestedLocation || pickUserLocation(receiver),
    logistics: req.body.logistics || "pickup",
    deliveryAddress: req.body.deliveryAddress || req.body.requestedLocation || pickUserLocation(receiver),
    pickupTimeWindow: req.body.pickupTimeWindow || "",
    status: "pending",
  });

  const created = await Request.findById(createdRequest._id)
    .populate({
      path: "donation",
      populate: { path: "donor", select: "name email locationName address city state coordinates" },
    })
    .populate("receiver", "name email locationName address city state coordinates");

  if (donation?.donor) {
    const donorUser = await User.findById(donation.donor).select("email name").lean();
    await notifyUser({
      userId: donation.donor,
      title: "New food request",
      message: `A receiver requested ${donation.foodName || "your donation"}.`,
      type: "request_created",
      metadata: {
        requestId: createdRequest._id,
        donationId: donation._id,
        receiverId: req.user.id,
      },
      skipEmail: true,
    });

    void (async () => {
      try {
        if (!donorUser?.email) return;
        await sendAppEmail({
          to: donorUser.email,
          subject: "New Request for Your Donation",
          title: "New Request for Your Donation",
          subtitle: "A receiver has requested food from your donation.",
          rows: [
            { label: "Food", value: donation.foodName || "Food" },
            { label: "Requested portions", value: String(requestedCount) },
            { label: "Request status", value: "Pending approval" },
          ],
          ctaText: "Open Donor Dashboard",
          ctaUrl: buildDashboardUrl("/donor/donate"),
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[email] request submitted -> donor failed:", error?.message || error);
      }
    })();
  }

  await notifyUser({
    userId: req.user.id,
    title: "Request submitted",
    message: `Your request for ${donation.foodName || "food"} was submitted successfully.`,
    type: "request_submitted",
    metadata: {
      requestId: createdRequest._id,
      donationId: donation._id,
    },
    skipEmail: true,
  });

  // Email receiver confirmation (explicit user action: request submitted).
  void (async () => {
    try {
      const receiverEmail = String(created?.receiver?.email || "").trim();
      if (!receiverEmail) return;
      await sendAppEmail({
        to: receiverEmail,
        subject: "Request submitted",
        title: "Request submitted",
        subtitle: `Your request for ${donation.foodName || "food"} was submitted successfully.`,
        rows: [
          { label: "Food", value: donation.foodName || "Food" },
          { label: "Requested portions", value: String(requestedCount) },
          { label: "Status", value: "Pending approval" },
        ],
        ctaText: "Open Receiver Dashboard",
        ctaUrl: buildDashboardUrl("/dashboard"),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[email] request submitted -> receiver failed:", error?.message || error);
    }
  })();

  return res.status(201).json(formatRequestResponse(req, created));
};

exports.getRequests = async (req, res) => {
  let query = {};

  // Filter by role
  if (req.user?.role === "receiver") {
    query.receiver = req.user.id;
  } else if (req.user?.role === "donor") {
    const donations = await Donation.find({ donor: req.user.id }).select("_id");
    const donationIds = donations.map((item) => item._id);
    query.donation = { $in: donationIds };
  }

  // ✅ ADD THIS (STATUS FILTER)
  if (req.query.status) {
    query.status = req.query.status;
  }

  const requests = await Request.find(query)
    .populate({
      path: "donation",
      populate: { path: "donor", select: "name email locationName address city state coordinates" },
    })
    .populate("receiver", "name email locationName address city state coordinates");

  const enriched = requests.map((item) => formatRequestResponse(req, item));

  return res.json(enriched);
};
