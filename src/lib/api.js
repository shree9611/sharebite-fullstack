const CONFIGURED_API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, "")
  : "";
const DEFAULT_RENDER_API_BASE_URL = "https://sharebite-backend-r0pa.onrender.com";
const IS_VERCEL_FRONTEND =
  typeof window !== "undefined" &&
  /(?:^|\.)vercel\.app$/i.test(window.location.hostname || "");

const parseOrigin = (value) => {
  try {
    return new URL(String(value)).origin;
  } catch {
    return "";
  }
};

const isLocalOrigin = (origin) =>
  /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(String(origin || ""));

const resolveApiBaseUrl = () => {
  const isBrowser = typeof window !== "undefined";
  const isHttpsPage = isBrowser && window.location.protocol === "https:";
  const configuredOrigin = parseOrigin(CONFIGURED_API_BASE_URL);
  const hasLocalhostBase = isLocalOrigin(configuredOrigin || CONFIGURED_API_BASE_URL);

  if (isHttpsPage && hasLocalhostBase) {
    // Safety guard: never use localhost API base on deployed HTTPS frontend.
    // On Vercel, force same-origin so requests go through rewrites (/api -> backend).
    if (IS_VERCEL_FRONTEND) return "";
    return DEFAULT_RENDER_API_BASE_URL;
  }

  // If explicitly configured, always prefer this base URL.
  if (CONFIGURED_API_BASE_URL) {
    return CONFIGURED_API_BASE_URL;
  }

  if (IS_VERCEL_FRONTEND) {
    // Use same-origin API on Vercel so browser CORS is not involved.
    return "";
  }

  // Fallback when env is not set.
  return DEFAULT_RENDER_API_BASE_URL;
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
  const primaryUrl = buildApiUrl(path);
  const shouldTryRelativeFallback = !API_BASE_URL;
  const urlsToTry = Array.from(new Set([primaryUrl, ...(shouldTryRelativeFallback ? [path] : [])]));

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
