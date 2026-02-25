import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { API_BASE_URL, apiFetchWithFallback } from "../lib/api.js";

const SAFE_DATA_IMAGE_RE = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i;

const resolveDonationImage = (mission) => {
  const imageUrl = mission?.donation?.imageUrl || mission?.donation?.image || "";
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  if (imageUrl.startsWith("data:")) return SAFE_DATA_IMAGE_RE.test(imageUrl) ? imageUrl : "";
  if (imageUrl.startsWith("/")) return `${API_BASE_URL}${imageUrl}`;
  return "";
};

const VolunteerAcceptMission = () => {
  const [showLocationFor, setShowLocationFor] = useState("");
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMissionId, setActiveMissionId] = useState("");
  const { t } = useLanguage();

  const loadMissions = useCallback(async () => {
    const token = localStorage.getItem("sharebite.token");
    if (!token) {
      setError("Please login as volunteer.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await apiFetchWithFallback("/api/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load missions.");
      }
      const rows = Array.isArray(data) ? data : [];
      setMissions(rows.filter((row) => row?.logistics === "delivery" && row?.status !== "declined"));
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

  const missionStats = useMemo(() => {
    const total = missions.length;
    const withPhoneContacts = missions.filter(
      (mission) => mission?.donor?.phone || mission?.receiver?.phone
    ).length;
    return {
      total,
      withPhoneContacts,
      routesAvailable: missions.filter((mission) => mission?.deliveryStatus !== "delivered").length,
    };
  }, [missions]);

  const handleAcceptMission = async (missionId) => {
    const token = localStorage.getItem("sharebite.token");
    if (!token) {
      setError("Please login as volunteer.");
      return;
    }

    setActiveMissionId(missionId);
    setError("");

    try {
      const response = await apiFetchWithFallback(`/api/requests/${missionId}/accept-mission`, {
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
          mission?._id === missionId
            ? { ...mission, deliveryStatus: "accepted", volunteer: mission?.volunteer || { name: "You" } }
            : mission
        )
      );
    } catch (acceptError) {
      setError(acceptError.message || "Unable to accept mission.");
    } finally {
      setActiveMissionId("");
    }
  };

  return (
    <div className="bg-[#fbf6ea] min-h-screen text-[#111814]">
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
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d7e5de] bg-[#f8fbf9] px-4 py-2 text-xs font-semibold text-[#1f3b31] hover:bg-[#eef6f2] disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              {isLoading ? "Refreshing..." : "Refresh List"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="rounded-xl bg-[#f2fbf6] border border-[#d6f1e1] px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide font-semibold text-[#4d7d66]">
                Total Missions
              </p>
              <p className="text-2xl font-extrabold text-[#0f6b4b] mt-1">{missionStats.total}</p>
            </div>
            <div className="rounded-xl bg-[#f7fbff] border border-[#d7e8f6] px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide font-semibold text-[#4a6f8e]">
                Contact Ready
              </p>
              <p className="text-2xl font-extrabold text-[#215f8f] mt-1">
                {missionStats.withPhoneContacts}
              </p>
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
        {!isLoading && !error && missions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e6eee9] p-6 text-sm text-[#6b7f77]">
            No delivery missions available right now.
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          {missions.map((mission) => {
            const missionId = String(mission?._id || "");
            const donorLocation = mission?.donation?.location || "Donor location not available";
            const receiverLocation = mission?.deliveryAddress || mission?.requestedLocation || "Receiver location not available";
            const mapQuery = encodeURIComponent(`${donorLocation} to ${receiverLocation}`);
            const isAccepted = mission?.deliveryStatus === "accepted" || mission?.deliveryStatus === "picked_up";
            const isDelivered = mission?.deliveryStatus === "delivered";
            const isProcessing = activeMissionId === missionId;

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
                    {resolveDonationImage(mission) ? (
                      <img
                        src={resolveDonationImage(mission)}
                        alt={mission?.donation?.foodName || "Food"}
                        className="mt-3 h-20 w-28 rounded-lg object-cover border border-[#e6eee9]"
                      />
                    ) : null}
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
                      disabled={isAccepted || isDelivered || isProcessing}
                      onClick={() => handleAcceptMission(missionId)}
                      className="px-4 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] transition-colors disabled:opacity-60"
                    >
                      {isProcessing ? "Accepting..." : isAccepted ? "Accepted" : isDelivered ? "Delivered" : "Accept Mission"}
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
                      Phone: {mission?.donor?.phone || "Not available"}
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
                      Phone: {mission?.receiver?.phone || "Not available"}
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



