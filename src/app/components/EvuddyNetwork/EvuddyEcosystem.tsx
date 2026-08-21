"use client";

type Pt = { sx: number; sy: number };

const OX = 720;
const OY = 360;
const UX = 44;
const UY = 25;

function iso(x: number, y: number, z = 0): Pt {
  return {
    sx: OX + (x - y) * UX,
    sy: OY + (x + y) * UY - z,
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
      <ellipse cx={p.sx} cy={p.sy + 6} rx="16" ry="7" fill="#0F172A" opacity="0.1" />
      <rect x={p.sx - 3} y={p.sy - 22} width="6" height="26" rx="1" fill="#7A4A22" />
      <circle cx={p.sx} cy={p.sy - 36} r="18" fill="#3F9A4F" />
      <circle cx={p.sx - 10} cy={p.sy - 30} r="11" fill="#4ADE80" />
      <circle cx={p.sx + 10} cy={p.sy - 29} r="10" fill="#22C55E" />
    </g>
  );
}

function Person({ x, y, shirt }: { x: number; y: number; shirt: string }) {
  const p = iso(x, y);
  return (
    <g>
      <ellipse cx={p.sx} cy={p.sy + 4} rx="9" ry="4" fill="#0F172A" opacity="0.12" />
      <circle cx={p.sx} cy={p.sy - 28} r="6" fill="#F6D7B0" />
      <rect x={p.sx - 7} y={p.sy - 21} width="14" height="16" rx="3" fill={shirt} />
      <rect x={p.sx - 5.5} y={p.sy - 5} width="4.5" height="11" rx="1" fill="#1E293B" />
      <rect x={p.sx + 1} y={p.sy - 5} width="4.5" height="11" rx="1" fill="#1E293B" />
    </g>
  );
}

function Scooter({ x, y, flip }: { x: number; y: number; flip?: boolean }) {
  const p = iso(x, y);
  return (
    <g transform={`translate(${p.sx} ${p.sy}) scale(${flip ? -1.35 : 1.35} 1.35)`}>
      <ellipse cx="0" cy="5" rx="16" ry="4.5" fill="#0F172A" opacity="0.12" />
      <ellipse cx="-13" cy="3" rx="6" ry="3.2" fill="#111827" />
      <ellipse cx="15" cy="3" rx="6" ry="3.2" fill="#111827" />
      <path d="M-11 1 L17 1 L15 -5 L-7 -5 Z" fill="#EC2A8C" />
      <path d="M13 -5 L16 1 L18 -12 L14 -18 L11 -11 Z" fill="#18B368" />
      <rect x="12" y="-20" width="11" height="3" rx="1" fill="#0F172A" />
    </g>
  );
}

function Line({ from, to }: { from: Pt; to: Pt }) {
  const mx = (from.sx + to.sx) / 2;
  const my = (from.sy + to.sy) / 2 - 40;
  return (
    <path
      d={`M${from.sx} ${from.sy} Q ${mx} ${my} ${to.sx} ${to.sy}`}
      fill="none"
      stroke="#18B368"
      strokeWidth="3"
      className="evuddy-net-line"
    />
  );
}

function RidingScooter({ delay, flip }: { delay: string; flip?: boolean }) {
  return (
    <g>
      <animateMotion dur="16s" begin={delay} repeatCount="indefinite" rotate="0">
        <mpath href="#evuddy-eco-road" />
      </animateMotion>
      <g transform={`scale(${flip ? -1.45 : 1.45} 1.45) translate(${flip ? 12 : -12} -6)`}>
        <ellipse cx="-13" cy="3" rx="6" ry="3.2" fill="#111827" />
        <ellipse cx="15" cy="3" rx="6" ry="3.2" fill="#111827" />
        <path d="M-11 1 L17 1 L15 -5 L-7 -5 Z" fill="#EC2A8C" />
        <path d="M13 -5 L16 1 L18 -12 L14 -18 L11 -11 Z" fill="#18B368" />
        <rect x="12" y="-20" width="11" height="3" rx="1" fill="#0F172A" />
      </g>
    </g>
  );
}

