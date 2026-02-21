import React, { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { buildApiUrl } from "../lib/api.js";
import { setCurrentProfile, upsertProfile } from "../lib/profile.js";

const RegistrationStep2 = () => {
  const location = useLocation();
  const storedAccountData = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("sharebite.accountData") || "null");
    } catch {
      return null;
    }
  })();
  const role = location.state?.role || sessionStorage.getItem("sharebite.roleLabel") || "Receiver";
  const accountData = location.state?.accountData || storedAccountData;
  const roleValue = String(accountData?.role || role || "").trim().toLowerCase();
  const normalizedRole = roleValue === "volunteer"
    ? "admin"
    : ["donor", "receiver", "admin"].includes(roleValue)
      ? roleValue
      : "receiver";
  const navigate = useNavigate();
  const { t } = useLanguage();
  const inputRefs = useRef([]);
  const formRef = useRef(null);
  const [fullName, setFullName] = useState(accountData?.name || "");
  const [emailValue, setEmailValue] = useState(accountData?.email || "");
  const [phoneValue, setPhoneValue] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [coords, setCoords] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    streetAddress: false,
    city: false,
    pincode: false,
  });

  const validate = {
    fullName: fullName.trim().length >= 3,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue),
    phone: /^[0-9]{10}$/.test(phoneValue),
    streetAddress: streetAddress.trim().length >= 3,
    city: city.trim().length >= 2,
    pincode: /^[A-Za-z0-9 -]{4,10}$/.test(pincode.trim()),
  };

  const showError = {
    fullName: touched.fullName && !validate.fullName,
    email: touched.email && !validate.email,
    phone: touched.phone && !validate.phone,
    streetAddress: touched.streetAddress && !validate.streetAddress,
    city: touched.city && !validate.city,
    pincode: touched.pincode && !validate.pincode,
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
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json().catch(() => ({}));
          const address = data?.address || {};
          const road = [address?.house_number, address?.road].filter(Boolean).join(" ").trim();
          const area =
            address?.suburb ||
            address?.neighbourhood ||
            address?.city_district ||
            address?.county ||
            "";
          const detectedStreet = [road, area].filter(Boolean).join(", ").trim();
          const detectedCity =
            address?.city ||
            address?.town ||
            address?.village ||
            address?.municipality ||
            "";
          const detectedPincode = address?.postcode || "";

          setStreetAddress(detectedStreet || `Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`);
          if (detectedCity) setCity(detectedCity);
          if (detectedPincode) setPincode(detectedPincode);
          setLocationStatus(t("Location Detected"));
        } catch {
          setStreetAddress(`Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`);
          setLocationStatus(t("Location Detected"));
        }
      },
      () => {
        setLocationStatus(t("Location Permission Denied"));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      streetAddress: true,
      city: true,
      pincode: true,
    });
    const isValid =
      validate.fullName &&
      validate.email &&
      validate.phone &&
      validate.streetAddress &&
      validate.city &&
      validate.pincode;
    if (!isValid) {
      setSubmitError("Please fill required fields correctly.");
      return;
    }
    if (!accountData?.password) {
      setSubmitError("Step 1 data missing. Please complete Account Details again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(buildApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: emailValue.trim(),
          password: accountData.password,
          role: normalizedRole,
          locationName: [streetAddress.trim(), city.trim()].filter(Boolean).join(", "),
          address: streetAddress.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(data?.message || "Please check your details and try again.");
        }
        if (response.status === 409) {
          throw new Error("Email already registered. Please login.");
        }
        if (response.status >= 500) {
          throw new Error("Server error while creating account. Please try again.");
        }
        throw new Error(data?.message || "Registration failed");
      }
      const locationParts = [streetAddress.trim(), city.trim(), pincode.trim()].filter(Boolean);
      const exactLocation =
        coords?.latitude && coords?.longitude
          ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
          : "";
      const profile = upsertProfile({
        name: fullName.trim(),
        email: emailValue.trim(),
        phone: phoneValue.trim(),
        role,
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        location: locationParts.join(", "),
        exactLocation,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      });
      if (profile) {
        setCurrentProfile(profile);
      }
      sessionStorage.removeItem("sharebite.accountData");
      sessionStorage.removeItem("sharebite.roleLabel");
      navigate("/login", { state: { role } });
    } catch (error) {
      if (error instanceof TypeError) {
        setSubmitError("Unable to reach server. Please check your connection and try again.");
      } else {
        setSubmitError(error.message || "Unable to register.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
                      className={`form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300 ${
                        showError.streetAddress ? "border-red-400" : ""
                      }`}
                      placeholder={t("Street Address Placeholder")}
                      value={streetAddress}
                      onChange={(event) => setStreetAddress(event.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, streetAddress: true }))
                      }
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
                        className={`form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300 ${
                          showError.city ? "border-red-400" : ""
                        }`}
                        placeholder={t("City Placeholder")}
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        onBlur={() =>
                          setTouched((prev) => ({ ...prev, city: true }))
                        }
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
                        className={`form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300 ${
                          showError.pincode ? "border-red-400" : ""
                        }`}
                        placeholder={t("Pincode Placeholder")}
                        value={pincode}
                        onChange={(event) => setPincode(event.target.value)}
                        onBlur={() =>
                          setTouched((prev) => ({ ...prev, pincode: true }))
                        }
                        ref={(el) => (inputRefs.current[7] = el)}
                        onKeyDown={(event) => handleEnterNext(event, 7)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-full">
                    <label className="text-sm font-semibold text-[#111815] mb-2">
                      Exact Location (GPS)
                    </label>
                    <input
                      className="form-input w-full rounded-full border border-[#e7eeeb] bg-white h-11 px-4 text-sm placeholder:text-[#8aa19a] focus:ring-2 focus:ring-teal-200/60 focus:border-teal-300"
                      value={
                        coords
                          ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
                          : ""
                      }
                      placeholder="Tap Detect My Location"
                      readOnly
                    />
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
                disabled={isSubmitting}
                className="h-12 w-full sm:w-auto min-w-[220px] rounded-full bg-[#12c76a] text-white text-sm font-bold shadow hover:bg-[#0fbf63] inline-flex items-center justify-center transition-colors"
              >
                {isSubmitting ? "Submitting..." : t("Submit")}
              </button>
            </div>
            {submitError ? (
              <p className="mt-3 text-xs text-red-600">{submitError}</p>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
};

export default RegistrationStep2;
