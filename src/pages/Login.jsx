import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { buildApiUrl } from "../lib/api.js";
import { decodeJwtPayload, getRoleHomePath, normalizeRole } from "../lib/auth.js";
import { getProfileByEmail, setCurrentProfile, upsertProfile } from "../lib/profile.js";

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem("sharebite.remember") === "true";
    if (remembered) {
      const storedEmail = localStorage.getItem("sharebite.email") || "";
      const storedPassword = localStorage.getItem("sharebite.password") || "";
      setEmail(storedEmail);
      setPassword(storedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError("");
    const isPasswordValid = password.trim().length >= 6;
    setShowPasswordError(!isPasswordValid);
    if (isPasswordValid) {
      setIsSubmitting(true);
      try {
        const response = await fetch(buildApiUrl("/api/auth/login"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.token) {
          throw new Error(data?.message || "Login failed");
        }

        localStorage.setItem("sharebite.token", data.token);
        const payload = decodeJwtPayload(data.token);
        const resolvedRole =
          normalizeRole(payload?.role) || normalizeRole(role) || "Receiver";
        localStorage.setItem("sharebite.role", resolvedRole);
        const savedProfile = getProfileByEmail(email.trim());
        const currentProfile = upsertProfile({
          name: savedProfile?.name || "User",
          email: email.trim(),
          phone: savedProfile?.phone || "",
          role: resolvedRole,
        });
        if (currentProfile) {
          setCurrentProfile(currentProfile);
        }

        if (rememberMe) {
          localStorage.setItem("sharebite.remember", "true");
          localStorage.setItem("sharebite.email", email);
          localStorage.setItem("sharebite.password", password);
        } else {
          localStorage.removeItem("sharebite.remember");
          localStorage.removeItem("sharebite.email");
          localStorage.removeItem("sharebite.password");
        }

        navigate(getRoleHomePath(resolvedRole), { state: { role: resolvedRole } });
      } catch (error) {
        setLoginError(error.message || "Unable to login.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleResetSubmit = (event) => {
    event.preventDefault();
    const isValid = resetPassword.trim().length >= 6;
    const isMatch = resetPassword === resetConfirm;
    if (!isValid) {
      setResetError(t("Password Error"));
      setResetSuccess(false);
      return;
    }
    if (!isMatch) {
      setResetError(t("Passwords Do Not Match"));
      setResetSuccess(false);
      return;
    }
    setPassword(resetPassword);
    setResetError("");
    setResetSuccess(true);
  };
  return (
    <div className="min-h-screen bg-transparent flex flex-col">

      {/* NAVBAR */}
      <header className="bg-white border-b px-4 sm:px-6 md:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          <span className="material-symbols-outlined text-green-500">
            volunteer_activism
          </span>
          {t("ShareBite")}
        </div>

        <Link to="/account-details">
          <button className="px-6 h-10 rounded-full bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition">
            {t("Sign Up")}
          </button>
        </Link>
      </header>

      {/* MAIN */}
      <main className="flex flex-1 flex-col lg:flex-row">

        {/* LEFT IMAGE */}
        <div className="hidden lg:flex w-1/2 relative overflow-hidden">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcumWwrU8qO_vjcka7DtPYvAvw5vwXynBG1yCJmEnRINBLPib9vJ3MYmxvjoCSZ4bcBQIqDxJz6SipN3AuH1WdqHgWQhsj3m92wHnhgvOYR_1rF-1uHZvK3V1WTP1hTUXh-q8PAmPq9QJhpJH5N6oZm5Gu5I6KuJ-k13u_mHXxDEw0a0FZqeVgqUELg0nT7rv_xnbWpNMC37g73Jqb5n0_YybsJMlqRh8D4A037QQvhpFqe6vdHqt5MgM2x2mJCYTRg4JhDnzZ1xvA"
            alt="Food community"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-12 left-12 text-white max-w-md">
            <h2 className="text-4xl font-bold mb-3">
              {t("Small Acts Title")}
            </h2>
            <p className="text-lg opacity-90">
              {t("Small Acts Subtitle")}
            </p>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 lg:py-0">
          <div className="w-full max-w-md bg-white border border-teal-200 shadow-lg shadow-teal-100/50 rounded-2xl p-6 sm:p-8">

            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{t("Welcome Back")}</h2>
            <p className="text-gray-600 mb-8">
              {t("Login Subtitle")}
            </p>

            {!showReset ? (
              <form className="space-y-5" onSubmit={handleSubmit}>

              {/* Email */}
              <div>
                <label className="text-sm font-semibold">
                  {t("Email Address")}
                </label>
                <input
                  type="email"
                  placeholder={t("Email Placeholder")}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full h-12 sm:h-14 mt-1 px-4 rounded-xl border focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-semibold">{t("Password")}</label>
                <input
                  type="password"
                  placeholder={t("Password Login Placeholder")}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`w-full h-12 sm:h-14 mt-1 px-4 rounded-xl border focus:ring-2 focus:ring-primary/40 ${
                    showPasswordError
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200"
                  }`}
                />
                {showPasswordError && (
                  <p className="mt-2 text-xs text-red-600">
                    {t("Password Error")}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  {t("Remember Me")}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowReset(true);
                    setResetSuccess(false);
                    setResetError("");
                  }}
                  className="text-primary cursor-pointer"
                >
                  {t("Forgot Password")}
                </button>
              </div>
<button
  type="submit"
  disabled={isSubmitting}
  className="w-full sm:w-auto sm:px-20 py-3 rounded-full bg-green-600 text-white font-semibold shadow hover:brightness-110 transition"
>
  {isSubmitting ? "Logging in..." : t("Login")}
</button>
{loginError && <p className="text-xs text-red-600 mt-2">{loginError}</p>}

{/* Divider */}
<div className="flex items-center gap-4 my-6">
  <div className="flex-1 h-px bg-gray-300"></div>
  <span className="text-sm text-gray-500">{t("Or Continue With")}</span>
  <div className="flex-1 h-px bg-gray-300"></div>
</div>

{/* Social Login */}
<div className="flex flex-col sm:flex-row gap-4">
  {/* Apple */}
  <button className="flex-1 h-12 sm:h-14 border rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
      alt="Apple"
      className="w-5 h-5"
    />
    <span className="font-semibold">{t("Apple")}</span>
  </button>

  {/* Google */}
  <button className="flex-1 h-12 sm:h-14 border rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
      alt="Google"
      className="w-5 h-5"
    />
    <span className="font-semibold">{t("Google")}</span>
  </button>
</div>

              <div className="text-center text-sm text-gray-600 mt-6">
                {t("No Account")}{" "}
                <Link to="/account-details" className="text-primary font-bold">
                  {t("Create Account Link")}
                </Link>
              </div>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleResetSubmit}>
                <div>
                  <label className="text-sm font-semibold">
                    {t("Email Address")}
                  </label>
                  <input
                    type="email"
                    placeholder={t("Email Placeholder")}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full h-12 sm:h-14 mt-1 px-4 rounded-xl border focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    {t("Create New Password")}
                  </label>
                  <input
                    type="password"
                    placeholder={t("Password Strong Placeholder")}
                    value={resetPassword}
                    onChange={(event) => setResetPassword(event.target.value)}
                    className="w-full h-12 sm:h-14 mt-1 px-4 rounded-xl border focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    {t("Confirm Password")}
                  </label>
                  <input
                    type="password"
                    placeholder={t("Confirm Password Placeholder")}
                    value={resetConfirm}
                    onChange={(event) => setResetConfirm(event.target.value)}
                    className="w-full h-12 sm:h-14 mt-1 px-4 rounded-xl border focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {resetError && (
                  <p className="text-xs text-red-600">{resetError}</p>
                )}
                {resetSuccess && (
                  <p className="text-xs text-green-600">
                    {t("Password Updated")}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-green-600 text-white font-semibold shadow hover:brightness-110 transition"
                  >
                    {t("Update Password")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReset(false)}
                    className="px-4 py-3 rounded-full border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
                  >
                    {t("Back to Login")}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;



