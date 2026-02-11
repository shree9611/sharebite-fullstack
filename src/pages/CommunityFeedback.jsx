import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const CommunityFeedback = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const isActive = (path) => location.pathname === path;
  const feedback = location.state?.feedback;
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
              <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-500 text-3xl">
                    volunteer_activism
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight font-display">
                    {t("Community Feedback")}
                  </h2>
                </div>
                <p className="text-zinc-500 text-base sm:text-lg">
                  {t("Community Feedback Subtitle")}
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
            {feedback && (
              <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">
                  {t("Latest Receiver Feedback")}
                </h3>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 space-y-2 text-sm text-zinc-700">
                    <div>
                      <span className="font-semibold">{t("Food Quality")}: </span>
                      {feedback.foodRating}/5
                    </div>
                    <div>
                      <span className="font-semibold">{t("Delivery Service")}: </span>
                      {feedback.deliveryRating}/5
                    </div>
                    {feedback.comments && (
                      <div>
                        <span className="font-semibold">{t("Comments")}: </span>
                        {feedback.comments}
                      </div>
                    )}
                  </div>
                  {feedback.photoPreview && (
                    <img
                      src={feedback.photoPreview}
                      alt="Feedback"
                      className="h-24 w-24 rounded-xl object-cover"
                    />
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-zinc-500 text-sm font-medium mb-1">
                    {t("Food Quality")}
                  </p>
                  <h3 className="text-4xl font-black text-zinc-900 font-display">
                    4.9<span className="text-xl text-zinc-400 font-normal">/5.0</span>
                  </h3>
                </div>
                <div className="flex gap-1">
                  <span className="material-symbols-outlined text-3xl text-[#11d483] fill-1">
                    star
                  </span>
                  <span className="material-symbols-outlined text-3xl text-[#11d483] fill-1">
                    star
                  </span>
                  <span className="material-symbols-outlined text-3xl text-[#11d483] fill-1">
                    star
                  </span>
                  <span className="material-symbols-outlined text-3xl text-[#11d483] fill-1">
                    star
                  </span>
                  <span className="material-symbols-outlined text-3xl text-[#11d483] fill-1">
                    star
                  </span>
                </div>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-zinc-500 text-sm font-medium mb-1">
                    {t("Service & Timing")}
                  </p>
                  <h3 className="text-4xl font-black text-zinc-900 font-display">
                    4.7<span className="text-xl text-zinc-400 font-normal">/5.0</span>
                  </h3>
                </div>
                <div className="flex gap-1">
                  <span className="material-symbols-outlined text-3xl text-[#11d483] fill-1">
                    star
                  </span>
                  <span className="material-symbols-outlined text-3xl text-[#11d483] fill-1">
                    star
                  </span>
                  <span className="material-symbols-outlined text-3xl text-[#11d483] fill-1">
                    star
                  </span>
                  <span className="material-symbols-outlined text-3xl text-[#11d483] fill-1">
                    star
                  </span>
                  <span className="material-symbols-outlined text-3xl text-zinc-200">
                    star
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-zinc-900 font-display mb-4">
                {t("Recent Reviews")}
              </h4>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-emerald-50 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">
                        corporate_fare
                      </span>
                    </div>
                    <div>
                      <h5 className="font-bold text-zinc-900">
                        {t("Sunshine Care Home")}
                      </h5>
                      <p className="text-xs text-zinc-400">
                        {t("Received 2 hours ago")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <span className="material-symbols-outlined text-xl text-[#11d483] fill-1">
                      star
                    </span>
                    <span className="material-symbols-outlined text-xl text-[#11d483] fill-1">
                      star
                    </span>
                    <span className="material-symbols-outlined text-xl text-[#11d483] fill-1">
                      star
                    </span>
                    <span className="material-symbols-outlined text-xl text-[#11d483] fill-1">
                      star
                    </span>
                    <span className="material-symbols-outlined text-xl text-[#11d483] fill-1">
                      star
                    </span>
                  </div>
                </div>
                <p className="text-zinc-600 leading-relaxed italic">
                  {t("Review 1")}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-emerald-50 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">school</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-zinc-900">
                        {t("Central Youth Center")}
                      </h5>
                      <p className="text-xs text-zinc-400">
                        {t("Received 1 day ago")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <span className="material-symbols-outlined text-xl text-[#11d483] fill-1">
                      star
                    </span>
                    <span className="material-symbols-outlined text-xl text-[#11d483] fill-1">
                      star
                    </span>
                    <span className="material-symbols-outlined text-xl text-[#11d483] fill-1">
                      star
                    </span>
                    <span className="material-symbols-outlined text-xl text-[#11d483] fill-1">
                      star
                    </span>
                    <span className="material-symbols-outlined text-xl text-zinc-200">
                      star
                    </span>
                  </div>
                </div>
                <p className="text-zinc-600 leading-relaxed italic">
                  {t("Review 2")}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-emerald-50 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">
                        home_health
                      </span>
                    </div>
                    <div>
                      <h5 className="font-bold text-zinc-900">
                        {t("Grace Shelter Foundation")}
                      </h5>
                      <p className="text-xs text-zinc-400">
                        {t("Received 3 days ago")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <span className="material-symbols-outlined text-xl text-[#11d483] fill-1">
                      star
                    </span>
                    <span className="material-symbols-outlined text-xl text-[#11d483] fill-1">
                      star
                    </span>
                    <span className="material-symbols-outlined text-xl text-[#11d483] fill-1">
                      star
                    </span>
                    <span className="material-symbols-outlined text-xl text-[#11d483] fill-1">
                      star
                    </span>
                    <span className="material-symbols-outlined text-xl text-[#11d483] fill-1">
                      star
                    </span>
                  </div>
                </div>
                <p className="text-zinc-600 leading-relaxed italic">
                  {t("Review 3")}
                </p>
              </div>
            </div>
            <p className="text-center text-zinc-400 text-sm mt-12 pb-12">
              {t("Feedback Footnote")}
            </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommunityFeedback;



