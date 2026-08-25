"use client";

import { useId } from "react";
import { useEvuddySideSrc } from "./useEvuddySideSrc";

/** Classic 2:1 isometric city — BatterySmart language, EVUDDY brand. */
const OX = 640;
const OY = 92;
const UX = 28;
const UY = 14;
const VB_W = 1280;
const VB_H = 640;

type Pt = { x: number; y: number };

function iso(x: number, y: number): Pt {
  return { x: OX + (x - y) * UX, y: OY + (x + y) * UY };
}

function diamond(x: number, y: number, s = 1) {
  const a = iso(x, y);
  const b = iso(x + s, y);
  const c = iso(x + s, y + s);
  const d = iso(x, y + s);
  return `${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y} ${d.x},${d.y}`;
}

function isoLine(points: Array<[number, number]>) {
  return points
    .map(([x, y], i) => {
      const p = iso(x, y);
      return `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    })
    .join(" ");
}

function roadFill(x0: number, y0: number, x1: number, y1: number) {
  const a = iso(x0, y0);
  const b = iso(x1, y0);
  const c = iso(x1, y1);
  const d = iso(x0, y1);
  return `${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y} ${d.x},${d.y}`;
}

function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function Box({
  x,
  y,
  w,
  d,
  h,
  top,
  left,
  right,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  top: string;
  left: string;
  right: string;
}) {
  const p = [iso(x, y), iso(x + w, y), iso(x + w, y + d), iso(x, y + d)];
  const q = p.map((pt) => ({ x: pt.x, y: pt.y - h }));
  const shadow = iso(x + w * 0.55, y + d * 0.7);
  return (
    <g>
      <ellipse cx={shadow.x} cy={shadow.y + 4} rx={w * UX * 0.55} ry={d * UY * 0.7} fill="rgba(15,23,42,0.10)" />
      <polygon
        points={`${p[3].x},${p[3].y} ${p[2].x},${p[2].y} ${q[2].x},${q[2].y} ${q[3].x},${q[3].y}`}
        fill={left}
      />
      <polygon
        points={`${p[1].x},${p[1].y} ${p[2].x},${p[2].y} ${q[2].x},${q[2].y} ${q[1].x},${q[1].y}`}
        fill={right}
      />
      <polygon
        points={`${q[0].x},${q[0].y} ${q[1].x},${q[1].y} ${q[2].x},${q[2].y} ${q[3].x},${q[3].y}`}
        fill={top}
      />
    </g>
  );
}

function FaceWindows({
  x,
  y,
  w,
  d,
  h,
  cols,
  rows,
  tone = "#E8F2FB",
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  cols: number;
  rows: number;
  tone?: string;
}) {
  const p1 = iso(x + w, y);
  const p2 = iso(x + w, y + d);
  const p3 = iso(x, y + d);
  const items = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u0 = (c + 0.22) / cols;
      const u1 = (c + 0.78) / cols;
      const v0 = (r + 0.22) / rows;
      const v1 = (r + 0.78) / rows;
      const b0 = lerp(p1, p2, u0);
      const b1 = lerp(p1, p2, u1);
      const a = { x: b0.x, y: b0.y - h * (1 - v0) };
      const b = { x: b1.x, y: b1.y - h * (1 - v0) };
      const c2 = { x: b1.x, y: b1.y - h * (1 - v1) };
      const e = { x: b0.x, y: b0.y - h * (1 - v1) };
      items.push(
        <polygon
          key={`r-${r}-${c}`}
          points={`${a.x},${a.y} ${b.x},${b.y} ${c2.x},${c2.y} ${e.x},${e.y}`}
          fill={tone}
          opacity="0.78"
        />
      );
    }
  }
  const leftCols = Math.max(2, cols - 1);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < leftCols; c++) {
      const u0 = (c + 0.22) / leftCols;
      const u1 = (c + 0.78) / leftCols;
      const v0 = (r + 0.22) / rows;
      const v1 = (r + 0.78) / rows;
      const b0 = lerp(p3, p2, u0);
      const b1 = lerp(p3, p2, u1);
      const a = { x: b0.x, y: b0.y - h * (1 - v0) };
      const b = { x: b1.x, y: b1.y - h * (1 - v0) };
      const c2 = { x: b1.x, y: b1.y - h * (1 - v1) };
      const e = { x: b0.x, y: b0.y - h * (1 - v1) };
      items.push(
        <polygon
          key={`l-${r}-${c}`}
          points={`${a.x},${a.y} ${b.x},${b.y} ${c2.x},${c2.y} ${e.x},${e.y}`}
          fill={tone}
          opacity="0.55"
        />
      );
    }
  }
  return <g>{items}</g>;
}

function Building({
  x,
  y,
  w,
  d,
  h,
  top,
  left,
  right,
  rows,
  cols,
  glass,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  top: string;
  left: string;
  right: string;
  rows: number;
  cols: number;
  glass?: string;
}) {
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={h} top={top} left={left} right={right} />
      <FaceWindows x={x} y={y} w={w} d={d} h={h} cols={cols} rows={rows} tone={glass} />
    </g>
  );
}

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const p = iso(x, y);
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${scale})`}>
      <ellipse cx="0" cy="5" rx="12" ry="4.2" fill="rgba(15,23,42,0.10)" />
      <ellipse cx="0" cy="-13" rx="15" ry="13" fill="#2F9E57" />
      <ellipse cx="5" cy="-20" rx="10" ry="8" fill="#5BD67A" />
    </g>
  );
}

