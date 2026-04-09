import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const RegistrationStep2 = () => {
  const location = useLocation();
  const role = location.state?.role;
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = () => {
    if (role === "Volunteer") {
      navigate("/volunteer/acceptmission", { state: { role } });
      return;
    }
    navigate("/registration-success", { state: { role } });
  };
  return (
    <div className="bg-[#f4f7f6] min-h-screen">
      <div className="min-h-screen w-full py-10 px-4 md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-[1040px] rounded-3xl border border-[#e7eeeb] bg-white shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)]">
          <header className="flex items-center justify-between px-8 py-5 border-b border-[#eef3f1]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-green-500 text-[26px]">
                volunteer_activism
              </span>
              <span className="font-bold text-[#111815]">{t("ShareBite")}</span>
            </div>

          </header>

          <main className="px-8 py-8">
            <div className="mb-6">
              <h1 className="text-[28px] font-black text-[#111815]">
                {t("Step2 Title")}
              </h1>
              <p className="text-[#6b8b81] text-sm mt-1">
                {t("Step2 Subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section>
                <h3 className="text-[#111815] font-semibold mb-4">
                  {t("Personal & Organization")}
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-col w-full">
                    <label className="text-sm font-semibold text-[#111815] mb-2">
                      {t("Full Name")}{" "}
                      <span className="text-accent-orange">*</span>
                    </label>
                    <input
                      className="form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-primary/30"
                      placeholder={t("Full Name Placeholder")}
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <label className="text-sm font-semibold text-[#111815] mb-2">
                      {t("Email Address")}{" "}
                      <span className="text-accent-orange">*</span>
                    </label>
                    <input
                      className="form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-primary/30"
                      placeholder={t("Email Placeholder")}
                      type="email"
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <label className="text-sm font-semibold text-[#111815] mb-2">
                      {t("Phone Number")}{" "}
                      <span className="text-accent-orange">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="w-20">
                        <select className="form-select w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-3 text-sm">
                          <option>+1</option>
                          <option>+91</option>
                          <option>+44</option>
                        </select>
                      </div>
                      <input
                        className="form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-primary/30"
                        placeholder={t("Phone Placeholder US")}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-full">
                    <label className="text-sm font-semibold text-[#111815] mb-2">
                      {t("Organization Name")}{" "}
                      <span className="text-accent-orange">*</span>
                    </label>
                    <input
                      className="form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-primary/30"
                      placeholder={t("Organization Placeholder")}
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <label className="text-sm font-semibold text-[#111815] mb-2">
                      {t("Organization Contact")}
                    </label>
                    <input
                      className="form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-primary/30"
                      placeholder={t("Organization Contact Placeholder")}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[#111815] font-semibold mb-4">
                  {t("Address & Location")}
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-col w-full">
                    <label className="text-sm font-semibold text-[#111815] mb-2">
                      {t("Street Address")}{" "}
                      <span className="text-accent-orange">*</span>
                    </label>
                    <input
                      className="form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-primary/30"
                      placeholder={t("Street Address Placeholder")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col w-full">
                      <label className="text-sm font-semibold text-[#111815] mb-2">
                        {t("City")}{" "}
                        <span className="text-accent-orange">*</span>
                      </label>
                      <input
                        className="form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-primary/30"
                        placeholder={t("City Placeholder")}
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <label className="text-sm font-semibold text-[#111815] mb-2">
                        {t("Pincode")}{" "}
                        <span className="text-accent-orange">*</span>
                      </label>
                      <input
                        className="form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-primary/30"
                        placeholder={t("Pincode Placeholder")}
                      />
                    </div>
                  </div>
                  <div className="relative w-full aspect-video rounded-2xl border border-[#e7eeeb] bg-[#e7efe9] overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,#cfe1d5_0,#c2d6c9_45%,#bdd0c4_100%)]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative flex flex-col items-center">
                        <div className="h-28 w-48 rounded-full border border-white/70 bg-white/60" />
                        <span className="material-symbols-outlined text-accent-orange text-[48px] -mt-16">
                          location_on
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="absolute top-3 right-3 z-10 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-primary text-xs font-bold shadow border border-[#e7eeeb]"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        my_location
                      </span>
                      {t("Detect My Location")}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#8aa19a]">
                    {t("Move Pin Note")}
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-10 pt-6 border-t border-[#eef3f1] flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                to="/account-details"
                className="flex items-center gap-2 text-sm font-semibold text-[#111815] hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                {t("Back to Step 1")}
              </Link>
              <button
                type="button"
                onClick={handleSubmit}
                className="h-12 min-w-[220px] rounded-full bg-[#12c76a] text-white text-sm font-bold shadow hover:bg-[#0fbf63] inline-flex items-center justify-center transition-colors"
              >
                {t("Submit")}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default RegistrationStep2;