export default function EvuddyEcosystem() {
  const hq = iso(5.2, 4.0, 150);
  const pickup = iso(0.2, 5.4, 10);
  const hub = iso(5.4, 7.6, 78);
  const charge = iso(10.4, 6.2, 42);
  const partner = iso(0.6, 1.4, 12);
  const gps = iso(10.0, 2.2, 10);
  const solar = iso(2.6, 10.4, 10);

  return (
    <div className="relative h-[58vh] min-h-[440px] w-full overflow-hidden bg-[linear-gradient(180deg,#EAF4FB_0%,#F7FBFD_42%,#EEF6F2_100%)] sm:h-[68vh] lg:h-[82vh]">
      <style>{`
        @keyframes evuddy-net {
          to { stroke-dashoffset: -56; }
        }
        @keyframes evuddy-cam {
          0%, 100% { transform: scale(1.08) translate(0, 0); }
          50% { transform: scale(1.16) translate(-1.4%, 1.1%); }
        }
        .evuddy-net-line {
          stroke-dasharray: 9 11;
          animation: evuddy-net 1.4s linear infinite;
          filter: drop-shadow(0 0 5px rgba(24,179,104,0.5));
        }
        .evuddy-cam {
          transform-origin: 50% 48%;
          animation: evuddy-cam 22s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-net-line, .evuddy-cam { animation: none; }
        }
      `}</style>

      <svg
        viewBox="80 40 1280 740"
        preserveAspectRatio="xMidYMid slice"
        className="evuddy-cam absolute inset-0 h-full w-full"
        role="img"
        aria-label="EVUDDY live ecosystem"
      >
        <defs>
          <pattern id="evuddy-big-grid" width="36" height="20" patternUnits="userSpaceOnUse">
            <path d="M18 0 L36 10 L18 20 L0 10 Z" fill="none" stroke="#D7DEE6" strokeWidth="0.9" />
          </pattern>
          <filter id="evuddy-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1440" height="820" fill="#F4F7FA" />
        <rect width="1440" height="820" fill="url(#evuddy-big-grid)" opacity="0.9" />

        {/* Roads spanning the city */}
        <path d={poly([iso(-2.4, 6.15), iso(13.2, 6.15), iso(13.2, 7.55), iso(-2.4, 7.55)])} fill="#D5DDE4" />
        <path d={poly([iso(-2.1, 6.4), iso(12.9, 6.4), iso(12.9, 7.3), iso(-2.1, 7.3)])} fill="#9AA3AE" />
        <path d={poly([iso(5.55, -0.4), iso(6.85, -0.4), iso(6.85, 12.2), iso(5.55, 12.2)])} fill="#D5DDE4" />
        <path d={poly([iso(5.8, -0.1), iso(6.6, -0.1), iso(6.6, 11.9), iso(5.8, 11.9)])} fill="#9AA3AE" />
        <path
          id="evuddy-eco-road"
          d={`M${iso(-1.6, 6.85).sx} ${iso(-1.6, 6.85).sy} L${iso(12.4, 6.85).sx} ${iso(12.4, 6.85).sy}`}
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeDasharray="14 12"
        />

        <g filter="url(#evuddy-glow)">
          <Line from={hq} to={pickup} />
          <Line from={hq} to={hub} />
          <Line from={hq} to={charge} />
          <Line from={hq} to={partner} />
          <Line from={hq} to={gps} />
          <Line from={hq} to={solar} />
        </g>

        {/* Spread city blocks */}
        <Box x={-1.6} y={-0.2} w={1.7} d={1.5} h={78} top="#F4F8FF" front="#E4EDF7" side="#C9D8E8" />
        <Box x={0.4} y={-0.4} w={1.55} d={1.45} h={108} top="#FBFDFF" front="#EEF3F9" side="#C2D3E4" />
        <Box x={2.2} y={-0.15} w={1.4} d={1.3} h={70} top="#F8FBFF" front="#EAF0F6" side="#C7D7E6" />
        <Box x={8.2} y={-0.3} w={1.8} d={1.55} h={124} top="#F3FAF6" front="#E7F4EC" side="#B7D5C4" />
        <Box x={10.2} y={0.2} w={1.5} d={1.35} h={88} top="#FBFDFF" front="#F2F6FA" side="#C5D6E4" />
        <Box x={11.8} y={1.4} w={1.35} d={1.2} h={64} top="#F7FAFC" front="#EEF2F6" side="#C3D2DF" />
        <Box x={10.0} y={8.2} w={1.9} d={1.55} h={68} top="#FFF1F7" front="#FCE7F1" side="#E8A0C0" />
        <Box x={8.4} y={8.6} w={1.4} d={1.25} h={52} top="#FDF2F8" front="#FCE7F3" side="#F0ABD0" />
        <Box x={-2.0} y={8.0} w={2.15} d={1.7} h={58} top="#E2E8F0" front="#334155" side="#1E293B" />
        <Box x={11.4} y={4.6} w={1.3} d={1.15} h={56} top="#ECFDF5" front="#D1FAE5" side="#86EFAC" />

        <Box x={0.15} y={1.05} w={1.55} d={1.35} h={46} top="#DCFCE7" front="#0F172A" side="#16A34A" />

        <path
          d={poly([iso(-1.4, 4.55), iso(2.6, 4.55), iso(2.6, 6.35), iso(-1.4, 6.35)])}
          fill="#F8FAFC"
          stroke="#18B368"
          strokeWidth="2"
          strokeDasharray="8 6"
        />
        <Box x={-0.9} y={4.75} w={1.25} d={1.1} h={28} top="#E2E8F0" front="#94A3B8" side="#64748B" />

        <Box x={4.15} y={2.7} w={2.7} d={2.35} h={148} top="#E8F8EE" front="#D7EEE0" side="#A9D4B8" />
        <Box x={4.4} y={2.95} w={2.2} d={1.85} h={96} top="#FFFFFF" front="#0F172A" side="#16A34A" />
        <circle cx={hq.sx} cy={hq.sy - 12} r="9" fill="#18B368" />
        <circle cx={hq.sx} cy={hq.sy - 12} r="18" fill="#18B368" opacity="0.22" />

        <Box x={4.45} y={6.7} w={2.15} d={1.9} h={78} top="#22C55E" front="#0F172A" side="#16A34A" />
        <Box x={4.25} y={6.5} w={2.55} d={2.25} h={16} top="#86EFAC" front="#16A34A" side="#15803D" />

        <Box x={9.7} y={5.45} w={2.0} d={1.55} h={44} top="#ECFDF5" front="#D1FAE5" side="#6EE7B7" />

        <Box x={1.2} y={9.7} w={1.15} d={0.9} h={14} top="#93C5FD" front="#1E3A8A" side="#1D4ED8" />
        <Box x={2.5} y={9.85} w={1.15} d={0.9} h={14} top="#93C5FD" front="#1E3A8A" side="#1D4ED8" />
        <Box x={3.8} y={9.7} w={1.15} d={0.9} h={14} top="#93C5FD" front="#1E3A8A" side="#1D4ED8" />
        <Box x={2.5} y={10.85} w={1.15} d={0.9} h={14} top="#7DD3FC" front="#1E3A8A" side="#2563EB" />

        <text
          x={iso(5.5, 4.7, 58).sx}
          y={iso(5.5, 4.7, 58).sy}
          textAnchor="middle"
          fill="#6EE7A8"
          fontSize="16"
          fontWeight="800"
        >
          EVUDDY
        </text>
        <text
          x={iso(5.5, 7.6, 42).sx}
          y={iso(5.5, 7.6, 42).sy}
          textAnchor="middle"
          fill="#18B368"
          fontSize="18"
          fontWeight="800"
          letterSpacing="2"
        >
          HUB
        </text>
        <text
          x={iso(10.7, 6.2, 22).sx}
          y={iso(10.7, 6.2, 22).sy}
          textAnchor="middle"
          fill="#15803D"
          fontSize="12"
          fontWeight="800"
        >
          EV CHARGE
        </text>
        <text
          x={iso(-0.9, 8.85, 28).sx}
          y={iso(-0.9, 8.85, 28).sy}
          textAnchor="middle"
          fill="#E2E8F0"
          fontSize="11"
          fontWeight="700"
        >
          NAGAR STN
        </text>

        <Tree x={-1.8} y={1.8} />
        <Tree x={2.0} y={0.9} />
        <Tree x={7.4} y={0.4} />
        <Tree x={12.4} y={2.2} />
        <Tree x={12.8} y={8.8} />
        <Tree x={-1.6} y={10.0} />
        <Tree x={6.8} y={10.6} />
        <Tree x={4.0} y={0.2} />
        <Tree x={9.0} y={10.2} />

        <Person x={0.85} y={1.7} shirt="#18B368" />
        <Person x={3.7} y={6.35} shirt="#EC2A8C" />
        <Person x={9.2} y={6.55} shirt="#0F172A" />
        <Person x={7.0} y={7.7} shirt="#22C55E" />
        <Person x={10.6} y={2.55} shirt="#EC2A8C" />

        <Scooter x={-0.2} y={5.55} />
        <Scooter x={1.1} y={5.85} flip />
        <Scooter x={2.0} y={5.5} />
        <Scooter x={10.2} y={2.55} />
        <RidingScooter delay="0s" />
        <RidingScooter delay="5.5s" flip />
        <RidingScooter delay="11s" />
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#EAF4FB] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#EEF6F2] to-transparent" />

      <div className="absolute left-4 top-[18%] max-w-[260px] rounded-2xl bg-white/95 px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.10)] sm:left-10 sm:max-w-[300px]">
        <p className="text-sm font-black text-[#0F172A] sm:text-base">Live GPS for riders and partners</p>
        <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">Every hub, pickup yard and street ride on one network.</p>
      </div>
      <div className="absolute bottom-[14%] right-4 max-w-[260px] rounded-2xl bg-white/95 px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.10)] sm:right-10 sm:max-w-[300px]">
        <p className="text-sm font-black text-[#0F172A] sm:text-base">Book. Pickup. Return.</p>
        <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">EVUDDY hubs with OTP, charge points and a scooter you can ride today.</p>
      </div>
    </div>
  );
}
