"use client";

type BoxProps = {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  top: string;
  front: string;
  side: string;
};

/** Isometric cuboid. x/y are ground-plane coords; h is height. */
function Box({ x, y, w, d, h, top, front, side }: BoxProps) {
  const ix = (gx: number, gy: number, z = 0) => ({
    sx: 380 + (gx - gy) * 26,
    sy: 268 + (gx + gy) * 15 - z,
  });
  const a = ix(x, y, h);
  const b = ix(x + w, y, h);
  const c = ix(x + w, y + d, h);
  const e = ix(x, y + d, h);
  const af = ix(x, y, 0);
  const bf = ix(x + w, y, 0);
  const cf = ix(x + w, y + d, 0);
  const ef = ix(x, y + d, 0);
  const p = (pts: { sx: number; sy: number }[]) =>
    pts.map((pt, i) => `${i ? "L" : "M"}${pt.sx.toFixed(1)} ${pt.sy.toFixed(1)}`).join(" ") + " Z";

  return (
    <g>
      <path d={p([e, c, cf, ef])} fill={side} />
      <path d={p([a, e, ef, af])} fill={front} />
      <path d={p([b, c, cf, bf])} fill={side} opacity={0.9} />
      <path d={p([a, b, c, e])} fill={top} />
    </g>
  );
}

function Tree({ gx, gy }: { gx: number; gy: number }) {
  const sx = 380 + (gx - gy) * 26;
  const sy = 268 + (gx + gy) * 15;
  return (
    <g>
      <ellipse cx={sx} cy={sy + 6} rx="10" ry="4" fill="#0F172A" opacity="0.12" />
      <rect x={sx - 2} y={sy - 14} width="4" height="16" fill="#6B3F1F" />
      <circle cx={sx} cy={sy - 22} r="12" fill="#18B368" />
      <circle cx={sx - 7} cy={sy - 18} r="8" fill="#22C55E" />
      <circle cx={sx + 6} cy={sy - 18} r="7" fill="#16A34A" />
    </g>
  );
}

function Person({ gx, gy, shirt }: { gx: number; gy: number; shirt: string }) {
  const sx = 380 + (gx - gy) * 26;
  const sy = 268 + (gx + gy) * 15;
  return (
    <g>
      <ellipse cx={sx} cy={sy + 4} rx="6" ry="2.4" fill="#0F172A" opacity="0.12" />
      <circle cx={sx} cy={sy - 18} r="4.2" fill="#F6D7B0" />
      <rect x={sx - 4.5} y={sy - 13} width="9" height="11" rx="2" fill={shirt} />
      <rect x={sx - 3.5} y={sy - 2} width="3" height="7" rx="1" fill="#1E293B" />
      <rect x={sx + 0.5} y={sy - 2} width="3" height="7" rx="1" fill="#1E293B" />
    </g>
  );
}

function ScooterMark({ gx, gy, flip }: { gx: number; gy: number; flip?: boolean }) {
  const sx = 380 + (gx - gy) * 26;
  const sy = 268 + (gx + gy) * 15;
  return (
    <g transform={`translate(${sx} ${sy}) scale(${flip ? -1 : 1} 1)`}>
      <ellipse cx="0" cy="4" rx="16" ry="4" fill="#0F172A" opacity="0.14" />
      <image href="/evuddy-side.png" x="-28" y="-22" width="56" height="28" preserveAspectRatio="xMidYMid meet" />
    </g>
  );
}

