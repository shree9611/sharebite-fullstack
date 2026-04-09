import React, { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const RequestApproval = () => {
  const { t } = useLanguage();
  const [showProfile, setShowProfile] = useState(false);
  return (
    <div className="bg-background-light min-h-screen">
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
                  {t("Donor Dashboard")}
                </p>
              </div>
            </div>
            <nav className="flex flex-col gap-2">
              <a
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#7a9087] hover:bg-[#f3f6f4] transition-all"
                href="/donor/donate"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_circle
                </span>
                <span className="text-xs font-semibold">{t("Donate Food")}</span>
              </a>
              <a
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#12c76a] text-white font-semibold shadow-sm"
                href="/donor/approvals"
              >
                <span className="material-symbols-outlined text-[18px]">
                  verified
                </span>
                <span className="text-xs">{t("Request Approval")}</span>
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
          <div className="max-w-5xl mx-auto py-10 px-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#111814] tracking-tight">
                  {t("Incoming Requests")}
                </h2>
                <p className="text-[#8aa19a] mt-1 text-sm">
                  {t("Incoming Requests Subtitle")}
                </p>
              </div>
              <div className="flex items-center gap-4 relative">
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
                <div className="bg-white border border-[#e6eee9] rounded-2xl p-4 flex items-center gap-4">
                  <div className="size-12 rounded-full border-4 border-[#eef4f1] border-t-[#12c76a] flex items-center justify-center">
                    <span className="text-xs font-bold text-[#12c76a]">50%</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[#8aa19a] uppercase tracking-wider">
                      {t("Donation Capacity")}
                    </p>
                    <p className="text-sm font-bold text-[#111814]">
                      {t("Capacity Filled")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-[#e6eee9] p-6 flex items-center justify-between transition-all">
                <div className="flex items-center gap-6">
                  <div className="size-14 bg-[#f3f6f4] rounded-xl flex items-center justify-center text-[#12c76a]">
                    <span className="material-symbols-outlined text-2xl">
                      corporate_fare
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-bold text-[#111814]">
                        {t("Global Relief Foundation")}
                      </h3>
                      <div className="flex items-center gap-1 bg-[#fff7ed] px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[12px] text-[#f59e0b] fill-1">
                          star
                        </span>
                        <span className="text-[11px] font-bold text-[#f59e0b]">
                          4.9
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-xs text-[#8aa19a]">
                        <span className="material-symbols-outlined text-[14px]">
                          restaurant
                        </span>
                        {t("45 Servings")}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[#8aa19a]">
                        <span className="material-symbols-outlined text-[14px]">
                          local_shipping
                        </span>
                        {t("Pickup requested")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-5 py-2 rounded-xl text-xs font-bold text-[#8aa19a] hover:bg-[#f3f6f4] transition-all">
                    {t("Decline")}
                  </button>
                  <button className="px-5 py-2 rounded-xl text-xs font-bold bg-[#12c76a] text-white shadow-sm hover:bg-[#0fbf63] transition-all flex items-center gap-2">
                    <span>{t("Approve")}</span>
                    <span className="material-symbols-outlined text-[14px]">
                      check_circle
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-[#e6eee9] p-6 flex items-center justify-between transition-all">
                <div className="flex items-center gap-6">
                  <div className="size-14 bg-[#f3f6f4] rounded-xl flex items-center justify-center text-[#12c76a]">
                    <span className="material-symbols-outlined text-2xl">
                      volunteer_activism
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-bold text-[#111814]">
                        {t("Urban Harvest NGO")}
                      </h3>
                      <div className="flex items-center gap-1 bg-[#fff7ed] px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[12px] text-[#f59e0b] fill-1">
                          star
                        </span>
                        <span className="text-[11px] font-bold text-[#f59e0b]">
                          4.7
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-xs text-[#8aa19a]">
                        <span className="material-symbols-outlined text-[14px]">
                          restaurant
                        </span>
                        {t("20 Servings")}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[#8aa19a]">
                        <span className="material-symbols-outlined text-[14px]">
                          delivery_dining
                        </span>
                        {t("Delivery needed")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-5 py-2 rounded-xl text-xs font-bold text-[#8aa19a] hover:bg-[#f3f6f4] transition-all">
                    {t("Decline")}
                  </button>
                  <button className="px-5 py-2 rounded-xl text-xs font-bold bg-[#12c76a] text-white shadow-sm hover:bg-[#0fbf63] transition-all flex items-center gap-2">
                    <span>{t("Approve")}</span>
                    <span className="material-symbols-outlined text-[14px]">
                      check_circle
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-[#e6eee9] p-6 flex items-center justify-between transition-all opacity-90">
                <div className="flex items-center gap-6">
                  <div className="size-14 bg-[#f3f6f4] rounded-xl flex items-center justify-center text-[#12c76a]">
                    <span className="material-symbols-outlined text-2xl">
                      home
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-bold text-[#111814]">
                        {t("City Care Center")}
                      </h3>
                      <div className="flex items-center gap-1 bg-[#fff7ed] px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[12px] text-[#f59e0b] fill-1">
                          star
                        </span>
                        <span className="text-[11px] font-bold text-[#f59e0b]">
                          4.5
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-xs text-[#8aa19a]">
                        <span className="material-symbols-outlined text-[14px]">
                          restaurant
                        </span>
                        {t("100 Servings")}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[#8aa19a]">
                        <span className="material-symbols-outlined text-[14px]">
                          local_shipping
                        </span>
                        {t("Pickup requested")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-5 py-2 rounded-xl text-xs font-bold text-[#8aa19a] hover:bg-[#f3f6f4] transition-all">
                    {t("Decline")}
                  </button>
                  <button className="px-5 py-2 rounded-xl text-xs font-bold bg-[#12c76a] text-white shadow-sm hover:bg-[#0fbf63] transition-all flex items-center gap-2">
                    <span>{t("Approve")}</span>
                    <span className="material-symbols-outlined text-[14px]">
                      check_circle
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center text-[#8aa19a] text-xs mt-10 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[14px]">
                info
              </span>
              {t("Approval Notice")}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RequestApproval;
