const CURRENT_PROFILE_KEY = "sharebite.currentProfile";
const PROFILE_EVENT = "sharebite.profileUpdated";

const emitProfileUpdated = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PROFILE_EVENT));
};

const sanitizeProfile = (profile) => {
  if (!profile || typeof profile !== "object") return null;
  return {
    ...profile,
    email: String(profile.email || "").trim(),
  };
};

export const upsertProfile = (profile) => {
  const current = getCurrentProfile() || {};
  const merged = sanitizeProfile({ ...current, ...profile });
  if (!merged?.email) return null;
  localStorage.setItem(CURRENT_PROFILE_KEY, JSON.stringify(merged));
  emitProfileUpdated();
  return merged;
};

export const getProfileByEmail = (email) => {
  const current = getCurrentProfile();
  if (!current) return null;
  const target = String(email || "").trim().toLowerCase();
  if (!target) return null;
  return String(current.email || "").trim().toLowerCase() === target ? current : null;
};

export const setCurrentProfile = (profile) => {
  const sanitized = sanitizeProfile(profile);
  if (!sanitized) return;
  localStorage.setItem(CURRENT_PROFILE_KEY, JSON.stringify(sanitized));
  emitProfileUpdated();
};

export const getCurrentProfile = () => {
  try {
    const raw = localStorage.getItem(CURRENT_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearCurrentProfile = () => {
  localStorage.removeItem(CURRENT_PROFILE_KEY);
  emitProfileUpdated();
};
