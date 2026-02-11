import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const role = location.state?.role;
  const showReceiver = !role || role === "Receiver";
  const [showNearby, setShowNearby] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const isAvailable = location.pathname === "/dashboard";
  const isMyRequests = location.pathname === "/my-requests";
  const isFeedback = location.pathname === "/receiver/feedback";
  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="bg-transparent text-[#111814] min-h-screen">
      {showReceiver ? (
        <div className="relative flex h-auto min-h-screen w-full flex-col">
          <header className="sticky top-0 z-50 flex items-center justify-between border-b border-solid border-orange-100 bg-white px-4 sm:px-6 md:px-10 py-5 shadow-sm">
            <div className="flex items-center gap-4 text-[#111814]">
              <div className="flex items-center gap-2">
                <div className="size-6 text-primary">
                  <span className="material-symbols-outlined text-3xl">
                    volunteer_activism
                  </span>
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
                  {t("ShareBite")}
                </h2>
              </div>
            </div>
            <div className="flex flex-1 justify-end relative">
              <button
                className="flex cursor-pointer items-center justify-center rounded-full h-9 w-9 bg-[#f0f4f2] text-[#111814]"
                onClick={() => setShowProfile((prev) => !prev)}
                type="button"
              >
                <span className="material-symbols-outlined">
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
            <aside className="w-full lg:w-60 border-b lg:border-r border-[#dbe6e0] bg-white/90 p-4 flex flex-col gap-6 shadow-sm">
              <div className="flex flex-col gap-2">
                <nav className="flex flex-col gap-1">
                  <a
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isAvailable
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-[#7a9087] hover:text-[#111814] hover:bg-slate-50"
                    }`}
                    href="/dashboard"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      restaurant
                    </span>
                    <p className="text-xs font-semibold">{t("Available Now")}</p>
                  </a>
                  <a
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isMyRequests
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-[#7a9087] hover:text-[#111814] hover:bg-slate-50"
                    }`}
                    href="/my-requests"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      shopping_cart
                    </span>
                    <p className="text-xs font-semibold">{t("My Requests")}</p>
                  </a>
                  <a
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isFeedback
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-[#7a9087] hover:text-[#111814] hover:bg-slate-50"
                    }`}
                    href="/receiver/feedback"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      reviews
                    </span>
                    <p className="text-xs font-semibold">{t("Feedback")}</p>
                  </a>
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
                    <p className="text-[#7a9087] text-sm">
                      {t("Receiver Dashboard Subtitle")}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowNearby((prev) => !prev)}
                      className="bg-[#12c76a] text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-[#0fbf63] transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        location_on
                      </span>
                      {showNearby ? t("Showing Nearby") : t("Find Food Near Me")}
                    </button>
                  </div>
                </div>

                {showNearby && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-bold text-[#111814]">
                        {t("Nearby Food")}
                      </h2>
                      <span className="text-[11px] text-[#7a9087]">
                        {t("Within 2 km")}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="bg-white rounded-xl overflow-hidden border border-[#e6eee9] flex flex-col shadow-sm">
                        <div className="relative h-32 w-full bg-[#f3f6f4] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#7a9087] text-4xl">
                            photo_camera
                          </span>
                          <div className="absolute top-2 left-2 bg-white/90 text-[#111814] text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-white/20">
                            <span className="material-symbols-outlined text-[12px]">
                              distance
                            </span>
                            {t("0.5 km away")}
                          </div>
                          <div className="absolute bottom-2 right-2 bg-[#12c76a] text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">
                              check_circle
                            </span>
                            {t("Available")}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col gap-2">
                          <div className="flex flex-col">
                            <h3 className="font-bold text-[#111814]">
                              {t("Mixed Sandwiches")}
                            </h3>
                            <p className="text-[11px] text-[#7a9087] flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[14px]">
                                store
                              </span>
                              {t("Plaza Deli")}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[11px] mt-2">
                            <span className="text-[#7a9087]">
                              {t("Claim Status")}
                            </span>
                            <span className="font-semibold text-[#12c76a]">
                              {t("3/4 servings left")}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#eef4f1] rounded-full">
                            <div className="bg-[#12c76a] h-full rounded-full w-[75%]" />
                          </div>
                          <a
                            className="mt-3 w-full bg-[#12c76a] hover:bg-[#0fbf63] text-white font-bold py-2 rounded-full text-xs text-center inline-flex items-center justify-center"
                            href="/food-request"
                          >
                            {t("Request Food")}
                          </a>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl overflow-hidden border border-[#e6eee9] flex flex-col shadow-sm">
                        <div className="relative h-32 w-full bg-[#f3f6f4] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#7a9087] text-4xl">
                            photo_camera
                          </span>
                          <div className="absolute top-2 left-2 bg-white/90 text-[#111814] text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-white/20">
                            <span className="material-symbols-outlined text-[12px]">
                              distance
                            </span>
                            {t("0.8 km away")}
                          </div>
                          <div className="absolute bottom-2 right-2 bg-[#12c76a] text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">
                              check_circle
                            </span>
                            {t("Available")}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col gap-2">
                          <div className="flex flex-col">
                            <h3 className="font-bold text-[#111814]">
                              {t("Artisan Bagels")}
                            </h3>
                            <p className="text-[11px] text-[#7a9087] flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[14px]">
                                store
                              </span>
                              {t("Downtown Bakery")}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[11px] mt-2">
                            <span className="text-[#7a9087]">
                              {t("Claim Status")}
                            </span>
                            <span className="font-semibold text-[#12c76a]">
                              {t("1/2 left")}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#eef4f1] rounded-full">
                            <div className="bg-[#12c76a] h-full rounded-full w-1/2" />
                          </div>
                          <a
                            className="mt-3 w-full bg-[#12c76a] hover:bg-[#0fbf63] text-white font-bold py-2 rounded-full text-xs text-center inline-flex items-center justify-center"
                            href="/food-request"
                          >
                            {t("Request Food")}
                          </a>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl overflow-hidden border border-[#e6eee9] flex flex-col shadow-sm">
                        <div className="relative h-32 w-full bg-[#f3f6f4] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#7a9087] text-4xl">
                            photo_camera
                          </span>
                          <div className="absolute top-2 left-2 bg-white/90 text-[#111814] text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-white/20">
                            <span className="material-symbols-outlined text-[12px]">
                              distance
                            </span>
                            {t("1.5 km away")}
                          </div>
                          <div className="absolute bottom-2 right-2 bg-[#12c76a] text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">
                              check_circle
                            </span>
                            {t("Available")}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col gap-2">
                          <div className="flex flex-col">
                            <h3 className="font-bold text-[#111814]">
                              {t("Seasonal Fruit Salad")}
                            </h3>
                            <p className="text-[11px] text-[#7a9087] flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[14px]">
                                store
                              </span>
                              {t("Fresh Market")}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[11px] mt-2">
                            <span className="text-[#7a9087]">
                              {t("Claim Status")}
                            </span>
                            <span className="font-semibold text-[#12c76a]">
                              {t("5 portions left")}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#eef4f1] rounded-full">
                            <div className="bg-[#12c76a]/40 h-full rounded-full w-[40%]" />
                          </div>
                          <a
                            className="mt-3 w-full bg-[#12c76a] hover:bg-[#0fbf63] text-white font-bold py-2 rounded-full text-xs text-center inline-flex items-center justify-center"
                            href="/food-request"
                          >
                            {t("Request Food")}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="bg-white rounded-xl overflow-hidden border border-[#e6eee9] flex flex-col shadow-sm">
                    <div className="relative h-32 w-full bg-[#f3f6f4] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#7a9087] text-4xl">
                        photo_camera
                      </span>
                      <div className="absolute top-2 left-2 bg-white/90 text-[#111814] text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-white/20">
                        <span className="material-symbols-outlined text-[12px]">
                          distance
                        </span>
                        {t("0.8 km away")}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-[#12c76a] text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">
                          check_circle
                        </span>
                        {t("Available")}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-[#111814]">
                          {t("Artisan Bagels")}
                        </h3>
                        <p className="text-[11px] text-[#7a9087] flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">
                            store
                          </span>
                          {t("Downtown Bakery")}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-2">
                        <span className="text-[#7a9087]">
                          {t("Claim Status")}
                        </span>
                        <span className="font-semibold text-[#12c76a]">
                          {t("1/2 left")}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#eef4f1] rounded-full">
                        <div className="bg-[#12c76a] h-full rounded-full w-1/2" />
                      </div>
                      <a className="mt-3 w-full bg-[#12c76a] hover:bg-[#0fbf63] text-white font-bold py-2 rounded-full text-xs text-center inline-flex items-center justify-center" href="/food-request">
                        {t("Request Food")}
                      </a>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl overflow-hidden border border-[#e6eee9] flex flex-col shadow-sm grayscale opacity-60 relative">
                    <div className="h-32 w-full bg-[#f3f6f4] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#7a9087] text-4xl">
                        photo_camera
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10">
                      <div className="bg-white/95 px-4 py-2 rounded-lg font-bold text-gray-800 shadow-sm border border-gray-200 text-[11px]">
                        {t("Fully Reserved")}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-gray-500">
                          {t("Vegetable Curry")}
                        </h3>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">
                            store
                          </span>
                          {t("Golden Spices")}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-2">
                        <span className="text-gray-400">
                          {t("Claim Status")}
                        </span>
                        <span className="font-semibold text-gray-400">
                          {t("0/2 left")}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full">
                        <div className="bg-gray-400 h-full rounded-full w-full" />
                      </div>
                      <button
                        className="mt-3 w-full bg-gray-300 text-gray-500 font-bold py-2 rounded-full text-xs cursor-not-allowed"
                        disabled
                      >
                        {t("Request Food")}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl overflow-hidden border border-[#e6eee9] flex flex-col shadow-sm">
                    <div className="relative h-32 w-full bg-[#f3f6f4] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#7a9087] text-4xl">
                        photo_camera
                      </span>
                      <div className="absolute top-2 left-2 bg-white/90 text-[#111814] text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-white/20">
                        <span className="material-symbols-outlined text-[12px]">
                          distance
                        </span>
                        {t("1.5 km away")}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-[#12c76a] text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">
                          check_circle
                        </span>
                        {t("Available")}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-[#111814]">
                          {t("Seasonal Fruit Salad")}
                        </h3>
                        <p className="text-[11px] text-[#7a9087] flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">
                            store
                          </span>
                          {t("Fresh Market")}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-2">
                        <span className="text-[#7a9087]">
                          {t("Claim Status")}
                        </span>
                        <span className="font-semibold text-[#12c76a]">
                          {t("5 portions left")}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#eef4f1] rounded-full">
                        <div className="bg-[#12c76a]/40 h-full rounded-full w-[40%]" />
                      </div>
                      <a className="mt-3 w-full bg-[#12c76a] hover:bg-[#0fbf63] text-white font-bold py-2 rounded-full text-xs text-center inline-flex items-center justify-center" href="/food-request">
                        {t("Request Food")}
                      </a>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl overflow-hidden border border-[#e6eee9] flex flex-col shadow-sm">
                    <div className="relative h-32 w-full bg-[#f3f6f4] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#7a9087] text-4xl">
                        photo_camera
                      </span>
                      <div className="absolute top-2 left-2 bg-white/90 text-[#111814] text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-white/20">
                        <span className="material-symbols-outlined text-[12px]">
                          distance
                        </span>
                        {t("0.5 km away")}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-[#12c76a] text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">
                          check_circle
                        </span>
                        {t("Available")}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-[#111814]">
                          {t("Mixed Sandwiches")}
                        </h3>
                        <p className="text-[11px] text-[#7a9087] flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">
                            store
                          </span>
                          {t("Plaza Deli")}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-2">
                        <span className="text-[#7a9087]">
                          {t("Claim Status")}
                        </span>
                        <span className="font-semibold text-[#12c76a]">
                          {t("3/4 servings left")}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#eef4f1] rounded-full">
                        <div className="bg-[#12c76a] h-full rounded-full w-[75%]" />
                      </div>
                      <a className="mt-3 w-full bg-[#12c76a] hover:bg-[#0fbf63] text-white font-bold py-2 rounded-full text-xs text-center inline-flex items-center justify-center" href="/food-request">
                        {t("Request Food")}
                      </a>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl overflow-hidden border border-[#e6eee9] flex flex-col shadow-sm">
                    <div className="relative h-32 w-full bg-[#f3f6f4] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#7a9087] text-4xl">
                        photo_camera
                      </span>
                      <div className="absolute top-2 left-2 bg-white/90 text-[#111814] text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-white/20">
                        <span className="material-symbols-outlined text-[12px]">
                          distance
                        </span>
                        {t("2.1 km away")}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-[#12c76a] text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">
                          check_circle
                        </span>
                        {t("Available")}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-[#111814]">
                          {t("Garden Salad")}
                        </h3>
                        <p className="text-[11px] text-[#7a9087] flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">
                            store
                          </span>
                          {t("Green Bowl")}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-2">
                        <span className="text-[#7a9087]">
                          {t("Claim Status")}
                        </span>
                        <span className="font-semibold text-[#12c76a]">
                          {t("2 portions left")}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#eef4f1] rounded-full">
                        <div className="bg-[#12c76a] h-full rounded-full w-full" />
                      </div>
                      <a className="mt-3 w-full bg-[#12c76a] hover:bg-[#0fbf63] text-white font-bold py-2 rounded-full text-xs text-center inline-flex items-center justify-center" href="/food-request">
                        {t("Request Food")}
                      </a>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl overflow-hidden border border-[#e6eee9] flex flex-col shadow-sm">
                    <div className="relative h-32 w-full bg-[#f3f6f4] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#7a9087] text-4xl">
                        photo_camera
                      </span>
                      <div className="absolute top-2 left-2 bg-white/90 text-[#111814] text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-white/20">
                        <span className="material-symbols-outlined text-[12px]">
                          distance
                        </span>
                        {t("3.2 km away")}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-[#12c76a] text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">
                          check_circle
                        </span>
                        {t("Available")}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-[#111814]">
                          {t("Pasta Primavera")}
                        </h3>
                        <p className="text-[11px] text-[#7a9087] flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">
                            store
                          </span>
                          {t("Italian Bistro")}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-2">
                        <span className="text-[#7a9087]">
                          {t("Claim Status")}
                        </span>
                        <span className="font-semibold text-[#12c76a]">
                          {t("1/2 left")}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#eef4f1] rounded-full">
                        <div className="bg-[#12c76a] h-full rounded-full w-1/2" />
                      </div>
                      <a className="mt-3 w-full bg-[#12c76a] hover:bg-[#0fbf63] text-white font-bold py-2 rounded-full text-xs text-center inline-flex items-center justify-center" href="/food-request">
                        {t("Request Food")}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white border border-[#dbe6e0] rounded-xl p-6 max-w-md text-center shadow-sm">
            <h2 className="text-lg font-bold">{t("Dashboard Unavailable")}</h2>
            <p className="text-sm text-[#618972] mt-2">
              {t("Dashboard Receiver Only")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;






