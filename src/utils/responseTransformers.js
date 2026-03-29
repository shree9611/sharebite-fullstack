const isAbsoluteUrl = (value) => /^https?:\/\//i.test(String(value || ""));

const getApiBaseUrl = (req) => {
  if (process.env.PUBLIC_BACKEND_URL) {
    return process.env.PUBLIC_BACKEND_URL.replace(/\/$/, "");
  }
  return `${req.protocol}://${req.get("host")}`;
};

const toAbsoluteImageUrl = (req, imagePath) => {
  if (!imagePath) return "";
  if (isAbsoluteUrl(imagePath)) return imagePath;
  const normalized = String(imagePath).startsWith("/") ? imagePath : `/${imagePath}`;
  return `${getApiBaseUrl(req)}${normalized}`;
};

const pickUserLocation = (user) => {
  if (!user) return "";
  return (
    user.locationName ||
    user.address ||
    [user.city, user.state].filter(Boolean).join(", ") ||
    ""
  );
};

const donationWithCompatFields = (req, donation) => {
  const record = donation.toObject ? donation.toObject() : { ...donation };
  if (record.quantity === 0) {
    record.quantity = null;
  }
  const imageUrl = toAbsoluteImageUrl(req, record.image);
  return {
    ...record,
    image: imageUrl,
    imageUrl,
    foodImage: imageUrl,
  };
};

module.exports = {
  toAbsoluteImageUrl,
  pickUserLocation,
  donationWithCompatFields,
};
