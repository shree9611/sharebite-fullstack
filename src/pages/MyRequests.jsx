import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { buildApiUrl } from "../lib/api.js";
import { clearSession } from "../lib/auth.js";
import { clearCurrentProfile, getCurrentProfile } from "../lib/profile.js";

const statusClasses = {
  pending: "bg-orange-50 text-orange-600 border-orange-100",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  declined: "bg-red-50 text-red-600 border-red-100",
};

const MyRequests = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(() => getCurrentProfile());
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const isAvailable = location.pathname === "/dashboard";
  const isMyRequests = location.pathname === "/my-requests";
  const isFeedback = location.pathname === "/receiver/feedback";

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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load my requests.");
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
    const onFocus = () => loadRequests();
    const intervalId = window.setInterval(() => loadRequests(), 10000);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadRequests]);

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      const aTime = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
      const bTime = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [requests]);

  const statusLabel = (status) => {
    if (status === "approved") return "Approved";
    if (status === "declined") return "Declined";
    return "Pending";
  };

  const statusNote = (status) => {
    if (status === "approved") {
      return "Approved by donor. Please complete pickup or delivery soon.";
    }
    if (status === "declined") {
      return "Not approved. Please check Available Foods and place a new request.";
    }
    return "Pending donor review.";
  };

  return (
    <div className="bg-background-light text-[#111814] min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#e5e9e7] bg-white px-4 sm:px-6 md:px-10 py-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="text-primary flex items-center">
                <span className="material-symbols-outlined text-2xl font-semibold">volunteer_activism</span>
              </div>
              <h2 className="text-lg font-bold leading-tight tracking-tight">{t("ShareBite")}</h2>
            </div>
          </div>
          <div className="flex items-center gap-4 relative">
            <button
              className="flex items-center justify-center rounded-full h-10 w-10 bg-[#f0f4f2] text-[#111814]"
              onClick={() => setShowProfile((prev) => !prev)}
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">account_circle</span>
            </button>
            {showProfile && (
              <div className="absolute right-0 top-12 w-72 rounded-2xl border border-[#e6eee9] bg-white shadow-lg overflow-hidden">
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
        </header>

        <div className="flex flex-1 flex-col lg:flex-row">
          <aside className="w-full lg:w-64 border-b lg:border-r border-[#e5e9e7] bg-white p-4 flex flex-col gap-6 lg:sticky lg:top-[65px] lg:h-[calc(100vh-65px)]">
            <nav className="flex flex-col gap-1">
              <Link
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isAvailable ? "text-[#12c76a] bg-[#e9f9f0]" : "text-[#618972] hover:bg-[#f0f4f2]"
                }`}
                to="/dashboard"
              >
                <span className="material-symbols-outlined text-[20px]">restaurant</span>
                <p className="text-sm font-semibold">{t("Available Now")}</p>
              </Link>
              <Link
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isMyRequests ? "text-[#12c76a] bg-[#e9f9f0]" : "text-[#618972] hover:bg-[#f0f4f2]"
                }`}
                to="/my-requests"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                <p className="text-sm font-bold">{t("My Requests")}</p>
              </Link>
              <Link
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isFeedback ? "text-[#12c76a] bg-[#e9f9f0]" : "text-[#618972] hover:bg-[#f0f4f2]"
                }`}
                to="/receiver/feedback"
              >
                <span className="material-symbols-outlined text-[20px]">reviews</span>
                <p className="text-sm font-semibold">{t("Feedback")}</p>
              </Link>
            </nav>
          </aside>

          <main className="flex-1 bg-white">
            <div className="p-4 sm:p-6 lg:p-12 max-w-6xl mx-auto">
              <div className="flex flex-col mb-10 gap-2">
                <h1 className="text-[#111814] text-2xl sm:text-3xl font-bold tracking-tight">{t("My Requests Title")}</h1>
                <p className="text-[#618972]">{t("My Requests Subtitle")}</p>
              </div>

              {isLoading ? <p className="text-sm text-[#618972]">Loading requests...</p> : null}
              {loadError ? <p className="text-sm text-red-600">{loadError}</p> : null}

              {!isLoading && !loadError && sortedRequests.length === 0 ? (
                <div className="rounded-xl border border-[#e5e9e7] bg-white p-6 text-sm text-[#618972]">
                  No requests yet.
                </div>
              ) : null}

              <div className="flex flex-col gap-3">
                {sortedRequests.map((reqItem) => (
                  <div
                    key={reqItem._id}
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white border border-[#e5e9e7] rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-1/3">
                      <div className="size-12 rounded-xl bg-[#f0f4f2] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-2xl">restaurant</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-[#111814]">{reqItem?.donation?.foodName || "Food"}</h3>
                        <div
                          className={`flex items-center gap-2 text-xs font-medium px-2.5 py-1 mt-1 rounded-full w-fit border ${
                            statusClasses[reqItem?.status] || statusClasses.pending
                          }`}
                        >
                          {statusLabel(reqItem?.status)}
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-2/3 text-xs text-[#4a6b57] space-y-1">
                      <p><strong>Requested Serves:</strong> {reqItem?.peopleCount || "-"}</p>
                      <p><strong>Preference:</strong> {reqItem?.foodPreference || "any"}</p>
                      <p><strong>Your Location:</strong> {reqItem?.requestedLocation || "-"}</p>

                      {reqItem?.logistics === "delivery" && reqItem?.deliveryAddress ? (
                        <p><strong>Delivery Address:</strong> {reqItem.deliveryAddress}</p>
                      ) : null}
                      <p><strong>Status Update:</strong> {statusNote(reqItem?.status)}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyRequests;
