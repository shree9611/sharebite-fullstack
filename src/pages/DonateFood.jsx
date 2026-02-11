import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const DonateFood = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const isActive = (path) => location.pathname === path;
  const handleLogout = () => {
    navigate("/login");
  };
  return (
    <div className="bg-transparent min-h-screen">
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <header className="border-b bg-white px-4 sm:px-6 md:px-10 py-5">
            <div className="flex items-center gap-2 font-bold text-lg">
              <span className="material-symbols-outlined text-green-500">
                volunteer_activism
              </span>
              {t("ShareBite")}
            </div>
          </header>
          <div className="flex flex-col sm:flex-row">
            <aside className="bg-white px-4 sm:px-6 md:px-8 py-4 border-r border-[#e6eee9] w-full sm:w-64 shrink-0">
              <nav className="flex flex-col gap-2 text-lg font-extrabold text-[#7a9087]">
                <Link
                  className={`hover:text-[#111814] transition-colors flex items-center gap-2 px-3 py-2 rounded-xl ${isActive("/donor/donate") ? "bg-green-50 text-green-600" : ""}`}
                  to="/donor/donate"
                >
                  <span className={`material-symbols-outlined text-[22px] ${isActive("/donor/donate") ? "text-green-600" : ""}`}>
                    add_circle
                  </span>
                  {t("Donate Food")}
                </Link>
                <Link
                  className={`hover:text-[#111814] transition-colors flex items-center gap-2 px-3 py-2 rounded-xl ${isActive("/donor/approvals") ? "bg-green-50 text-green-600" : ""}`}
                  to="/donor/approvals"
                >
                  <span className={`material-symbols-outlined text-[22px] ${isActive("/donor/approvals") ? "text-green-600" : ""}`}>
                    verified
                  </span>
                  {t("Request Approval")}
                </Link>
                <Link
                  className={`hover:text-[#111814] transition-colors flex items-center gap-2 px-3 py-2 rounded-xl ${isActive("/donor/feedback") ? "bg-green-50 text-green-600" : ""}`}
                  to="/donor/feedback"
                >
                  <span className={`material-symbols-outlined text-[22px] ${isActive("/donor/feedback") ? "text-green-600" : ""}`}>
                    forum
                  </span>
                  {t("Community Feedback")}
                </Link>
              </nav>
            </aside>
            <div className="flex-1">
              <div className="max-w-4xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#111814]">
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

            <div className="bg-white rounded-2xl border border-[#e6eee9] p-5 sm:p-6">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="flex flex-col gap-3 px-4 py-3 rounded-xl bg-[#fff7ed] border border-[#fde2c2]">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#f97316] text-[18px]">
                          bakery_dining
                        </span>
                        <div>
                          <p className="text-xs font-bold text-[#111814] leading-none">
                            {t("Baked Type")}
                          </p>
                          <p className="text-[10px] text-[#8aa19a] mt-1 uppercase tracking-wider">
                            {t("Baked Type Subtitle")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <label className="flex-1 relative cursor-pointer">
                          <input
                            defaultChecked
                            className="sr-only peer"
                            name="bakedType"
                            type="radio"
                            value="baked"
                          />
                          <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-[#e6eee9] bg-white peer-checked:border-[#f97316] peer-checked:bg-[#fff7ed] transition-all">
                            <span className="text-xs font-bold text-[#111814]">
                              {t("Baked")}
                            </span>
                          </div>
                        </label>
                        <label className="flex-1 relative cursor-pointer">
                          <input
                            className="sr-only peer"
                            name="bakedType"
                            type="radio"
                            value="non-baked"
                          />
                          <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-[#e6eee9] bg-white peer-checked:border-[#f97316] peer-checked:bg-[#fff7ed] transition-all">
                            <span className="text-xs font-bold text-[#111814]">
                              {t("Non Baked")}
                            </span>
                          </div>
                        </label>
                      </div>
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
                  <p className="text-center text-[#a4b2ac] text-xs mt-5 px-2 sm:px-10">
                    {t("Donation Disclaimer")}
                  </p>
                </div>
              </form>
            </div>
            <p className="text-center text-[#a4b2ac] text-xs mt-6">
              {t("Donation Thanks")}
            </p>
          </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DonateFood;



