const CONFIGURED_API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
const DEFAULT_PROD_API_BASE_URL = "https://sharebite-backend-r0pa.onrender.com";
const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:5000";
const SAFE_DATA_IMAGE_RE = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i;
const DEFAULT_API_TIMEOUT_MS = 15000;

const isBrowser = typeof window !== "undefined";
const isLocalPage =
  isBrowser &&
  /^(localhost|127\.0\.0\.1)$/i.test(String(window.location.hostname || ""));

const resolveApiBaseUrl = () => {
  if (CONFIGURED_API_BASE_URL) {
    // Avoid invalid localhost target on deployed HTTPS pages.
    if (
      isBrowser &&
      window.location.protocol === "https:" &&
      /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(CONFIGURED_API_BASE_URL)
    ) {
      return DEFAULT_PROD_API_BASE_URL;
    }
    return CONFIGURED_API_BASE_URL;
  }
  return isLocalPage ? DEFAULT_LOCAL_API_BASE_URL : DEFAULT_PROD_API_BASE_URL;
};

export const API_BASE_URL = resolveApiBaseUrl();
export const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

const withNoCache = (options = {}) => {
  const method = String(options?.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return options;

  const headers = new Headers(options?.headers || undefined);
  if (!headers.has("Cache-Control")) headers.set("Cache-Control", "no-store");
  if (!headers.has("Pragma")) headers.set("Pragma", "no-cache");

  return {
    ...options,
    headers,
    cache: options?.cache || "no-store",
  };
};

const fetchWithTimeout = async (url, options, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...withNoCache(options),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const resolveAssetUrl = (assetPath) => {
  const rawValue = String(assetPath || "").trim();
  if (!rawValue) return "";
  if (/^https?:\/\//i.test(rawValue)) return rawValue;
  if (rawValue.startsWith("data:")) return SAFE_DATA_IMAGE_RE.test(rawValue) ? rawValue : "";
  if (rawValue.startsWith("//")) return `https:${rawValue}`;
  const normalizedPath = rawValue.startsWith("/") ? rawValue : `/${rawValue.replace(/^\/+/, "")}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const apiFetchWithFallback = async (path, options = {}) => {
  const {
    timeoutMs = DEFAULT_API_TIMEOUT_MS,
    allowRelativeFallback = false,
    ...fetchOptions
  } = options;
  const primaryUrl = buildApiUrl(path);

  try {
    return await fetchWithTimeout(primaryUrl, fetchOptions, timeoutMs);
  } catch (primaryError) {
    if (!allowRelativeFallback || primaryUrl === path) {
      throw primaryError;
    }
    return fetchWithTimeout(path, fetchOptions, timeoutMs);
  }
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("sharebite.token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
