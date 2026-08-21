"use client";

import { useState } from "react";
import { useEvuddySideSrc } from "../Hero/useEvuddySideSrc";

type Pt = { sx: number; sy: number };

const OX = 720;
const OY = 370;
const UX = 46;
const UY = 26.5;

function iso(x: number, y: number, z = 0): Pt {
  return {
    sx: OX + (x - y) * UX,
    sy: OY + (x + y) * UY - z,
  };
}

function poly(pts: Pt[]) {
  return pts.map((p, i) => `${i ? "L" : "M"}${p.sx.toFixed(1)} ${p.sy.toFixed(1)}`).join(" ") + " Z";
}

function Slab({
  x,
  y,
  w,
  d,
  fill,
  stroke,
  dash,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  fill: string;
  stroke?: string;
  dash?: string;
}) {
  return (
    <path
      d={poly([iso(x, y), iso(x + w, y), iso(x + w, y + d), iso(x, y + d)])}
      fill={fill}
      stroke={stroke}
      strokeWidth={stroke ? 1.6 : 0}
      strokeDasharray={dash}
    />
  );
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
  windows,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  top: string;
  front: string;
  side: string;
  windows?: boolean;
}) {
  const a = iso(x, y, h);
  const b = iso(x + w, y, h);
  const c = iso(x + w, y + d, h);
  const e = iso(x, y + d, h);
  const af = iso(x, y, 0);
  const bf = iso(x + w, y, 0);
  const cf = iso(x + w, y + d, 0);
  const ef = iso(x, y + d, 0);
  const cols = Math.max(2, Math.round(w * 2));
  const rows = Math.max(2, Math.round(h / 22));
  const panes = [];
  if (windows) {
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const u0 = (col + 0.18) / cols;
        const u1 = (col + 0.78) / cols;
        const v0 = (row + 0.22) / rows;
        const v1 = (row + 0.72) / rows;
        const lerp = (p: Pt, q: Pt, t: number) => ({ sx: p.sx + (q.sx - p.sx) * t, sy: p.sy + (q.sy - p.sy) * t });
        const topL = lerp(a, e, u0);
        const topR = lerp(a, e, u1);
        const botL = lerp(af, ef, u0);
        const botR = lerp(af, ef, u1);
        const p0 = lerp(topL, botL, v0);
        const p1 = lerp(topR, botR, v0);
        const p2 = lerp(topR, botR, v1);
        const p3 = lerp(topL, botL, v1);
        panes.push(<path key={`${row}-${col}`} d={poly([p0, p1, p2, p3])} fill="#9BD7F0" opacity="0.85" />);
      }
    }
  }
  return (
    <g>
      <path d={poly([iso(x - 0.04, y - 0.04), iso(x + w + 0.08, y - 0.04), iso(x + w + 0.08, y + d + 0.08), iso(x - 0.04, y + d + 0.08)])} fill="#0F172A" opacity="0.07" />
      <path d={poly([e, c, cf, ef])} fill={side} />
      <path d={poly([a, e, ef, af])} fill={front} />
      <path d={poly([b, c, cf, bf])} fill={side} opacity="0.9" />
      <path d={poly([a, b, c, e])} fill={top} />
      {panes}
    </g>
  );
}

function Tree({ x, y }: { x: number; y: number }) {
  const p = iso(x, y);
  return (
    <g>
      <ellipse cx={p.sx} cy={p.sy + 8} rx="18" ry="7" fill="#0F172A" opacity="0.1" />
      <path d={`M${p.sx - 3} ${p.sy + 4} L${p.sx + 3} ${p.sy + 4} L${p.sx + 2} ${p.sy - 18} L${p.sx - 2} ${p.sy - 18} Z`} fill="#6B3F1F" />
      <ellipse cx={p.sx} cy={p.sy - 28} rx="16" ry="14" fill="#3FA35A" />
      <ellipse cx={p.sx - 8} cy={p.sy - 24} rx="10" ry="9" fill="#5BC56F" />
      <ellipse cx={p.sx + 8} cy={p.sy - 24} rx="9" ry="8" fill="#2F8F4A" />
    </g>
  );
}

