const Donation = require("../models/Donation");
const ImageAsset = require("../models/ImageAsset");
const User = require("../models/User");
const { notifyUser } = require("../utils/notifier");
const { donationWithCompatFields } = require("../utils/responseTransformers");
const { sendAppEmail } = require("../services/emailService");
const mongoose = require("mongoose");

const DONATION_DEBUG = String(process.env.DEBUG_DONATIONS || "").trim() === "1";

const parseExpiryTime = (rawValue) => {
  const value = String(rawValue || "").trim();
  if (!value) return null;

  // Support "HH:MM" (time-only) inputs by using today's date.
  const timeOnlyMatch = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (timeOnlyMatch) {
    const hours = Number(timeOnlyMatch[1]);
    const minutes = Number(timeOnlyMatch[2]);
    const date = new Date();
    date.setSeconds(0, 0);
    date.setHours(hours, minutes, 0, 0);
    // If time has already passed today, roll to tomorrow.
    if (date.getTime() <= Date.now()) {
      date.setDate(date.getDate() + 1);
    }
    return date;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const ensureDbReady = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ message: "Database unavailable. Please try again shortly." });
    return false;
  }
  return true;
};

exports.createDonation = async (req, res) => {
  if (!ensureDbReady(res)) return;
  try {
    if (DONATION_DEBUG) {
      // eslint-disable-next-line no-console
      console.log(`[${req.requestId || "n/a"}] createDonation body keys=`, Object.keys(req.body || {}));
      // eslint-disable-next-line no-console
      console.log(`[${req.requestId || "n/a"}] createDonation files=`, Array.isArray(req.files) ? req.files.length : 0);
      // eslint-disable-next-line no-console
      console.log(`[${req.requestId || "n/a"}] createDonation user=`, req.user || null);
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body = req.body || {};
    // upload.any() populates req.files; keep req.file support for compatibility.
    const uploadedFile = req.file || (Array.isArray(req.files) ? req.files[0] : null);

    let image = body.image || body.imageUrl || body.foodImage || body.picture || "";

    const foodTitle = String(body.foodTitle || body.foodName || body.title || "").trim();
    const foodName = foodTitle;
    const quantityRaw = body.quantity ?? body.qty ?? "";
    const quantity = typeof quantityRaw === "number" ? quantityRaw : Number(String(quantityRaw).trim());
    const pickupLocation = String(body.pickupLocation || body.location || "").trim();
    const location = pickupLocation;
    const expiryTimeRaw = body.expiryTime || body.bestBefore || body.expiry || "";
    const bestBefore = String(body.bestBefore || "").trim();
    const expiryTime = parseExpiryTime(expiryTimeRaw);

    const dietaryType = String(body.dietaryType || body.dietary || "").trim();
    const bakedType = String(body.bakedType || body.baked || "").trim();

    if (!foodName || !Number.isFinite(quantity) || quantity <= 0 || !location || !expiryTimeRaw) {
      return res.status(400).json({
        message: "Missing required fields: foodTitle, quantity, pickupLocation, bestBefore",
      });
    }
    if (!(expiryTime instanceof Date) || Number.isNaN(expiryTime.getTime())) {
      return res.status(400).json({ message: "expiryTime must be a valid date" });
    }
    if (expiryTime.getTime() <= Date.now()) {
      return res.status(400).json({ message: "expiryTime must be in the future" });
    }

    if (uploadedFile?.buffer?.length) {
      try {
        const savedImage = await ImageAsset.create({
          filename: uploadedFile.originalname || "",
          contentType: uploadedFile.mimetype || "application/octet-stream",
          size: uploadedFile.size || uploadedFile.buffer.length,
          data: uploadedFile.buffer,
        });
        image = `/api/images/${savedImage._id}`;
      } catch (imageError) {
        console.error(
          `[${req.requestId || "n/a"}] Donation image save failed:`,
          imageError?.stack || imageError?.message || imageError
        );
        // Fallback: store base64 directly on the donation when ImageAsset fails.
        // uploadMiddleware limits files to 5MB, keeping this under Mongo's 16MB doc limit.
        if (!image && uploadedFile?.mimetype?.startsWith("image/")) {
          try {
            const base64 = uploadedFile.buffer.toString("base64");
            image = `data:${uploadedFile.mimetype};base64,${base64}`;
          } catch (encodeError) {
            console.error(
              `[${req.requestId || "n/a"}] Donation image base64 encode failed:`,
              encodeError?.message || encodeError
            );
          }
        }
      }
    }

    const donation = await Donation.create({
      donor: req.user.id,
      foodName,
      foodTitle,
      quantity,
      quantityRemaining: quantity,
      location,
      pickupLocation,
      expiryTime,
      bestBefore,
      image,
      dietaryType,
      bakedType,
    });

    await notifyUser({
      userId: req.user.id,
      title: "Donation submitted",
      message: `Your donation for ${foodName || "food"} was submitted successfully.`,
      type: "donation_created",
      metadata: {
        donationId: donation?._id,
      },
      skipEmail: true,
    });

    // Email donor confirmation (explicit user action: donation created).
    void (async () => {
      try {
        const donorUser = await User.findById(req.user.id).select("email name").lean();
        const donorEmail = String(donorUser?.email || "").trim();
        if (!donorEmail) return;

        const expiryText = donation?.expiryTime ? new Date(donation.expiryTime).toLocaleString() : "";
        await sendAppEmail({
          to: donorEmail,
          subject: "Donation submitted",
          title: "Donation submitted",
          subtitle: "Your donation is now listed for receivers.",
          rows: [
            { label: "Food", value: donation.foodName || "Food" },
            { label: "Total portions", value: String(donation.quantity ?? "") },
            { label: "Pickup location", value: donation.pickupLocation || donation.location || "" },
            { label: "Expiry time", value: expiryText },
          ],
          ctaText: "Open Donor Dashboard",
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[email] donation created -> donor failed:", error?.message || error);
      }
    })();

    // Email nearby receivers (explicit user action: donation created).
    // Never fail the API call due to email issues.
    (async () => {
      try {
        const donor = await User.findById(req.user.id).select("name coordinates city state locationName").lean();
        const donorLat = Number(donor?.coordinates?.latitude);
        const donorLng = Number(donor?.coordinates?.longitude);
        const hasCoords = Number.isFinite(donorLat) && Number.isFinite(donorLng);
        if (!hasCoords) return;

        const receivers = await User.find({
          role: "receiver",
          email: { $exists: true, $ne: "" },
        })
          .select("email name coordinates")
          .lean();

        const uniqueEmails = new Set();
        const recipients = [];

        const haversineKm = (fromLat, fromLng, toLat, toLng) => {
          const earthRadiusKm = 6371;
          const toRad = (value) => (value * Math.PI) / 180;
          const dLat = toRad(toLat - fromLat);
          const dLng = toRad(toLng - fromLng);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
          return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };

        for (const receiver of receivers) {
          const email = String(receiver?.email || "").trim().toLowerCase();
          if (!email || uniqueEmails.has(email)) continue;

          if (hasCoords) {
            const lat = Number(receiver?.coordinates?.latitude);
            const lng = Number(receiver?.coordinates?.longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
            const distanceKm = haversineKm(donorLat, donorLng, lat, lng);
            if (distanceKm > 10) continue;
          }

          uniqueEmails.add(email);
          recipients.push(receiver);
          if (recipients.length >= 25) break;
        }

        if (!recipients.length) return;

        const expiryText = donation?.expiryTime ? new Date(donation.expiryTime).toLocaleString() : "";
        for (const receiver of recipients) {
          await sendAppEmail({
            to: receiver.email,
            subject: "New Food Donation Available",
            title: "New Food Donation Available",
            subtitle: "A donor nearby has shared food that you can request now.",
            rows: [
              { label: "Food", value: donation.foodName || "Food" },
              { label: "Quantity", value: String(donation.quantityRemaining ?? donation.quantity ?? "") },
              { label: "Pickup location", value: donation.pickupLocation || donation.location || "" },
              { label: "Expiry time", value: expiryText },
            ],
            ctaText: "Open Receiver Dashboard",
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[email] donation created -> receivers failed:", error?.message || error);
      }
    })();

    return res.status(201).json(donationWithCompatFields(req, donation));
  } catch (error) {
    console.error(`[${req.requestId || "n/a"}] Donation create failed:`, error?.stack || error?.message || error);
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    // Include request id so you can correlate with Render logs. Include error type/code for faster debugging.
    return res.status(500).json({
      message: "Failed to submit donation",
      requestId: req.requestId || "",
      errorName: error?.name || "",
      errorCode: error?.code || "",
      error: process.env.NODE_ENV === "production" ? undefined : (error?.message || String(error)),
    });
  }
};

exports.getDonations = async (req, res) => {
  try {
    const now = new Date();
    const data = await Donation.find({
      $and: [
        { status: { $regex: /^(available|active)$/i } },
        { expiryTime: { $gt: now } },
        {
          $or: [
            { quantityRemaining: { $gt: 0 } },
            {
              $and: [
                {
                  $or: [
                    { quantityRemaining: { $exists: false } },
                    { quantityRemaining: null },
                  ],
                },
                { quantity: { $gt: 0 } },
              ],
            },
          ],
        },
      ],
    }).populate("donor", "name email locationName address city state coordinates");

    return res.json(
      data.map((item) => {
        const record = donationWithCompatFields(req, item);
        return record;
      })
    );
  } catch {
    return res.status(500).json({ message: "Failed to fetch donations" });
  }
};

exports.getDonationHistory = async (req, res) => {
  try {
    const now = new Date();
    const rows = await Donation.find({
      $or: [
        { status: { $not: { $regex: /^(available|active)$/i } } },
        { expiryTime: { $lte: now } },
        { quantityRemaining: { $lte: 0 } },
        {
          $and: [
            {
              $or: [
                { quantityRemaining: { $exists: false } },
                { quantityRemaining: null },
              ],
            },
            { quantity: { $lte: 0 } },
          ],
        },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("donor", "name email locationName address city state coordinates");

    return res.json(rows.map((item) => donationWithCompatFields(req, item)));
  } catch {
    return res.status(500).json({ message: "Failed to fetch donation history" });
  }
};

exports.getMyDonations = async (req, res) => {
  if (!ensureDbReady(res)) return;
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const limitRaw = Array.isArray(req.query?.limit) ? req.query.limit[0] : req.query?.limit;
    const requestedLimit = Number(limitRaw);
    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(Math.floor(requestedLimit), 100)
        : 40;

    const rows = await Donation.find({ donor: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json(rows.map((item) => donationWithCompatFields(req, item)));
  } catch (error) {
    console.error(`[${req.requestId || "n/a"}] Donation list mine failed:`, error?.message || error);
    return res.status(500).json({ message: "Failed to fetch donations" });
  }
};
