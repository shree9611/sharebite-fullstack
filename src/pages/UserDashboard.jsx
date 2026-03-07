import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { apiFetchWithFallback, resolveAssetUrl } from "../lib/api.js";
import { clearSession } from "../lib/auth.js";
import { clearCurrentProfile, getCurrentProfile } from "../lib/profile.js";
import NotificationBell from "../components/NotificationBell.jsx";

const NEARBY_RADIUS_KM = 10;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const extractCoords = (item) => {
  const directLat = toNumber(item?.latitude ?? item?.lat);
  const directLng = toNumber(item?.longitude ?? item?.lng ?? item?.lon);
  if (directLat !== null && directLng !== null) {
    return { lat: directLat, lng: directLng };
  }

  const nestedLat = toNumber(item?.location?.latitude ?? item?.location?.lat);
  const nestedLng = toNumber(item?.location?.longitude ?? item?.location?.lng ?? item?.location?.lon);
  if (nestedLat !== null && nestedLng !== null) {
    return { lat: nestedLat, lng: nestedLng };
  }

  const coordsArray = Array.isArray(item?.coordinates) ? item.coordinates : null;
  if (coordsArray?.length >= 2) {
    const lng = toNumber(coordsArray[0]);
    const lat = toNumber(coordsArray[1]);
    if (lat !== null && lng !== null) {
      return { lat, lng };
    }
  }

  return null;
};

