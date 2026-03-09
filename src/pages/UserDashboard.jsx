import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

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

export default function UserDashboard() {

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
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
        const res = await axios.get("http://localhost:5000/api/donations");
        setDonations(res.data);
      } catch (err) {
        console.error("Error fetching donations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  // extract coordinates
  const extractCoords = (item) => {
    if (item.location?.coordinates) {
      return {
        lat: item.location.coordinates[1],
        lng: item.location.coordinates[0],
      };
    }

    if (item.latitude && item.longitude) {
      return {
        lat: item.latitude,
        lng: item.longitude,
      };
    }

    return null;
  };

  // FILTER DONATIONS
  const visibleDonations = useMemo(() => {

    let filtered = donations
      .map((item) => {

        const coords = extractCoords(item);
        const distanceKm =
          coords && userCoords
            ? haversineKm(userCoords, coords)
            : null;

        const status = String(item?.status || "").toLowerCase();

        const isAvailable =
          (status === "active" || status === "available") &&
          Number(item?.quantity || 0) > 0;

        return {
          ...item,
          _distanceKm: distanceKm,
          _isAvailable: isAvailable,
        };
      })
      .filter((item) => item._isAvailable);

    if (showNearby && userCoords) {
      filtered = filtered.filter(
        (item) =>
          item._distanceKm !== null &&
          item._distanceKm <= NEARBY_RADIUS_KM
      );

      filtered.sort(
        (a, b) =>
          (a._distanceKm ?? 999) -
          (b._distanceKm ?? 999)
      );
    }

    return filtered;

  }, [donations, showNearby, userCoords]);

  if (loading) {
    return <p>Loading donations...</p>;
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
            }}
          >
            <h3>{item.foodName}</h3>
            <p>Quantity: {item.quantity}</p>
            <p>Status: {item.status}</p>

            {item._distanceKm !== null && (
              <p>Distance: {item._distanceKm.toFixed(2)} km</p>
            )}
          </div>
        ))
      )}

    </div>
  );
}