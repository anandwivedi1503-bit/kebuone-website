"use client";

type Pt = { sx: number; sy: number };

const UX = 26;
const UY = 15;

function iso(x: number, y: number, z = 0): Pt {
  return {
    sx: 560 + (x - y) * UX,
    sy: 318 + (x + y) * UY - z,
  };
}

function poly(pts: Pt[]) {
  return pts.map((p, i) => `${i ? "L" : "M"}${p.sx.toFixed(1)} ${p.sy.toFixed(1)}`).join(" ") + " Z";
}

function Box({
  x,
  y,
  w,
  d,
  h,
  top,
  front,
  side,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  top: string;
  front: string;
  side: string;
}) {
  const a = iso(x, y, h);
  const b = iso(x + w, y, h);
  const c = iso(x + w, y + d, h);
  const e = iso(x, y + d, h);
  const af = iso(x, y, 0);
  const bf = iso(x + w, y, 0);
  const cf = iso(x + w, y + d, 0);
  const ef = iso(x, y + d, 0);
  return (
    <g>
      <path d={poly([e, c, cf, ef])} fill={side} />
      <path d={poly([a, e, ef, af])} fill={front} />
      <path d={poly([b, c, cf, bf])} fill={side} opacity="0.92" />
      <path d={poly([a, b, c, e])} fill={top} />
    </g>
  );
}

function Tree({ x, y }: { x: number; y: number }) {
  const p = iso(x, y);
  return (
    <g>
      <ellipse cx={p.sx} cy={p.sy + 4} rx="11" ry="5" fill="#0F172A" opacity="0.1" />
      <rect x={p.sx - 2} y={p.sy - 16} width="4" height="18" rx="1" fill="#7A4A22" />
      <circle cx={p.sx} cy={p.sy - 26} r="13" fill="#3F9A4F" />
      <circle cx={p.sx - 7} cy={p.sy - 22} r="8" fill="#4ADE80" />
      <circle cx={p.sx + 7} cy={p.sy - 21} r="7" fill="#22C55E" />
    </g>
  );
}

function Person({ x, y, shirt }: { x: number; y: number; shirt: string }) {
  const p = iso(x, y);
  return (
    <g>
      <ellipse cx={p.sx} cy={p.sy + 3} rx="7" ry="3" fill="#0F172A" opacity="0.12" />
      <circle cx={p.sx} cy={p.sy - 20} r="4.4" fill="#F6D7B0" />
      <rect x={p.sx - 5} y={p.sy - 15} width="10" height="12" rx="2" fill={shirt} />
      <rect x={p.sx - 4} y={p.sy - 3} width="3.2" height="8" rx="1" fill="#1E293B" />
      <rect x={p.sx + 0.8} y={p.sy - 3} width="3.2" height="8" rx="1" fill="#1E293B" />
    </g>
  );
}

function Scooter({ x, y, flip }: { x: number; y: number; flip?: boolean }) {
  const p = iso(x, y);
  return (
    <g transform={`translate(${p.sx} ${p.sy}) scale(${flip ? -1 : 1} 1)`}>
      <ellipse cx="0" cy="5" rx="16" ry="4.5" fill="#0F172A" opacity="0.12" />
      <ellipse cx="-13" cy="3" rx="6" ry="3.2" fill="#111827" />
      <ellipse cx="15" cy="3" rx="6" ry="3.2" fill="#111827" />
      <path d="M-11 1 L17 1 L15 -5 L-7 -5 Z" fill="#EC2A8C" />
      <path d="M13 -5 L16 1 L18 -12 L14 -18 L11 -11 Z" fill="#18B368" />
      <rect x="12" y="-20" width="11" height="3" rx="1" fill="#0F172A" />
    </g>
  );
}

function Tag({
  x,
  y,
  title,
  note,
  accent,
}: {
  x: number;
  y: number;
  title: string;
  note: string;
  accent: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="148" height="44" rx="12" fill="white" stroke="#E2E8F0" />
      <circle cx="18" cy="22" r="6" fill={accent} />
      <text x="32" y="19" fill="#0F172A" fontSize="12" fontWeight="800">
        {title}
      </text>
      <text x="32" y="34" fill="#64748B" fontSize="10" fontWeight="600">
        {note}
      </text>
    </g>
  );
}

