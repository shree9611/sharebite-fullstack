import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { apiFetchWithFallback, resolveAssetUrl } from "../lib/api.js";
import { clearSession } from "../lib/auth.js";
import { clearCurrentProfile, getCurrentProfile } from "../lib/profile.js";

const stringifyLocation = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const text = [
      value.address,
      value.locationName,
      value.label,
      value.name,
      value.city,
      value.state,
      value.pincode,
    ]
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join(", ");
    if (text) return text;
    const coords = Array.isArray(value.coordinates) ? value.coordinates : [];
    if (coords.length >= 2) {
      const [lng, lat] = coords;
      return `Lat ${Number(lat).toFixed(5)}, Lng ${Number(lng).toFixed(5)}`;
    }
  }
  return "";
};

const resolveDonationImage = (mission) => {
  return resolveAssetUrl(
    mission?.donation?.imageUrl ||
    mission?.donation?.image ||
    mission?.donation?.foodImage ||
    mission?.imageUrl ||
    mission?.image ||
    mission?.foodImage ||
    ""
  );
};

const resolveProfileImage = (profile) => {
  return resolveAssetUrl(profile?.profileImageUrl || profile?.profileImage || "");
};

const normalizeDeliveryStatus = (value) => {
  const status = String(value || "").toLowerCase();
  if (status === "completed") return "delivered";
  return status || "unassigned";
};

const normalizeMission = (row) => {
  const request = row?.request || row?.requestId || {};
  const donation = row?.donation || request?.donation || {};
  const donor = row?.donor || request?.donor || donation?.donor || {};
  const receiver = row?.receiver || request?.receiver || {};
  const pickupId =
    row?.pickupId ||
    row?.pickup?._id ||
    row?._id ||
    row?.id ||
    "";
  const requestId = request?._id || row?.requestId?._id || row?.requestId || row?._id || "";
  return {
    ...row,
    _id: String(requestId || pickupId || ""),
    pickupId: String(pickupId || ""),
    requestId: String(requestId || ""),
    donation,
    donor,
    receiver,
    logistics: row?.logistics || request?.logistics || "delivery",
    deliveryStatus: normalizeDeliveryStatus(row?.deliveryStatus || row?.status || request?.deliveryStatus),
    donorLocation: row?.donorLocation || request?.donorLocation || donation?.location || donor?.location,
    receiverLocation:
      row?.receiverLocation ||
      request?.receiverLocation ||
      row?.deliveryAddress ||
      request?.deliveryAddress ||
      row?.requestedLocation ||
      request?.requestedLocation ||
      receiver?.location,
    donorPhone: donor?.phone || donor?.phoneNumber || donor?.contactNumber || "",
    receiverPhone: receiver?.phone || receiver?.phoneNumber || receiver?.contactNumber || "",
  };
};

