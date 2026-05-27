import React from "react";

interface VanguardCarIconProps {
  className?: string;
  size?: number;
}

/**
 * Cyberpunk-style car SVG icon — the unified Vanguard Botics brand icon.
 * Extracted from Login.tsx to be reused across all views.
 */
const VanguardCarIcon: React.FC<VanguardCarIconProps> = ({ className = "", size = 36 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 34 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
  >
    {/* Aggressive Car Body Silhouette */}
    <path d="M 31 17 L 24 14 L 18 10 L 12 10 L 6 13 L 2 14 L 2 21 L 4 21" />
    <path d="M 12 21 L 20 21" />
    <path d="M 28 21 L 30 21 L 31 17" />

    {/* Sleek Angular Side Window */}
    <path d="M 18 10 L 23 14 L 8 14 L 12 10 Z" />

    {/* Cyberpunk Racing Number "67" */}
    <g strokeWidth="0.8">
      <path d="M 15.5 15 L 13.5 15 L 12.5 19 L 14.5 19 L 15 17 L 13 17" />
      <path d="M 16.5 15 L 18.5 15 L 17.5 19" />
    </g>

    {/* Massive Cyberpunk Rear Spoiler */}
    <path d="M 6 13 L 4 8 L 10 8 L 12 10" />

    {/* Front Splitter & Rear Diffuser */}
    <line x1="27" y1="22" x2="33" y2="22" />
    <line x1="1" y1="22" x2="5" y2="22" />

    {/* Headlight & Taillight Slits */}
    <path d="M 28 15 L 31 16" strokeWidth="2" />
    <path d="M 2 15 L 4 15" strokeWidth="2" />

    {/* Futuristic Crosshair Wheels */}
    <circle cx="8" cy="21" r="3.5" />
    <circle cx="8" cy="21" r="1" />
    <line x1="4.5" y1="21" x2="11.5" y2="21" />
    <line x1="8" y1="17.5" x2="8" y2="24.5" />

    <circle cx="24" cy="21" r="3.5" />
    <circle cx="24" cy="21" r="1" />
    <line x1="20.5" y1="21" x2="27.5" y2="21" />
    <line x1="24" y1="17.5" x2="24" y2="24.5" />
  </svg>
);

export default VanguardCarIcon;
