export function GpsScooterMark({ className = "" }: { className?: string }) {
  return (
    <g className={className}>
      <g transform="translate(-22 -14)">
        <circle cx="10" cy="22" r="5" fill="#1C1917" />
        <circle cx="10" cy="22" r="2.2" fill="#F7F4EE" />
        <circle cx="32" cy="22" r="5" fill="#1C1917" />
        <circle cx="32" cy="22" r="2.2" fill="#F7F4EE" />
        <path d="M12 20.5h14.5L32 10h6" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
        <rect x="14" y="9" width="14" height="8" rx="1.6" fill="#F4C430" />
        <rect x="14" y="14.5" width="14" height="4.5" fill="#1F8A78" />
        <path d="M21 9V6.5h6" stroke="#1C1917" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="21" cy="5.4" r="2.2" fill="#1F6B4A" />
      </g>
    </g>
  );
}
