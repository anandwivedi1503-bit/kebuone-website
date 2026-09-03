export function GpsScooterMark({ className = "" }: { className?: string }) {
  return (
    <g className={className}>
      <g transform="translate(-28 -16)">
        <circle cx="12" cy="24" r="6" fill="#1C1917" />
        <circle cx="12" cy="24" r="2.4" fill="#F7F4EE" />
        <circle cx="40" cy="24" r="6" fill="#1C1917" />
        <circle cx="40" cy="24" r="2.4" fill="#F7F4EE" />
        <path d="M16 23h16" stroke="#1C1917" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M32 22 L38 10 H46" stroke="#1C1917" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="17" y="11" width="16" height="9" rx="2" fill="#F4C430" />
        <rect x="17" y="16.5" width="16" height="4.5" fill="#1F8A78" />
        <rect x="28" y="6" width="8" height="3.2" rx="1.2" fill="#1C1917" />
        <path d="M24 11 V7" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="5.5" r="2.4" fill="#1F6B4A" />
      </g>
    </g>
  );
}
