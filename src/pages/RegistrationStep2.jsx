import React, { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const RegistrationStep2 = () => {
  const location = useLocation();
  const role = location.state?.role;
  const navigate = useNavigate();
  const { t } = useLanguage();
  const inputRefs = useRef([]);
  const formRef = useRef(null);
  const [fullName, setFullName] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [coords, setCoords] = useState(null);
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
  });

  const validate = {
    fullName: fullName.trim().length >= 3,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue),
    phone: /^[0-9]{10}$/.test(phoneValue),
  };

  const showError = {
    fullName: touched.fullName && !validate.fullName,
    email: touched.email && !validate.email,
    phone: touched.phone && !validate.phone,
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

  const handleFormEnter = (event) => {
    if (event.key !== "Enter") {
      return;
    }
    const target = event.target;
    if (!formRef.current || target.tagName === "TEXTAREA") {
      return;
    }
    event.preventDefault();
    const focusables = Array.from(
      formRef.current.querySelectorAll(
        "input, select, textarea, button"
      )
    ).filter(
      (el) =>
        !el.disabled &&
        el.getAttribute("type") !== "hidden" &&
        el.offsetParent !== null
    );
    const index = focusables.indexOf(target);
    const next = focusables[index + 1];
    if (next) {
      next.focus();
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus(t("Geolocation Not Supported"));
      return;
    }
    setLocationStatus(t("Detecting Location"));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        setStreetAddress(`Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`);
        setLocationStatus(t("Location Detected"));
      },
      () => {
        setLocationStatus(t("Location Permission Denied"));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = () => {
    navigate("/login", { state: { role } });
  };
  return (
    <div className="bg-transparent min-h-screen">
      <div className="min-h-screen w-full py-8 sm:py-10 px-4 sm:px-6 md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-[1040px] rounded-3xl border border-teal-100 bg-white shadow-[0_25px_70px_-45px_rgba(13,148,136,0.45)]">
          <header className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-5 border-b border-[#eef3f1] bg-white">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-green-500 text-[26px]">
                volunteer_activism
              </span>
              <span className="font-bold text-[#111815]">{t("ShareBite")}</span>
            </div>

          </header>

          <main className="px-5 sm:px-8 py-6 sm:py-8">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-[28px] font-black text-[#111815]">
                {t("Step2 Title")}
              </h1>
              <p className="text-[#6b8b81] text-sm mt-1">
                {t("Step2 Subtitle")}
              </p>
            </div>

            <div
              ref={formRef}
              onKeyDown={handleFormEnter}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
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
                      className={`form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300 ${
                        showError.fullName ? "border-red-400" : ""
                      }`}
                      placeholder={t("Full Name Placeholder")}
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, fullName: true }))
                      }
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
                  <div className="flex flex-col w-full">
                    <label className="text-sm font-semibold text-[#111815] mb-2">
                      {t("Email Address")}{" "}
                      <span className="text-accent-orange">*</span>
                    </label>
                    <input
                      className={`form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300 ${
                        showError.email ? "border-red-400" : ""
                      }`}
                      placeholder={t("Email Placeholder")}
                      type="email"
                      value={emailValue}
                      onChange={(event) => setEmailValue(event.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, email: true }))
                      }
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
                  <div className="flex flex-col w-full">
                    <label className="text-sm font-semibold text-[#111815] mb-2">
                      {t("Phone Number")}{" "}
                      <span className="text-accent-orange">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="w-20">
                        <select className="form-select w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-3 text-sm focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300">
                          <option>+1</option>
                          <option>+91</option>
                          <option>+44</option>
                        </select>
                      </div>
                      <input
                        className={`form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300 ${
                          showError.phone ? "border-red-400" : ""
                        }`}
                        placeholder={t("Phone Placeholder US")}
                        value={phoneValue}
                        onChange={(event) =>
                          setPhoneValue(event.target.value.replace(/\D/g, ""))
                        }
                        onBlur={() =>
                          setTouched((prev) => ({ ...prev, phone: true }))
                        }
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        ref={(el) => (inputRefs.current[2] = el)}
                        onKeyDown={(event) => handleEnterNext(event, 2)}
                      />
                    </div>
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
                  <div className="flex flex-col w-full">
                    <label className="text-sm font-semibold text-[#111815] mb-2">
                      {t("Organization Name")}{" "}
                      <span className="text-accent-orange">*</span>
                    </label>
                    <input
                      className="form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300"
                      placeholder={t("Organization Placeholder")}
                      ref={(el) => (inputRefs.current[3] = el)}
                      onKeyDown={(event) => handleEnterNext(event, 3)}
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <label className="text-sm font-semibold text-[#111815] mb-2">
                      {t("Organization Contact")}
                    </label>
                    <input
                      className="form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300"
                      placeholder={t("Organization Contact Placeholder")}
                      ref={(el) => (inputRefs.current[4] = el)}
                      onKeyDown={(event) => handleEnterNext(event, 4)}
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
                      className="form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300"
                      placeholder={t("Street Address Placeholder")}
                      value={streetAddress}
                      onChange={(event) => setStreetAddress(event.target.value)}
                      ref={(el) => (inputRefs.current[5] = el)}
                      onKeyDown={(event) => handleEnterNext(event, 5)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col w-full">
                      <label className="text-sm font-semibold text-[#111815] mb-2">
                        {t("City")}{" "}
                        <span className="text-accent-orange">*</span>
                      </label>
                      <input
                        className="form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300"
                        placeholder={t("City Placeholder")}
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        ref={(el) => (inputRefs.current[6] = el)}
                        onKeyDown={(event) => handleEnterNext(event, 6)}
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <label className="text-sm font-semibold text-[#111815] mb-2">
                        {t("Pincode")}{" "}
                        <span className="text-accent-orange">*</span>
                      </label>
                      <input
                        className="form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300"
                        placeholder={t("Pincode Placeholder")}
                        value={pincode}
                        onChange={(event) => setPincode(event.target.value)}
                        ref={(el) => (inputRefs.current[7] = el)}
                        onKeyDown={(event) => handleEnterNext(event, 7)}
                      />
                    </div>
                  </div>
                  <div className="relative w-full aspect-video rounded-2xl border border-[#e7eeeb] bg-[#e7efe9] overflow-hidden">
                    {coords ? (
                      <iframe
                        title="Detected location"
                        className="absolute inset-0 h-full w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&z=15&output=embed`}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,#cfe1d5_0,#c2d6c9_45%,#bdd0c4_100%)]" />
                    )}
                    {!coords && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative flex flex-col items-center">
                          <div className="h-28 w-48 rounded-full border border-white/70 bg-white/60" />
                          <span className="material-symbols-outlined text-accent-orange text-[48px] -mt-16">
                            location_on
                          </span>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      className="absolute top-3 right-3 z-10 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-primary text-xs font-bold shadow border border-[#e7eeeb]"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        my_location
                      </span>
                      {t("Detect My Location")}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#8aa19a]">
                    {locationStatus || t("Move Pin Note")}
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
                className="h-12 w-full sm:w-auto min-w-[220px] rounded-full bg-[#12c76a] text-white text-sm font-bold shadow hover:bg-[#0fbf63] inline-flex items-center justify-center transition-colors"
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



