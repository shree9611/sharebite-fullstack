import React, { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const VolunteerAcceptMission = () => {
  const [showLocation, setShowLocation] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="bg-background-light min-h-screen text-[#111814]">
      <div className="flex min-h-screen">
        <aside className="w-60 bg-white border-r border-[#e6eee9] flex flex-col fixed h-full z-10">
          <div className="p-5 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center rounded-full size-12 bg-[#e9f9f0] text-[#12c76a]">
                <span className="material-symbols-outlined text-[26px]">
                  volunteer_activism
                </span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-[#111814] text-sm font-bold leading-none uppercase tracking-wider">
                  {t("ShareBite")}
                </h1>
                <p className="text-[#8aa19a] text-[11px] font-medium">
                  {t("Volunteer Dashboard")}
                </p>
              </div>
            </div>
            <nav className="flex flex-col gap-2">
              <a
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#12c76a] text-white font-semibold shadow-sm"
                href="/volunteer/acceptmission"
              >
                <span className="material-symbols-outlined text-[18px]">
                  assignment
                </span>
                <span className="text-xs">{t("Accept Mission")}</span>
              </a>
            </nav>
          </div>
        </aside>

        <main className="flex-1 ml-60">
          <div className="max-w-4xl mx-auto py-10 px-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#111814]">
                  {t("Volunteer Missions")}
                </h2>
                <p className="text-[#8aa19a] text-sm mt-1">
                  {t("Volunteer Missions Subtitle")}
                </p>
              </div>
              <div className="relative">
                <button
                  className="flex items-center justify-center rounded-full h-9 w-9 bg-white border border-[#e6eee9] text-[#7a9087]"
                  type="button"
                  onClick={() => setShowProfile((prev) => !prev)}
                >
                <span className="material-symbols-outlined text-[18px]">
                  account_circle
                </span>
                </button>
                {showProfile && (
                  <div className="absolute right-0 top-12 w-72 rounded-2xl border border-[#e6eee9] bg-white shadow-lg overflow-hidden">
                    <div className="h-16 bg-[#f8efe3]" />
                    <div className="-mt-8 flex flex-col items-center px-4 pb-4">
                      <div className="h-16 w-16 rounded-full bg-white border-4 border-white shadow flex items-center justify-center text-[#7a9087]">
                        <span className="material-symbols-outlined text-3xl">
                          account_circle
                        </span>
                      </div>
                      <p className="mt-2 font-bold text-[#111814]">
                        {t("User Name")}
                      </p>
                      <p className="text-xs text-[#7a9087]">
                        {t("User Email")}
                      </p>
                    </div>
                    <div className="px-4 pb-4 text-xs text-[#7a9087]">
                      <div className="flex items-center justify-between py-2 border-t border-[#eef4f1]">
                        <span>{t("Phone")}</span>
                        <span className="font-semibold text-[#111814]">
                          +91 XXXXX XXXXX
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          className="flex-1 rounded-xl bg-[#f3f6f4] px-3 py-2 font-semibold text-[#111814]"
                          type="button"
                          onClick={() => setShowProfile(false)}
                        >
                          {t("Cancel")}
                        </button>
                        <button className="flex-1 rounded-xl px-3 py-2 font-semibold text-red-500 hover:bg-red-50">
                          {t("Logout")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e6eee9] p-6">
              <div className="flex items-center justify-between gap-4">
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
                  className="px-4 py-2 rounded-full bg-[#12c76a] text-white text-xs font-bold hover:bg-[#0fbf63] transition-all"
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
        </main>
      </div>
    </div>
  );
};

export default VolunteerAcceptMission;
