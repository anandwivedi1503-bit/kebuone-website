"use client";

import { useMemo } from "react";

const RAY_COLORS = ["#FBBF24", "#FB923C", "#F97316", "#FDE68A"];

/** Sunrise sun disc with soft rays for Chhath poster header */
export function ChhathSunRays() {
  const rays = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        rotate: i * 30,
        delay: `${(i * 0.18) % 1.2}s`,
        color: RAY_COLORS[i % RAY_COLORS.length],
      })),
    []
  );

  return (
    <div className="evuddy-chhath-sun" aria-hidden>
      {rays.map((ray, i) => (
        <span
          key={i}
          className="evuddy-chhath-sun__ray"
          style={{
            transform: `rotate(${ray.rotate}deg)`,
            background: `linear-gradient(180deg, ${ray.color}, transparent)`,
            animationDelay: ray.delay,
          }}
        />
      ))}
      <span className="evuddy-chhath-sun__disc" />
    </div>
  );
}

/** Riverside offering row — stylised soop + diyas */
export function ChhathOfferingRow() {
  return (
    <div className="evuddy-chhath-offerings" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="evuddy-chhath-soop">
          <span className="evuddy-chhath-soop__basket" />
          <span className="evuddy-chhath-soop__fruit" />
        </span>
      ))}
    </div>
  );
}

/** Horizontal garland under poster headline */
export function ChhathMarigoldBand() {
  return (
    <svg className="evuddy-chhath-marigold" viewBox="0 0 400 16" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="chhath-marigold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0" />
          <stop offset="20%" stopColor="#F97316" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="80%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 8 Q50 2 100 8 T200 8 T300 8 T400 8"
        fill="none"
        stroke="url(#chhath-marigold)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
