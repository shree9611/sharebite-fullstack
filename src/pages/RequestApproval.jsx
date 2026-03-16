import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell.jsx";
import { resolveAssetUrl } from "../lib/api.js";
import { getCurrentProfile } from "../lib/profile.js";
import {
  approveRequestById,
  fetchPendingRequests,
  rejectRequestById,
} from "../features/request-approval/api.js";

const RequestApproval = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeActionId, setActiveActionId] = useState("");
  const [profile, setProfile] = useState(() => getCurrentProfile());
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setProfile(getCurrentProfile());
  }, []);

  const isActive = (path) => location.pathname === path;

  const resolveImage = (item) =>
    resolveAssetUrl(
      item?.donation?.imageUrl ||
        item?.donation?.image ||
        item?.donationImageUrl ||
        item?.donationImage ||
        ""
    );

  const resolveProfileImage = (value) => {
    return resolveAssetUrl(value?.profileImageUrl || value?.profileImage || "");
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const loadPendingRequests = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const token = localStorage.getItem("sharebite.token");
      if (!token) {
        throw new Error("Please login first.");
      }
      const rows = await fetchPendingRequests();
      if (!mountedRef.current) return;
      setRequests(rows);
    } catch (error) {
      if (!mountedRef.current) return;
      setErrorMessage(error?.message || "Unable to load pending requests.");
    } finally {
      if (mountedRef.current) setIsLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadPendingRequests();
  }, [loadPendingRequests]);

  const pendingRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      return new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime();
    });
  }, [requests]);

  const updateRequestStatus = async (requestId, action) => {
    setErrorMessage("");
    setActiveActionId(requestId);

    const previousRequests = requests;
    setRequests((prev) => prev.filter((item) => String(item?._id) !== String(requestId)));

    try {
      if (action === "approve") {
        await approveRequestById(requestId);
      } else {
        await rejectRequestById(requestId);
      }
    } catch (error) {
      setRequests(previousRequests);
      setErrorMessage(error?.message || "Unable to update request.");
    } finally {
      setActiveActionId("");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#e7efe9] bg-white px-4 py-4 sm:px-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-bold text-[#1b1f23]">
            <span className="material-symbols-outlined text-green-600">volunteer_activism</span>
            ShareBite
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e6eee9] bg-white text-[#7a9087]"
              aria-label="Profile"
            >
              {resolveProfileImage(profile) ? (
                <img
                  src={resolveProfileImage(profile)}
                  alt="Profile"
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-[18px]">account_circle</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 md:px-10 lg:flex-row">
        <aside className="w-full border-b border-[#e7efe9] pb-4 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
          <nav className="flex gap-2 overflow-x-auto text-sm font-bold text-[#5a6f65] lg:block lg:space-y-2 lg:text-base">
            <Link
              to="/donor/donate"
              className={`block whitespace-nowrap rounded-lg px-3 py-2 ${isActive("/donor/donate") ? "bg-[#eaf7ef] text-[#147a40]" : "hover:bg-[#f7fbf8]"}`}
            >
              Donate Food
            </Link>
            <Link
              to="/donor/approvals"
              className={`block whitespace-nowrap rounded-lg px-3 py-2 ${isActive("/donor/approvals") ? "bg-[#eaf7ef] text-[#147a40]" : "hover:bg-[#f7fbf8]"}`}
            >
              Request Approval
            </Link>
            <Link
              to="/donor/feedback"
              className={`block whitespace-nowrap rounded-lg px-3 py-2 ${isActive("/donor/feedback") ? "bg-[#eaf7ef] text-[#147a40]" : "hover:bg-[#f7fbf8]"}`}
            >
              Community Feedback
            </Link>
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-[#1c2520] sm:text-3xl">Incoming Requests</h1>
              <p className="mt-1 text-sm text-[#6f8278]">Review pending requests and approve or decline them.</p>
            </div>
            <button
              type="button"
              onClick={loadPendingRequests}
              className="rounded-lg border border-[#dce7df] px-3 py-2 text-xs font-semibold text-[#4f635a] hover:bg-[#f7fbf8]"
            >
              Refresh
            </button>
          </div>

          {isLoading ? <p className="text-sm text-[#6f8278]">Loading requests...</p> : null}

          {!isLoading && errorMessage ? (
            <div className="rounded-xl border border-[#f3d5d5] bg-[#fff7f7] px-4 py-3 text-sm text-[#b42318]">
              {errorMessage}
            </div>
          ) : null}

          {!isLoading && !errorMessage && pendingRequests.length === 0 ? (
            <div className="rounded-xl border border-[#e7efe9] bg-[#fbfdfc] px-4 py-3 text-sm text-[#6f8278]">
              No pending requests
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {pendingRequests.map((item) => {
              const imageUrl = resolveImage(item);
              const isActionLoading = activeActionId === item?._id;
              const logisticsLabel =
                String(item?.logistics || "").toLowerCase() === "delivery" ? "Delivery" : "Pickup";
              const receiverLocation =
                item?.receiverLocation || item?.requestedLocation || item?.deliveryAddress || "-";
              return (
                <article
                  key={item?._id}
                  className="rounded-2xl border border-[#e7efe9] bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item?.donation?.foodName || "Donation"}
                          className="h-20 w-24 rounded-lg border border-[#e7efe9] object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-20 w-24 items-center justify-center rounded-lg border border-[#e7efe9] bg-[#f7fbf8] text-xs text-[#6f8278]">
                          No image
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="min-w-0 truncate text-base font-bold text-[#1f2a24]">
                            {item?.receiver?.name || "Receiver"}
                          </p>
                          <span className="rounded-full border border-[#e7efe9] bg-[#fbfdfc] px-2 py-0.5 text-xs font-semibold text-[#50645b]">
                            Pending
                          </span>
                        </div>
                        <p className="text-sm text-[#5f7268]">
                          {item?.receiver?.email || "No email"}
                        </p>
                        <p className="mt-2 text-sm text-[#33443b]">
                          Food: {item?.donation?.foodName || "-"}
                        </p>
                        <p className="text-sm text-[#33443b]">
                          People Count: {item?.peopleCount || 0}
                        </p>
                        <p className="text-sm text-[#33443b]">Logistics: {logisticsLabel}</p>
                        <p className="text-sm text-[#33443b]">Receiver Location: {receiverLocation}</p>
                        <p className="mt-2 text-xs text-[#6f8278]">
                          Requested: {formatDateTime(item?.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => updateRequestStatus(item?._id, "reject")}
                        className="w-full rounded-lg border border-[#f3d5d5] px-4 py-2 text-sm font-semibold text-[#b42318] disabled:opacity-60 sm:w-auto"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => updateRequestStatus(item?._id, "approve")}
                        className="w-full rounded-lg bg-[#169c54] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
                      >
                        {isActionLoading ? "Please wait..." : "Approve"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default RequestApproval;

