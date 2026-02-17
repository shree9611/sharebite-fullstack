const PROFILES_KEY = "sharebite.profiles";
const CURRENT_PROFILE_KEY = "sharebite.currentProfile";

const readProfiles = () => {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeProfiles = (profiles) => {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

const emailKey = (email) => (email || "").trim().toLowerCase();

export const upsertProfile = (profile) => {
  const key = emailKey(profile?.email);
  if (!key) return null;

  const profiles = readProfiles();
  const merged = {
    ...profiles[key],
    ...profile,
    email: (profile.email || "").trim(),
  };
  profiles[key] = merged;
  writeProfiles(profiles);
  return merged;
};

export const getProfileByEmail = (email) => {
  const key = emailKey(email);
  if (!key) return null;
  const profiles = readProfiles();
  return profiles[key] || null;
};

export const setCurrentProfile = (profile) => {
  if (!profile) return;
  localStorage.setItem(CURRENT_PROFILE_KEY, JSON.stringify(profile));
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
};