function Person({ x, y, shirt }: { x: number; y: number; shirt: string }) {
  const p = iso(x, y);
  return (
    <g transform={`translate(${p.x} ${p.y})`}>
      <ellipse cx="0" cy="3" rx="5" ry="1.8" fill="rgba(15,23,42,0.12)" />
      <rect x="-2.3" y="-13" width="4.6" height="10" rx="1.5" fill={shirt} />
      <circle cx="0" cy="-16.5" r="3" fill="#F3C6A4" />
      <rect x="-2.1" y="-4" width="1.8" height="6.5" rx="0.7" fill="#1E3A5F" />
      <rect x="0.4" y="-4" width="1.8" height="6.5" rx="0.7" fill="#1E3A5F" />
    </g>
  );
}

function IsoScooter({ color = "#18B368" }: { color?: string }) {
  return (
    <g>
      <ellipse cx="0" cy="6" rx="16" ry="4" fill="rgba(15,23,42,0.14)" />
      <circle cx="-11" cy="4" r="5" fill="#111827" />
      <circle cx="12" cy="4" r="5" fill="#111827" />
      <circle cx="-11" cy="4" r="2.1" fill="#94A3B8" />
      <circle cx="12" cy="4" r="2.1" fill="#94A3B8" />
      <path d="M-10 1 L-4 -2 L8 -2 L14 2 L10 5 L-8 5 Z" fill={color} />
      <path d="M-2 -2 L1 -11 L6 -11 L8 -2" fill="#0F172A" />
      <rect x="5" y="-13" width="2.2" height="12" rx="0.8" fill="#0F172A" />
      <rect x="4.2" y="-15" width="6" height="2.4" rx="1" fill="#EC2A8C" />
    </g>
  );
}

