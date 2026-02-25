const resolveApiBaseUrl = () => {
  // Use explicit backend URL when provided (dev + production).
  // Falls back to same-origin when env is not set.
  if (import.meta.env.VITE_API_BASE_URL) {
    return String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, "");
  }
  // Fallback when env is not set.
  return "";
};

export const API_BASE_URL = resolveApiBaseUrl();

export const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

export const apiFetchWithFallback = async (path, options = {}) => {
  const primaryUrl = buildApiUrl(path);
  const fallbackUrl = path;
  const urlsToTry = primaryUrl === fallbackUrl ? [primaryUrl] : [primaryUrl, fallbackUrl];

  let lastNetworkError = null;
  for (const url of urlsToTry) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (error instanceof TypeError) {
        lastNetworkError = error;
        continue;
      }
      throw error;
    }
  }

  if (lastNetworkError) {
    throw lastNetworkError;
  }

  throw new Error("Unable to reach server.");
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("sharebite.token");
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};
