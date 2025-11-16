import React from "react";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
}

const Logo: React.FC<LogoProps> = ({ className = "", variant = "dark" }) => {
  const fillColor = variant === "light" ? "#ffffff" : "#1d1d1f";

  return (
    <svg
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Modern D with hexagon shape */}
      <path
        d="M8 8L16 4L24 8V16L16 20L8 16V8Z"
        fill="url(#gradient1)"
        stroke={fillColor}
        strokeWidth="0.5"
      />
      <path
        d="M12 12L16 10L20 12V16L16 18L12 16V12Z"
        fill={fillColor}
        fillOpacity="0.1"
      />

      {/* Text: davnex */}
      <text
        x="30"
        y="26"
        fill={fillColor}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="18"
        fontWeight="600"
        letterSpacing="-0.5"
      >
        davnex
      </text>

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="gradient1" x1="8" y1="4" x2="24" y2="20">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;
