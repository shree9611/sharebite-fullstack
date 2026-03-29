import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { apiFetchWithFallback, resolveAssetUrl } from "../lib/api.js";
import Navbar from "../components/Navbar.jsx";

const NEARBY_RADIUS_KM = 10;

const extractDonationList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.donations)) return payload.donations;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const getDonationId = (row) => {
  const candidate = row?._id ?? row?.id ?? row?.donationId ?? row?.donation?._id;
  return candidate ? String(candidate) : "";
};

const normalizeDonationStatus = (row) => {
  const raw = row?.status ?? row?.availability ?? row?.state ?? "available";
  return String(raw || "").trim().toLowerCase();
};

const resolveDonationQuantity = (row) => {
  const raw = row?.quantityRemaining ?? row?.quantity ?? row?.availableQuantity ?? row?.qty;
  if (raw === undefined || raw === null || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

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

  const loadDonations = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setLoadError("");
    try {
      const response = await apiFetchWithFallback("/api/donations", {
        cache: "no-store",
      });
      const data = await response.json().catch(() => ([]));
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load donations.");
      }

      const list = extractDonationList(data);
      const uniqueActive = [];
      const seen = new Set();
      for (const row of list) {
        const key = getDonationId(row);
        if (!key || seen.has(key)) continue;

        const status = normalizeDonationStatus(row);
        const isListed = status === "active" || status === "available";
        const isVisible = isListed;
        if (!isVisible) continue;
        seen.add(key);
        uniqueActive.push({
          ...row,
          _id: row?._id ?? row?.id ?? row?.donationId ?? key,
          quantity: row?.quantity ?? row?.quantityRemaining ?? row?.availableQuantity ?? row?.qty,
        });
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
    <div className="bg-white text-[#111814] min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col">
        <Navbar showNotifications showProfile />

        <div className="flex flex-1 flex-col lg:flex-row">
          <aside className="w-full lg:w-60 border-b lg:border-r border-[#e7efe9] bg-white p-4 flex flex-col gap-6 shadow-sm">
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
                  const status = String(item?.status || "").toLowerCase();
                  const expiryMs = item?.expiryTime ? new Date(item.expiryTime).getTime() : null;
                  const isExpired = Boolean(expiryMs && expiryMs <= Date.now());
                  const isAvailable =
                    !isExpired &&
                    (status === "active" || status === "available") &&
                    Number(item?.quantity || 0) > 0;
                  const badgeText = isExpired ? "Expired" : isAvailable ? "Available" : "Unavailable";
                  const badgeClass = isExpired
                    ? "bg-amber-100 text-amber-800"
                    : isAvailable
                      ? "bg-[#12c76a] text-white"
                      : "bg-slate-200 text-slate-700";
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
                      <div className={`absolute bottom-2 right-2 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${badgeClass}`}>
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        {badgeText}
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
                            dietaryType: item.dietaryType || "",
                            bakedType: item.bakedType || "",
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

