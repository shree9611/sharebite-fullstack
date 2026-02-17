import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { buildApiUrl, getAuthHeaders } from "../lib/api.js";

const ReceiverFeedback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showProfile, setShowProfile] = useState(false);
  const [foodRating, setFoodRating] = useState(4);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [comments, setComments] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState(location.state?.requestId || "");
  const fileInputRef = useRef(null);
  const isAvailable = location.pathname === "/dashboard";
  const isMyRequests = location.pathname === "/my-requests";
  const isFeedback = location.pathname === "/receiver/feedback";
  const handleLogout = () => {
    navigate("/login");
  };

  useEffect(() => {
    if (requestId) return;

    const loadLatestApprovedRequest = async () => {
      try {
        const response = await fetch(buildApiUrl("/api/requests"), {
          headers: { ...getAuthHeaders() },
        });
        const data = await response.json().catch(() => []);
        if (!response.ok || !Array.isArray(data)) {
          return;
        }
        const approved = data
          .filter((item) => item?.status === "approved")
          .sort((a, b) => {
            const aTime = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
            const bTime = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
            return bTime - aTime;
          });
        if (approved[0]?._id) {
          setRequestId(approved[0]._id);
        }
      } catch {
        // Keep silent here; submit will show actionable error if requestId is missing.
      }
    };

    loadLatestApprovedRequest();
  }, [requestId]);

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitFeedback = async () => {
    setSubmitError("");
    setSubmitSuccess("");
    if (!requestId) {
      setSubmitError("No approved request found. Please request and get approval first.");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch(buildApiUrl("/api/feedback"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          requestId,
          rating: Math.round((foodRating + deliveryRating) / 2),
          comment: comments,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Feedback submit failed");
      }
      setSubmitSuccess("Feedback submitted.");
      setComments("");
      setPhotoPreview("");
      setFoodRating(4);
      setDeliveryRating(5);
    } catch (error) {
      setSubmitError(error.message || "Unable to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="bg-transparent min-h-screen text-[#111815]">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          <div className="px-4 sm:px-6 md:px-10 flex justify-center py-5 bg-white border-b border-solid border-[#f0f4f3]">
            <div className="flex flex-col w-full max-w-none flex-1">
              <header className="flex items-center justify-between whitespace-nowrap px-2 py-1">
                <div className="flex items-center gap-2 font-bold text-lg text-[#111815]">
                  <span className="material-symbols-outlined text-green-500">
                    volunteer_activism
                  </span>
                  {t("ShareBite")}
                </div>
                <div className="flex flex-1 justify-end items-center relative">
                  <button
                    className="flex items-center justify-center rounded-full h-9 w-9 bg-[#f0f4f2] text-[#111814]"
                    onClick={() => setShowProfile((prev) => !prev)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      account_circle
                    </span>
                  </button>
                  {showProfile && (
                    <div className="absolute right-0 top-12 w-72 rounded-2xl border border-[#e6eee9] bg-white shadow-lg overflow-hidden">
                      <div className="h-16 bg-[#f8efe3]" />
                      <div className="-mt-8 flex flex-col items-center px-4 pb-4">
                        <div className="h-16 w-16 rounded-full bg-white border-4 border-white shadow flex items-center justify-center text-[#7a9087]">
                          <span className="material-symbols-outlined text-3xl">
                            account_circle
                          </span>
                        </div>
                        <p className="mt-2 font-bold text-[#111814]">
                          {t("User Name")}
                        </p>
                        <p className="text-xs text-[#7a9087]">
                          {t("User Email")}
                        </p>
                      </div>
                      <div className="px-4 pb-4 text-xs text-[#7a9087]">
                        <div className="flex items-center justify-between py-2 border-t border-[#eef4f1]">
                          <span>{t("Phone")}</span>
                          <span className="font-semibold text-[#111814]">
                            +91 XXXXX XXXXX
                          </span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            className="flex-1 rounded-xl bg-[#f3f6f4] px-3 py-2 font-semibold text-[#111814]"
                            type="button"
                            onClick={() => setShowProfile(false)}
                          >
                            {t("Cancel")}
                          </button>
                          <button
                            className="flex-1 rounded-xl px-3 py-2 font-semibold text-red-500 hover:bg-red-50"
                            onClick={handleLogout}
                            type="button"
                          >
                            {t("Logout")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </header>
            </div>
          </div>
          <main className="flex flex-1 py-2 flex-col md:flex-row">
            <div className="w-full md:w-64 hidden md:block border-r border-[#e6eee9] bg-white">
              <div className="p-4">
                <nav className="flex flex-col gap-2">
                  <a
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isAvailable
                        ? "text-[#12c76a] bg-[#e9f9f0]"
                        : "text-[#7a9087] hover:text-[#111814] hover:bg-[#f3f6f4]"
                    }`}
                    href="/dashboard"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      restaurant
                    </span>
                    <p className="text-xs font-semibold">{t("Available Now")}</p>
                  </a>
                  <a
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isMyRequests
                        ? "text-[#12c76a] bg-[#e9f9f0]"
                        : "text-[#7a9087] hover:text-[#111814] hover:bg-[#f3f6f4]"
                    }`}
                    href="/my-requests"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      shopping_cart
                    </span>
                    <p className="text-xs font-semibold">{t("My Requests")}</p>
                  </a>
                  <a
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isFeedback
                        ? "text-[#12c76a] bg-[#e9f9f0]"
                        : "text-[#7a9087] hover:text-[#111814] hover:bg-[#f3f6f4]"
                    }`}
                    href="/receiver/feedback"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      reviews
                    </span>
                    <p className="text-xs font-semibold">{t("Feedback")}</p>
                  </a>
                </nav>
              </div>
            </div>
            <div className="flex flex-col max-w-[800px] flex-1 gap-8 px-4 sm:px-6 md:px-12">
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm">
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="flex min-w-0 sm:min-w-72 flex-col gap-3">
                    <h1 className="text-[#111815] text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
                      {t("Share Your Experience")}
                    </h1>
                    <p className="text-[#618979] text-sm sm:text-base font-normal leading-normal">
                      {t("Feedback Intro")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-10 bg-white p-6 sm:p-8 rounded-xl shadow-sm">
                <div>
                  <h2 className="text-[#111815] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4">
                    {t("Food Quality Question")}
                  </h2>
                  <div className="flex flex-wrap gap-4 p-4 bg-background-light rounded-lg items-center">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFoodRating(value)}
                          className="leading-none"
                        >
                          <span
                            className={`material-symbols-outlined text-4xl cursor-pointer ${
                              value <= foodRating ? "text-green-600" : "text-[#dbe6e1]"
                            }`}
                          >
                            star
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[#618979] font-medium ml-2">
                      {t("Excellent Quality")}
                    </p>
                  </div>
                </div>
                <div>
                  <h2 className="text-[#111815] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4">
                    {t("Delivery Service")}
                  </h2>
                  <div className="flex flex-wrap gap-4 p-4 bg-background-light rounded-lg items-center">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setDeliveryRating(value)}
                          className="leading-none"
                        >
                          <span
                            className={`material-symbols-outlined text-4xl cursor-pointer ${
                              value <= deliveryRating ? "text-green-600" : "text-[#dbe6e1]"
                            }`}
                          >
                            star
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[#618979] font-medium ml-2">
                      {t("Very Professional")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[#111815] text-[18px] font-bold leading-tight tracking-[-0.015em]">
                    {t("Add Thoughts")}
                  </label>
                  <textarea
                    className="w-full min-h-[160px] p-4 rounded-lg bg-background-light border-none text-[#111815] placeholder-[#618979] focus:ring-2 focus:ring-green-300 focus:outline-none"
                    placeholder={t("Thoughts Placeholder")}
                    value={comments}
                    onChange={(event) => setComments(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[#111815] text-[18px] font-bold leading-tight tracking-[-0.015em]">
                    {t("Upload Photo")}
                  </label>
                  <p className="text-sm text-[#618979] -mt-1 mb-2">
                    {t("Upload Photo Hint")}
                  </p>
                  <div
                    className="border-2 border-dashed border-[#dbe6e1] rounded-xl p-6 sm:p-10 flex flex-col items-center justify-center gap-3 hover:border-primary transition-colors cursor-pointer bg-background-light/50"
                    onClick={handlePhotoClick}
                  >
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Selected"
                        className="h-32 w-32 rounded-lg object-cover"
                      />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-4xl text-[#618979]">
                          add_a_photo
                        </span>
                        <span className="text-sm font-semibold text-[#111815]">
                          {t("Upload Dropzone")}
                        </span>
                        <span className="text-xs text-[#618979]">
                          {t("Upload Formats")}
                        </span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>
                </div>
                <div className="pt-4 flex flex-col gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      defaultChecked
                      className="rounded text-green-600 focus:ring-green-300 h-5 w-5 bg-background-light border-none"
                      type="checkbox"
                    />
                    <span className="text-[#111815] text-sm">
                      {t("Anonymous Feedback")}
                    </span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      className="flex-1 bg-green-600 hover:bg-green-600/90 text-[#111815] font-black text-base sm:text-lg py-4 rounded-xl transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSubmitFeedback}
                    >
                      <span className="material-symbols-outlined">send</span>
                      {isSubmitting ? "Submitting..." : t("Submit Feedback")}
                    </button>
                    <button className="w-full sm:w-auto px-8 bg-[#f0f4f3] text-[#111815] font-bold py-4 rounded-xl transition-all">
                      {t("Cancel")}
                    </button>
                  </div>
                </div>
                {submitError ? (
                  <p className="text-sm text-red-600">{submitError}</p>
                ) : null}
                {submitSuccess ? (
                  <p className="text-sm text-green-600">{submitSuccess}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-4 p-6 bg-green-50 rounded-xl border border-green-100 italic text-[#111815]">
                <span className="material-symbols-outlined text-green-600 text-3xl">
                  format_quote
                </span>
                <p className="text-base">
                  {t("Feedback Quote")}
                </p>
              </div>
            </div>
          </main>
          <footer className="px-4 md:px-40 py-10 border-t border-solid border-[#f0f4f3]">
            <div className="max-w-[960px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[#618979] text-sm">
                {t("Receiver Footer Line")}
              </p>
              <div className="flex gap-6">
                <a className="text-[#618979] text-sm hover:text-green-600">
                  {t("Privacy Policy")}
                </a>
                <a className="text-[#618979] text-sm hover:text-green-600">
                  {t("Terms of Service")}
                </a>
                <a className="text-[#618979] text-sm hover:text-green-600">
                  {t("Help Center")}
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ReceiverFeedback;




