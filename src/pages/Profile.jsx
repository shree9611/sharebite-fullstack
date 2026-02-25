import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetchWithFallback, getAuthHeaders } from "../lib/api.js";
import { clearSession } from "../lib/auth.js";
import { clearCurrentProfile, setCurrentProfile } from "../lib/profile.js";

const initialForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
  address: "",
  accountType: "",
  city: "",
  state: "",
  userId: "",
  organizationName: "",
  foodTypeUsuallyDonated: "",
  totalDonationsCount: 0,
  donorRating: 0,
  receiverOrganizationName: "",
  peopleServed: 0,
  totalFoodReceived: 0,
  receiverRating: 0,
  profileImage: "",
  profileImageUrl: "",
};

const Profile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordState, setPasswordState] = useState({ currentPassword: "", newPassword: "" });

  const isDonor = form.accountType === "Donor";
  const isReceiver = form.accountType === "Receiver";

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await apiFetchWithFallback("/api/users/me", {
          headers: { ...getAuthHeaders() },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.message || "Failed to load profile.");
        setForm((prev) => ({ ...prev, ...data }));
        setCurrentProfile({
          name: data?.fullName || "",
          email: data?.email || "",
          phone: data?.phoneNumber || "",
          role: data?.accountType || "",
        });
      } catch (loadError) {
        setError(loadError.message || "Unable to load profile.");
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result || ""));
    reader.readAsDataURL(photoFile);
  }, [photoFile]);

  const profileImageSrc = useMemo(() => {
    return photoPreview || form.profileImageUrl || "";
  }, [photoPreview, form.profileImageUrl]);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("fullName", form.fullName);
      payload.append("phoneNumber", form.phoneNumber);
      payload.append("address", form.address);
      payload.append("city", form.city);
      payload.append("state", form.state);
      payload.append("organizationName", form.organizationName);
      payload.append("foodTypeUsuallyDonated", form.foodTypeUsuallyDonated);
      payload.append("receiverOrganizationName", form.receiverOrganizationName);
      payload.append("peopleServed", String(form.peopleServed || 0));
      payload.append("totalFoodReceived", String(form.totalFoodReceived || 0));
      if (photoFile) payload.append("avatar", photoFile);

      const response = await apiFetchWithFallback("/api/users/me", {
        method: "PATCH",
        headers: { ...getAuthHeaders() },
        body: payload,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Failed to update profile.");

      setForm((prev) => ({ ...prev, ...data }));
      setPhotoFile(null);
      setSuccess(data?.message || "Profile updated successfully.");
      setCurrentProfile({
        name: data?.fullName || form.fullName,
        email: form.email,
        phone: data?.phoneNumber || form.phoneNumber,
        role: form.accountType,
      });
    } catch (saveError) {
      setError(saveError.message || "Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");
    try {
      const response = await apiFetchWithFallback("/api/users/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(passwordState),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Failed to change password.");
      setSuccess(data?.message || "Password changed.");
      setPasswordState({ currentPassword: "", newPassword: "" });
    } catch (changeError) {
      setError(changeError.message || "Unable to change password.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Delete account permanently? This cannot be undone.");
    if (!confirmed) return;
    setError("");
    try {
      const response = await apiFetchWithFallback("/api/users/me", {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Failed to delete account.");
      clearSession();
      clearCurrentProfile();
      navigate("/login");
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete account.");
    }
  };

  const handleLogout = () => {
    clearSession();
    clearCurrentProfile();
    navigate("/login");
  };

  if (isLoading) {
    return <div className="min-h-screen p-8 text-sm text-[#6f7368]">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl rounded-2xl border border-[#ece6d7] bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-extrabold text-[#2f2d26]">Profile</h1>
        <p className="mt-1 text-sm text-[#7a7467]">Manage your personal and account details.</p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-[#eee7d8] p-4">
            <div className="h-36 w-36 overflow-hidden rounded-full border border-[#e5dece] bg-[#f8f4ea]">
              {profileImageSrc ? (
                <img src={profileImageSrc} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[#948c79]">No photo</div>
              )}
            </div>
            <input type="file" accept="image/*" className="mt-3 w-full text-xs" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
            <p className="mt-2 text-xs text-[#8e8674]">User ID: {form.userId}</p>
            <p className="text-xs text-[#8e8674]">Account: {form.accountType}</p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Full Name" />
            <input className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm bg-[#faf7ef]" value={form.email} readOnly placeholder="Email" />
            <input className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm" value={form.phoneNumber} onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))} placeholder="Phone Number" />
            <input className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Address" />
            <input className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="City" />
            <input className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm" value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} placeholder="State" />

            {isDonor ? (
              <>
                <input className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm" value={form.organizationName} onChange={(e) => setForm((p) => ({ ...p, organizationName: e.target.value }))} placeholder="Organization Name" />
                <input className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm" value={form.foodTypeUsuallyDonated} onChange={(e) => setForm((p) => ({ ...p, foodTypeUsuallyDonated: e.target.value }))} placeholder="Food Type Usually Donated" />
                <input className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm bg-[#faf7ef]" value={`Total Donations: ${form.totalDonationsCount}`} readOnly />
                <input className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm bg-[#faf7ef]" value={`Rating: ${form.donorRating || 0}`} readOnly />
              </>
            ) : null}

            {isReceiver ? (
              <>
                <input className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm" value={form.receiverOrganizationName} onChange={(e) => setForm((p) => ({ ...p, receiverOrganizationName: e.target.value }))} placeholder="NGO/Organization Name" />
                <input className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm" value={form.peopleServed} onChange={(e) => setForm((p) => ({ ...p, peopleServed: e.target.value }))} placeholder="People Served" />
                <input className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm" value={form.totalFoodReceived} onChange={(e) => setForm((p) => ({ ...p, totalFoodReceived: e.target.value }))} placeholder="Total Food Received" />
                <input className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm bg-[#faf7ef]" value={`Rating: ${form.receiverRating || 0}`} readOnly />
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={handleSave} disabled={isSaving} className="rounded-xl bg-[#2f9f6a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#248c5a] disabled:opacity-60">
            {isSaving ? "Saving..." : "Edit Profile / Save"}
          </button>
          <button type="button" onClick={handleLogout} className="rounded-xl border border-[#ddccb0] px-4 py-2 text-sm font-semibold text-[#6b6252]">Logout</button>
          <button type="button" onClick={handleDeleteAccount} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600">Delete Account</button>
        </div>

        <div className="mt-8 rounded-xl border border-[#eee5d1] p-4">
          <p className="text-sm font-semibold text-[#4f493d]">Change Password</p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="password" className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm" placeholder="Current Password" value={passwordState.currentPassword} onChange={(e) => setPasswordState((p) => ({ ...p, currentPassword: e.target.value }))} />
            <input type="password" className="h-11 rounded-xl border border-[#e8e0cf] px-3 text-sm" placeholder="New Password" value={passwordState.newPassword} onChange={(e) => setPasswordState((p) => ({ ...p, newPassword: e.target.value }))} />
          </div>
          <button type="button" onClick={handleChangePassword} className="mt-3 rounded-xl bg-[#4d7fca] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3f6db1]">Change Password</button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mt-4 text-sm text-green-700">{success}</p> : null}
      </div>
    </div>
  );
};

export default Profile;

