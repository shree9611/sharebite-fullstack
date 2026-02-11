import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const RegistrationSuccess = () => {
  const location = useLocation();
  const role = location.state?.role;
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleGoToDashboard = () => {
    if (role === "Donor") {
      navigate("/donor/donate", { state: { role } });
      return;
    }
    navigate("/dashboard", { state: { role } });
  };
  return (
    <div className="bg-transparent min-h-screen text-[#111815]">
      <div className="min-h-screen w-full py-8 sm:py-10 px-4 sm:px-6">
        <div className="mx-auto w-full max-w-[860px] rounded-3xl border border-[#e4ece8] bg-white shadow-[0_30px_80px_-60px_rgba(0,0,0,0.5)]">
          <header className="flex items-center gap-2 px-4 sm:px-6 md:px-10 py-5 border-b border-[#eef3f1] bg-white">
            <span className="material-symbols-outlined text-green-500 text-[26px]">
              volunteer_activism
            </span>
            <span className="font-bold text-[#111815]">{t("ShareBite")}</span>
          </header>

          <main className="px-5 sm:px-6 py-8 sm:py-10">
            <div className="flex flex-col items-center text-center">
              <img
                alt="People sharing food illustration"
                className="w-full max-w-[360px] h-auto object-contain rounded-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuATworrip29X8270LbBmomTFQdux7iuSAfMXYv6yj-TuPHRjl3fFBl2PavVrN72FlV380bv_uK0G5UXo4PivuQwVdKx6NNKG5AgIl5Y4Q05lGmPm3vUkTgqirQ2Qll0kda9vuQbQnRstZTG99bSCP4Rtacwe6CEQnutS2KIwjoVXZMwSruhKpAnXskR6b6bNCA9pHrQPwOKU2eWmxjEZyzt_mqDnCHaW1XLq9neKlRcF8mUFJy9VYuhKP93IMqgZ8BpL4ppL7-vYRB2"
              />

              <div className="mt-6 flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[22px]">
                  check_circle
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold mt-4">
                {t("Success Title")}
              </h1>
              <h2 className="text-base sm:text-lg font-semibold mt-2">
                {t("Welcome Community")}
              </h2>
              <p className="text-[#6b8b81] text-sm mt-2 max-w-[520px]">
                {t("Verification Note")}
              </p>

              <div className="mt-6 flex flex-col items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={handleGoToDashboard}
                  className="h-12 w-full sm:w-auto min-w-[240px] rounded-full bg-[#12c76a] text-white text-sm font-bold shadow hover:bg-[#0fbf63] inline-flex items-center justify-center gap-2"
                >
                  {t("Go to Dashboard")}
                  <span className="material-symbols-outlined text-[18px]">
                    dashboard
                  </span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;



