import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetchWithFallback, getAuthHeaders } from "../lib/api.js";

const NotificationBell = () => {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshNotifications = useCallback(async (showLoading = true) => {
    const token = localStorage.getItem("sharebite.token");
    if (!token) return;
    if (showLoading) setIsLoading(true);
    setError("");
    try {
      const response = await apiFetchWithFallback("/api/notifications", {
        headers: { ...getAuthHeaders() },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load notifications.");
      }
      const nextItems = Array.isArray(data?.items) ? data.items : [];
      setItems(nextItems);
      setUnreadCount(Number(data?.unreadCount || 0));
    } catch (loadError) {
      setError(loadError.message || "Unable to load notifications.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.hidden) return;
      refreshNotifications(false);
    }, 60000);
    const onFocus = () => refreshNotifications(false);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshNotifications]);

  const visibleItems = useMemo(() => items.slice(0, 8), [items]);

  const markOneRead = async (id) => {
    try {
      const response = await apiFetchWithFallback(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { ...getAuthHeaders() },
      });
      if (!response.ok) return;
      setItems((prev) => prev.map((item) => (item?._id === id ? { ...item, isRead: true } : item)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // no-op
    }
  };

  const markAllRead = async () => {
    try {
      const response = await apiFetchWithFallback("/api/notifications/read-all", {
        method: "PATCH",
        headers: { ...getAuthHeaders() },
      });
      if (!response.ok) return;
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      // no-op
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e6eee9] bg-white text-[#6f7f77]"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-[18px]">notifications</span>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#ef4444] px-1 text-center text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-11 z-20 w-80 overflow-hidden rounded-2xl border border-[#e6eee9] bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-[#eef4f1] px-4 py-3">
            <p className="text-sm font-bold text-[#1f2d24]">Notifications</p>
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] font-semibold text-[#2f9f6a] hover:underline"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? <p className="px-4 py-3 text-xs text-[#7a9087]">Loading...</p> : null}
            {error ? <p className="px-4 py-3 text-xs text-red-600">{error}</p> : null}
            {!isLoading && !error && visibleItems.length === 0 ? (
              <p className="px-4 py-3 text-xs text-[#7a9087]">No notifications yet.</p>
            ) : null}
            {visibleItems.map((item) => (
              <button
                key={item?._id}
                type="button"
                onClick={() => markOneRead(item?._id)}
                className={`w-full border-b border-[#f1f5f3] px-4 py-3 text-left transition hover:bg-[#f8fbf9] ${
                  item?.isRead ? "bg-white" : "bg-[#f3faf6]"
                }`}
              >
                <p className="text-xs font-semibold text-[#1f2d24]">{item?.title || "Notification"}</p>
                <p className="mt-1 text-xs text-[#63766d]">{item?.message || item?.body || ""}</p>
                <p className="mt-1 text-[10px] text-[#92a39b]">
                  {new Date(item?.createdAt || Date.now()).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationBell;
