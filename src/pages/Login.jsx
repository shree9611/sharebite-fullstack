import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const Login = () => {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [showPasswordError, setShowPasswordError] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const isPasswordValid = password.trim().length >= 6;
    setShowPasswordError(!isPasswordValid);
  };
  return (
    <div className="min-h-screen bg-background-light flex flex-col">

      {/* NAVBAR */}
      <header className="bg-white border-b px-6 lg:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          <span className="material-symbols-outlined text-green-500">
            volunteer_activism
          </span>
          {t("ShareBite")}
        </div>

        <Link to="/account-details">
          <button className="px-6 h-10 rounded-full bg-primary text-[#111814] text-sm font-bold hover:opacity-90 transition">
            {t("Sign Up")}
          </button>
        </Link>
      </header>

      {/* MAIN */}
      <main className="flex flex-1">

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
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md">

            <h2 className="text-3xl font-bold mb-2">{t("Welcome Back")}</h2>
            <p className="text-gray-600 mb-8">
              {t("Login Subtitle")}
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>

              {/* Email */}
              <div>
                <label className="text-sm font-semibold">
                  {t("Email Address")}
                </label>
                <input
                  type="email"
                  placeholder={t("Email Placeholder")}
                  className="w-full h-14 mt-1 px-4 rounded-xl border focus:ring-2 focus:ring-primary/40"
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
                  className={`w-full h-14 mt-1 px-4 rounded-xl border focus:ring-2 focus:ring-primary/40 ${
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
                  <input type="checkbox" className="accent-primary" />
                  {t("Remember Me")}
                </label>
                <span className="text-primary cursor-pointer">
                  {t("Forgot Password")}
                </span>
              </div>
<button
  type="submit"
  className="px-20 py-3 rounded-full bg-green-600 text-white font-semibold shadow hover:brightness-110 transition"
>
  {t("Login")}
</button>

{/* Divider */}
<div className="flex items-center gap-4 my-6">
  <div className="flex-1 h-px bg-gray-300"></div>
  <span className="text-sm text-gray-500">{t("Or Continue With")}</span>
  <div className="flex-1 h-px bg-gray-300"></div>
</div>

{/* Social Login */}
<div className="flex gap-4">
  {/* Apple */}
  <button className="flex-1 h-14 border rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
      alt="Apple"
      className="w-5 h-5"
    />
    <span className="font-semibold">{t("Apple")}</span>
  </button>

  {/* Google */}
  <button className="flex-1 h-14 border rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition">
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

          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
