import React, { useState } from "react";

const FoodRequest = () => {
  const [logistics, setLogistics] = useState("pickup");

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
      <div className="max-w-2xl w-full py-12">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#10b981] text-4xl">
              volunteer_activism
            </span>
            <h1 className="text-3xl font-bold text-slate-800">ShareBite</h1>
          </div>
          <p className="text-slate-500 font-medium">Food Request Form</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 md:p-12">
          <form className="space-y-10">
            <div className="space-y-3">
              <label
                className="block text-sm font-semibold text-slate-700"
                htmlFor="people-count"
              >
                How many people need food?
              </label>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    groups
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-slate-200 focus:ring-[#10b981] focus:border-[#10b981] transition-all outline-none"
                    id="people-count"
                    min="1"
                    placeholder="Enter number"
                    type="number"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                Preferred Food Type
              </label>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <input className="hidden peer" id="veg" type="checkbox" />
                  <label
                    className="cursor-pointer px-6 py-2.5 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:border-[#10b981] transition-all flex items-center gap-2 peer-checked:bg-[#10b981] peer-checked:text-white peer-checked:border-[#10b981]"
                    htmlFor="veg"
                  >
                    <span className="material-symbols-outlined text-lg">
                      potted_plant
                    </span>
                    Veg
                  </label>
                </div>
                <div className="relative">
                  <input className="hidden peer" id="non-veg" type="checkbox" />
                  <label
                    className="cursor-pointer px-6 py-2.5 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:border-[#10b981] transition-all flex items-center gap-2 peer-checked:bg-[#10b981] peer-checked:text-white peer-checked:border-[#10b981]"
                    htmlFor="non-veg"
                  >
                    <span className="material-symbols-outlined text-lg">
                      set_meal
                    </span>
                    Non-Veg
                  </label>
                </div>
                <div className="relative">
                  <input className="hidden peer" id="grains" type="checkbox" />
                  <label
                    className="cursor-pointer px-6 py-2.5 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:border-[#10b981] transition-all flex items-center gap-2 peer-checked:bg-[#10b981] peer-checked:text-white peer-checked:border-[#10b981]"
                    htmlFor="grains"
                  >
                    <span className="material-symbols-outlined text-lg">
                      grass
                    </span>
                    Grains
                  </label>
                </div>
                <div className="relative">
                  <input className="hidden peer" id="bakery" type="checkbox" />
                  <label
                    className="cursor-pointer px-6 py-2.5 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:border-[#10b981] transition-all flex items-center gap-2 peer-checked:bg-[#10b981] peer-checked:text-white peer-checked:border-[#10b981]"
                    htmlFor="bakery"
                  >
                    <span className="material-symbols-outlined text-lg">
                      bakery_dining
                    </span>
                    Bakery
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-2">
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Logistics Preference
                </label>
                <p className="text-xs text-slate-500">
                  How would you like to receive the food?
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    checked={logistics === "pickup"}
                    className="hidden peer"
                    id="pickup-option"
                    name="logistics"
                    onChange={() => setLogistics("pickup")}
                    type="radio"
                  />
                  <label
                    className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-slate-200 transition-all text-center gap-3 bg-white peer-checked:border-[#10b981] peer-checked:bg-[#ecfdf5] peer-checked:shadow-[0_0_0_1px_#10b981]"
                    htmlFor="pickup-option"
                  >
                    <span className="material-symbols-outlined text-4xl text-slate-400 peer-checked:text-[#10b981]">
                      directions_walk
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        Self-Pickup
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        Collect in person
                      </p>
                    </div>
                  </label>
                </div>
                <div className="relative">
                  <input
                    checked={logistics === "delivery"}
                    className="hidden peer"
                    id="delivery-option"
                    name="logistics"
                    onChange={() => setLogistics("delivery")}
                    type="radio"
                  />
                  <label
                    className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-slate-200 transition-all text-center gap-3 bg-white peer-checked:border-[#10b981] peer-checked:bg-[#ecfdf5] peer-checked:shadow-[0_0_0_1px_#10b981]"
                    htmlFor="delivery-option"
                  >
                    <span className="material-symbols-outlined text-4xl text-slate-400 peer-checked:text-[#10b981]">
                      local_shipping
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        Request Delivery
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        Doorstep drop-off
                      </p>
                    </div>
                  </label>
                </div>
                {logistics === "delivery" && (
                  <div className="col-span-1 md:col-span-2 space-y-3 pt-2">
                    <label
                      className="block text-sm font-semibold text-slate-700"
                      htmlFor="address"
                    >
                      Delivery Address
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-4 text-slate-400">
                        location_on
                      </span>
                      <textarea
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border-slate-200 focus:ring-[#10b981] focus:border-[#10b981] transition-all outline-none resize-none"
                        id="address"
                        placeholder="Enter full delivery address for your Center"
                        rows="3"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6">
              <button
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-5 rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                type="submit"
              >
                <span className="material-symbols-outlined">send</span>
                Send Request
              </button>
              <p className="mt-6 text-center text-slate-400 text-sm italic">
                "Your request helps us minimize waste"
              </p>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-slate-400 text-xs">
          <p>
            © 2024 ShareBite Platform. Empowering communities through dignified
            food distribution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FoodRequest;