function HubKiosk({ x, y, label }: { x: number; y: number; label: string }) {
  const w = 1.2;
  const d = 1.05;
  const h = 78;
  const p1 = iso(x + w, y);
  const p2 = iso(x + w, y + d);
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={h} top="#1A4E86" left="#0C2744" right="#143A66" />
      <Box x={x + 0.08} y={y + 0.08} w={1.04} d={0.88} h={7} top="#22C55E" left="#14532D" right="#16A34A" />
      {[0, 1, 2, 3].map((n) => {
        const u0 = 0.18;
        const u1 = 0.82;
        const v0 = (n + 0.35) / 5;
        const v1 = (n + 0.78) / 5;
        const b0 = lerp(p1, p2, u0);
        const b1 = lerp(p1, p2, u1);
        const a = { x: b0.x, y: b0.y - h * (1 - v0) };
        const b = { x: b1.x, y: b1.y - h * (1 - v0) };
        const c = { x: b1.x, y: b1.y - h * (1 - v1) };
        const e = { x: b0.x, y: b0.y - h * (1 - v1) };
        return (
          <polygon
            key={n}
            className="evuddy-iso-slot"
            points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y} ${e.x},${e.y}`}
            fill="#4ADE80"
          />
        );
      })}
      <text
        x={iso(x + 0.6, y + 0.4).x}
        y={iso(x + 0.6, y + 0.4).y - 88}
        textAnchor="middle"
        fill="#0F172A"
        fontSize="8"
        fontWeight="800"
        fontFamily="system-ui,sans-serif"
      >
        {label}
      </text>
    </g>
  );
}

function Callout({
  x,
  y,
  dx,
  dy,
  title,
  width = 168,
}: {
  x: number;
  y: number;
  dx: number;
  dy: number;
  title: string;
  width?: number;
}) {
  const p = iso(x, y);
  const bx = p.x + dx;
  const by = p.y + dy;
  return (
    <g className="evuddy-iso-callout">
      <line x1={p.x} y1={p.y - 36} x2={bx} y2={by + 28} stroke="#CBD5E1" strokeWidth="1.4" />
      <rect
        x={bx - width / 2}
        y={by}
        width={width}
        height="36"
        rx="18"
        fill="#fff"
        stroke="#E8EEF4"
        filter="drop-shadow(0 8px 12px rgba(15,23,42,0.10))"
      />
      <text
        x={bx}
        y={by + 23}
        textAnchor="middle"
        fill="#0F172A"
        fontSize="11"
        fontWeight="700"
        fontFamily="system-ui,sans-serif"
      >
        {title}
      </text>
    </g>
  );
}

function RideScooter({
  d,
  duration,
  delay = 0,
  color,
}: {
  d: string;
  duration: number;
  delay?: number;
  color: string;
}) {
  return (
    <g>
      <animateMotion
        path={d}
        dur={`${duration}ms`}
        begin={`${-delay}ms`}
        repeatCount="indefinite"
        rotate="0"
      />
      <g transform="scale(0.72)">
        <IsoScooter color={color} />
      </g>
    </g>
  );
}

function ParkedPhoto({ src, x, y }: { src: string; x: number; y: number }) {
  const p = iso(x, y);
  const w = 34;
  const h = 20;
  return (
    <image
      href={src}
      x={p.x - w / 2}
      y={p.y - h + 2}
      width={w}
      height={h}
      preserveAspectRatio="xMidYMid meet"
      style={{ filter: "drop-shadow(2px 3px 3px rgba(15,23,42,0.18))" }}
    />
  );
}

const AVE: Array<[number, number]> = [
  [0.6, 8.15],
  [19.4, 8.15],
];
const CROSS: Array<[number, number]> = [
  [10.15, 1.1],
  [10.15, 15.2],
];
const LOOP: Array<[number, number]> = [
  [3.4, 8.15],
  [10.15, 8.15],
  [10.15, 12.55],
  [16.2, 12.55],
  [16.2, 8.15],
  [10.15, 8.15],
  [3.4, 8.15],
];
const SPUR: Array<[number, number]> = [
  [4.2, 4.15],
  [10.15, 4.15],
  [10.15, 8.15],
];

export default function HeroCityRide() {
  const src = useEvuddySideSrc();
  const uid = useId().replace(/:/g, "");

  return (
    <div className="relative mx-auto mt-3 w-full max-w-[1280px] sm:mt-5">
      <style>{`
        @keyframes evuddy-iso-cloud {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(16px); }
        }
        @keyframes evuddy-iso-slot {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @keyframes evuddy-iso-dash {
          to { stroke-dashoffset: -52; }
        }
        @keyframes evuddy-iso-callout {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes evuddy-ride {
          from { offset-distance: 0%; }
          to { offset-distance: 100%; }
        }
        .evuddy-ride {
          offset-rotate: 0deg;
          offset-anchor: 0px 0px;
          animation-name: evuddy-ride;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .evuddy-iso-slot { animation: evuddy-iso-slot 1.7s ease-in-out infinite; }
        .evuddy-iso-dash { animation: evuddy-iso-dash 1.1s linear infinite; }
        .evuddy-iso-callout { animation: evuddy-iso-callout 4.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-iso-clouds, .evuddy-iso-slot, .evuddy-iso-dash, .evuddy-iso-callout, .evuddy-ride {
            animation: none !important;
          }
        }
      `}</style>

      <div className="relative h-[270px] overflow-hidden sm:h-[430px] lg:h-[540px]">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F3F7FB" />
            </linearGradient>
          </defs>

          <rect width={VB_W} height={VB_H} fill={`url(#${uid}-sky)`} />

          {[-4, 0, 4, 8, 12, 16, 20].map((gx) =>
            [-2, 2, 6, 10, 14].map((gy) => (
              <polygon
                key={`${gx}-${gy}`}
                points={diamond(gx, gy, 4)}
                fill="none"
                stroke="rgba(148,163,184,0.16)"
                strokeWidth="1"
              />
            ))
          )}

          <g className="evuddy-iso-clouds" fill="#E6EEF5" opacity="0.95">
            <g transform="translate(170 64)">
              <ellipse cx="0" cy="0" rx="24" ry="11" />
              <ellipse cx="16" cy="-3" rx="16" ry="9" />
            </g>
            <g transform="translate(990 52)">
              <ellipse cx="0" cy="0" rx="20" ry="10" />
              <ellipse cx="14" cy="-2" rx="14" ry="8" />
            </g>
            <g transform="translate(560 40)">
              <ellipse cx="0" cy="0" rx="16" ry="8" />
              <ellipse cx="12" cy="-2" rx="12" ry="7" />
            </g>
          </g>

          <polygon points={diamond(11.8, 3.7, 3.1)} fill="#F0F7F3" />
          <polygon points={diamond(12.2, 10.2, 3.4)} fill="#E7F6EE" />

          <polygon points={roadFill(0.15, 7.25, 19.85, 9.05)} fill="#C9D7E6" />
          <polygon points={roadFill(9.2, 0.7, 11.1, 15.6)} fill="#C9D7E6" />
          <polygon points={roadFill(10.9, 11.7, 17.0, 13.4)} fill="#C9D7E6" />
          <polygon points={roadFill(3.6, 3.4, 11.1, 4.9)} fill="#C9D7E6" />

          <path
            className="evuddy-iso-dash"
            d={isoLine(AVE)}
            fill="none"
            stroke="#fff"
            strokeWidth="2.4"
            strokeDasharray="11 15"
            strokeLinecap="round"
          />
          <path
            className="evuddy-iso-dash"
            d={isoLine(CROSS)}
            fill="none"
            stroke="#fff"
            strokeWidth="2.4"
            strokeDasharray="11 15"
            strokeLinecap="round"
          />
          <path
            className="evuddy-iso-dash"
            d={isoLine([
              [10.9, 12.55],
              [16.8, 12.55],
            ])}
            fill="none"
            stroke="#fff"
            strokeWidth="2.1"
            strokeDasharray="10 14"
            strokeLinecap="round"
          />
          <path
            className="evuddy-iso-dash"
            d={isoLine([
              [3.8, 4.15],
              [10.2, 4.15],
            ])}
            fill="none"
            stroke="#fff"
            strokeWidth="2.1"
            strokeDasharray="10 14"
            strokeLinecap="round"
          />

          <Building x={0.9} y={1.5} w={2.3} d={1.45} h={78} top="#F4F8FC" left="#C5D4E4" right="#7E9FBE" rows={4} cols={4} />
          <Building x={3.5} y={1.2} w={2.5} d={1.55} h={108} top="#EEF4FA" left="#B7CCE2" right="#5C86B0" rows={6} cols={4} />
          <Building x={6.3} y={1.6} w={2.2} d={1.35} h={64} top="#F7FAFC" left="#D0DEEB" right="#8AA7C0" rows={3} cols={4} />
          <Building x={12.4} y={1.15} w={2.4} d={1.45} h={86} top="#F3F7FB" left="#C2D4E6" right="#7194B6" rows={4} cols={4} />
          <Building x={15.1} y={1.0} w={2.6} d={1.6} h={118} top="#EDF3F9" left="#B4C9DF" right="#547CA8" rows={6} cols={4} />
          <Building x={17.9} y={2.5} w={2.0} d={1.2} h={48} top="#ECFDF5" left="#BBF7D0" right="#18B368" rows={2} cols={3} glass="#BBF7D0" />

          <Building x={0.8} y={10.35} w={2.2} d={1.35} h={70} top="#F8FAFC" left="#CDD8E4" right="#7B93AA" rows={3} cols={4} />
          <Building x={3.3} y={10.15} w={2.5} d={1.5} h={96} top="#EEF4FA" left="#B9CDE1" right="#5F82A8" rows={5} cols={4} />
          <Building x={6.1} y={10.5} w={2.2} d={1.3} h={58} top="#FFF7ED" left="#FED7AA" right="#F97316" rows={2} cols={4} glass="#FFEDD5" />
          <Building
            x={12.35}
            y={10.05}
            w={3.15}
            d={1.65}
            h={72}
            top="#ECFDF5"
            left="#86EFAC"
            right="#18B368"
            rows={3}
            cols={5}
            glass="#BBF7D0"
          />
          <Building x={15.8} y={10.25} w={2.15} d={1.25} h={52} top="#FFF1F2" left="#FECDD3" right="#EC2A8C" rows={2} cols={3} glass="#FECDD3" />
          <Building x={18.1} y={10.55} w={1.9} d={1.15} h={44} top="#F1F5F9" left="#CBD5E1" right="#64748B" rows={2} cols={3} />

          <text
            x={iso(13.9, 10.55).x}
            y={iso(13.9, 10.55).y - 82}
            textAnchor="middle"
            fill="#0F172A"
            fontSize="11"
            fontWeight="800"
            fontFamily="system-ui,sans-serif"
          >
            EVUDDY HUB
          </text>

          <polygon points={diamond(12.05, 3.85, 2.7)} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
          <text
            x={iso(13.4, 4.05).x}
            y={iso(13.4, 4.05).y - 6}
            textAnchor="middle"
            fill="#334155"
            fontSize="9"
            fontWeight="800"
            fontFamily="system-ui,sans-serif"
          >
            YARD
          </text>

          <HubKiosk x={2.15} y={6.0} label="HUB" />
          <HubKiosk x={16.35} y={6.05} label="HUB" />
          <HubKiosk x={7.55} y={12.7} label="YARD" />
          <HubKiosk x={11.35} y={2.55} label="HUB" />

          <Tree x={0.35} y={4.4} />
          <Tree x={5.9} y={3.55} scale={0.88} />
          <Tree x={8.6} y={2.4} />
          <Tree x={14.6} y={3.3} />
          <Tree x={19.4} y={5.2} scale={0.9} />
          <Tree x={0.4} y={12.6} />
          <Tree x={8.7} y={10.9} />
          <Tree x={11.7} y={14.5} />
          <Tree x={17.4} y={14.1} />
          <Tree x={19.7} y={11.4} scale={0.85} />

          <Person x={2.0} y={5.75} shirt="#18B368" />
          <Person x={3.55} y={6.85} shirt="#EC2A8C" />
          <Person x={12.55} y={5.35} shirt="#0EA5E9" />
          <Person x={13.9} y={11.55} shirt="#18B368" />
          <Person x={8.35} y={13.55} shirt="#F59E0B" />
          <Person x={17.55} y={6.95} shirt="#0F172A" />
          <Person x={6.7} y={4.95} shirt="#6366F1" />

          {src ? (
            <>
              <ParkedPhoto src={src} x={12.45} y={5.15} />
              <ParkedPhoto src={src} x={13.15} y={5.5} />
              <ParkedPhoto src={src} x={13.85} y={5.85} />
            </>
          ) : null}

          <RideScooter d={isoLine(AVE)} duration={9000} color="#18B368" />
          <RideScooter d={isoLine(AVE)} duration={11000} delay={4500} color="#EC2A8C" />
          <RideScooter d={isoLine(CROSS)} duration={8000} delay={1200} color="#0EA5E9" />
          <RideScooter d={isoLine(LOOP)} duration={14000} delay={600} color="#18B368" />
          <RideScooter d={isoLine(SPUR)} duration={7000} delay={2000} color="#F59E0B" />

          <Callout x={2.7} y={6.2} dx={-150} dy={-118} title="Hourly to monthly EV rentals" width={186} />
          <Callout x={13.9} y={10.3} dx={210} dy={-90} title="Dense EVUDDY hub & yard network" width={214} />
          <Callout x={7.9} y={12.9} dx={-40} dy={70} title="Pickup OTP · GPS-tracked rides" width={204} />
        </svg>
      </div>
    </div>
  );
}
