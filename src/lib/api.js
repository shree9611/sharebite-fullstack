const resolveApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // In local dev, use same-origin + Vite proxy (/api and /uploads).
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
