import React, { useEffect, useMemo, useState } from "react";
import React, { useEffect, useMemo, useState } from "react";
import { apiFetchWithFallback } from "../lib/api.js";

const NEARBY_RADIUS_KM = 10;

function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * (Math.PI / 180);
  const dLon = (b.lng - a.lng) * (Math.PI / 180);

  const lat1 = a.lat * (Math.PI / 180);
  const lat2 = b.lat * (Math.PI / 180);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 *
      Math.cos(lat1) *
      Math.cos(lat2);

  return 2 * R * Math.asin(Math.sqrt(h));
}

const formatExpiry = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

export default function UserDashboard() {

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNearby, setShowNearby] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  // get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        console.log("Location permission denied");
      }
    );
  }, []);

  // fetch donations
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setError("");
        const res = await apiFetchWithFallback("/api/donations", {
          allowRelativeFallback: true,
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Failed to fetch donations (HTTP ${res.status}).`);
        }
        const data = await res.json().catch(() => []);
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.donations)
            ? data.donations
            : Array.isArray(data?.data)
              ? data.data
              : [];
        setDonations(list);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching donations", err);
        setError(err?.message || "Error fetching donations");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  // extract coordinates
  const extractCoords = (item) => {
    if (Array.isArray(item?.coordinates?.coordinates) && item.coordinates.coordinates.length === 2) {
      return {
        lat: item.coordinates.coordinates[1],
        lng: item.coordinates.coordinates[0],
      };
    }

    if (Array.isArray(item?.location?.coordinates) && item.location.coordinates.length === 2) {
      return {
        lat: item.location.coordinates[1],
        lng: item.location.coordinates[0],
      };
    }

    const rawLat = item?.latitude ?? item?.lat;
    const rawLng = item?.longitude ?? item?.lng;
    const lat = Number(rawLat);
    const lng = Number(rawLng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return {
        lat,
        lng,
      };
    }

    const donorLat = Number(item?.donor?.coordinates?.latitude);
    const donorLng = Number(item?.donor?.coordinates?.longitude);
    if (Number.isFinite(donorLat) && Number.isFinite(donorLng)) {
      return { lat: donorLat, lng: donorLng };
    }

    return null;
  };

  // FILTER DONATIONS
  const visibleDonations = useMemo(() => {

    const mapped = donations
      .map((item) => {

        const coords = extractCoords(item);
        const distanceKm =
          coords && userCoords
            ? haversineKm(userCoords, coords)
            : null;

        const status = String(item?.status || "").toLowerCase();
        const rawQuantity = item?.quantity;
        const quantityValue = Number(rawQuantity);
        const hasQuantity =
          rawQuantity !== undefined &&
          rawQuantity !== null &&
          rawQuantity !== "" &&
          Number.isFinite(quantityValue);

        const isAvailable =
          (status === "active" || status === "available") &&
          (!hasQuantity || quantityValue > 0);

        return {
          ...item,
          _distanceKm: distanceKm,
          _isAvailable: isAvailable,
        };
      })
      .filter((item) => item._isAvailable);

    if (showNearby && userCoords) {
      const withDistance = mapped.filter(
        (item) => item._distanceKm !== null && item._distanceKm <= NEARBY_RADIUS_KM
      );
      const withoutDistance = mapped.filter((item) => item._distanceKm === null);

      withDistance.sort((a, b) => (a._distanceKm ?? 999) - (b._distanceKm ?? 999));
      return [...withDistance, ...withoutDistance];
    }

    return mapped;

  }, [donations, showNearby, userCoords]);

  if (loading) {
    return <p>Loading donations...</p>;
  }

  if (error) {
    return <p style={{ padding: "20px" }}>Unable to load donations: {error}</p>;
  }

  return (
    <div style={{ padding: "20px" }}>

      <h2>Receiver Dashboard</h2>

      <button
        onClick={() => setShowNearby(!showNearby)}
        style={{ marginBottom: "20px" }}
      >
        {showNearby ? "Show All Donations" : "Show Nearby Donations"}
      </button>

      {visibleDonations.length === 0 ? (
        <p>No food donations available yet.</p>
      ) : (
        visibleDonations.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "8px",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            {item.imageUrl || item.image ? (
              <img
                src={item.imageUrl || item.image}
                alt={item.foodName || "Donation"}
                style={{
                  width: "90px",
                  height: "90px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  border: "1px solid #eee",
                }}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : null}

            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0 }}>{item.foodName || item.foodTitle || "Food Donation"}</h3>
              <div style={{ marginTop: "6px", fontSize: "14px", color: "#333" }}>
                <div><strong>Quantity:</strong> {item.quantity ?? "-"}</div>
                <div><strong>Status:</strong> {item.status || "-"}</div>
                <div><strong>Pickup:</strong> {item.pickupLocation || item.location || "-"}</div>
                {item.expiryTime ? (
                  <div><strong>Expiry:</strong> {formatExpiry(item.expiryTime)}</div>
                ) : null}
                {item.donor?.name ? (
                  <div><strong>Donor:</strong> {item.donor.name}</div>
                ) : null}
              </div>

              {showNearby && item._distanceKm === null ? (
                <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#666" }}>
                  Distance unavailable (donation has no coordinates).
                </p>
              ) : null}

              {item._distanceKm !== null && (
                <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#555" }}>
                  Distance: {item._distanceKm.toFixed(2)} km
                </p>
              )}
            </div>
          </div>
        ))
      )}

    </div>
  );
}
