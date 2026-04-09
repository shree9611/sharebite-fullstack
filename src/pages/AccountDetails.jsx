import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";


const AccountDetails = () => {
    const location = useLocation();
    const role = location.state?.role;
    const { t } = useLanguage();

  return (
    <div className="bg-background-light min-h-screen text-[#111815] transition-colors duration-300">

    {/* Header */}
<header className="flex items-center justify-between border-b border-[#e0e5e3] px-4 md:px-10 py-3 bg-white">
  
  {/* Logo + Brand */}
  <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-green-500 text-3xl">
      volunteer_activism
    </span>
    <h2 className="text-2xl font-extrabold text-[#111815]">
      {t("ShareBite")}
    </h2>
  </div>
</header>


      {/* Main */}
      <main className="flex justify-center items-center px-4 py-10">
  <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-xl p-8 md:p-10">


          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold mb-2">
              {t("Account Details")}
            </h1>
            <p className="text-[#618979]">
              {t("Account Details Subtitle")}
            </p>
          </div>

          {role && (
            <p className="text-center text-sm font-semibold text-primary mb-6">
              {t("Selected Role")}: {t(`Role ${role}`)}
            </p>
          )}

          {/* Form */}
          <form className="flex flex-col gap-5">

            {/* Full Name */}
            <div>
              <label className="text-sm font-semibold px-1">
                {t("Full Name")}
              </label>
              <div className="relative mt-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#618979]">
                  person
                </span>
                <input
                  type="text"
                  placeholder={t("Full Name Placeholder")}
                  className="w-full h-14 pl-12 pr-4 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold px-1">
                {t("Email Address")}
              </label>
              <div className="relative mt-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#618979]">
                  mail
                </span>
                <input
                  type="email"
                  placeholder={t("Email Placeholder")}
                  className="w-full h-14 pl-12 pr-4 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-semibold px-1">
                {t("Phone Number")}
              </label>
              <div className="relative mt-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#618979]">
                  call
                </span>
                <input
                  type="tel"
                  placeholder={t("Phone Placeholder")}
                  className="w-full h-14 pl-12 pr-4 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold px-1">
                {t("Password")}
              </label>
              <div className="relative mt-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#618979]">
                  lock
                </span>
                <input
                  type="password"
                  placeholder={t("Password Strong Placeholder")}
                  className="w-full h-14 pl-12 pr-4 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
{/* Confirm Password */}
<div>
  <label className="text-sm font-semibold px-1">
    {t("Confirm Password")}
  </label>
  <div className="relative mt-1">
    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#618979]">
      lock
    </span>
    <input
      type="password"
      placeholder={t("Confirm Password Placeholder")}
      className="w-full h-14 pl-12 pr-4 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
    />
  </div>
</div>

<p className="text-xs text-center text-[#618979] mt-2">
  {t("By Continuing Agree")}{" "}
  <span className="text-primary font-semibold cursor-pointer">
    {t("Terms of Service")}
  </span>{" "}
  {t("And")}{" "}
  <span className="text-primary font-semibold cursor-pointer">
    {t("Privacy Policy")}
  </span>.
</p>


            {/* Continue */}
            <Link
              to="/registration-step-2"
              state={{ role }}
              className="bg-[#12c76a] hover:bg-[#0fbf63] text-white px-8 py-3 rounded-xl font-bold text-center transition-colors"
            >
              {t("Continue")}
            </Link>


            {/* Back */}
            <Link
  to="/roles"
  className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#618979] hover:text-primary transition"
>
  <span className="material-symbols-outlined text-base">
    arrow_back
  </span>
  {t("Back to Role Selection")}
</Link>

          </form>

          {/* Footer */}
          <div className="mt-12 border-t pt-8 flex justify-center gap-8 text-xs text-[#4b6d5e]">
            <div className="flex items-center gap-2 opacity-70">
              <span className="material-symbols-outlined text-primary">
                verified_user
              </span>
              {t("Data Secure")}
            </div>
            <div className="flex items-center gap-2 opacity-70">
              <span className="material-symbols-outlined text-accent-orange">
                encrypted
              </span>
              {t("SSL Encrypted")}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AccountDetails;
