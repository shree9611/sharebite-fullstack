import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell.jsx";
import Avatar from "./Avatar.jsx";
import { getCurrentProfile } from "../lib/profile.js";

const PROFILE_EVENT = "sharebite.profileUpdated";

const resolveProfileAvatar = (profile) => {
  return (
    profile?.profileImageUrl ||
    profile?.profileImage ||
    profile?.avatarUrl ||
    profile?.avatar ||
    profile?.profileImageDataUrl ||
    ""
  );
};

const Navbar = ({
  right = null,
  showNotifications = false,
  showProfile = false,
  onProfileClick,
}) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => getCurrentProfile());

  useEffect(() => {
    const handleProfileUpdated = () => setProfile(getCurrentProfile());
    const handleStorage = (event) => {
      if (event?.key && event.key !== "sharebite.currentProfile") return;
      handleProfileUpdated();
    };

    window.addEventListener(PROFILE_EVENT, handleProfileUpdated);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(PROFILE_EVENT, handleProfileUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const avatarSrc = useMemo(() => resolveProfileAvatar(profile), [profile]);

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-[#e6eee9] bg-white">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 md:px-10">
        <div className="flex items-center gap-2 text-[#111815]">
          <span className="material-symbols-outlined text-green-600 text-[28px]">
            volunteer_activism
          </span>
          <span className="text-lg font-bold leading-tight tracking-tight">ShareBite</span>
        </div>

        <div className="flex items-center gap-2">
          {showNotifications ? <NotificationBell /> : null}
          {showProfile ? (
            <button
              type="button"
              onClick={onProfileClick || (() => navigate("/profile"))}
              aria-label="Profile"
              title="Profile"
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#e6eee9] bg-white"
            >
              <Avatar src={avatarSrc} alt="Profile" size={36} />
            </button>
          ) : null}
          {right}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
