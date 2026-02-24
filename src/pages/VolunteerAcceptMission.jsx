import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { buildApiUrl } from "../lib/api.js";

const VolunteerAcceptMission = () => {
  const [showLocationFor, setShowLocationFor] = useState("");
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    const token = localStorage.getItem("sharebite.token");
    if (!token) {
      setError("Please login as volunteer.");
      setIsLoading(false);
      return;
    }

    const loadMissions = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(buildApiUrl("/api/requests"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error(data?.message || "Failed to load missions.");
        }
        const rows = Array.isArray(data) ? data : [];
        setMissions(rows.filter((row) => row?.logistics === "delivery"));
      } catch (loadError) {
        if (loadError instanceof TypeError) {
          setError("Unable to reach server. Please check your connection and try again.");
        } else {
          setError(loadError.message || "Unable to load volunteer missions.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMissions();
  }, []);

  return (
    <div className="bg-transparent min-h-screen text-[#111814]">
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-[#111814]">
            {t("Volunteer Missions")}
          </h2>
          <p className="text-[#8aa19a] text-sm mt-1">
            {t("Volunteer Missions Subtitle")}
          </p>
        </div>

        {isLoading ? <p className="text-sm text-[#8aa19a]">Loading missions...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
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

            return (
              <div key={missionId} className="bg-white rounded-2xl border border-[#e6eee9] p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-[#111814]">
                      Delivery: {mission?.donation?.foodName || "Food"}
                    </h3>
                    <p className="text-xs text-[#8aa19a] mt-1">
                      Receiver: {mission?.receiver?.name || "Receiver"}
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-[#6b7f77]">
                      <div>Donor: {mission?.donor?.name || "Donor"} {mission?.donor?.phone ? `(${mission.donor.phone})` : ""}</div>
                      <div>From: {donorLocation}</div>
                      <div>To: {receiverLocation}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLocationFor((prev) => (prev === missionId ? "" : missionId))}
                    className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#12c76a] text-white text-xs font-bold hover:bg-[#0fbf63] transition-all"
                  >
                    {showLocationFor === missionId ? "Hide Route" : "View Route"}
                  </button>
                </div>

                {showLocationFor === missionId ? (
                  <div className="mt-5 rounded-xl border border-[#e6eee9] bg-[#f8fbf9] p-4">
                    <div className="flex items-center gap-2 text-[#111814] text-sm font-semibold">
                      <span className="material-symbols-outlined text-[18px] text-[#12c76a]">
                        local_shipping
                      </span>
                      Delivery Route
                    </div>
                    <a
                      className="mt-2 text-xs text-[#0f6b4b] font-semibold underline"
                      href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open route in Google Maps
                    </a>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VolunteerAcceptMission;



