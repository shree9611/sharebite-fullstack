import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildApiUrl } from "../lib/api.js";
import { getCurrentProfile } from "../lib/profile.js";

const FoodRequest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const donation = location.state || {};
  const donationId = donation?.donationId;
  const availableQuantity = Number(donation?.quantity);
  const hasQuantityLimit = Number.isFinite(availableQuantity) && availableQuantity > 0;
  const profile = getCurrentProfile();
  const receiverLocation =
    profile?.location ||
    profile?.address ||
    profile?.streetAddress ||
    [profile?.city, profile?.pincode].filter(Boolean).join(", ");

  const [peopleCount, setPeopleCount] = useState("");
  const [foodPreference, setFoodPreference] = useState("any");
  const [requestedLocation, setRequestedLocation] = useState(receiverLocation || "");
  const [logistics, setLogistics] = useState("pickup");
  const [address, setAddress] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (requestedLocation.trim()) return;
    if (!navigator.geolocation) return;

    setLocationStatus("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(5);
        const lng = position.coords.longitude.toFixed(5);
        setRequestedLocation(`Lat ${lat}, Lng ${lng}`);
        setLocationStatus("Receiver location auto-filled.");
      },
      () => {
        setLocationStatus("Unable to auto-detect location. Enter manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [requestedLocation]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("sharebite.token");
    if (!token) {
      setError("Please login first.");
      return;
    }
    if (!donationId) {
      setError("No donation selected. Go back and choose a donation.");
      return;
    }
    if (!peopleCount || Number(peopleCount) <= 0) {
      setError("Please enter valid people count.");
      return;
    }
    if (hasQuantityLimit && Number(peopleCount) > availableQuantity) {
      setError(`Requested quantity cannot be greater than available quantity (${availableQuantity}).`);
      return;
    }
    if (logistics === "pickup" && !requestedLocation.trim()) {
      setError("Please enter your location.");
      return;
    }
    if (logistics === "delivery" && !address.trim()) {
      setError("Please enter delivery address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(buildApiUrl("/api/requests"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          donationId,
          peopleCount: Number(peopleCount),
          foodPreference,
          requestedLocation: logistics === "pickup" ? requestedLocation.trim() : "",
          logistics,
          deliveryAddress: address.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit request.");
      }

      setSuccess("Request sent to donor successfully.");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (submitError) {
      setError(submitError.message || "Unable to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-transparent">
      <div className="max-w-2xl w-full py-8 sm:py-12">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#10b981] text-4xl">volunteer_activism</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">ShareBite</h1>
          </div>
          <p className="text-slate-500 font-medium">Food Request Form</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 md:p-12">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p><strong>Selected Food:</strong> {donation?.foodName || "Not selected"}</p>
              <p><strong>Quantity:</strong> {donation?.quantity || "-"}</p>
              <p><strong>Location:</strong> {donation?.location || "-"}</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="people-count">
                How many people need food?
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">groups</span>
                <input
                  id="people-count"
                  type="number"
                  min="1"
                  max={hasQuantityLimit ? availableQuantity : undefined}
                  value={peopleCount}
                  onChange={(event) => setPeopleCount(event.target.value)}
                  placeholder="Enter number"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-[#10b981] focus:border-[#10b981] outline-none"
                  required
                />
              </div>
              {hasQuantityLimit ? (
                <p className="text-xs text-slate-500">Available quantity: {availableQuantity}</p>
              ) : null}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Preferred Food Type</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFoodPreference("veg")}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold ${
                    foodPreference === "veg" ? "bg-[#10b981] text-white border-[#10b981]" : "border-slate-200 text-slate-600"
                  }`}
                >
                  Veg
                </button>
                <button
                  type="button"
                  onClick={() => setFoodPreference("non-veg")}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold ${
                    foodPreference === "non-veg" ? "bg-[#10b981] text-white border-[#10b981]" : "border-slate-200 text-slate-600"
                  }`}
                >
                  Non-Veg
                </button>
                <button
                  type="button"
                  onClick={() => setFoodPreference("any")}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold ${
                    foodPreference === "any" ? "bg-[#10b981] text-white border-[#10b981]" : "border-slate-200 text-slate-600"
                  }`}
                >
                  Any
                </button>
              </div>
            </div>

            {logistics === "pickup" && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Receiver Location</label>
                <input
                  type="text"
                  value={requestedLocation}
                  onChange={(event) => setRequestedLocation(event.target.value)}
                  onFocus={() => {
                    if (!requestedLocation.trim() && receiverLocation) {
                      setRequestedLocation(receiverLocation);
                    }
                  }}
                  placeholder="Enter your pickup location"
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:ring-[#10b981] focus:border-[#10b981] outline-none"
                  required
                />
                {locationStatus ? (
                  <p className="text-xs text-slate-500">{locationStatus}</p>
                ) : null}
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Logistics Preference</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setLogistics("pickup")}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold ${
                    logistics === "pickup" ? "bg-[#10b981] text-white border-[#10b981]" : "border-slate-200 text-slate-600"
                  }`}
                >
                  Self-Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setLogistics("delivery")}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold ${
                    logistics === "delivery" ? "bg-[#10b981] text-white border-[#10b981]" : "border-slate-200 text-slate-600"
                  }`}
                >
                  Request Delivery
                </button>
              </div>

              {logistics === "delivery" && (
                <textarea
                  rows="3"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Enter full delivery address"
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:ring-[#10b981] focus:border-[#10b981] outline-none"
                />
              )}
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {success ? <p className="text-sm text-green-700">{success}</p> : null}

            <button
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-60"
              type="submit"
              disabled={isSubmitting || !donationId}
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FoodRequest;