export default function EvuddyEcosystem() {
  const road = (x1: number, y1: number, x2: number, y2: number, width: number) => {
    const ix = (gx: number, gy: number) => ({
      sx: 380 + (gx - gy) * 26,
      sy: 268 + (gx + gy) * 15,
    });
    const alongX = y1 === y2;
    const hw = width / 2;
    const corners = alongX
      ? [
          ix(x1, y1 - hw),
          ix(x2, y1 - hw),
          ix(x2, y1 + hw),
          ix(x1, y1 + hw),
        ]
      : [
          ix(x1 - hw, y1),
          ix(x2 - hw, y2),
          ix(x2 + hw, y2),
          ix(x1 + hw, y1),
        ];
    return corners.map((pt, i) => `${i ? "L" : "M"}${pt.sx.toFixed(1)} ${pt.sy.toFixed(1)}`).join(" ") + " Z";
  };

  return (
    <svg viewBox="0 0 760 420" className="h-auto w-full" role="img" aria-label="EVUDDY ecosystem: hub, pickup yard, street and live GPS rides">
      <defs>
        <pattern id="evuddy-iso-grid" width="36" height="20" patternUnits="userSpaceOnUse">
          <path d="M18 0 L36 10 L18 20 L0 10 Z" fill="none" stroke="#D7DEE6" strokeWidth="0.9" />
        </pattern>
        <linearGradient id="iso-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F8FBFD" />
          <stop offset="1" stopColor="#EEF3F7" />
        </linearGradient>
      </defs>

      <rect width="760" height="420" fill="url(#iso-sky)" />
      <rect x="40" y="40" width="680" height="340" fill="url(#evuddy-iso-grid)" opacity="0.9" />

      {/* Ground slab */}
      <path d="M380 92 L668 258 L380 424 L92 258 Z" fill="#E8EEF2" />
      <path d="M380 108 L640 258 L380 408 L120 258 Z" fill="#F4F7F9" />

      {/* Cross streets */}
      <path d={road(-2.2, 3.2, 9.4, 3.2, 1.55)} fill="#94A3B0" />
      <path d={road(4.15, 0.4, 4.15, 7.6, 1.35)} fill="#8B98A6" />
      <path d={road(-1.8, 3.2, 9.0, 3.2, 1.05)} fill="#64748B" />
      <path d={road(4.15, 0.7, 4.15, 7.3, 0.9)} fill="#5B6878" />

      {/* Dashed center lines */}
      <path
        d="M186 258 L574 258"
        fill="none"
        stroke="white"
        strokeDasharray="11 9"
        strokeWidth="2.2"
        opacity="0.85"
      />
      <path
        d="M380 148 L380 368"
        fill="none"
        stroke="white"
        strokeDasharray="11 9"
        strokeWidth="2.2"
        opacity="0.7"
      />

      {/* Houses */}
      <Box x={0.2} y={0.6} w={1.6} d={1.4} h={54} top="#F8FBFF" front="#EEF4FA" side="#C9D9E8" />
      <Box x={2.1} y={0.5} w={1.5} d={1.5} h={70} top="#FFFFFF" front="#F3F7FB" side="#B7CBDC" />
      <Box x={6.1} y={0.4} w={1.7} d={1.5} h={78} top="#ECFDF3" front="#E8F8EE" side="#A7D4B8" />
      <Box x={8.0} y={0.6} w={1.5} d={1.3} h={58} top="#FFFFFF" front="#F7FAFC" side="#C5D6E4" />

      {/* Shop row */}
      <Box x={6.4} y={4.6} w={2.2} d={1.6} h={48} top="#FFF1F7" front="#FCE7F1" side="#E8A0C0" />
      <Box x={8.8} y={4.7} w={1.6} d={1.4} h={42} top="#ECFDF5" front="#D1FAE5" side="#6EE7B7" />

      {/* Station */}
      <Box x={-1.6} y={4.8} w={2.4} d={1.8} h={36} top="#E2E8F0" front="#334155" side="#1E293B" />

      {/* EVUDDY hub — branded cube */}
      <Box x={3.2} y={4.55} w={2.15} d={1.9} h={86} top="#18B368" front="#0F172A" side="#16A34A" />

      {/* Pickup yard slab */}
      <path d={road(-1.4, 1.85, 2.6, 1.85, 1.9)} fill="#CBD5E1" />
      <path d={road(-1.2, 1.85, 2.4, 1.85, 1.45)} fill="#F8FAFC" />

      {/* Hub wordmark */}
      <text x="380" y="214" textAnchor="middle" fill="#6EE7A8" fontSize="11" fontWeight="800" letterSpacing="1.4">
        EVUDDY
      </text>
      <text x="380" y="228" textAnchor="middle" fill="#18B368" fontSize="8" fontWeight="700">
        HUB
      </text>

      {/* Shop labels */}
      <text x="488" y="292" textAnchor="middle" fill="#EC2A8C" fontSize="8" fontWeight="800">
        EV CHARGE
      </text>
      <text x="128" y="300" textAnchor="middle" fill="#E2E8F0" fontSize="8" fontWeight="700">
        NAGAR STN
      </text>
      <text x="262" y="188" textAnchor="middle" fill="#0F172A" fontSize="8" fontWeight="800">
        PICKUP YARD
      </text>

      <Tree gx={-0.4} gy={0.2} />
      <Tree gx={5.4} gy={0.15} />
      <Tree gx={9.6} gy={1.1} />
      <Tree gx={9.8} gy={6.4} />
      <Tree gx={-1.8} gy={6.6} />
      <Tree gx={2.6} gy={6.8} />

      <Person gx={1.1} gy={2.55} shirt="#18B368" />
      <Person gx={5.05} gy={2.55} shirt="#EC2A8C" />
      <Person gx={7.3} gy={3.85} shirt="#0F172A" />

      <ScooterMark gx={-0.2} gy={1.7} />
      <ScooterMark gx={0.9} gy={1.95} flip />
      <ScooterMark gx={5.4} gy={3.05} />
      <ScooterMark gx={7.1} gy={3.35} flip />

      {/* Live GPS route */}
      <path
        d="M250 214 C310 228 350 236 380 248 C430 262 500 268 548 292"
        fill="none"
        stroke="#18B368"
        strokeWidth="3"
        strokeDasharray="7 6"
        strokeLinecap="round"
      />
      <circle cx="250" cy="214" r="6" fill="#18B368" />
      <circle cx="548" cy="292" r="6" fill="#EC2A8C" />
      <text x="236" y="204" fill="#15803D" fontSize="8" fontWeight="800">
        LIVE GPS
      </text>

      {/* Caption chips */}
      <g>
        <rect x="24" y="24" width="132" height="28" rx="14" fill="white" stroke="#E2E8F0" />
        <circle cx="42" cy="38" r="5" fill="#18B368" />
        <text x="54" y="42" fill="#0F172A" fontSize="11" fontWeight="700">
          EVUDDY hub
        </text>
        <rect x="164" y="24" width="148" height="28" rx="14" fill="white" stroke="#E2E8F0" />
        <circle cx="182" cy="38" r="5" fill="#EC2A8C" />
        <text x="194" y="42" fill="#0F172A" fontSize="11" fontWeight="700">
          Pickup + street ride
        </text>
      </g>
    </svg>
  );
}