const VolunteerAcceptMission = () => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showLocationFor, setShowLocationFor] = useState("");
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeRequestId, setActiveRequestId] = useState("");
  const [activePickupId, setActivePickupId] = useState("");
  const [brokenImageIds, setBrokenImageIds] = useState({});
  const [profile, setProfile] = useState(() => getCurrentProfile());
  const { t } = useLanguage();

  const handleLogout = () => {
    clearSession();
    clearCurrentProfile();
    navigate("/login");
  };

  useEffect(() => {
    setProfile(getCurrentProfile());
  }, []);

  const loadMissions = useCallback(async () => {
    const token = localStorage.getItem("sharebite.token");
    if (!token) {
      setError("Please login as volunteer.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    setActionError("");
    try {
      const pickupResponse = await apiFetchWithFallback("/api/pickups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let rows = [];
      if (pickupResponse.ok) {
        const data = await pickupResponse.json().catch(() => []);
        rows = Array.isArray(data) ? data : [];
      } else {
        const requestResponse = await apiFetchWithFallback("/api/requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await requestResponse.json().catch(() => []);
        if (!requestResponse.ok) {
          throw new Error(data?.message || "Failed to load missions.");
        }
        rows = Array.isArray(data) ? data : [];
      }
      const normalizedRows = rows
        .map(normalizeMission)
        .filter((row) => row?.logistics === "delivery" && row?.status !== "declined");
      setMissions(normalizedRows);
    } catch (loadError) {
      if (loadError instanceof TypeError) {
        setError("Unable to reach server. Please check your connection and try again.");
      } else {
        setError(loadError.message || "Unable to load volunteer missions.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  useEffect(() => {
    const onFocus = () => loadMissions();
    const intervalId = window.setInterval(() => loadMissions(), 8000);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadMissions]);

  const missionStats = useMemo(() => {
    const total = missions.length;
    return {
      total,
      routesAvailable: missions.filter((mission) => mission?.deliveryStatus !== "delivered").length,
    };
  }, [missions]);

  const handleAcceptMission = async (requestId) => {
    const token = localStorage.getItem("sharebite.token");
    if (!token) {
      setError("Please login as volunteer.");
      return;
    }

    setActiveRequestId(requestId);
    setActionError("");
    setSuccessMessage("");

    try {
      const response = await apiFetchWithFallback(`/api/requests/${requestId}/accept-mission`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Failed to accept mission.");
      }
      setMissions((prev) =>
        prev.map((mission) =>
          mission?.requestId === requestId || mission?._id === requestId
            ? { ...mission, deliveryStatus: "accepted", volunteer: mission?.volunteer || { name: "You" } }
            : mission
        )
      );
      setSuccessMessage("Mission accepted. You can now proceed with delivery.");
    } catch (acceptError) {
      setActionError(acceptError.message || "Unable to accept mission.");
    } finally {
      setActiveRequestId("");
    }
  };

  const handleConfirmDelivery = async (mission) => {
    const token = localStorage.getItem("sharebite.token");
    if (!token) {
      setError("Please login as volunteer.");
      return;
    }
    const pickupId = mission?.pickupId;
    const requestId = mission?.requestId || mission?._id;
    if (!pickupId && !requestId) {
      setActionError("Mission is missing required IDs.");
      return;
    }
    setActivePickupId(String(pickupId || requestId));
    setActionError("");
    setSuccessMessage("");
    try {
      let response;
      if (pickupId) {
        response = await apiFetchWithFallback(`/api/pickups/${pickupId}/complete`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await apiFetchWithFallback(`/api/requests/${requestId}/complete-delivery`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      if (response.status === 404 && requestId) {
        response = await apiFetchWithFallback(`/api/requests/${requestId}/complete-delivery`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Failed to confirm delivery.");
      }
      setMissions((prev) =>
        prev.map((item) =>
          item?.pickupId === pickupId || item?.requestId === requestId || item?._id === requestId
            ? {
                ...item,
                status: "completed",
                deliveryStatus: "delivered",
                donation: { ...(item?.donation || {}), status: "delivered" },
              }
            : item
        )
      );
      setSuccessMessage(
        "Delivery confirmed. Donor and receiver were notified and status is now Delivered."
      );
    } catch (confirmError) {
      setActionError(confirmError.message || "Unable to confirm delivery.");
    } finally {
      setActivePickupId("");
    }
  };

  return (
    <div className="bg-white min-h-screen text-[#111814]">
      <header className="border-b bg-white px-4 sm:px-6 md:px-10 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 font-bold text-lg relative">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-500">volunteer_activism</span>
            {t("ShareBite")}
          </div>
          <div className="relative">
            <button
              className="flex items-center justify-center rounded-full h-9 w-9 bg-white border border-[#e6eee9] text-[#7a9087]"
              onClick={() => setShowProfile((prev) => !prev)}
              type="button"
            >
              {resolveProfileImage(profile) ? (
                <img src={resolveProfileImage(profile)} alt="Profile" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[18px]">account_circle</span>
              )}
            </button>
            {showProfile && (
              <div className="absolute right-0 top-12 w-72 rounded-2xl border border-[#e6eee9] bg-white shadow-lg overflow-hidden z-10">
                <div className="h-16 bg-slate-50" />
                <div className="-mt-8 flex flex-col items-center px-4 pb-4">
                  <div className="h-16 w-16 rounded-full bg-white border-4 border-white shadow flex items-center justify-center text-[#7a9087]">
                    {resolveProfileImage(profile) ? (
                      <img src={resolveProfileImage(profile)} alt="Profile" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl">account_circle</span>
                    )}
                  </div>
                  <p className="mt-2 font-bold text-[#111814]">{profile?.name || "Volunteer"}</p>
                  <p className="text-xs text-[#7a9087]">{profile?.email || "Email not available"}</p>
                </div>
                <div className="px-4 pb-4 text-xs text-[#7a9087]">
                  <div className="flex items-center justify-between py-2 border-t border-[#eef4f1]">
                    <span>{t("Phone")}</span>
                    <span className="font-semibold text-[#111814]">{profile?.phone || "N/A"}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link
                      className="flex-1 rounded-xl bg-[#f3f6f4] px-3 py-2 font-semibold text-[#111814] text-center"
                      to="/profile"
                      onClick={() => setShowProfile(false)}
                    >
                      Profile
                    </Link>
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
      </header>
      <div className="max-w-6xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#e6eee9] p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-wider uppercase font-semibold text-[#7a9087]">
                Volunteer Operations
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111814] mt-1">
                {t("Volunteer Missions")}
              </h2>
              <p className="text-[#8aa19a] text-sm mt-1">
                {t("Volunteer Missions Subtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={loadMissions}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d7e5de] bg-white px-4 py-2 text-xs font-semibold text-[#1f3b31] hover:bg-[#eef6f2] disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              {isLoading ? "Refreshing..." : "Refresh List"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <div className="rounded-xl bg-[#f2fbf6] border border-[#d6f1e1] px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide font-semibold text-[#4d7d66]">
                Total Missions
              </p>
              <p className="text-2xl font-extrabold text-[#0f6b4b] mt-1">{missionStats.total}</p>
            </div>
            <div className="rounded-xl bg-[#fffbf3] border border-[#f8e5bf] px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide font-semibold text-[#8a6a2e]">
                Routes Available
              </p>
              <p className="text-2xl font-extrabold text-[#9b6a11] mt-1">
                {missionStats.routesAvailable}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-[#e6eee9] p-6 text-sm text-[#8aa19a]">
              Loading missions...
            </div>
          ) : null}
        {error ? (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {actionError ? (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-4 text-sm text-red-700">
            {actionError}
          </div>
        ) : null}
        {successMessage ? (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}
        {!isLoading && !error && missions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e6eee9] p-6 text-sm text-[#6b7f77]">
            No delivery missions available right now.
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          {missions.map((mission) => {
            const missionId = String(mission?.requestId || mission?._id || mission?.pickupId || "");
            const donorLocation =
              stringifyLocation(mission?.donorLocation) ||
              stringifyLocation(mission?.donation?.location) ||
              "Donor location not available";
            const receiverLocation =
              stringifyLocation(mission?.receiverLocation) ||
              stringifyLocation(mission?.deliveryAddress) ||
              stringifyLocation(mission?.requestedLocation) ||
              "Receiver location not available";
            const mapQuery = encodeURIComponent(`${donorLocation} to ${receiverLocation}`);
            const isAccepted = mission?.deliveryStatus === "accepted" || mission?.deliveryStatus === "picked_up";
            const isDelivered = mission?.deliveryStatus === "delivered";
            const isAccepting = activeRequestId && (activeRequestId === mission?.requestId || activeRequestId === missionId);
            const isCompleting =
              activePickupId &&
              (activePickupId === mission?.pickupId || activePickupId === mission?.requestId || activePickupId === missionId);
            const imageSrc = brokenImageIds[missionId] ? "" : resolveDonationImage(mission);

            return (
              <div key={missionId} className="bg-white rounded-2xl border border-[#e6eee9] p-5 sm:p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-[#7a9087]">
                      Mission ID: {missionId || "N/A"}
                    </p>
                    <h3 className="text-lg font-extrabold text-[#111814] mt-1">
                      Delivery: {mission?.donation?.foodName || "Food"}
                    </h3>
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={mission?.donation?.foodName || "Food"}
                        className="mt-3 h-20 w-28 rounded-lg object-cover border border-[#e6eee9]"
                        onError={() => setBrokenImageIds((prev) => ({ ...prev, [missionId]: true }))}
                      />
                    ) : (
                      <div className="mt-3 h-20 w-28 rounded-lg border border-[#e6eee9] bg-[#f3f7f5] flex items-center justify-center text-[#93a29b]">
                        <span className="material-symbols-outlined text-[18px]">image_not_supported</span>
                      </div>
                    )}
                    <p className="text-xs text-[#8aa19a] mt-1">
                      Assigned for receiver: {mission?.receiver?.name || "Receiver"}
                    </p>
                    <div className="mt-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        isDelivered
                          ? "bg-emerald-50 text-emerald-700"
                          : isAccepted
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                      }`}>
                        {isDelivered ? "Delivered" : isAccepted ? "Mission Accepted" : "Awaiting Volunteer"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setShowLocationFor((prev) => (prev === missionId ? "" : missionId))}
                      className="px-4 py-2 rounded-xl bg-[#12c76a] text-white text-xs font-bold hover:bg-[#0fbf63] transition-colors"
                    >
                      {showLocationFor === missionId ? "Hide Route" : "View Route"}
                    </button>
                    <button
                      type="button"
                      disabled={isAccepted || isDelivered || isAccepting || !mission?.requestId}
                      onClick={() => handleAcceptMission(mission?.requestId || missionId)}
                      className="px-4 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] transition-colors disabled:opacity-60"
                    >
                      {isAccepting ? "Accepting..." : isAccepted ? "Accepted" : isDelivered ? "Delivered" : "Accept Mission"}
                    </button>
                    <button
                      type="button"
                      disabled={!isAccepted || isDelivered || isCompleting || (!mission?.pickupId && !mission?.requestId)}
                      onClick={() => handleConfirmDelivery(mission)}
                      className="px-4 py-2 rounded-xl bg-[#12c76a] text-white text-xs font-bold hover:bg-[#0fbf63] transition-colors disabled:opacity-60"
                    >
                      {isCompleting ? "Confirming..." : isDelivered ? "Delivered" : "Confirm Delivery"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#e6eee9] bg-[#f9fcfb] p-4">
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-[#7a9087]">
                      Pickup
                    </p>
                    <p className="text-sm font-bold text-[#111814] mt-1">
                      {mission?.donor?.name || "Donor"}
                    </p>
                    <p className="text-xs text-[#6b7f77] mt-1">
                      Phone: {mission?.donorPhone || "Not available"}
                    </p>
                    <p className="text-xs text-[#6b7f77] mt-2">
                      {donorLocation}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#e6eee9] bg-[#f9fcfb] p-4">
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-[#7a9087]">
                      Drop-off
                    </p>
                    <p className="text-sm font-bold text-[#111814] mt-1">
                      {mission?.receiver?.name || "Receiver"}
                    </p>
                    <p className="text-xs text-[#6b7f77] mt-1">
                      Phone: {mission?.receiverPhone || "Not available"}
                    </p>
                    <p className="text-xs text-[#6b7f77] mt-2">
                      {receiverLocation}
                    </p>
                  </div>
                </div>

                {showLocationFor === missionId ? (
                  <div className="mt-4 rounded-xl border border-[#dfece6] bg-[#f4faf7] p-4">
                    <div className="flex items-center gap-2 text-[#111814] text-sm font-semibold">
                      <span className="material-symbols-outlined text-[18px] text-[#12c76a]">
                        local_shipping
                      </span>
                      Delivery Route
                    </div>
                    <a
                      className="mt-2 inline-flex items-center gap-1 text-xs text-[#0f6b4b] font-semibold underline"
                      href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open route in Google Maps
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerAcceptMission;



