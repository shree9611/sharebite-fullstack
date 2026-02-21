import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { buildApiUrl } from "../lib/api.js";
import { clearSession } from "../lib/auth.js";
import { clearCurrentProfile, getCurrentProfile } from "../lib/profile.js";

const RequestApproval = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(() => getCurrentProfile());
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [activeActionId, setActiveActionId] = useState("");
  const [showPastApprovals, setShowPastApprovals] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    clearSession();
    clearCurrentProfile();
    navigate("/login");
  };

  useEffect(() => {
    setProfile(getCurrentProfile());
  }, []);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    const token = localStorage.getItem("sharebite.token");
    if (!token) {
      setLoadError("Please login first.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(buildApiUrl("/api/requests"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load requests.");
      }
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      setLoadError(error.message || "Unable to load requests.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    const refresh = () => loadRequests();
    const onFocus = () => loadRequests();
    const intervalId = window.setInterval(refresh, 10000);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadRequests]);

  const pendingRequests = useMemo(
    () =>
      requests
        .filter((reqItem) => reqItem?.status === "pending")
        .sort(
          (a, b) =>
            new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
        ),
    [requests]
  );
  const approvedRequests = useMemo(
    () =>
      requests
        .filter((reqItem) => reqItem?.status === "approved")
        .sort(
          (a, b) =>
            new Date(b?.updatedAt || b?.createdAt || 0).getTime() -
            new Date(a?.updatedAt || a?.createdAt || 0).getTime()
        ),
    [requests]
  );

  const handleApprove = async (requestId) => {
    setActionError("");
    setActiveActionId(requestId);
    const token = localStorage.getItem("sharebite.token");
    if (!token) {
      setActionError("Please login first.");
      setActiveActionId("");
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/approvals/${requestId}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Failed to approve request.");
      }
      setRequests((prev) =>
        prev.map((item) => (item._id === requestId ? { ...item, status: "approved" } : item))
      );
    } catch (error) {
      setActionError(error.message || "Unable to approve request.");
    } finally {
      setActiveActionId("");
    }
  };

  const handleDecline = async (requestId) => {
    setActionError("");
    setActiveActionId(requestId);
    const token = localStorage.getItem("sharebite.token");
    if (!token) {
      setActionError("Please login first.");
      setActiveActionId("");
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/approvals/${requestId}/decline`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Failed to decline request.");
      }
      setRequests((prev) =>
        prev.map((item) => (item._id === requestId ? { ...item, status: "declined" } : item))
      );
    } catch (error) {
      setActionError(error.message || "Unable to decline request.");
    } finally {
      setActiveActionId("");
    }
  };

  return (
    <div className="bg-transparent min-h-screen">
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <header className="border-b bg-white px-4 sm:px-6 md:px-10 py-5">
            <div className="flex items-center gap-2 font-bold text-lg">
              <span className="material-symbols-outlined text-green-500">volunteer_activism</span>
              {t("ShareBite")}
            </div>
          </header>
          <div className="flex flex-col sm:flex-row">
            <aside className="bg-white px-4 sm:px-6 md:px-8 py-4 border-r border-[#e6eee9] w-full sm:w-64 shrink-0">
              <nav className="flex flex-col gap-2 text-lg font-extrabold text-[#7a9087]">
                <Link
                  className={`hover:text-[#111814] transition-colors flex items-center gap-2 px-3 py-2 rounded-xl ${
                    isActive("/donor/donate") ? "bg-green-50 text-green-600" : ""
                  }`}
                  to="/donor/donate"
                >
                  <span
                    className={`material-symbols-outlined text-[22px] ${
                      isActive("/donor/donate") ? "text-green-600" : ""
                    }`}
                  >
                    add_circle
                  </span>
                  {t("Donate Food")}
                </Link>
                <Link
                  className={`hover:text-[#111814] transition-colors flex items-center gap-2 px-3 py-2 rounded-xl ${
                    isActive("/donor/approvals") ? "bg-green-50 text-green-600" : ""
                  }`}
                  to="/donor/approvals"
                >
                  <span
                    className={`material-symbols-outlined text-[22px] ${
                      isActive("/donor/approvals") ? "text-green-600" : ""
                    }`}
                  >
                    verified
                  </span>
                  {t("Request Approval")}
                </Link>
                <Link
                  className={`hover:text-[#111814] transition-colors flex items-center gap-2 px-3 py-2 rounded-xl ${
                    isActive("/donor/feedback") ? "bg-green-50 text-green-600" : ""
                  }`}
                  to="/donor/feedback"
                >
                  <span
                    className={`material-symbols-outlined text-[22px] ${
                      isActive("/donor/feedback") ? "text-green-600" : ""
                    }`}
                  >
                    forum
                  </span>
                  {t("Community Feedback")}
                </Link>
              </nav>
            </aside>

            <div className="flex-1 bg-[#f6f8fb]">
              <div className="max-w-6xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-extrabold text-[#1b2430] flex items-center gap-3">
                      Incoming Requests
                      <span className="inline-flex items-center justify-center rounded-full bg-[#e8edf3] text-[#4f6072] text-sm font-bold px-3 py-1">
                        {pendingRequests.length}
                      </span>
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <button
                        className="flex items-center justify-center rounded-full h-9 w-9 bg-white border border-[#e6eee9] text-[#7a9087]"
                        onClick={() => setShowProfile((prev) => !prev)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">account_circle</span>
                      </button>
                      {showProfile && (
                        <div className="absolute right-0 top-12 w-72 rounded-2xl border border-[#e6eee9] bg-white shadow-lg overflow-hidden z-10">
                          <div className="h-16 bg-[#f8efe3]" />
                          <div className="-mt-8 flex flex-col items-center px-4 pb-4">
                            <div className="h-16 w-16 rounded-full bg-white border-4 border-white shadow flex items-center justify-center text-[#7a9087]">
                              <span className="material-symbols-outlined text-3xl">account_circle</span>
                            </div>
                            <p className="mt-2 font-bold text-[#111814]">{profile?.name || t("User Name")}</p>
                            <p className="text-xs text-[#7a9087]">{profile?.email || t("User Email")}</p>
                          </div>
                          <div className="px-4 pb-4 text-xs text-[#7a9087]">
                            <div className="flex items-center justify-between py-2 border-t border-[#eef4f1]">
                              <span>{t("Phone")}</span>
                              <span className="font-semibold text-[#111814]">{profile?.phone || "N/A"}</span>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <button
                                className="flex-1 rounded-xl bg-[#f3f6f4] px-3 py-2 font-semibold text-[#111814]"
                                type="button"
                                onClick={() => setShowProfile(false)}
                              >
                                {t("Cancel")}
                              </button>
                              <button
                                className="flex-1 rounded-xl px-3 py-2 font-semibold text-red-500 hover:bg-red-50"
                                onClick={handleLogout}
                                type="button"
                              >
                                {t("Logout")}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isLoading ? <p className="text-sm text-[#8aa19a]">Loading requests...</p> : null}
                {loadError ? <p className="text-sm text-red-600">{loadError}</p> : null}
                {actionError ? <p className="text-sm text-red-600 mb-3">{actionError}</p> : null}

                {!isLoading && !loadError && pendingRequests.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-[#e6ebf1] p-6 text-sm text-[#8aa19a]">
                    No pending receiver requests yet.
                  </div>
                ) : null}

                <div className="space-y-4">
                  {pendingRequests.map((reqItem) => {
                    const isDelivery = reqItem?.logistics === "delivery";
                    const isProcessing = activeActionId === reqItem._id;

                    return (
                      <div
                        key={reqItem._id}
                        className="bg-white rounded-3xl border border-[#e6ebf1] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="size-14 rounded-2xl bg-[#edf3fb] text-[#8da2bf] flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">domain</span>
                          </div>

                          <div>
                            <h3 className="leading-tight font-extrabold text-[#1d2b3d] text-2xl sm:text-3xl">
                              {reqItem?.receiver?.name || "Receiver"}
                            </h3>
                            <p className="mt-1 text-sm text-[#7a8ea4] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-[#fbbf24]">star</span>
                              {reqItem?.receiver?.email || "New receiver request"}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-5 text-[#4c6077]">
                              <div className="flex items-center gap-2 text-lg font-semibold">
                                <span className="material-symbols-outlined text-[20px]">groups</span>
                                Feeding {reqItem?.peopleCount || 1} people
                              </div>
                              <div className="flex items-center gap-2 text-lg font-semibold">
                                <span className="material-symbols-outlined text-[20px]">
                                  {isDelivery ? "local_shipping" : "directions_walk"}
                                </span>
                                {isDelivery ? "Delivery Requested" : "Self-Pickup"}
                              </div>
                            </div>

                            <div className="mt-3 text-xs text-[#8aa0b6] flex flex-wrap gap-x-4 gap-y-1">
                              <span>Food: {reqItem?.donation?.foodName || "-"}</span>
                              <span>Preference: {reqItem?.foodPreference || "any"}</span>
                              <span>Location: {reqItem?.requestedLocation || "-"}</span>
                              {isDelivery && reqItem?.deliveryAddress ? (
                                <span>Delivery: {reqItem.deliveryAddress}</span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 lg:min-w-[310px] lg:justify-end">
                          <button
                            className="h-14 min-w-[120px] rounded-2xl border border-[#d7e0ea] px-6 text-sm sm:text-base font-bold text-[#60758e] hover:bg-[#f6f9fc] disabled:opacity-60"
                            onClick={() => handleDecline(reqItem._id)}
                            type="button"
                            disabled={isProcessing}
                          >
                            Decline
                          </button>
                          <button
                            className="h-14 min-w-[180px] rounded-2xl bg-[#18bf82] px-7 text-white text-sm sm:text-base font-bold shadow-[0_2px_8px_rgba(24,191,130,0.35)] hover:bg-[#13b177] disabled:opacity-60"
                            onClick={() => handleApprove(reqItem._id)}
                            type="button"
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Please wait..." : "Approve Request"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setShowPastApprovals((prev) => !prev)}
                    className="text-[#8fa0b2] font-semibold hover:text-[#62758a]"
                  >
                    {showPastApprovals ? "Hide Past Donation Approvals" : "View Past Donation Approvals"}
                  </button>
                </div>

                {showPastApprovals && (
                  <div className="mt-6 space-y-3">
                    {approvedRequests.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-[#e6ebf1] p-4 text-sm text-[#8aa19a]">
                        No past approvals yet.
                      </div>
                    ) : (
                      approvedRequests.map((reqItem) => (
                        <div
                          key={`approved-${reqItem._id}`}
                          className="bg-white rounded-2xl border border-[#e6ebf1] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        >
                          <div className="text-sm text-[#4c6077]">
                            <p className="font-bold text-[#1d2b3d]">
                              {reqItem?.receiver?.name || "Receiver"} approved for {reqItem?.donation?.foodName || "Food"}
                            </p>
                            <p className="text-xs text-[#8aa0b6]">
                              Serves: {reqItem?.peopleCount || 1} | {reqItem?.logistics === "delivery" ? "Delivery" : "Self-Pickup"}
                            </p>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            Approved
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RequestApproval;
