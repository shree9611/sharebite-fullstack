import React, { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const VolunteerAcceptMission = () => {
  const [showLocation, setShowLocation] = useState(false);
  const { t } = useLanguage();

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

        <div className="bg-white rounded-2xl border border-[#e6eee9] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#111814]">
                {t("Mission Title")}
              </h3>
              <p className="text-xs text-[#8aa19a] mt-1">
                {t("Receiver Label")} {t("Sunshine Care Home")}
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#6b7f77]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#12c76a]">
                    call
                  </span>
                  {t("Phone")}: +91 824-555-0187
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <span className="material-symbols-outlined text-[16px] text-[#12c76a]">
                    local_shipping
                  </span>
                  {t("Deliver From To")}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowLocation(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#12c76a] text-white text-xs font-bold hover:bg-[#0fbf63] transition-all"
            >
              {t("Accept Task")}
            </button>
          </div>

          {showLocation && (
            <div className="mt-5 rounded-xl border border-[#e6eee9] bg-[#f8fbf9] p-4">
              <div className="flex items-center gap-2 text-[#111814] text-sm font-semibold">
                <span className="material-symbols-outlined text-[18px] text-[#12c76a]">
                  location_on
                </span>
                {t("Receiver Location")}
              </div>
              <a
                className="mt-2 text-xs text-[#0f6b4b] font-semibold underline"
                href="https://www.google.com/maps/search/?api=1&query=Mangalore%2C%20Karnataka%2C%20India"
                target="_blank"
                rel="noreferrer"
              >
                {t("Mangalore Address")}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerAcceptMission;



