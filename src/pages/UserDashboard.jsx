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
  if (directLat !== null && directLng !== null) return { lat: directLat, lng: directLng };

  const nestedLat = toNumber(item?.location?.latitude ?? item?.location?.lat);
  const nestedLng = toNumber(item?.location?.longitude ?? item?.location?.lng ?? item?.location?.lon);
  if (nestedLat !== null && nestedLng !== null) return { lat: nestedLat, lng: nestedLng };

  const coordsArray = Array.isArray(item?.coordinates) ? item.coordinates : null;
  if (coordsArray?.length >= 2) {
    const lng = toNumber(coordsArray[0]);
    const lat = toNumber(coordsArray[1]);
    if (lat !== null && lng !== null) return { lat, lng };
  }

  return null;
};

const haversineKm = (from, to) => {
  const earthRadiusKm = 6371;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const resolveDonationImage = (item) => resolveAssetUrl(item?.imageUrl || item?.image || "");
const resolveProfileImage = (profile) => resolveAssetUrl(profile?.profileImageUrl || profile?.profileImage || "");

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

  useEffect(() => setProfile(getCurrentProfile()), []);

  // Load donations
  const loadDonations = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setLoadError("");
    try {
      const response = await apiFetchWithFallback("/api/donations", { cache: "no-store" });
      const data = await response.json().catch(() => []);
      if (!response.ok) throw new Error(data?.message || "Failed to load donations.");

      const list = Array.isArray(data) ? data : [];

      // Keep all donations, mark availability later
      setDonations(list);
    } catch (error) {
      const message =
        error instanceof TypeError
          ? "Unable to reach server. Check backend URL, internet, and CORS settings."
          : error.message || "Unable to load donations.";
      setLoadError(message);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadDonations(); }, [loadDonations]);

  // Load past donations
  const loadPastDonations = useCallback(async () => {
    if (pastLoaded || isPastLoading) return;
    setIsPastLoading(true);
    try {
      const historyResponse = await apiFetchWithFallback("/api/donations/history", { cache: "no-store" });
      const historyData = await historyResponse.json().catch(() => []);
      if (historyResponse.ok && Array.isArray(historyData)) {
        setPastDonations(historyData);
        setPastLoaded(true);
      }
    } finally { setIsPastLoading(false); }
  }, [pastLoaded, isPastLoading]);

  // Refresh donations on focus
  useEffect(() => {
    const onFocus = () => loadDonations(false);
    const intervalId = setInterval(() => { if (!document.hidden) loadDonations(false); }, 60000);
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(intervalId); window.removeEventListener("focus", onFocus); };
  }, [loadDonations]);

  // Filter visible donations
  const visibleDonations = useMemo(() => {
    let filtered = donations.map(item => {
      const coords = extractCoords(item);
      const distanceKm = coords && userCoords ? haversineKm(userCoords, coords) : null;
      const status = String(item?.status || "").toLowerCase();
      const isAvailable = (status === "active" || status === "available") && Number(item?.quantity || 0) > 0;
      return { ...item, _distanceKm: distanceKm, _isAvailable: isAvailable };
    });

    if (showNearby && userCoords) {
      filtered = filtered.filter(item => item._distanceKm !== null && item._distanceKm <= NEARBY_RADIUS_KM);
      filtered.sort((a, b) => (a._distanceKm ?? 999) - (b._distanceKm ?? 999));
    }

    return filtered;
  }, [donations, showNearby, userCoords]);

  const handleFindNearMe = () => {
    if (showNearby) { setShowNearby(false); setLocateError(""); return; }

    if (!navigator.geolocation) { setLocateError("Geolocation not supported."); return; }

    setIsLocating(true); setLocateError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setShowNearby(true); setIsLocating(false); },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) setLocateError("Location permission denied.");
        else if (error.code === error.POSITION_UNAVAILABLE) setLocateError("Location unavailable.");
        else if (error.code === error.TIMEOUT) setLocateError("Location request timed out.");
        else setLocateError("Unable to get your location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (!showReceiver) {
    return (
      <div className="bg-white text-[#111814] min-h-screen flex items-center justify-center p-6">
        <div className="bg-white border border-[#dbe6e0] rounded-xl p-6 max-w-md text-center shadow-sm">
          <h2 className="text-lg font-bold">{t("Dashboard Unavailable")}</h2>
          <p className="text-sm text-[#618972] mt-2">{t("Dashboard Receiver Only")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fffdf7] text-[#111814] min-h-screen">
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-solid border-[#f3ecdc] bg-[#fffdf7] px-4 sm:px-6 md:px-10 py-5 shadow-sm">
          <div className="flex items-center gap-4 text-[#111814]">
            <div className="flex items-center gap-2">
              <div className="size-6 text-[#12c76a]">
                <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
              </div>
              <h2 className="text-lg font-bold tracking-[-0.015em]">{t("ShareBite")}</h2>
            </div>
          </div>
          <div className="flex flex-1 justify-end relative items-center gap-2">
            <NotificationBell />
            <button onClick={() => navigate("/profile")} className="flex cursor-pointer items-center justify-center rounded-full h-9 w-9 bg-[#f0f4f2]">
              {resolveProfileImage(profile) ? <img src={resolveProfileImage(profile)} alt="Profile" className="h-9 w-9 rounded-full object-cover" /> : <span className="material-symbols-outlined">account_circle</span>}
            </button>
          </div>
        </header>

        {/* Main */}
        <div className="flex flex-1 flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full lg:w-60 border-b lg:border-r border-[#f3ecdc] bg-[#fffdf7] p-4 flex flex-col gap-6 shadow-sm">
            <nav className="flex flex-col gap-1">
              <Link className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isAvailable ? "text-emerald-700 bg-emerald-50" : "text-[#7a9087] hover:text-[#111814] hover:bg-slate-50"}`} to="/dashboard">
                <span className="material-symbols-outlined text-[18px]">restaurant</span>
                <p className="text-xs font-semibold">{t("Available Now")}</p>
              </Link>
              <Link className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isMyRequests ? "text-emerald-700 bg-emerald-50" : "text-[#7a9087] hover:text-[#111814] hover:bg-slate-50"}`} to="/my-requests">
                <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                <p className="text-xs font-semibold">{t("My Requests")}</p>
              </Link>
              <Link className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isFeedback ? "text-emerald-700 bg-emerald-50" : "text-[#7a9087] hover:text-[#111814] hover:bg-slate-50"}`} to="/receiver/feedback">
                <span className="material-symbols-outlined text-[18px]">reviews</span>
                <p className="text-xs font-semibold">{t("Feedback")}</p>
              </Link>
            </nav>
          </aside>

          {/* Dashboard Content */}
          <main className="flex-1 flex flex-col min-h-screen">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 rounded-2xl bg-white border border-slate-200/70 p-5 shadow-sm">
                <div>
                  <h1 className="text-[#111814] tracking-light text-[22px] sm:text-[24px] font-bold leading-tight">{t("Receiver Dashboard")}</h1>
                  <p className="text-[#7a9087] text-sm">{t("Receiver Dashboard Subtitle")}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleFindNearMe} className="bg-[#12c76a] text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-[#0fbf63] transition-all shadow-sm" disabled={isLocating}>
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    {isLocating ? "Locating..." : showNearby ? t("Showing Nearby") : t("Find Food Near Me")}
                  </button>
                </div>
              </div>

              {isLoading && <p className="text-sm text-[#7a9087]">Loading donations...</p>}
              {loadError && <p className="text-sm text-red-600">{loadError}</p>}
              {locateError && <p className="text-sm text-red-600">{locateError}</p>}
              {!isLoading && !loadError && visibleDonations.length === 0 && (
                <div className="bg-white rounded-xl border border-[#e6eee9] p-6 text-sm text-[#7a9087]">
                  No food donations available yet.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {visibleDonations.map(item => (
                  <div key={item._id} className="bg-white rounded-xl overflow-hidden border border-[#e6eee9] flex flex-col shadow-sm">
                    <div className="relative h-32 w-full bg-[#f3f6f4] flex items-center justify-center">
                      {resolveDonationImage(item) ? <img src={resolveDonationImage(item)} alt={item.foodName || "Food"} className="h-full w-full object-cover" /> : <span className="material-symbols-outlined text-[#7a9087] text-4xl">photo_camera</span>}
                      <div className={`absolute bottom-2 right-2 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${item._isAvailable ? "bg-[#12c76a] text-white" : "bg-slate-200 text-slate-700"}`}>
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        {item._isAvailable ? "Available" : "Unavailable"}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <h3 className="font-bold text-[#111814]">{item.foodName || "Food Item"}</h3>
                      <p className="text-[11px] text-[#7a9087] flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[14px]">location_on</span>{item.location || "Location not provided"}</p>
                      {showNearby && item._distanceKm !== null && <p className="text-[11px] text-[#12c76a] font-semibold mt-1">{item._distanceKm.toFixed(1)} km away</p>}
                      <div className="flex items-center justify-between text-[11px] mt-2">
                        <span className="text-[#7a9087]">Claim Status</span>
                        <span className={`font-semibold ${item._isAvailable ? "text-[#12c76a]" : "text-slate-600"}`}>
                          {item._isAvailable ? `${item.quantity} portions left` : resolvePastStatus(item)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#eef4f1] rounded-full"><div className="bg-[#12c76a] h-full rounded-full w-full" /></div>
                      {item._isAvailable ? <Link className="mt-3 w-full bg-[#12c76a] hover:bg-[#0fbf63] text-white font-bold py-2 rounded-full text-xs text-center inline-flex items-center justify-center" to="/food-request" state={{ donationId: item._id, foodName: item.foodName, quantity: item.quantity, location: item.location, image: item.image, imageUrl: item.imageUrl }}>{t("Request Food")}</Link> : <button type="button" disabled className="mt-3 w-full bg-slate-200 text-slate-600 font-bold py-2 rounded-full text-xs text-center inline-flex items-center justify-center cursor-not-allowed">Not Available</button>}
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

export default UserDashboard;