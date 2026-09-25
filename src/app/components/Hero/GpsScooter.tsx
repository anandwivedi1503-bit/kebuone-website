/** Yellow EVUDDY scooter mark — used on GPS maps instead of a generic pin. */
export function GpsScooterMark({ className = "" }: { className?: string }) {
  return (
    <g className={className}>
      <g transform="translate(-30 -22)">
        <ellipse cx="16" cy="34" rx="11" ry="3.2" fill="#1C1917" opacity="0.18" />
        <ellipse cx="46" cy="34" rx="11" ry="3.2" fill="#1C1917" opacity="0.18" />
        <circle cx="16" cy="30" r="8" fill="#1C1917" />
        <circle cx="16" cy="30" r="3.2" fill="#F7F4EE" />
        <circle cx="46" cy="30" r="8" fill="#1C1917" />
        <circle cx="46" cy="30" r="3.2" fill="#F7F4EE" />
        <path
          d="M20 28.5 C26 27, 34 27, 40 28.5"
          stroke="#1C1917"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path d="M40 27 L48 12 H56" stroke="#1C1917" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 16 H42 C44.4 16 46 17.6 46 20 V26 H20 V18 C20 16.9 20.9 16 22 16Z" fill="#F4C430" />
        <path d="M20 22.5 H46 V26.5 H20Z" fill="#1F8A78" />
        <rect x="24" y="18" width="14" height="3.2" rx="1.2" fill="#1C1917" opacity="0.12" />
        <rect x="36" y="8" width="12" height="4" rx="1.6" fill="#1C1917" />
        <path d="M30 16 V10" stroke="#1C1917" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="30" cy="8" r="3" fill="#1F6B4A" />
        <path d="M48 12 L52 8" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
      </g>
    </g>
  );
}
