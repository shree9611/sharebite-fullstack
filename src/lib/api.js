const CONFIGURED_API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, "")
  : "";
const IS_VERCEL_FRONTEND =
  typeof window !== "undefined" &&
  /(?:^|\.)vercel\.app$/i.test(window.location.hostname || "");

const resolveApiBaseUrl = () => {
  // If explicitly configured, always prefer this base URL.
  if (CONFIGURED_API_BASE_URL) {
    return CONFIGURED_API_BASE_URL;
  }

  if (IS_VERCEL_FRONTEND) {
    // Route through Vercel rewrites to avoid browser CORS preflight issues.
    return "";
  }

  // Fallback when env is not set.
  return "";
};

export const API_BASE_URL = resolveApiBaseUrl();

export const buildApiUrl = (path) => `${API_BASE_URL}${path}`;
const buildUrlWithBase = (base, path) => `${base || ""}${path}`;
const SAFE_DATA_IMAGE_RE = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i;

export const resolveAssetUrl = (assetPath) => {
  const rawValue = String(assetPath || "").trim();
  if (!rawValue) return "";
  if (rawValue.startsWith("http://") || rawValue.startsWith("https://")) {
    // Normalize backend-host absolute upload URLs to the configured API host.
    // This avoids broken images when backend returns a different origin.
    if (API_BASE_URL) {
      try {
        const parsed = new URL(rawValue);
        if (parsed.pathname.startsWith("/uploads/")) {
          return buildApiUrl(`${parsed.pathname}${parsed.search || ""}${parsed.hash || ""}`);
        }
      } catch {
        // Keep original URL if parsing fails.
      }
    }
    return rawValue;
  }
  if (rawValue.startsWith("data:")) return SAFE_DATA_IMAGE_RE.test(rawValue) ? rawValue : "";
  if (rawValue.startsWith("//")) return `https:${rawValue}`;
  const normalizedPath = rawValue.startsWith("/")
    ? rawValue
    : `/${rawValue.replace(/^\/+/, "")}`;
  return buildUrlWithBase(API_BASE_URL, normalizedPath);
};

export const apiFetchWithFallback = async (path, options = {}) => {
  const urlsToTry = Array.from(
    new Set([
      buildApiUrl(path),
      path,
    ])
  );

  let lastNetworkError = null;
  let lastServerErrorResponse = null;
  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, options);
      if (response.status >= 500) {
        lastServerErrorResponse = response;
        continue;
      }
      return response;
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

  if (lastServerErrorResponse) {
    return lastServerErrorResponse;
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
