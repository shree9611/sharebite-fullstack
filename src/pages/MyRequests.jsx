import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const MyRequests = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [showProfile, setShowProfile] = useState(false);
  const isAvailable = location.pathname === "/dashboard";
  const isMyRequests = location.pathname === "/my-requests";
  const isFeedback = location.pathname === "/receiver/feedback";
  return (
    <div className="bg-background-light text-[#111814] min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#e5e9e7] bg-white px-6 py-3 lg:px-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="text-primary flex items-center">
                <span className="material-symbols-outlined text-2xl font-semibold">
                  volunteer_activism
                </span>
              </div>
              <h2 className="text-lg font-bold leading-tight tracking-tight">
                {t("ShareBite")}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4 relative">
            <button
              className="flex items-center justify-center rounded-full h-10 w-10 bg-[#f0f4f2] text-[#111814]"
              onClick={() => setShowProfile((prev) => !prev)}
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">
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
        </header>
        <div className="flex flex-1">
          <aside className="w-64 border-r border-[#e5e9e7] bg-white p-4 flex flex-col gap-6 sticky top-[65px] h-[calc(100vh-65px)]">
            <nav className="flex flex-col gap-1">
              <a
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isAvailable
                    ? "text-[#12c76a] bg-[#e9f9f0]"
                    : "text-[#618972] hover:bg-[#f0f4f2]"
                }`}
                href="/dashboard"
              >
                <span className="material-symbols-outlined text-[20px]">
                  restaurant
                </span>
                <p className="text-sm font-semibold">{t("Available Now")}</p>
              </a>
              <a
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isMyRequests
                    ? "text-[#12c76a] bg-[#e9f9f0]"
                    : "text-[#618972] hover:bg-[#f0f4f2]"
                }`}
                href="/my-requests"
              >
                <span className="material-symbols-outlined text-[20px]">
                  shopping_cart
                </span>
                <p className="text-sm font-bold">{t("My Requests")}</p>
              </a>
              <a
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isFeedback
                    ? "text-[#12c76a] bg-[#e9f9f0]"
                    : "text-[#618972] hover:bg-[#f0f4f2]"
                }`}
                href="/receiver/feedback"
              >
                <span className="material-symbols-outlined text-[20px]">
                  reviews
                </span>
                <p className="text-sm font-semibold">{t("Feedback")}</p>
              </a>
            </nav>
          </aside>
          <main className="flex-1 bg-white">
            <div className="p-8 lg:p-12 max-w-6xl mx-auto">
              <div className="flex flex-col mb-10 gap-2">
                <h1 className="text-[#111814] text-3xl font-bold tracking-tight">
                  {t("My Requests Title")}
                </h1>
                <p className="text-[#618972]">
                  {t("My Requests Subtitle")}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="group flex items-center justify-between p-4 bg-white border border-[#e5e9e7] rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="size-12 rounded-xl bg-[#f0f4f2] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-2xl">
                        bakery_dining
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#111814]">
                        {t("Artisan Bagels")}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 mt-1 rounded-full w-fit bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <div className="flex gap-0.5 mr-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                        </div>
                        {t("In Transit")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-12 w-1/3">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-[#9fb8a9] font-bold">
                        {t("Donor")}
                      </span>
                      <span className="text-sm font-semibold text-[#4a6b57]">
                        {t("Downtown Bakery")}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-[#9fb8a9] font-bold">
                        {t("Arrival")}
                      </span>
                      <span className="text-sm font-semibold text-[#111814]">
                        12:45 PM
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-end w-1/3">
                    <button className="px-4 py-2 text-primary hover:bg-primary/5 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">
                        chat_bubble
                      </span>
                        {t("Contact")}
                    </button>
                    <button className="px-4 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 text-sm font-bold rounded-lg transition-colors">
                      {t("Cancel")}
                    </button>
                  </div>
                </div>

                <div className="group flex items-center justify-between p-4 bg-white border border-[#e5e9e7] rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="size-12 rounded-xl bg-[#f0f4f2] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-2xl">
                        lunch_dining
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#111814]">
                        {t("Mixed Sandwiches")}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 mt-1 rounded-full w-fit bg-orange-50 text-orange-600 border border-orange-100">
                        <div className="flex gap-0.5 mr-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                        </div>
                        {t("Pending")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-12 w-1/3">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-[#9fb8a9] font-bold">
                        {t("Donor")}
                      </span>
                      <span className="text-sm font-semibold text-[#4a6b57]">
                        {t("Plaza Deli")}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-[#9fb8a9] font-bold">
                        {t("Status")}
                      </span>
                      <span className="text-sm font-semibold text-[#618972]">
                        {t("Awaiting Shop")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-end w-1/3">
                    <button className="px-4 py-2 text-gray-400 cursor-not-allowed opacity-50 text-sm font-bold rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">
                        chat_bubble
                      </span>
                      {t("Contact")}
                    </button>
                    <button className="px-4 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 text-sm font-bold rounded-lg transition-colors">
                      {t("Cancel")}
                    </button>
                  </div>
                </div>

                <div className="group flex items-center justify-between p-4 bg-white border border-[#e5e9e7] rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="size-12 rounded-xl bg-[#f0f4f2] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-2xl">
                        skillet
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#111814]">
                        {t("Pasta Primavera")}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 mt-1 rounded-full w-fit bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <div className="flex gap-0.5 mr-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                        </div>
                        {t("In Transit")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-12 w-1/3">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-[#9fb8a9] font-bold">
                        {t("Donor")}
                      </span>
                      <span className="text-sm font-semibold text-[#4a6b57]">
                        {t("Italian Bistro")}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-[#9fb8a9] font-bold">
                        {t("Courier")}
                      </span>
                      <span className="text-sm font-semibold text-[#618972]">
                        {t("Finding")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-end w-1/3">
                    <button className="px-4 py-2 text-gray-400 cursor-not-allowed opacity-50 text-sm font-bold rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">
                        chat_bubble
                      </span>
                      {t("Contact")}
                    </button>
                    <button className="px-4 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 text-sm font-bold rounded-lg transition-colors">
                      {t("Cancel")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyRequests;
