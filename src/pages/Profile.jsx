import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetchWithFallback, getAuthHeaders, resolveAssetUrl } from "../lib/api.js";
import { clearSession } from "../lib/auth.js";
import { clearCurrentProfile, setCurrentProfile } from "../lib/profile.js";

const initialForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
  address: "",
  city: "",
  state: "",
  accountType: "",
  userId: "",
  profileImage: "",
  profileImageUrl: "",
  organizationName: "",
  foodTypeUsuallyDonated: "",
  totalDonationsCount: 0,
  donorRating: 0,
  receiverOrganizationName: "",
  peopleServed: 0,
  totalFoodReceived: 0,
  receiverRating: 0,
  role: "",
};

const readOnlyInputClass =
  "h-12 w-full rounded-xl border border-[#dfe7dd] bg-[#f6f8f5] px-4 text-sm text-[#4f5a4d]";
const editableInputClass =
  "h-12 w-full rounded-xl border border-[#d7e2d6] bg-white px-4 text-sm text-[#1e2a1f] outline-none transition focus:border-[#7bcf9f] focus:ring-2 focus:ring-[#dff4e7]";

const Profile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [hasImageLoadError, setHasImageLoadError] = useState(false);
  const [isPasswordPanelOpen, setIsPasswordPanelOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordState, setPasswordState] = useState({ currentPassword: "", newPassword: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const isDonor = form.accountType === "Donor";
  const isReceiver = form.accountType === "Receiver";
  const stateOptions = [
    "Andhra Pradesh",
    "Delhi",
    "Karnataka",
    "Kerala",
    "Maharashtra",
    "Tamil Nadu",
    "Telangana",
    "Uttar Pradesh",
    "West Bengal",
  ];
  const donorFoodTags = useMemo(
    () =>
      String(form.foodTypeUsuallyDonated || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    [form.foodTypeUsuallyDonated]
  );
  const verificationBadge = isDonor
    ? "Verified Donor"
    : isReceiver
      ? "Verified Receiver"
      : "Verified Volunteer";

  const apiRequestAcrossPaths = async (paths, options = {}) => {
    let lastResponseData = {};
    for (const path of paths) {
      const response = await apiFetchWithFallback(path, options);
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        return { response, data };
      }
      if (![404, 405].includes(response.status)) {
        return { response, data };
      }
      lastResponseData = data;
    }
    return { response: { ok: false }, data: lastResponseData };
  };

  const syncNavbarProfile = (profileData) => {
    setCurrentProfile({
      name: profileData?.fullName || "",
      email: profileData?.email || "",
      phone: profileData?.phoneNumber || "",
      role: profileData?.accountType || "",
      profileImage: profileData?.profileImage || "",
      profileImageUrl: profileData?.profileImageUrl || "",
      city: profileData?.city || "",
      state: profileData?.state || "",
      address: profileData?.address || "",
    });
  };

  const loadProfile = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("sharebite.token");
      if (!token) {
        clearSession();
        clearCurrentProfile();
        navigate("/login");
        return;
      }

      const { response, data } = await apiRequestAcrossPaths(["/api/users/profile", "/api/users/me"], {
        headers: { ...getAuthHeaders() },
      });
      if (!response.ok) {
        if (response.status === 401) {
          clearSession();
          clearCurrentProfile();
          navigate("/login");
          return;
        }
        throw new Error(data?.message || "Failed to load profile.");
      }
      setForm((prev) => ({ ...prev, ...data }));
      syncNavbarProfile(data);
      setHasImageLoadError(false);
    } catch (loadError) {
      if (loadError instanceof TypeError) {
        setError("Failed to fetch profile. Please check server connection.");
      } else {
        setError(loadError.message || "Unable to load profile.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const profileImageSrc = useMemo(
    () => (hasImageLoadError ? "" : resolveAssetUrl(photoPreview || form.profileImageUrl || form.profileImage || "")),
    [hasImageLoadError, photoPreview, form.profileImage, form.profileImageUrl]
  );

  const handleImageChange = (event) => {
    setError("");
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png"]);
    if (!allowedTypes.has(String(file.type || "").toLowerCase())) {
      setError("Only JPG, JPEG, and PNG images are allowed.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoFile(file);
      setPhotoPreview(String(reader.result || ""));
      setHasImageLoadError(false);
    };
    reader.onerror = () => setError("Failed to preview selected image.");
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("fullName", String(form.fullName || "").trim());
      payload.append("phoneNumber", String(form.phoneNumber || "").trim());
      payload.append("address", String(form.address || "").trim());
      payload.append("city", String(form.city || "").trim());
      payload.append("state", String(form.state || "").trim());

      if (isDonor) {
        payload.append("organizationName", String(form.organizationName || "").trim());
        payload.append("foodTypeUsuallyDonated", String(form.foodTypeUsuallyDonated || "").trim());
      }

      if (isReceiver) {
        payload.append("receiverOrganizationName", String(form.receiverOrganizationName || "").trim());
      }

      if (photoFile) payload.append("avatar", photoFile);

      const { response, data } = await apiRequestAcrossPaths(["/api/users/profile", "/api/users/me"], {
        method: "PATCH",
        headers: { ...getAuthHeaders() },
        body: payload,
      });

      if (!response.ok) throw new Error(data?.message || "Failed to update profile.");

      const mergedProfile = { ...form, ...data };
      setForm(mergedProfile);
      syncNavbarProfile(mergedProfile);
      setPhotoFile(null);
      setPhotoPreview("");
      setHasImageLoadError(false);
      setSuccess(data?.message || "Profile updated successfully.");
    } catch (saveError) {
      if (saveError instanceof TypeError) {
        setError("Failed to fetch while saving profile. Please check connection.");
      } else {
        setError(saveError.message || "Unable to update profile.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!passwordState.currentPassword || !passwordState.newPassword) {
      setError("Current password and new password are required.");
      return;
    }
    if (String(passwordState.newPassword).length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { response, data } = await apiRequestAcrossPaths(["/api/users/profile/password", "/api/users/me/password"], {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(passwordState),
      });
      if (!response.ok) throw new Error(data?.message || "Failed to change password.");
      setPasswordState({ currentPassword: "", newPassword: "" });
      setIsPasswordPanelOpen(false);
      setSuccess(data?.message || "Password changed successfully.");
    } catch (changeError) {
      if (changeError instanceof TypeError) {
        setError("Failed to fetch while changing password.");
      } else {
        setError(changeError.message || "Unable to change password.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    clearCurrentProfile();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    setError("");
    setIsDeletingAccount(true);
    try {
      const { response, data } = await apiRequestAcrossPaths(["/api/users/profile", "/api/users/me"], {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      if (!response.ok) throw new Error(data?.message || "Failed to delete account.");
      clearSession();
      clearCurrentProfile();
      navigate("/login");
    } catch (deleteError) {
      if (deleteError instanceof TypeError) {
        setError("Failed to fetch while deleting account.");
      } else {
        setError(deleteError.message || "Unable to delete account.");
      }
      setShowDeleteModal(false);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f5f2] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl rounded-3xl border border-[#dde7dc] bg-white p-6 text-sm text-[#6f7368] shadow-sm">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f2] px-4 py-8 sm:px-6 md:py-10 lg:px-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-[#dde7dc] bg-white p-5 shadow-[0_20px_50px_-30px_rgba(24,66,33,0.35)] sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-[#f3f7f2] shadow-md">
            {profileImageSrc ? (
              <img
                src={profileImageSrc}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={() => setHasImageLoadError(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[#809280]">
                <span className="material-symbols-outlined text-4xl">account_circle</span>
              </div>
            )}
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-[#1f2b1f]">{form.fullName || "Profile"}</h1>
          <span className="mt-2 inline-flex items-center rounded-full bg-[#eaf7ef] px-3 py-1 text-[11px] font-bold text-[#1f8a49]">
            {verificationBadge}
          </span>
          <div className="mt-4 w-full max-w-xs">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="w-full text-xs text-[#5d705f]"
              onChange={handleImageChange}
              disabled={isSaving}
            />
            <p className="mt-1 text-[11px] text-[#819182]">JPG, JPEG, PNG only. Max 5MB.</p>
          </div>
        </div>

        {error ? <p className="mt-5 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="mt-5 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

        <section className="mt-8 border-t border-[#e6eee4] pt-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#243324]">
            <span className="material-symbols-outlined text-[18px] text-[#2f9f6a]">badge</span>
            Basic Information
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#5d6d5d]">Full Name</label>
              <input
                className={editableInputClass}
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#5d6d5d]">Phone Number</label>
              <input
                className={editableInputClass}
                value={form.phoneNumber}
                onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#5d6d5d]">Address</label>
              <input
                className={editableInputClass}
                value={form.address}
                onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#5d6d5d]">City</label>
              <input
                className={editableInputClass}
                value={form.city}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#5d6d5d]">State</label>
              <select
                className={editableInputClass}
                value={form.state}
                onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}
              >
                <option value="">Select state</option>
                {stateOptions.map((stateName) => (
                  <option key={stateName} value={stateName}>
                    {stateName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="mt-8 border-t border-[#e6eee4] pt-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#243324]">
            <span className="material-symbols-outlined text-[18px] text-[#2f9f6a]">lock</span>
            System Details
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#5d6d5d]">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Email
              </label>
              <input className={readOnlyInputClass} value={form.email} readOnly />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#5d6d5d]">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Account Type
              </label>
              <input className={readOnlyInputClass} value={form.accountType} readOnly />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#5d6d5d]">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                User ID
              </label>
              <input className={readOnlyInputClass} value={form.userId} readOnly />
            </div>
          </div>
        </section>

        {isDonor ? (
          <section className="mt-8 border-t border-[#e6eee4] pt-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#243324]">
              <span className="material-symbols-outlined text-[18px] text-[#2f9f6a]">bar_chart</span>
              Organization Impact
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#5d6d5d]">Organization Name</label>
                  <input
                    className={editableInputClass}
                    value={form.organizationName}
                    onChange={(event) => setForm((prev) => ({ ...prev, organizationName: event.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#5d6d5d]">Food Types Donated</label>
                  <input
                    className={editableInputClass}
                    value={form.foodTypeUsuallyDonated}
                    placeholder="Perishables, Canned Goods, Prepared Meals"
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, foodTypeUsuallyDonated: event.target.value }))
                    }
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {donorFoodTags.length > 0 ? (
                      donorFoodTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex rounded-full border border-[#cde8d6] bg-[#edf8f1] px-3 py-1 text-[11px] font-semibold text-[#2f8f58]"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#7b8b7b]">Add food types separated by commas.</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-[#d6eadc] bg-[#f2fbf5] p-4">
                  <p className="text-xs font-semibold text-[#5d6d5d]">Total Donations</p>
                  <p className="mt-1 text-3xl font-black text-[#1f8a49]">{Number(form.totalDonationsCount || 0)}</p>
                </div>
                <div className="rounded-2xl border border-[#dce6f7] bg-[#f4f8ff] p-4">
                  <p className="text-xs font-semibold text-[#5d6d5d]">Partner Rating</p>
                  <p className="mt-1 flex items-center gap-1 text-2xl font-black text-[#1d4ed8]">
                    <span className="material-symbols-outlined text-[20px]">star</span>
                    {Number(form.donorRating || 0)}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-8 border-t border-[#e6eee4] pt-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#243324]">
            <span className="material-symbols-outlined text-[18px] text-[#2f9f6a]">security</span>
            Security & Actions
          </h2>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 text-sm">
              <button
                type="button"
                onClick={() => setIsPasswordPanelOpen((prev) => !prev)}
                className="w-fit text-left font-semibold text-[#2f78bd] hover:underline"
              >
                Change Password
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-fit text-left font-semibold text-[#4d5b4e] hover:underline"
              >
                Logout
              </button>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="h-11 rounded-xl border border-red-300 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
              >
                Delete Account
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="h-11 rounded-xl bg-[#2f9f6a] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#248c5a] disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </section>

        {isPasswordPanelOpen ? (
          <div className="mt-6 rounded-xl border border-[#dde6f0] bg-[#f8fbff] p-4">
            <p className="text-sm font-semibold text-[#2f4665]">Change Password</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="password"
                className={editableInputClass}
                placeholder="Current Password"
                value={passwordState.currentPassword}
                onChange={(event) =>
                  setPasswordState((prev) => ({ ...prev, currentPassword: event.target.value }))
                }
              />
              <input
                type="password"
                className={editableInputClass}
                placeholder="New Password"
                value={passwordState.newPassword}
                onChange={(event) =>
                  setPasswordState((prev) => ({ ...prev, newPassword: event.target.value }))
                }
              />
            </div>
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="mt-3 rounded-xl bg-[#4d7fca] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3f6db1] disabled:opacity-60"
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        ) : null}
      </div>

      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#2f2d26]">Delete Account</h3>
            <p className="mt-2 text-sm text-[#6d6658]">
              This action is permanent and cannot be undone. Do you want to continue?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeletingAccount}
                className="rounded-xl border border-[#ddd2bf] px-4 py-2 text-sm font-semibold text-[#665f52] hover:bg-[#f8f3ea] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isDeletingAccount ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Profile;
