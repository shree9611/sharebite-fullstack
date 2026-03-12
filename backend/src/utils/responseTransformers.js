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
  const imageUrl = toAbsoluteImageUrl(req, record.image);
  return {
    ...record,
    image: imageUrl,
    imageUrl,
    foodImage: imageUrl,
  };
};

const normalizeUserRoleLabel = (role) => {
  const normalized = String(role || "").toLowerCase();
  if (normalized === "donor") return "Donor";
  if (normalized === "receiver") return "Receiver";
  if (normalized === "volunteer") return "Volunteer";
  if (normalized === "admin") return "Admin";
  return "";
};

const userWithCompatFields = (req, user) => {
  const record = user?.toObject ? user.toObject() : { ...(user || {}) };
  const profileImageUrl = toAbsoluteImageUrl(req, record.profileImage);
  return {
    ...record,
    fullName: record.fullName || record.name || "",
    phoneNumber: record.phoneNumber || record.phone || "",
    accountType: record.accountType || normalizeUserRoleLabel(record.role),
    profileImage: profileImageUrl,
    profileImageUrl,
  };
};

module.exports = {
  toAbsoluteImageUrl,
  pickUserLocation,
  donationWithCompatFields,
  userWithCompatFields,
};