const haversineKm = (from, to) => {
  const earthRadiusKm = 6371;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const resolveDonationImage = (item) => {
  return resolveAssetUrl(item?.imageUrl || item?.image || "");
};

const resolveProfileImage = (profile) => {
  return resolveAssetUrl(profile?.profileImageUrl || profile?.profileImage || "");
};

const resolvePastStatus = (item) => {
  const expiry = item?.expiryTime ? new Date(item.expiryTime).getTime() : null;
  if (expiry && expiry <= Date.now()) return "Expired";
  if (Number(item?.quantity || 0) <= 0) return "Fully Claimed";
  const status = String(item?.status || "").toLowerCase();
  if (status === "delivered") return "Delivered";
  if (status === "claimed") return "Claimed";
  if (status && status !== "active") return status[0].toUpperCase() + status.slice(1);
  return "Unavailable";
};

const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const role = location.state?.role;
  const showReceiver = !role || role === "Receiver";
  const [showNearby, setShowNearby] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const [userCoords, setUserCoords] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(() => getCurrentProfile());
  const [donations, setDonations] = useState([]);
  const [pastDonations, setPastDonations] = useState([]);
  const [showPastList, setShowPastList] = useState(false);
  const [isPastLoading, setIsPastLoading] = useState(false);
  const [pastLoaded, setPastLoaded] = useState(false);
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

  const loadDonations = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setLoadError("");
    try {
      const response = await apiFetchWithFallback("/api/donations", {
        cache: "no-store",
      });
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load donations.");
      }
      const list = Array.isArray(data) ? data : [];
      const uniqueActive = [];
      const seen = new Set();
      for (const row of list) {
        const key = String(row?._id || "");
        if (!key || seen.has(key)) continue;
        const normalizedStatus = String(row?.status || "").toLowerCase();
        const isActiveLike = normalizedStatus === "active" || normalizedStatus === "available";
        const isVisible = isActiveLike && Number(row?.quantity || 0) > 0;
        if (!isVisible) continue;
        seen.add(key);
        uniqueActive.push(row);
      }
      setDonations(uniqueActive);
    } catch (error) {
      const message =
        error instanceof TypeError
          ? "Unable to reach server. Please check backend URL, internet, and CORS settings, then try again."
          : error.message || "Unable to load donations.";
      setLoadError(message);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const loadPastDonations = useCallback(async () => {
    if (pastLoaded || isPastLoading) return;
    setIsPastLoading(true);
    try {
      const historyResponse = await apiFetchWithFallback("/api/donations/history", {
        cache: "no-store",
      });
      const historyData = await historyResponse.json().catch(() => []);
      if (historyResponse.ok && Array.isArray(historyData)) {
        setPastDonations(historyData);
        setPastLoaded(true);
      }
    } finally {
      setIsPastLoading(false);
    }
  }, [pastLoaded, isPastLoading]);

  useEffect(() => {
    const onFocus = () => loadDonations(false);
    const intervalId = window.setInterval(() => {
      if (document.hidden) return;
      loadDonations(false);
    }, 60000);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadDonations]);

  const visibleDonations = useMemo(() => {
    if (!showNearby || !userCoords) return donations;

    const mapped = donations
      .map((item) => {
      const coords = extractCoords(item);
      if (!coords) {
        return { ...item, _distanceKm: null };
      }
      return { ...item, _distanceKm: haversineKm(userCoords, coords) };
      })
      .filter((item) => item._distanceKm !== null && item._distanceKm <= NEARBY_RADIUS_KM);

    mapped.sort((a, b) => {
      if (a._distanceKm === null && b._distanceKm === null) return 0;
      if (a._distanceKm === null) return 1;
      if (b._distanceKm === null) return -1;
      return a._distanceKm - b._distanceKm;
    });

    return mapped;
  }, [donations, showNearby, userCoords]);

  const handleFindNearMe = () => {
    if (showNearby) {
      setShowNearby(false);
      setLocateError("");
      return;
    }

    if (!navigator.geolocation) {
      setLocateError("Geolocation is not supported on this browser.");
      return;
    }

    setIsLocating(true);
    setLocateError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setShowNearby(true);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocateError("Location permission denied. Please allow location access.");
          return;
        }
        if (error.code === error.POSITION_UNAVAILABLE) {
          setLocateError("Unable to detect your location right now.");
          return;
        }
        if (error.code === error.TIMEOUT) {
          setLocateError("Location request timed out. Please try again.");
          return;
        }
        setLocateError("Unable to get your location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (!showReceiver) {
    return (
      <div className="bg-white text-[#111814] min-h-screen">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white border border-[#dbe6e0] rounded-xl p-6 max-w-md text-center shadow-sm">
            <h2 className="text-lg font-bold">{t("Dashboard Unavailable")}</h2>
            <p className="text-sm text-[#618972] mt-2">{t("Dashboard Receiver Only")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fffdf7] text-[#111814] min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-solid border-[#f3ecdc] bg-[#fffdf7] px-4 sm:px-6 md:px-10 py-5 shadow-sm">
          <div className="flex items-center gap-4 text-[#111814]">
            <div className="flex items-center gap-2">
              <div className="size-6 text-[#12c76a]">
                <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
              </div>
              <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">{t("ShareBite")}</h2>
            </div>
          </div>
          <div className="flex flex-1 justify-end relative items-center gap-2">
            <NotificationBell />
            <button
              className="flex cursor-pointer items-center justify-center rounded-full h-9 w-9 bg-[#f0f4f2] text-[#111814]"
              onClick={() => navigate("/profile")}
              type="button"
            >
              {resolveProfileImage(profile) ? (
                <img src={resolveProfileImage(profile)} alt="Profile" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="material-symbols-outlined">account_circle</span>
              )}
            </button>
            {showProfile && (
              <div className="absolute right-0 top-12 w-72 rounded-2xl border border-[#e6eee9] bg-white shadow-lg overflow-hidden">
                <div className="h-16 bg-slate-50" />
                <div className="-mt-8 flex flex-col items-center px-4 pb-4">
                  <div className="h-16 w-16 rounded-full bg-white border-4 border-white shadow flex items-center justify-center text-[#7a9087]">
                    {resolveProfileImage(profile) ? (
                      <img src={resolveProfileImage(profile)} alt="Profile" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl">account_circle</span>
                    )}
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
          <aside className="w-full lg:w-60 border-b lg:border-r border-[#f3ecdc] bg-[#fffdf7] p-4 flex flex-col gap-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <nav className="flex flex-col gap-1">
                <Link
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isAvailable
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-[#7a9087] hover:text-[#111814] hover:bg-slate-50"
                  }`}
                  to="/dashboard"
                >
                  <span className="material-symbols-outlined text-[18px]">restaurant</span>
                  <p className="text-xs font-semibold">{t("Available Now")}</p>
                </Link>
                <Link
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isMyRequests
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-[#7a9087] hover:text-[#111814] hover:bg-slate-50"
                  }`}
                  to="/my-requests"
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                  <p className="text-xs font-semibold">{t("My Requests")}</p>
                </Link>
                <Link
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isFeedback
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-[#7a9087] hover:text-[#111814] hover:bg-slate-50"
                  }`}
                  to="/receiver/feedback"
                >
                  <span className="material-symbols-outlined text-[18px]">reviews</span>
                  <p className="text-xs font-semibold">{t("Feedback")}</p>
                </Link>
              </nav>
            </div>
          </aside>

          <main className="flex-1 flex flex-col min-h-screen">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 rounded-2xl bg-white border border-slate-200/70 p-5 shadow-sm">
                <div>
                  <h1 className="text-[#111814] tracking-light text-[22px] sm:text-[24px] font-bold leading-tight">
                    {t("Receiver Dashboard")}
                  </h1>
                  <p className="text-[#7a9087] text-sm">{t("Receiver Dashboard Subtitle")}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleFindNearMe}
                    className="bg-[#12c76a] text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-[#0fbf63] transition-all shadow-sm"
                    disabled={isLocating}
                  >
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    {isLocating ? "Locating..." : showNearby ? t("Showing Nearby") : t("Find Food Near Me")}
                  </button>
                </div>
              </div>

              {isLoading ? <p className="text-sm text-[#7a9087]">Loading donations...</p> : null}
              {loadError ? <p className="text-sm text-red-600">{loadError}</p> : null}
              {locateError ? <p className="text-sm text-red-600">{locateError}</p> : null}

              {!isLoading && !loadError && visibleDonations.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#e6eee9] p-6 text-sm text-[#7a9087]">
                  No food donations available yet.
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {visibleDonations.map((item) => {
                  const normalizedStatus = String(item?.status || "").toLowerCase();
                  const isAvailable =
                    (normalizedStatus === "active" || normalizedStatus === "available") &&
                    Number(item?.quantity || 0) > 0;
                  return (
                  <div key={item._id} className="bg-white rounded-xl overflow-hidden border border-[#e6eee9] flex flex-col shadow-sm">
                    <div className="relative h-32 w-full bg-[#f3f6f4] flex items-center justify-center">
                      {resolveDonationImage(item) ? (
                        <img
                          src={resolveDonationImage(item)}
                          alt={item.foodName || "Food"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[#7a9087] text-4xl">photo_camera</span>
                      )}
                      <div className={`absolute bottom-2 right-2 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                        isAvailable ? "bg-[#12c76a] text-white" : "bg-slate-200 text-slate-700"
                      }`}>
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        {isAvailable ? "Available" : "Unavailable"}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-[#111814]">{item.foodName || "Food Item"}</h3>
                        <p className="text-[11px] text-[#7a9087] flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {item.location || "Location not provided"}
                        </p>
                        {showNearby && item?._distanceKm !== null ? (
                          <p className="text-[11px] text-[#12c76a] font-semibold mt-1">
                            {(item._distanceKm).toFixed(1)} km away
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-2">
                        <span className="text-[#7a9087]">Claim Status</span>
                        <span className={`font-semibold ${isAvailable ? "text-[#12c76a]" : "text-slate-600"}`}>
                          {isAvailable ? `${item.quantity} portions left` : `${item?.status || "claimed"}`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#eef4f1] rounded-full">
                        <div className="bg-[#12c76a] h-full rounded-full w-full" />
                      </div>
                      {isAvailable ? (
                        <Link
                          className="mt-3 w-full bg-[#12c76a] hover:bg-[#0fbf63] text-white font-bold py-2 rounded-full text-xs text-center inline-flex items-center justify-center"
                          to="/food-request"
                          state={{
                            donationId: item._id,
                            foodName: item.foodName,
                            quantity: item.quantity,
                            location: item.location,
                            image: item.image,
                            imageUrl: item.imageUrl,
                          }}
                        >
                          {t("Request Food")}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="mt-3 w-full bg-slate-200 text-slate-600 font-bold py-2 rounded-full text-xs text-center inline-flex items-center justify-center cursor-not-allowed"
                        >
                          Not Available
                        </button>
                      )}
                    </div>
                  </div>
                )})}
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => {
                    const next = !showPastList;
                    setShowPastList(next);
                    if (next) loadPastDonations();
                  }}
                  className="rounded-full border border-[#dce8e1] bg-white px-4 py-2 text-xs font-bold text-[#2e5b48] hover:bg-[#f6fbf8]"
                >
                  {showPastList ? "Hide Past Food List" : `Past Food List (${pastDonations.length})`}
                </button>
              </div>

              {showPastList ? (
                <div className="mt-4">
                  {isPastLoading ? (
                    <div className="bg-white rounded-xl border border-[#e6eee9] p-6 text-sm text-[#7a9087]">
                      Loading past food list...
                    </div>
                  ) : null}
                  {!isPastLoading && pastDonations.length === 0 ? (
                    <div className="bg-white rounded-xl border border-[#e6eee9] p-6 text-sm text-[#7a9087]">
                      No past food records yet.
                    </div>
                  ) : !isPastLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {pastDonations.map((item, index) => (
                        <div key={`past-${item?._id || item?.createdAt || index}`} className="bg-white rounded-xl overflow-hidden border border-[#e6eee9] flex flex-col shadow-sm">
                          <div className="relative h-32 w-full bg-[#f3f6f4] flex items-center justify-center">
                            {resolveDonationImage(item) ? (
                              <img
                                src={resolveDonationImage(item)}
                                alt={item?.foodName || "Food"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-[#7a9087] text-4xl">photo_camera</span>
                            )}
                            <div className="absolute bottom-2 right-2 text-[9px] font-bold px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                              {resolvePastStatus(item)}
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-[#111814]">{item?.foodName || "Food Item"}</h3>
                            <p className="text-[11px] text-[#7a9087] mt-1">{item?.location || "Location not provided"}</p>
                            <p className="text-[11px] text-[#7a9087] mt-1">
                              {item?.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

