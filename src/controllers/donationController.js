const Donation = require("../models/Donation");
const ImageAsset = require("../models/ImageAsset");
const { donationWithCompatFields } = require("../utils/responseTransformers");
const mongoose = require("mongoose");

const ensureDbReady = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ message: "Database unavailable. Please try again shortly." });
    return false;
  }
  return true;
};

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseDonationCoordinates = (body) => {
  const latitude =
    body?.latitude ??
    body?.lat ??
    body?.coords?.latitude ??
    body?.coords?.lat ??
    body?.coordinates?.latitude ??
    body?.coordinates?.lat;
  const longitude =
    body?.longitude ??
    body?.lng ??
    body?.coords?.longitude ??
    body?.coords?.lng ??
    body?.coordinates?.longitude ??
    body?.coordinates?.lng;

  const parsedLat = parseOptionalNumber(latitude);
  const parsedLng = parseOptionalNumber(longitude);

  if (parsedLat === null && parsedLng === null) return null;
  if (parsedLat === null || parsedLng === null) return { error: "Both latitude and longitude are required" };
  if (parsedLat < -90 || parsedLat > 90) return { error: "latitude must be between -90 and 90" };
  if (parsedLng < -180 || parsedLng > 180) return { error: "longitude must be between -180 and 180" };

  return {
    type: "Point",
    coordinates: [parsedLng, parsedLat],
  };
};

exports.createDonation = async (req, res) => {
  if (!ensureDbReady(res)) return;
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body = req.body || {};
    const uploadedFile = req.file || (Array.isArray(req.files) ? req.files[0] : null);

    let image = body.image || body.imageUrl || body.foodImage || body.picture || "";

    if (uploadedFile?.buffer?.length) {
      const savedImage = await ImageAsset.create({
        filename: uploadedFile.originalname || "",
        contentType: uploadedFile.mimetype || "application/octet-stream",
        size: uploadedFile.size || uploadedFile.buffer.length,
        data: uploadedFile.buffer,
      });
      image = `/api/images/${savedImage._id}`;
    }

    const quantityProvided = body.quantity !== undefined && body.quantity !== null && body.quantity !== "";
    let quantity;
    if (quantityProvided) {
      quantity = Number(body.quantity);
      if (!Number.isFinite(quantity)) {
        return res.status(400).json({ message: "quantity must be a number" });
      }
      if (quantity <= 0) {
        return res.status(400).json({ message: "quantity must be greater than 0" });
      }
    }

    const expiryTime = body.expiryTime ? new Date(body.expiryTime) : undefined;
    if (expiryTime !== undefined && Number.isNaN(expiryTime.getTime())) {
      return res.status(400).json({ message: "expiryTime must be a valid date" });
    }

    const parsedCoordinates = parseDonationCoordinates(body);
    if (parsedCoordinates?.error) {
      return res.status(400).json({ message: parsedCoordinates.error });
    }

    // Avoid spreading raw req.body into MongoDB documents (prevents invalid geospatial objects, etc.).
    const donationPayload = {
      donor: req.user.id,
      foodName: body.foodName,
      location: body.location,
      expiryTime,
      image,
    };

    if (quantityProvided) {
      donationPayload.quantity = quantity;
    }

    if (parsedCoordinates) {
      donationPayload.coordinates = parsedCoordinates;
    }

    const donation = await Donation.create(donationPayload);
    return res.status(201).json(donationWithCompatFields(req, donation));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("createDonation failed", {
      userId: req.user?.id,
      hasFile: Boolean(req.file || (Array.isArray(req.files) && req.files.length)),
      error: error && (error.stack || error.message || error),
    });
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to submit donation" });
  }
};

exports.getDonations = async (req, res) => {
  if (!ensureDbReady(res)) return;
  try {
    const data = await Donation.find().populate("donor", "name email locationName address city state coordinates");
    return res.json(data.map((item) => donationWithCompatFields(req, item)));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("getDonations failed", error && (error.stack || error.message || error));
    return res.status(500).json({ message: "Failed to fetch donations" });
  }
};
