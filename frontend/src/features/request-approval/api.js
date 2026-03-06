import { apiFetchWithFallback, getAuthHeaders } from "../../lib/api.js";

const REQUESTS_API_PATH = "/api/requests?status=pending";
const REQUEST_TIMEOUT_MS = 20000;

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const normalizeRequestList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

export const fetchPendingRequests = async () => {
  const response = await apiFetchWithFallback(REQUESTS_API_PATH, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
    timeoutMs: REQUEST_TIMEOUT_MS,
  });

  const payload = await parseJsonSafely(response);
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load pending requests.");
  }

  return normalizeRequestList(payload);
};

export const approveRequestById = async (requestId) => {
  const response = await apiFetchWithFallback(`/api/approvals/${requestId}`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
    },
    timeoutMs: REQUEST_TIMEOUT_MS,
  });
  const payload = await parseJsonSafely(response);
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to approve request.");
  }
  return payload;
};

export const rejectRequestById = async (requestId) => {
  const response = await apiFetchWithFallback(`/api/approvals/${requestId}/decline`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
    },
    timeoutMs: REQUEST_TIMEOUT_MS,
  });
  const payload = await parseJsonSafely(response);
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to reject request.");
  }
  return payload;
};

