import { useState } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function Disclaimer() {
  const [agreed, setAgreed] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-transparent text-text-main">
      <div className="min-h-screen w-full">
        <header className="bg-surface border-b border-border px-4 sm:px-6 md:px-10 py-5">
          <div className="max-w-[1100px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-lg">
              <span className="material-symbols-outlined text-primary">
                volunteer_activism
              </span>
              {t("ShareBite")}
            </div>
            <div />
          </div>
        </header>

        <main className="flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
          <div className="w-full max-w-[520px]">
            <div className="bg-surface rounded-2xl shadow-lg border border-border p-6 sm:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <span className="material-symbols-outlined text-3xl">
                    gpp_maybe
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold">
                  {t("Disclaimer Agreement")}
                </h1>
                <div className="flex justify-center gap-2 mt-3 mb-5">
                  <span className="h-1 w-10 rounded-full bg-primary"></span>
                  <span className="h-1 w-10 rounded-full bg-primary/50"></span>
                </div>
              </div>

              <div className="bg-surface-alt border border-border rounded-xl p-4 text-sm text-text-muted">
                {t("Disclaimer Body")}{" "}
                <span className="font-semibold text-text-main">
                  {t("Disclaimer Emphasis")}
                </span>
              </div>

              <p className="text-xs text-text-muted mt-4">
                {t("Disclaimer Note")}
              </p>

              <label className="flex items-center gap-3 mt-5 text-sm text-text-main">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                {t("Disclaimer Checkbox")}
              </label>

              <Link to="/roles">
                <button
                  disabled={!agreed}
                  className={`mt-5 w-full rounded-full py-3 text-sm font-bold transition ${
                    agreed
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "bg-border text-text-muted cursor-not-allowed"
                  }`}
                >
                  {t("Agree and Continue")}
                </button>
              </Link>

              <div className="flex justify-center gap-4 text-[11px] text-text-muted mt-4">
                <span className="hover:text-primary cursor-pointer">
                  {t("Privacy Policy")}
                </span>
                <span>•</span>
                <span className="hover:text-primary cursor-pointer">
                  {t("Terms of Service")}
                </span>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] text-text-muted/80 tracking-widest uppercase">
              {t("Trusted By Safety Orgs")}
            </div>
            <div className="mt-4 flex justify-center gap-6 text-text-muted/80">
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



