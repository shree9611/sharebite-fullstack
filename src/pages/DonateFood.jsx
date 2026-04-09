import React, { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const DonateFood = () => {
  const { t } = useLanguage();
  const [showProfile, setShowProfile] = useState(false);
  return (
    <div className="bg-background-light min-h-screen">
      <div className="flex min-h-screen">
        <aside className="w-60 bg-white border-r border-[#e6eee9] flex flex-col fixed h-full z-10">
          <div className="p-5 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center rounded-2xl size-11 bg-[#e9f9f0] text-[#12c76a]">
                <span className="material-symbols-outlined text-[26px]">
                  volunteer_activism
                </span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-[#111814] text-sm font-bold leading-none uppercase tracking-wider">
                  {t("ShareBite")}
                </h1>
                <p className="text-[#8aa19a] text-[11px] font-medium">
                  {t("Donor Dashboard")}
                </p>
              </div>
            </div>
            <nav className="flex flex-col gap-2">
              <a
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#12c76a] text-white font-semibold shadow-sm"
                href="/donor/donate"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_circle
                </span>
                <span className="text-xs">{t("Donate Food")}</span>
              </a>
              <a
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#7a9087] hover:bg-[#f3f6f4] transition-all"
                href="/donor/approvals"
              >
                <span className="material-symbols-outlined text-[18px]">
                  verified
                </span>
                <span className="text-xs font-semibold">{t("Request Approval")}</span>
              </a>
              <a
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#7a9087] hover:bg-[#f3f6f4] transition-all"
                href="/donor/feedback"
              >
                <span className="material-symbols-outlined text-[18px]">
                  forum
                </span>
                <span className="text-xs font-semibold">
                  {t("Community Feedback")}
                </span>
              </a>
            </nav>
          </div>
        </aside>

        <main className="flex-1 ml-60">
          <div className="max-w-4xl mx-auto py-10 px-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#111814]">
                  {t("Donate Surplus Food")}
                </h2>
                <p className="text-[#8aa19a] text-sm mt-1">
                  {t("Donate Surplus Subtitle")}
                </p>
              </div>
              <div className="relative">
                <button
                  className="flex items-center justify-center rounded-full h-9 w-9 bg-white border border-[#e6eee9] text-[#7a9087]"
                  onClick={() => setShowProfile((prev) => !prev)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    account_circle
                  </span>
                </button>
                {showProfile && (
                  <div className="absolute right-0 top-12 w-72 rounded-2xl border border-[#e6eee9] bg-white shadow-lg overflow-hidden z-10">
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
              <form className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-[#eef4f1]">
                  <span className="material-symbols-outlined text-[#12c76a] text-[18px]">
                    restaurant_menu
                  </span>
                  <h3 className="text-sm font-bold text-[#111814]">
                    {t("Essential Information")}
                  </h3>
                </div>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#e6eee9] rounded-xl p-5 bg-[#f8fbf9]">
                  <span className="material-symbols-outlined text-3xl text-[#9fb3aa] mb-2">
                    photo_camera
                  </span>
                  <p className="text-xs text-[#8aa19a] font-medium">
                    {t("Add Food Photo")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-[#6b7f77]">
                      {t("Food Title")}
                    </label>
                    <input
                      className="w-full h-10 rounded-xl border-[#e6eee9] text-sm focus:ring-[#12c76a] focus:border-[#12c76a]"
                      placeholder={t("Food Title Placeholder")}
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-[#6b7f77]">
                      {t("Quantity / Servings")}
                    </label>
                    <input
                      className="w-full h-10 rounded-xl border-[#e6eee9] text-sm focus:ring-[#12c76a] focus:border-[#12c76a]"
                      placeholder={t("Quantity Placeholder")}
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-[#6b7f77]">
                      {t("Best Before")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9fb3aa] text-[18px]">
                        schedule
                      </span>
                      <input
                        className="w-full h-10 pl-10 rounded-xl border-[#e6eee9] text-sm focus:ring-[#12c76a] focus:border-[#12c76a]"
                        type="time"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-[#6b7f77]">
                      {t("Pickup Location")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9fb3aa] text-[18px]">
                        location_on
                      </span>
                      <input
                        className="w-full h-10 pl-10 rounded-xl border-[#e6eee9] text-sm focus:ring-[#12c76a] focus:border-[#12c76a]"
                      placeholder={t("Pickup Placeholder")}
                        type="text"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-[#6b7f77]">
                    {t("Dietary Classification")}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex gap-3">
                      <label className="flex-1 relative cursor-pointer">
                        <input
                          defaultChecked
                          className="sr-only peer"
                          name="dietary"
                          type="radio"
                          value="veg"
                        />
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#e6eee9] bg-white peer-checked:border-[#12c76a] peer-checked:bg-[#e9f9f0] transition-all">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#12c76a] text-[18px]">
                              potted_plant
                            </span>
                            <span className="text-xs font-bold text-[#111814]">
                              {t("Veg")}
                            </span>
                          </div>
                        </div>
                      </label>
                      <label className="flex-1 relative cursor-pointer">
                        <input
                          className="sr-only peer"
                          name="dietary"
                          type="radio"
                          value="non-veg"
                        />
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#e6eee9] bg-white peer-checked:border-[#f59e0b] peer-checked:bg-[#fff7ed] transition-all">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#f59e0b] text-[18px]">
                              set_meal
                            </span>
                            <span className="text-xs font-bold text-[#111814]">
                              {t("Non-Veg")}
                            </span>
                          </div>
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#fff7ed] border border-[#fde2c2]">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#f97316] text-[18px]">
                          bakery_dining
                        </span>
                        <div>
                          <p className="text-xs font-bold text-[#111814] leading-none">
                            {t("Baked Goods")}
                          </p>
                          <p className="text-[10px] text-[#8aa19a] mt-1 uppercase tracking-wider">
                            {t("Baked Goods Subtitle")}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input className="sr-only peer" type="checkbox" />
                        <div className="w-10 h-5 bg-[#d7e0dc] rounded-full peer-checked:bg-[#f97316] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    className="w-full bg-[#12c76a] hover:bg-[#0fbf63] text-white font-bold py-3 rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                    type="submit"
                  >
                    {t("Submit Donation")}
                    <span className="material-symbols-outlined text-[18px]">
                      send
                    </span>
                  </button>
                  <p className="text-center text-[#a4b2ac] text-xs mt-5 px-10">
                    {t("Donation Disclaimer")}
                  </p>
                </div>
              </form>
            </div>
            <p className="text-center text-[#a4b2ac] text-xs mt-6">
              {t("Donation Thanks")}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DonateFood;
