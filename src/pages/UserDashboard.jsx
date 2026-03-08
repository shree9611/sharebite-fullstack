{visibleDonations.map((item) => {
  const status = String(item?.status || "").toLowerCase();
  const isAvailable =
    (status === "active" || status === "available") &&
    Number(item?.quantity || 0) > 0;

  return (
    <div key={item._id} className="bg-white rounded-xl overflow-hidden border border-[#e6eee9] flex flex-col shadow-sm">
      <div className="relative h-32 w-full bg-[#f3f6f4] flex items-center justify-center">
        {resolveDonationImage(item) ? (
          <img
            src={resolveDonationImage(item)}
            alt={item.foodName || "Food"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined text-[#7a9087] text-4xl">photo_camera</span>
        )}
        <div
          className={`absolute bottom-2 right-2 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
            isAvailable ? "bg-[#12c76a] text-white" : "bg-slate-200 text-slate-700"
          }`}
        >
          <span className="material-symbols-outlined text-[12px]">check_circle</span>
          {isAvailable ? "Available" : "Unavailable"}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex flex-col">
          <h3 className="font-bold text-[#111814]">{item.foodName || "Food Item"}</h3>
          <p className="text-[11px] text-[#7a9087] flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {item.location || "Location not provided"}
          </p>
          {showNearby && item?._distanceKm !== null && (
            <p className="text-[11px] text-[#12c76a] font-semibold mt-1">
              {item._distanceKm.toFixed(1)} km away
            </p>
          )}
        </div>
        <div className="flex items-center justify-between text-[11px] mt-2">
          <span className="text-[#7a9087]">Claim Status</span>
          <span className={`font-semibold ${isAvailable ? "text-[#12c76a]" : "text-slate-600"}`}>
            {isAvailable ? `${item.quantity} portions left` : `${item?.status || "claimed"}`}
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#eef4f1] rounded-full">
          <div className="bg-[#12c76a] h-full rounded-full w-full" />
        </div>
        {isAvailable ? (
          <Link
            className="mt-3 w-full bg-[#12c76a] hover:bg-[#0fbf63] text-white font-bold py-2 rounded-full text-xs text-center inline-flex items-center justify-center"
            to="/food-request"
            state={{
              donationId: item._id,
              foodName: item.foodName,
              quantity: item.quantity,
              location: item.location,
              image: item.image,
              imageUrl: item.imageUrl,
            }}
          >
            {t("Request Food")}
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="mt-3 w-full bg-slate-200 text-slate-600 font-bold py-2 rounded-full text-xs text-center inline-flex items-center justify-center cursor-not-allowed"
          >
            Not Available
          </button>
        )}
      </div>
    </div>
  );
})}