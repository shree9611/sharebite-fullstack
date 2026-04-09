import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function Disclaimer() {
  const [agreed, setAgreed] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-[#111814]">
      <div className="min-h-screen w-full">
        <header className="bg-white border-b border-[#e6eee9] px-8 py-4">
          <div className="max-w-[1100px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-lg">
              <span className="material-symbols-outlined text-green-500">
                volunteer_activism
              </span>
              {t("ShareBite")}
            </div>
            <button className="flex items-center justify-center rounded-full h-9 w-9 bg-[#f3f6f4] text-[#7a9087]">
              <span className="material-symbols-outlined text-[18px]">
                notifications
              </span>
            </button>
          </div>
        </header>

        <main className="flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-[520px]">
            <div className="bg-white rounded-2xl shadow-lg border border-[#e6eee9] p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#e9f9f0] flex items-center justify-center text-[#12c76a] mb-3">
                  <span className="material-symbols-outlined text-3xl">
                    gpp_maybe
                  </span>
                </div>
                <h1 className="text-xl font-bold">
                  {t("Disclaimer Agreement")}
                </h1>
                <div className="flex justify-center gap-2 mt-3 mb-5">
                  <span className="h-1 w-10 rounded-full bg-orange-400"></span>
                  <span className="h-1 w-10 rounded-full bg-green-500"></span>
                </div>
              </div>

              <div className="bg-[#f6f8f7] border border-[#eef4f1] rounded-xl p-4 text-sm text-[#4b5f57]">
                {t("Disclaimer Body")}{" "}
                <span className="font-semibold text-[#111814]">
                  {t("Disclaimer Emphasis")}
                </span>
              </div>

              <p className="text-xs text-[#7a9087] mt-4">
                {t("Disclaimer Note")}
              </p>

              <label className="flex items-center gap-3 mt-5 text-sm text-[#111814]">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-4 w-4 accent-green-500"
                />
                {t("Disclaimer Checkbox")}
              </label>

              <Link to="/roles">
                <button
                  disabled={!agreed}
                  className={`mt-5 w-full rounded-full py-3 text-sm font-bold transition ${
                    agreed
                      ? "bg-[#12c76a] text-white hover:bg-[#0fbf63]"
                      : "bg-[#e6eee9] text-[#9aa9a2] cursor-not-allowed"
                  }`}
                >
                  {t("Agree and Continue")}
                </button>
              </Link>

              <div className="flex justify-center gap-4 text-[11px] text-[#7a9087] mt-4">
                <span className="hover:text-[#12c76a] cursor-pointer">
                  {t("Privacy Policy")}
                </span>
                <span>•</span>
                <span className="hover:text-[#12c76a] cursor-pointer">
                  {t("Terms of Service")}
                </span>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] text-[#9aa9a2] tracking-widest uppercase">
              {t("Trusted By Safety Orgs")}
            </div>
            <div className="mt-4 flex justify-center gap-6 text-[#9aa9a2]">
              <span className="material-symbols-outlined">health_and_safety</span>
              <span className="material-symbols-outlined">verified_user</span>
              <span className="material-symbols-outlined">eco</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
