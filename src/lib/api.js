const resolveApiBaseUrl = () => {
  // In development, always use same-origin paths so Vite proxy handles /api and /uploads.
  if (import.meta.env.DEV) {
    return "";
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, "");
  }
  // Fallback for production if env is not set.
  return "";
};

export const API_BASE_URL = resolveApiBaseUrl();

export const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

export const getAuthHeaders = () => {
  const token = localStorage.getItem("sharebite.token");
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};