function Person({ x, y, shirt }: { x: number; y: number; shirt: string }) {
  const p = iso(x, y);
  return (
    <g>
      <ellipse cx={p.sx} cy={p.sy + 5} rx="8" ry="3.2" fill="#0F172A" opacity="0.12" />
      <circle cx={p.sx} cy={p.sy - 24} r="5.2" fill="#F3C7A4" />
      <path d={`M${p.sx - 6} ${p.sy - 18} Q${p.sx} ${p.sy - 20} ${p.sx + 6} ${p.sy - 18} L${p.sx + 5} ${p.sy - 4} L${p.sx - 5} ${p.sy - 4} Z`} fill={shirt} />
      <rect x={p.sx - 5} y={p.sy - 4} width="4" height="10" rx="1.2" fill="#1E293B" />
      <rect x={p.sx + 1} y={p.sy - 4} width="4" height="10" rx="1.2" fill="#1E293B" />
    </g>
  );
}

function Scooter({ x, y, flip, src }: { x: number; y: number; flip?: boolean; src: string }) {
  const p = iso(x, y);
  if (!src) return null;
  return (
    <g transform={`translate(${p.sx} ${p.sy})`}>
      <ellipse cx="0" cy="7" rx="22" ry="5" fill="#0F172A" opacity="0.16" />
      <g transform={`scale(${flip ? -1 : 1} 1)`}>
        <image href={src} x="-38" y="-34" width="76" height="40" preserveAspectRatio="xMidYMid meet" />
      </g>
    </g>
  );
}

function Line({ from, to }: { from: Pt; to: Pt }) {
  const mx = (from.sx + to.sx) / 2;
  const my = Math.min(from.sy, to.sy) - 36;
  return (
    <path
      d={`M${from.sx} ${from.sy} Q ${mx} ${my} ${to.sx} ${to.sy}`}
      fill="none"
      stroke="#18B368"
      strokeWidth="1.8"
      opacity="0.45"
      className="evuddy-net-line"
    />
  );
}

function RidingScooter({ delay, src }: { delay: string; src: string }) {
  if (!src) return null;
  return (
    <g>
      <animateMotion dur="18s" begin={delay} repeatCount="indefinite" rotate="0">
        <mpath href="#evuddy-eco-road" />
      </animateMotion>
      <ellipse cx="0" cy="8" rx="22" ry="5" fill="#0F172A" opacity="0.16" />
      <g transform="scale(-1 1)">
        <image href={src} x="-40" y="-36" width="80" height="42" preserveAspectRatio="xMidYMid meet" />
      </g>
    </g>
  );
}

