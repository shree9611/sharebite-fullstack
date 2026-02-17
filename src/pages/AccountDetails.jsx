import React, { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { buildApiUrl } from "../lib/api.js";
import { setCurrentProfile, upsertProfile } from "../lib/profile.js";


const AccountDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const role = location.state?.role;
    const { t } = useLanguage();
    const inputRefs = useRef([]);
    const [fullName, setFullName] = useState("");
    const [emailValue, setEmailValue] = useState("");
    const [phoneValue, setPhoneValue] = useState("");
    const [passwordValue, setPasswordValue] = useState("");
    const [confirmValue, setConfirmValue] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touched, setTouched] = useState({
      fullName: false,
      email: false,
      phone: false,
      password: false,
      confirm: false,
    });

    const validate = {
      fullName: fullName.trim().length >= 3,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue),
      phone: /^[0-9]{10}$/.test(phoneValue),
      password: /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{6,}$/.test(passwordValue),
      confirm: confirmValue.length > 0 && confirmValue === passwordValue,
    };

    const showError = {
      fullName: touched.fullName && !validate.fullName,
      email: touched.email && !validate.email,
      phone: touched.phone && !validate.phone,
      password: touched.password && !validate.password,
      confirm: touched.confirm && !validate.confirm,
    };

    const handleEnterNext = (event, index) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const next = inputRefs.current[index + 1];
        if (next) {
          next.focus();
        }
      }
    };

    const roleMap = {
      Donor: "donor",
      Receiver: "receiver",
      Volunteer: "admin",
    };

    const handleContinue = async (event) => {
      event.preventDefault();
      setSubmitError("");
      setTouched({
        fullName: true,
        email: true,
        phone: true,
        password: true,
        confirm: true,
      });

      const isValid =
        validate.fullName &&
        validate.email &&
        validate.phone &&
        validate.password &&
        validate.confirm;
      if (!isValid) {
        setSubmitError("Please fix the form errors.");
        return;
      }

      const userRole = roleMap[role] || "receiver";
      const profile = upsertProfile({
        name: fullName.trim(),
        email: emailValue.trim(),
        phone: phoneValue.trim(),
        role,
      });
      if (profile) {
        setCurrentProfile(profile);
      }
      const accountData = {
        name: fullName.trim(),
        email: emailValue.trim(),
        password: passwordValue,
        role: userRole,
      };
      sessionStorage.setItem("sharebite.accountData", JSON.stringify(accountData));
      sessionStorage.setItem("sharebite.roleLabel", role || "Receiver");

      if (role === "Volunteer") {
        setIsSubmitting(true);
        try {
          const response = await fetch(buildApiUrl("/api/auth/register"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(accountData),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || "Registration failed");
          }
          navigate("/login", { state: { role } });
        } catch (error) {
          setSubmitError(error.message || "Unable to register.");
        } finally {
          setIsSubmitting(false);
        }
        return;
      }

      navigate("/registration-step-2", { state: { role, accountData } });
    };

  return (
    <div className="bg-transparent min-h-screen text-[#111815] transition-colors duration-300">

    {/* Header */}
<header className="flex items-center justify-between border-b border-[#e0e5e3] px-4 sm:px-6 md:px-10 py-5 bg-white">
  
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
      <main className="flex justify-center items-center px-4 sm:px-6 py-8 sm:py-10">
  <div className="w-full max-w-[520px] bg-white rounded-2xl border border-teal-100 shadow-[0_20px_50px_-20px_rgba(13,148,136,0.45)] p-6 sm:p-8 md:p-10">


          {/* Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
              {t("Account Details")}
            </h1>
            <p className="text-sm sm:text-base text-[#618979]">
              {t("Account Details Subtitle")}
            </p>
          </div>

          {role && (
            <p className="text-center text-sm font-semibold text-primary mb-6">
              {t("Selected Role")}: {t(`Role ${role}`)}
            </p>
          )}

          {/* Form */}
          <form className="flex flex-col gap-4 sm:gap-5" onSubmit={handleContinue}>

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
                  className={`w-full h-12 sm:h-14 pl-12 pr-4 border rounded-xl text-sm focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300 ${
                    showError.fullName ? "border-red-400" : ""
                  }`}
                  minLength={3}
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                  ref={(el) => (inputRefs.current[0] = el)}
                  onKeyDown={(event) => handleEnterNext(event, 0)}
                />
                {showError.fullName ? (
                  <p className="mt-1 text-[11px] text-red-500">
                    {t("At least 3 characters")}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-[#8aa19a]">
                    {t("At least 3 characters")}
                  </p>
                )}
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
                  className={`w-full h-12 sm:h-14 pl-12 pr-4 border rounded-xl text-sm focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300 ${
                    showError.email ? "border-red-400" : ""
                  }`}
                  required
                  autoComplete="email"
                  value={emailValue}
                  onChange={(event) => setEmailValue(event.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  ref={(el) => (inputRefs.current[1] = el)}
                  onKeyDown={(event) => handleEnterNext(event, 1)}
                />
                {showError.email ? (
                  <p className="mt-1 text-[11px] text-red-500">
                    {t("Enter a valid email address")}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-[#8aa19a]">
                    {t("Enter a valid email address")}
                  </p>
                )}
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
                  className={`w-full h-12 sm:h-14 pl-12 pr-4 border rounded-xl text-sm focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300 ${
                    showError.phone ? "border-red-400" : ""
                  }`}
                  required
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  minLength={10}
                  title="Enter a 10 digit phone number"
                  autoComplete="tel"
                  value={phoneValue}
                  onChange={(event) => setPhoneValue(event.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                  ref={(el) => (inputRefs.current[2] = el)}
                  onKeyDown={(event) => handleEnterNext(event, 2)}
                />
                {showError.phone ? (
                  <p className="mt-1 text-[11px] text-red-500">
                    {t("Exactly 10 digits")}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-[#8aa19a]">
                    {t("Exactly 10 digits")}
                  </p>
                )}
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
                  type={showPassword ? "text" : "password"}
                  placeholder={t("Password Strong Placeholder")}
                  className={`w-full h-12 sm:h-14 pl-12 pr-12 border rounded-xl text-sm focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300 ${
                    showError.password ? "border-red-400" : ""
                  }`}
                  minLength={6}
                  pattern="^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{6,}$"
                  title="Minimum 6 characters, one number & special character"
                  required
                  value={passwordValue}
                  onChange={(event) => setPasswordValue(event.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  ref={(el) => (inputRefs.current[3] = el)}
                  onKeyDown={(event) => handleEnterNext(event, 3)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#618979] hover:text-[#111815]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
                {showError.password ? (
                  <p className="mt-1 text-[11px] text-red-500">
                    {t("Minimum 6 characters, one number & special character")}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-[#8aa19a]">
                    {t("Minimum 6 characters, one number & special character")}
                  </p>
                )}
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
      type={showConfirmPassword ? "text" : "password"}
      placeholder={t("Confirm Password Placeholder")}
      className={`w-full h-12 sm:h-14 pl-12 pr-12 border rounded-xl text-sm focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300 ${
        showError.confirm ? "border-red-400" : ""
      }`}
      required
      value={confirmValue}
      onChange={(event) => setConfirmValue(event.target.value)}
      pattern={passwordValue ? passwordValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : undefined}
      title="Must match password"
      onBlur={() => setTouched((prev) => ({ ...prev, confirm: true }))}
      ref={(el) => (inputRefs.current[4] = el)}
      onKeyDown={(event) => handleEnterNext(event, 4)}
    />
    <button
      type="button"
      onClick={() => setShowConfirmPassword((prev) => !prev)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#618979] hover:text-[#111815]"
      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
    >
      <span className="material-symbols-outlined text-[20px]">
        {showConfirmPassword ? "visibility_off" : "visibility"}
      </span>
    </button>
    {showError.confirm ? (
      <p className="mt-1 text-[11px] text-red-500">
        {t("Must match password")}
      </p>
    ) : (
      <p className="mt-1 text-[11px] text-[#8aa19a]">
        {t("Must match password")}
      </p>
    )}
  </div>
</div>

<p className="text-xs text-center text-[#618979] mt-2 px-2 sm:px-4">
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
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#12c76a] hover:bg-[#0fbf63] disabled:opacity-60 text-white px-6 sm:px-8 py-3 rounded-xl font-bold text-center transition-colors"
            >
              {isSubmitting ? "Please wait..." : t("Continue")}
            </button>
            {submitError ? (
              <p className="text-xs text-red-600 text-center">{submitError}</p>
            ) : null}


            {/* Back */}
            <Link
  to="/roles"
  className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-[#618979] hover:text-primary transition"
>
  <span className="material-symbols-outlined text-base">
    arrow_back
  </span>
  {t("Back to Role Selection")}
</Link>

          </form>

          {/* Footer */}
          <div className="mt-10 sm:mt-12 border-t pt-6 sm:pt-8 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-xs text-[#4b6d5e]">
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



