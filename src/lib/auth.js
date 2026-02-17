const ROLE_MAP = {
  donor: "Donor",
  receiver: "Receiver",
  volunteer: "Volunteer",
  admin: "Volunteer",
};

export const normalizeRole = (role) => {
  if (!role || typeof role !== "string") return null;
  const normalized = ROLE_MAP[role.toLowerCase()];
  return normalized || null;
};

export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
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
