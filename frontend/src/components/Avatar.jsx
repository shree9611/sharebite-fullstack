import React, { useMemo, useState } from "react";
import defaultAvatar from "../assets/default-avatar.svg";
import { resolveAssetUrl } from "../lib/api.js";

const Avatar = ({ src, alt = "Avatar", size = 36, className = "" }) => {
  const resolvedSrc = useMemo(() => resolveAssetUrl(src || ""), [src]);
  const [hasError, setHasError] = useState(false);
  const fallbackSrc = defaultAvatar;
  const finalSrc = !hasError && resolvedSrc ? resolvedSrc : fallbackSrc;

  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-full ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      <img
        src={finalSrc}
        alt={alt}
        width={size}
        height={size}
        className="h-full w-full object-cover"
        onError={() => setHasError(true)}
        loading="lazy"
        decoding="async"
      />
    </span>
  );
};

export default Avatar;