export default function EvuddyEcosystem() {
  const bikeSrc = useEvuddySideSrc();
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const big = pinned || hover;
  const hq = iso(5.1, 3.6, 132);
  const pickup = iso(0.4, 4.9, 8);
  const hub = iso(5.15, 7.15, 62);
  const charge = iso(9.7, 5.7, 36);
  const partner = iso(0.7, 1.15, 10);
  const gps = iso(9.6, 2.05, 8);
  const solar = iso(2.4, 9.7, 8);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={big}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => setPinned((open) => !open)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setPinned((open) => !open);
        }
      }}
      className={`relative w-full cursor-zoom-in overflow-hidden bg-[linear-gradient(180deg,#E8F3FB_0%,#F6FBFE_48%,#EEF7F2_100%)] transition-[height,min-height] duration-500 ease-out ${
        big
          ? "h-[72vh] min-h-[520px] cursor-zoom-out sm:h-[80vh]"
          : "h-[34vh] min-h-[260px] sm:h-[40vh] sm:min-h-[340px] lg:h-[44vh]"
      }`}
    >
      <style>{`
        @keyframes evuddy-net {
          to { stroke-dashoffset: -56; }
        }
        .evuddy-net-line {
          stroke-dasharray: 8 12;
          animation: evuddy-net 1.6s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-net-line { animation: none; }
        }
      `}</style>

      <svg
        viewBox="0 0 1440 820"
        preserveAspectRatio="xMidYMid meet"
        className={`absolute inset-0 h-full w-full transition-transform duration-500 ease-out ${
          big ? "scale-100" : "scale-[0.94]"
        }`}
        role="img"
        aria-label="EVUDDY live ecosystem"
      >
        <defs>
          <linearGradient id="iso-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E7F2FB" />
            <stop offset="1" stopColor="#F4FAF7" />
          </linearGradient>
        </defs>

        <rect width="1440" height="820" fill="url(#iso-sky)" />
        <path d={poly([iso(-3.2, -1.6), iso(14.6, -1.6), iso(14.6, 12.4), iso(-3.2, 12.4)])} fill="#E6EEF4" />
        <path d={poly([iso(-2.4, -0.7), iso(13.6, -0.7), iso(13.6, 11.5), iso(-2.4, 11.5)])} fill="#F3F7FA" />

        {/* Avenue + cross street with curbs */}
        <Slab x={-2.6} y={5.85} w={16.2} d={1.55} fill="#C9D3DC" />
        <Slab x={-2.4} y={6.05} w={15.8} d={1.15} fill="#AAB4BE" />
        <Slab x={4.95} y={-0.9} w={1.45} d={12.4} fill="#C9D3DC" />
        <Slab x={5.15} y={-0.7} w={1.05} d={12} fill="#AAB4BE" />
        <path
          id="evuddy-eco-road"
          d={`M${iso(-2.1, 6.62).sx} ${iso(-2.1, 6.62).sy} L${iso(12.8, 6.62).sx} ${iso(12.8, 6.62).sy}`}
          fill="none"
          stroke="white"
          strokeWidth="3.2"
          strokeDasharray="16 12"
          strokeLinecap="round"
        />

        <g>
          <Line from={hq} to={pickup} />
          <Line from={hq} to={hub} />
          <Line from={hq} to={charge} />
          <Line from={hq} to={partner} />
          <Line from={hq} to={gps} />
          <Line from={hq} to={solar} />
        </g>

        <Box x={-1.7} y={-0.35} w={1.55} d={1.4} h={86} top="#FFFFFF" front="#EDF3F8" side="#C8D6E2" windows />
        <Box x={0.15} y={-0.5} w={1.45} d={1.35} h={112} top="#FBFDFF" front="#F2F7FB" side="#C3D2DF" windows />
        <Box x={1.85} y={-0.2} w={1.3} d={1.2} h={74} top="#FFFFFF" front="#EEF4F9" side="#CAD7E2" windows />
        <Box x={7.7} y={-0.45} w={1.7} d={1.45} h={128} top="#F5FBF8" front="#EAF5EF" side="#BFD4C8" windows />
        <Box x={9.6} y={0.15} w={1.4} d={1.25} h={92} top="#FFFFFF" front="#F3F7FB" side="#C7D5E0" windows />
        <Box x={11.2} y={1.25} w={1.25} d={1.15} h={68} top="#FAFCFE" front="#F0F5F8" side="#CCD7E0" windows />
        <Box x={9.5} y={8.05} w={1.75} d={1.4} h={70} top="#F7FBFF" front="#ECF3F8" side="#C5D3DE" windows />
        <Box x={-2.05} y={7.85} w={2.05} d={1.6} h={58} top="#E6EDF3" front="#3A4858" side="#24303C" />

        {/* Partner kiosk */}
        <Box x={0.2} y={0.85} w={1.4} d={1.2} h={42} top="#DCFCE7" front="#0F172A" side="#16A34A" />

        {/* Pickup yard */}
        <Slab x={-1.55} y={4.15} w={4.15} d={1.95} fill="#D7E0E8" />
        <Slab x={-1.4} y={4.3} w={3.85} d={1.65} fill="#F7FAFC" stroke="#18B368" dash="7 6" />
        <Box x={-1.15} y={4.4} w={1.15} d={0.95} h={24} top="#E2E8F0" front="#94A3B8" side="#64748B" />

        {/* HQ */}
        <Box x={3.95} y={2.35} w={2.55} d={2.15} h={132} top="#F2FAF5" front="#E4F3EA" side="#B7D4C2" windows />
        <Box x={4.2} y={2.6} w={2.05} d={1.65} h={86} top="#FFFFFF" front="#0F172A" side="#16A34A" />
        <circle cx={hq.sx} cy={hq.sy - 8} r="8" fill="#18B368" />
        <circle cx={hq.sx} cy={hq.sy - 8} r="16" fill="#18B368" opacity="0.18" />

        {/* Hub kiosk + canopy */}
        <Box x={4.25} y={6.45} w={2.0} d={1.7} h={66} top="#22C55E" front="#0F172A" side="#16A34A" />
        <Box x={4.05} y={6.25} w={2.4} d={2.05} h={14} top="#86EFAC" front="#16A34A" side="#15803D" />

        {/* Charge bay */}
        <Box x={9.15} y={5.15} w={1.85} d={1.4} h={40} top="#ECFDF5" front="#D1FAE5" side="#6EE7B7" />

        {/* Solar row */}
        <Box x={1.05} y={9.25} w={1.05} d={0.8} h={12} top="#93C5FD" front="#1E3A8A" side="#1D4ED8" />
        <Box x={2.25} y={9.4} w={1.05} d={0.8} h={12} top="#93C5FD" front="#1E3A8A" side="#1D4ED8" />
        <Box x={3.45} y={9.25} w={1.05} d={0.8} h={12} top="#93C5FD" front="#1E3A8A" side="#1D4ED8" />

        <text x={iso(5.2, 4.35, 52).sx} y={iso(5.2, 4.35, 52).sy} textAnchor="middle" fill="#6EE7A8" fontSize="15" fontWeight="800">
          EVUDDY
        </text>
        <text x={iso(5.25, 7.25, 36).sx} y={iso(5.25, 7.25, 36).sy} textAnchor="middle" fill="#18B368" fontSize="16" fontWeight="800" letterSpacing="2">
          HUB
        </text>
        <text x={iso(10.05, 5.85, 20).sx} y={iso(10.05, 5.85, 20).sy} textAnchor="middle" fill="#15803D" fontSize="11" fontWeight="800">
          EV CHARGE
        </text>
        <text x={iso(-1.0, 8.65, 28).sx} y={iso(-1.0, 8.65, 28).sy} textAnchor="middle" fill="#E2E8F0" fontSize="10" fontWeight="700">
          NAGAR STN
        </text>

        <Tree x={-1.85} y={1.55} />
        <Tree x={1.85} y={0.7} />
        <Tree x={7.05} y={0.25} />
        <Tree x={12.15} y={2.05} />
        <Tree x={12.35} y={8.45} />
        <Tree x={-1.55} y={9.55} />
        <Tree x={6.55} y={10.05} />

        <Person x={0.85} y={1.45} shirt="#18B368" />
        <Person x={3.55} y={6.15} shirt="#EC2A8C" />
        <Person x={8.75} y={6.25} shirt="#0F172A" />
        <Person x={9.85} y={2.35} shirt="#22C55E" />

        <Scooter x={-0.35} y={5.05} src={bikeSrc} />
        <Scooter x={0.7} y={5.25} src={bikeSrc} flip />
        <Scooter x={1.7} y={5.05} src={bikeSrc} />
        <Scooter x={9.55} y={2.45} src={bikeSrc} />
        <RidingScooter delay="0s" src={bikeSrc} />
        <RidingScooter delay="6s" src={bikeSrc} />
        <RidingScooter delay="12s" src={bikeSrc} />
      </svg>

      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {big ? "Click to shrink" : "Hover or click to expand"}
      </p>

      {big ? (
        <>
          <div className="pointer-events-none absolute left-4 top-[16%] max-w-[260px] rounded-2xl bg-white/95 px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.10)] sm:left-10 sm:max-w-[300px]">
            <p className="text-sm font-black text-[#0F172A] sm:text-base">Live GPS for riders and partners</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">Every hub, pickup yard and street ride on one network.</p>
          </div>
          <div className="pointer-events-none absolute bottom-[14%] right-4 max-w-[260px] rounded-2xl bg-white/95 px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.10)] sm:right-10 sm:max-w-[300px]">
            <p className="text-sm font-black text-[#0F172A] sm:text-base">Book. Pickup. Return.</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">EVUDDY hubs with OTP, charge points and a scooter you can ride today.</p>
          </div>
        </>
      ) : null}
    </div>
  );
}
