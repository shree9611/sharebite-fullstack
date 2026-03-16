import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell.jsx";
import { resolveAssetUrl } from "../lib/api.js";
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
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
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
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-[#e7efe9] bg-white px-4 py-5 sm:px-6 md:px-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-bold text-[#1b1f23]">
            <span className="material-symbols-outlined text-green-600">volunteer_activism</span>
            ShareBite
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              type="button"
              onClick={() => navigate("/profile")}
              aria-label="Profile"
              title="Profile"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e6eee9] bg-white text-[#7a9087]"
            >
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-w-0 flex-col sm:flex-row">
        <aside className="bg-white px-4 sm:px-6 md:px-8 py-4 border-r border-[#e7efe9] w-full sm:w-64 shrink-0">
          <nav className="flex flex-col gap-2 text-lg font-extrabold text-[#7a9087]">
            <Link
              className={`hover:text-[#111814] transition-colors flex items-center gap-2 px-3 py-2 rounded-xl ${isActive("/donor/donate") ? "bg-green-50 text-green-600" : ""}`}
              to="/donor/donate"
            >
              <span className={`material-symbols-outlined text-[22px] ${isActive("/donor/donate") ? "text-green-600" : ""}`}>
                add_circle
              </span>
              Donate Food
            </Link>
            <Link
              className={`hover:text-[#111814] transition-colors flex items-center gap-2 px-3 py-2 rounded-xl ${isActive("/donor/approvals") ? "bg-green-50 text-green-600" : ""}`}
              to="/donor/approvals"
            >
              <span className={`material-symbols-outlined text-[22px] ${isActive("/donor/approvals") ? "text-green-600" : ""}`}>
                verified
              </span>
              Request Approval
            </Link>
            <Link
              className={`hover:text-[#111814] transition-colors flex items-center gap-2 px-3 py-2 rounded-xl ${isActive("/donor/feedback") ? "bg-green-50 text-green-600" : ""}`}
              to="/donor/feedback"
            >
              <span className={`material-symbols-outlined text-[22px] ${isActive("/donor/feedback") ? "text-green-600" : ""}`}>
                forum
              </span>
              Community Feedback
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-[#1c2520]">Incoming Requests</h1>
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
              return (
                <article
                  key={item?._id}
                  className="rounded-2xl border border-[#e7efe9] bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
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
                      <div>
                        <p className="text-base font-bold text-[#1f2a24]">
                          {item?.receiver?.name || "Receiver"}
                        </p>
                        <p className="text-sm text-[#5f7268]">
                          {item?.receiver?.email || "No email"}
                        </p>
                        <p className="mt-2 text-sm text-[#33443b]">
                          Food: {item?.donation?.foodName || "-"}
                        </p>
                        <p className="text-sm text-[#33443b]">
                          People Count: {item?.peopleCount || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => updateRequestStatus(item?._id, "reject")}
                        className="rounded-lg border border-[#f3d5d5] px-4 py-2 text-sm font-semibold text-[#b42318] disabled:opacity-60"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => updateRequestStatus(item?._id, "approve")}
                        className="rounded-lg bg-[#169c54] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {isActionLoading ? "Please wait..." : "Approve"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RequestApproval;

