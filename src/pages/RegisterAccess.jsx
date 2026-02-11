import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function RegisterAccess() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background-light font-display">

      {/* NAVBAR */}
      <header className="w-full bg-white border-b px-4 sm:px-6 md:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <span
              className="material-symbols-outlined text-primary text-2xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}
            >
              volunteer_activism
            </span>
          </div>
          <h1 className="text-xl font-bold">{t("ShareBite")}</h1>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-grow flex flex-col lg:flex-row">

        {/* LEFT IMAGE */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcumWwrU8qO_vjcka7DtPYvAvw5vwXynBG1yCJmEnRINBLPib9vJ3MYmxvjoCSZ4bcBQIqDxJz6SipN3AuH1WdqHgWQhsj3m92wHnhgvOYR_1rF-1uHZvK3V1WTP1hTUXh-q8PAmPq9QJhpJH5N6oZm5Gu5I6KuJ-k13u_mHXxDEw0a0FZqeVgqUELg0nT7rv_xnbWpNMC37g73Jqb5n0_YybsJMlqRh8D4A037QQvhpFqe6vdHqt5MgM2x2mJCYTRg4JhDnzZ1xvA"
            className="absolute inset-0 w-full h-full object-cover"
            alt="Community"
          />
          <div className="absolute bottom-12 left-12 right-12 z-20 text-white">
            <h2 className="text-4xl font-bold mb-4">
              {t("Small Acts Title")}
            </h2>
            <p className="text-lg opacity-90 max-w-md">
              {t("Small Acts Subtitle")}
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-white">
          <div className="w-full max-w-[440px]">

            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {t("Create Your Account")}
            </h2>
            <p className="text-gray-600 mb-8">
              {t("Secure Access")}
            </p>

            <form className="space-y-5">

              <div>
                <label className="text-sm font-semibold">
                  {t("Email Address")}
                </label>
                <input
                  type="email"
                  placeholder={t("Email Placeholder")}
                  className="w-full h-12 sm:h-14 px-4 rounded-xl border focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">{t("Password")}</label>
                <input
                  type="password"
                  placeholder={t("Password Placeholder")}
                  className="w-full h-12 sm:h-14 px-4 rounded-xl border focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full h-12 sm:h-14 bg-primary font-bold rounded-xl"
              >
                {t("Continue")}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-500">
                    {t("Or Continue With")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="h-12 rounded-xl border flex items-center justify-center gap-2">
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    className="w-5"
                    alt="Google"
                  />
                  {t("Google")}
                </button>
                <button className="h-12 rounded-xl border flex items-center justify-center gap-2">
                  <img
                    src="https://www.svgrepo.com/show/511330/apple-173.svg"
                    className="w-5"
                    alt="Apple"
                  />
                  {t("Apple")}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}



