"use client";

import { useMemo } from "react";

const LIGHT_COLORS = ["#FF9933", "#FFD700", "#E11D48", "#1F6B4A", "#F97316", "#A855F7"];

/** Mini string lights for the welcome poster header */
export function PosterStringLights() {
  const bulbs = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        color: LIGHT_COLORS[i % LIGHT_COLORS.length],
        delay: `${(i * 0.12) % 1.4}s`,
      })),
    []
  );

  return (
    <div className="evuddy-poster-lights" aria-hidden>
      <svg className="evuddy-poster-lights__wire" viewBox="0 0 600 20" preserveAspectRatio="none">
        <path
          d="M0 6 Q75 14 150 6 T300 6 T450 6 T600 6"
          fill="none"
          stroke="rgba(66, 32, 6, 0.35)"
          strokeWidth="1.2"
        />
      </svg>
      <div className="evuddy-poster-lights__bulbs">
        {bulbs.map((bulb, i) => (
          <span
            key={i}
            className="evuddy-poster-light-bulb"
            style={{
              backgroundColor: bulb.color,
              color: bulb.color,
              animationDelay: bulb.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** Stylised firecracker bundle — gold panel corner (no photo needed) */
export function PosterCrackerArt({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse cx="60" cy="88" rx="38" ry="6" fill="rgba(66,32,6,0.12)" />
      <path d="M28 75 L32 28 L36 75 Z" fill="#DC2626" />
      <path d="M28 75 L32 28 L36 75 Z" stroke="#991B1B" strokeWidth="0.8" />
      <path d="M48 78 L52 22 L56 78 Z" fill="#B91C1C" />
      <path d="M68 76 L72 30 L76 76 Z" fill="#DC2626" />
      <path d="M88 77 L92 26 L96 77 Z" fill="#EF4444" />
      <rect x="30" y="24" width="4" height="8" rx="1" fill="#FFD700" />
      <rect x="50" y="18" width="4" height="8" rx="1" fill="#FFD700" />
      <rect x="70" y="22" width="4" height="8" rx="1" fill="#FFD700" />
      <rect x="90" y="20" width="4" height="8" rx="1" fill="#FFD700" />
      <path d="M32 28 Q34 12 38 8" stroke="#FDE047" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M52 22 Q54 8 58 4" stroke="#FDE047" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="38" cy="8" r="2" fill="#FBBF24" opacity="0.9" />
      <circle cx="58" cy="4" r="2" fill="#FBBF24" opacity="0.85" />
    </svg>
  );
}

/** Small diya row under the flatlay */
export function PosterDiyaRow() {
  return (
    <div className="evuddy-poster-diya-row" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="evuddy-poster-diya" style={{ animationDelay: `${i * 0.15}s` }}>
          <span className="evuddy-poster-diya__bowl" />
          <span className="evuddy-poster-diya__flame" />
        </span>
      ))}
    </div>
  );
}
