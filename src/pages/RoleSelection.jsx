import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState("Receiver");
  const navigate = useNavigate();
  const { t } = useLanguage();

  const roles = [
    {
      key: "Donor",
      title: t("Role Donor"),
      desc: t("Role Donor Desc"),
      icon: "inventory_2",
    },
    {
      key: "Receiver",
      title: t("Role Receiver"),
      desc: t("Role Receiver Desc"),
      icon: "volunteer_activism",
    },
    {
      key: "Volunteer",
      title: t("Role Volunteer"),
      desc: t("Role Volunteer Desc"),
      icon: "local_shipping",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-5 border-b bg-white">
        <div className="flex items-center gap-2 font-bold text-lg">
          <span className="material-symbols-outlined text-green-500">
            volunteer_activism
          </span>
          {t("ShareBite")}
        </div>
      </header>

      {/* Content */}
      <main className="flex justify-center px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-4xl w-full text-center">

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
            {t("Join Community")}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mb-8 sm:mb-10">
            {t("Choose Role Subtitle")}
          </p>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {roles.map((role) => {
              const isSelected = selectedRole === role.key;

              return (
                <div
                  key={role.key}
                  onClick={() => setSelectedRole(role.key)}
                  className={`rounded-xl p-6 cursor-pointer transition
                    ${
                      isSelected
                        ? "border-2 border-orange-400 shadow-md"
                        : "border border-gray-200 hover:shadow"
                    }
                  `}
                >
                  <div
                    className={`mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center
                      ${
                        isSelected
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }
                    `}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {role.icon}
                    </span>
                  </div>

                  <h3 className="font-semibold mb-1">{role.title}</h3>
                  <p className="text-sm text-gray-500">{role.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Button */}
         <button
  onClick={() =>
    navigate("/account-details", {
      state: { role: selectedRole },
    })
  }
  className="w-full sm:w-auto px-10 py-3 rounded-full bg-green-500 text-white font-semibold shadow hover:brightness-110 transition"
>
  {t("Continue")} {t("As")} {t(`Role ${selectedRole}`)} →
</button>


          {/* Footer Icons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mt-12 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">eco</span>
              {t("Zero Waste Policy")}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">shield</span>
              {t("Secure Platform")}
            </span>
          </div>

        </div>
      </main>
    </div>
  );
};

export default RoleSelection;



