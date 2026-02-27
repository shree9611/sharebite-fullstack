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
  "h-11 rounded-xl border border-[#e8e0cf] bg-[#faf7ef] px-3 text-sm text-[#5b5549]";
const editableInputClass =
  "h-11 rounded-xl border border-[#e8e0cf] bg-white px-3 text-sm text-[#1f1b13]";

const Profile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
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

  const handleToggleEditMode = () => {
    setError("");
    setSuccess("");
    if (isEditMode) {
      setPhotoFile(null);
      setPhotoPreview("");
      setHasImageLoadError(false);
      loadProfile();
      setIsEditMode(false);
      return;
    }
    setIsEditMode(true);
  };

  const handleSave = async () => {
    if (!isEditMode) return;
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
      setIsEditMode(false);
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
      <div className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#ece6d7] bg-white p-6 text-sm text-[#6f7368] shadow-sm">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl rounded-2xl border border-[#ece6d7] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-[#2f2d26]">Profile</h1>
          <p className="text-sm text-[#7a7467]">Manage your profile details and account settings.</p>
        </div>

        {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-[#eee7d8] bg-[#fffdfa] p-4">
            <div className="mx-auto h-36 w-36 overflow-hidden rounded-full border border-[#e5dece] bg-white">
              {profileImageSrc ? (
                <img
                  src={profileImageSrc}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={() => setHasImageLoadError(true)}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[#948c79]">No photo</div>
              )}
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-[#6e685c]">Profile Picture</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                className="mt-2 w-full text-xs"
                onChange={handleImageChange}
                disabled={!isEditMode || isSaving}
              />
              <p className="mt-2 text-[11px] text-[#8b8578]">JPG, JPEG, PNG only. Max 5MB.</p>
            </div>

            <div className="mt-4 space-y-2">
              <input className={readOnlyInputClass} value={`Account Type: ${form.accountType || "N/A"}`} readOnly />
              <input className={readOnlyInputClass} value={`User ID: ${form.userId || "N/A"}`} readOnly />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
            <input
              className={isEditMode ? editableInputClass : readOnlyInputClass}
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              placeholder="Full Name"
              readOnly={!isEditMode}
            />
            <input className={readOnlyInputClass} value={form.email} readOnly placeholder="Email" />
            <input
              className={isEditMode ? editableInputClass : readOnlyInputClass}
              value={form.phoneNumber}
              onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
              placeholder="Phone Number"
              readOnly={!isEditMode}
            />
            <input
              className={isEditMode ? editableInputClass : readOnlyInputClass}
              value={form.address}
              onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
              placeholder="Address"
              readOnly={!isEditMode}
            />
            <input
              className={isEditMode ? editableInputClass : readOnlyInputClass}
              value={form.city}
              onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
              placeholder="City"
              readOnly={!isEditMode}
            />
            <input
              className={isEditMode ? editableInputClass : readOnlyInputClass}
              value={form.state}
              onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}
              placeholder="State"
              readOnly={!isEditMode}
            />

            {isDonor ? (
              <>
                <input
                  className={isEditMode ? editableInputClass : readOnlyInputClass}
                  value={form.organizationName}
                  onChange={(event) => setForm((prev) => ({ ...prev, organizationName: event.target.value }))}
                  placeholder="Organization Name"
                  readOnly={!isEditMode}
                />
                <input
                  className={isEditMode ? editableInputClass : readOnlyInputClass}
                  value={form.foodTypeUsuallyDonated}
                  onChange={(event) => setForm((prev) => ({ ...prev, foodTypeUsuallyDonated: event.target.value }))}
                  placeholder="Food Type"
                  readOnly={!isEditMode}
                />
                <input className={readOnlyInputClass} value={`Total Donations: ${Number(form.totalDonationsCount || 0)}`} readOnly />
                <input className={readOnlyInputClass} value={`Rating: ${Number(form.donorRating || 0)}`} readOnly />
              </>
            ) : null}

            {isReceiver ? (
              <>
                <input
                  className={isEditMode ? editableInputClass : readOnlyInputClass}
                  value={form.receiverOrganizationName}
                  onChange={(event) => setForm((prev) => ({ ...prev, receiverOrganizationName: event.target.value }))}
                  placeholder="NGO Name"
                  readOnly={!isEditMode}
                />
                <input className={readOnlyInputClass} value={`People Served: ${Number(form.peopleServed || 0)}`} readOnly />
                <input className={readOnlyInputClass} value={`Total Food Received: ${Number(form.totalFoodReceived || 0)}`} readOnly />
                <input className={readOnlyInputClass} value={`Rating: ${Number(form.receiverRating || 0)}`} readOnly />
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-[30px] mx-auto w-full max-w-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleToggleEditMode}
              disabled={isSaving}
              className="h-12 w-full sm:flex-1 rounded-xl border border-[#2f9f6a] bg-white px-4 text-sm font-semibold text-[#2f9f6a] transition-all duration-300 ease-in-out hover:bg-[#eaf7f0] disabled:opacity-60"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isEditMode || isSaving}
              className="h-12 w-full sm:flex-1 rounded-xl bg-[#2f9f6a] px-4 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-in-out hover:bg-[#248c5a] hover:shadow-md disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="mt-3 sm:mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setIsPasswordPanelOpen((prev) => !prev)}
              className="h-12 w-full rounded-xl border border-[#9db7d9] bg-white px-4 text-sm font-semibold text-[#35527a] transition-all duration-300 ease-in-out hover:bg-[#eef5ff]"
            >
              Change Password
            </button>
          </div>

          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleLogout}
              className="h-12 w-full sm:flex-1 rounded-xl bg-[#eef1f4] px-4 text-sm font-semibold text-[#374151] transition-all duration-300 ease-in-out hover:bg-[#e2e8f0]"
            >
              Logout
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="h-12 w-full sm:flex-1 rounded-xl border border-red-300 bg-white px-4 text-sm font-semibold text-red-600 transition-all duration-300 ease-in-out hover:bg-red-600 hover:text-white"
            >
              Delete Account
            </button>
          </div>
        </div>

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
