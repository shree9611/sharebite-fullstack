const ROLE_MAP = {
  donor: "Donor",
  donar: "Donor",
  receiver: "Receiver",
  volunteer: "Volunteer",
  admin: "Volunteer",
};

export const normalizeRole = (role) => {
  if (!role || typeof role !== "string") return null;
  const key = role.trim().toLowerCase();
  if (!key) return null;
  const mapped = ROLE_MAP[key];
  if (mapped) return mapped;
  if (key === "donor") return "Donor";
  if (key === "receiver") return "Receiver";
  if (key === "volunteer") return "Volunteer";
  return null;
};

export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (payload.length % 4)) % 4;
    if (padLength) payload += "=".repeat(padLength);
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const getCurrentUserRole = () => {
  const storedRole = normalizeRole(localStorage.getItem("sharebite.role"));
  if (storedRole) return storedRole;

  const token = localStorage.getItem("sharebite.token");
  const payload = decodeJwtPayload(token);
  const tokenRole = normalizeRole(payload?.role);
  if (tokenRole) {
    localStorage.setItem("sharebite.role", tokenRole);
  }
  return tokenRole;
};

export const getRoleHomePath = (role) => {
  if (role === "Donor") return "/donor/donate";
  if (role === "Volunteer") return "/volunteer/acceptmission";
  return "/dashboard";
};

export const clearSession = () => {
  localStorage.removeItem("sharebite.token");
  localStorage.removeItem("sharebite.role");
};