function Line({ from, to }: { from: Pt; to: Pt }) {
  const mx = (from.sx + to.sx) / 2;
  const my = (from.sy + to.sy) / 2 - 28;
  return (
    <path
      d={`M${from.sx} ${from.sy} Q ${mx} ${my} ${to.sx} ${to.sy}`}
      fill="none"
      stroke="#18B368"
      strokeWidth="2.4"
      className="evuddy-net-line"
    />
  );
}

export default function EvuddyEcosystem() {
  const hq = iso(4.2, 3.1, 128);
  const pickup = iso(0.4, 4.4, 8);
  const hub = iso(4.3, 6.35, 70);
  const charge = iso(8.4, 5.1, 40);
  const partner = iso(1.1, 1.2, 8);
  const gps = iso(7.6, 2.4, 8);
  const solar = iso(2.4, 8.6, 8);

  return (
    <div className="relative overflow-hidden bg-white">
      <style>{`
        @keyframes evuddy-net {
          to { stroke-dashoffset: -48; }
        }
        .evuddy-net-line {
          stroke-dasharray: 8 10;
          animation: evuddy-net 1.4s linear infinite;
          filter: drop-shadow(0 0 4px rgba(24,179,104,0.55));
        }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-net-line { animation: none; }
        }
      `}</style>

      <svg
        viewBox="0 0 1120 640"
        className="h-auto w-full"
        role="img"
        aria-label="EVUDDY ecosystem: hub, pickup yard, live GPS, partners and riders on one connected network"
      >
        <defs>
          <filter id="evuddy-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1120" height="640" fill="#F7FAFC" />

        {/* Ground diamond */}
        <path d="M560 92 L980 336 L560 580 L140 336 Z" fill="#EEF3F7" />
        <path
          d="M560 118 L940 336 L560 554 L180 336 Z"
          fill="none"
          stroke="#D5DEE6"
          strokeWidth="1"
          strokeDasharray="8 10"
        />

        {/* Roads */}
        <path
          d={poly([iso(-1.2, 4.9), iso(10.4, 4.9), iso(10.4, 6.05), iso(-1.2, 6.05)])}
          fill="#E8EEF4"
        />
        <path
          d={poly([iso(4.55, 0.6), iso(5.55, 0.6), iso(5.55, 9.4), iso(4.55, 9.4)])}
          fill="#E4EBF1"
        />
        <path
          d={`M${iso(-0.6, 5.45).sx} ${iso(-0.6, 5.45).sy} L${iso(9.8, 5.45).sx} ${iso(9.8, 5.45).sy}`}
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeDasharray="10 9"
        />

        {/* Network from HQ */}
        <g filter="url(#evuddy-glow)">
          <Line from={hq} to={pickup} />
          <Line from={hq} to={hub} />
          <Line from={hq} to={charge} />
          <Line from={hq} to={partner} />
          <Line from={hq} to={gps} />
          <Line from={hq} to={solar} />
        </g>

        {/* City fabric */}
        <Box x={-0.4} y={0.2} w={1.5} d={1.35} h={62} top="#F4F8FF" front="#E4EDF7" side="#C9D8E8" />
        <Box x={1.3} y={0.1} w={1.35} d={1.3} h={86} top="#FBFDFF" front="#EEF3F9" side="#C2D3E4" />
        <Box x={6.6} y={0.15} w={1.6} d={1.4} h={98} top="#F3FAF6" front="#E7F4EC" side="#B7D5C4" />
        <Box x={8.4} y={0.4} w={1.35} d={1.2} h={70} top="#FBFDFF" front="#F2F6FA" side="#C5D6E4" />
        <Box x={7.8} y={6.6} w={1.7} d={1.4} h={54} top="#FFF1F7" front="#FCE7F1" side="#E8A0C0" />
        <Box x={-1.2} y={6.5} w={1.9} d={1.55} h={46} top="#E2E8F0" front="#334155" side="#1E293B" />

        {/* Partner kiosk */}
        <Box x={0.5} y={0.95} w={1.35} d={1.2} h={38} top="#DCFCE7" front="#0F172A" side="#16A34A" />

        {/* Pickup yard */}
        <path
          d={poly([iso(-0.3, 3.7), iso(2.5, 3.7), iso(2.5, 5.15), iso(-0.3, 5.15)])}
          fill="#F8FAFC"
          stroke="#18B368"
          strokeDasharray="6 5"
        />
        <Box x={0.05} y={3.85} w={1.1} d={0.95} h={22} top="#E2E8F0" front="#94A3B8" side="#64748B" />

        {/* HQ */}
        <Box x={3.35} y={2.15} w={2.35} d={2.05} h={118} top="#E8F8EE" front="#D7EEE0" side="#A9D4B8" />
        <Box x={3.55} y={2.35} w={1.95} d={1.65} h={78} top="#FFFFFF" front="#0F172A" side="#16A34A" />
        <circle cx={hq.sx} cy={hq.sy - 10} r="7" fill="#18B368" />
        <circle cx={hq.sx} cy={hq.sy - 10} r="14" fill="#18B368" opacity="0.2" />

        {/* EVUDDY HUB kiosk */}
        <Box x={3.55} y={5.55} w={1.85} d={1.65} h={64} top="#22C55E" front="#0F172A" side="#16A34A" />
        <Box x={3.4} y={5.4} w={2.15} d={1.95} h={12} top="#86EFAC" front="#16A34A" side="#15803D" />

        {/* Charge canopy */}
        <Box x={7.85} y={4.55} w={1.7} d={1.35} h={36} top="#ECFDF5" front="#D1FAE5" side="#6EE7B7" />

        {/* Solar farm */}
        <Box x={1.5} y={8.05} w={0.9} d={0.7} h={10} top="#93C5FD" front="#1E3A8A" side="#1D4ED8" />
        <Box x={2.5} y={8.15} w={0.9} d={0.7} h={10} top="#93C5FD" front="#1E3A8A" side="#1D4ED8" />
        <Box x={3.5} y={8.05} w={0.9} d={0.7} h={10} top="#93C5FD" front="#1E3A8A" side="#1D4ED8" />

        {/* HQ wordmark on front face — place near projected front */}
        <text x={iso(4.5, 3.9, 48).sx} y={iso(4.5, 3.9, 48).sy} textAnchor="middle" fill="#6EE7A8" fontSize="11" fontWeight="800">
          EVUDDY
        </text>
        <text x={iso(4.52, 6.35, 34).sx} y={iso(4.52, 6.35, 34).sy} textAnchor="middle" fill="#18B368" fontSize="13" fontWeight="800" letterSpacing="2">
          HUB
        </text>
        <text x={iso(8.7, 5.2, 18).sx} y={iso(8.7, 5.2, 18).sy} textAnchor="middle" fill="#15803D" fontSize="8" fontWeight="800">
          EV CHARGE
        </text>
        <text x={iso(-0.2, 7.2, 22).sx} y={iso(-0.2, 7.2, 22).sy} textAnchor="middle" fill="#E2E8F0" fontSize="8" fontWeight="700">
          NAGAR STN
        </text>

        <Tree x={-0.6} y={1.6} />
        <Tree x={2.5} y={0.4} />
        <Tree x={6.1} y={0.5} />
        <Tree x={9.6} y={1.8} />
        <Tree x={9.8} y={7.2} />
        <Tree x={-1.1} y={8.2} />
        <Tree x={5.6} y={8.6} />

        <Person x={0.9} y={1.55} shirt="#18B368" />
        <Person x={3.1} y={5.2} shirt="#EC2A8C" />
        <Person x={7.3} y={5.55} shirt="#0F172A" />
        <Person x={5.6} y={6.5} shirt="#22C55E" />

        <Scooter x={0.6} y={4.55} />
        <Scooter x={1.5} y={4.75} flip />
        <Scooter x={5.7} y={5.35} />
        <Scooter x={6.6} y={5.55} flip />
        <Scooter x={7.9} y={2.55} />

        <Tag x={58} y={118} title="Partner" note="Fleet & hub ops" accent="#18B368" />
        <Tag x={70} y={268} title="Pickup yard" note="OTP · scooters ready" accent="#EC2A8C" />
        <Tag x={486} y={78} title="EVUDDY network" note="Live GPS · every hub" accent="#18B368" />
        <Tag x={470} y={430} title="EVUDDY Hub" note="Book · pickup · return" accent="#18B368" />
        <Tag x={820} y={168} title="Rider app" note="Track the ride" accent="#EC2A8C" />
        <Tag x={860} y={330} title="EV Charge" note="Street top-up" accent="#22C55E" />
        <Tag x={210} y={500} title="Clean energy" note="Solar on the yard" accent="#38BDF8" />
      </svg>
    </div>
  );
}
