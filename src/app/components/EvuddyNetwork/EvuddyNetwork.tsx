"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { MapPin, Navigation, Radio, ShieldCheck, Zap } from "lucide-react";
import EvuddyEcosystem, { type CityZone } from "./EvuddyEcosystem";
import { INDIA_PATH, INDIA_VIEWBOX } from "./indiaOutline";
import { googleMapsUrl, openGoogleMaps } from "./maps";

type CityMark = {
  name: string;
  x: number;
  y: number;
  hubs: string;
  hubCount: number;
  lat: number;
  lng: number;
};

type LiveHub = {
  hubName?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  hubLocation?: string;
};

const CITY_COORDS: Record<string, { x: number; y: number; lat: number; lng: number }> = {
  Srinagar: { x: 117.8, y: 107.04, lat: 34.0837, lng: 74.7973 },
  Delhi: { x: 154.05, y: 189.31, lat: 28.6139, lng: 77.209 },
  Noida: { x: 156.76, y: 190.36, lat: 28.5355, lng: 77.391 },
  Gurugram: { x: 151.34, y: 191.57, lat: 28.4595, lng: 77.0266 },
  Mathura: { x: 160.97, y: 206.16, lat: 27.4924, lng: 77.6737 },
  Agra: { x: 166.08, y: 210.82, lat: 27.1767, lng: 78.0081 },
  Jaipur: { x: 132.69, y: 214.88, lat: 26.9124, lng: 75.7873 },
  Lucknow: { x: 210.3, y: 215.78, lat: 26.8467, lng: 80.9462 },
  Kanpur: { x: 200.97, y: 221.8, lat: 26.4499, lng: 80.3319 },
  Ahmedabad: { x: 84.26, y: 273.38, lat: 23.0225, lng: 72.5714 },
  Surat: { x: 88.17, y: 301.21, lat: 21.1702, lng: 72.8311 },
  Mumbai: { x: 88.93, y: 332.64, lat: 19.076, lng: 72.8777 },
  Pune: { x: 103.67, y: 341.06, lat: 18.5204, lng: 73.8567 },
  Indore: { x: 133.74, y: 277.89, lat: 22.7196, lng: 75.8577 },
  Bhopal: { x: 157.06, y: 269.77, lat: 23.2599, lng: 77.4126 },
  Hyderabad: { x: 173.3, y: 358.06, lat: 17.385, lng: 78.4867 },
  Bengaluru: { x: 159.76, y: 424.53, lat: 12.9716, lng: 77.5946 },
  Bangalore: { x: 159.76, y: 424.53, lat: 12.9716, lng: 77.5946 },
  Chennai: { x: 200.07, y: 422.88, lat: 13.0827, lng: 80.2707 },
  Kolkata: { x: 321.74, y: 280.15, lat: 22.5726, lng: 88.3639 },
  Patna: { x: 273.31, y: 234.73, lat: 25.5941, lng: 85.1376 },
  Chandigarh: { x: 147.58, y: 157.43, lat: 30.7333, lng: 76.7794 },
};

const FALLBACK_CITIES: CityMark[] = [
  { name: "Delhi", x: 154.05, y: 189.31, hubs: "Capital hub", hubCount: 1, lat: 28.6139, lng: 77.209 },
  { name: "Mathura", x: 160.97, y: 206.16, hubs: "Pickup yard", hubCount: 1, lat: 27.4924, lng: 77.6737 },
  { name: "Jaipur", x: 132.69, y: 214.88, hubs: "City hub", hubCount: 1, lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", x: 210.3, y: 215.78, hubs: "Ride & return yard", hubCount: 1, lat: 26.8467, lng: 80.9462 },
  { name: "Mumbai", x: 88.93, y: 332.64, hubs: "Coastal hub", hubCount: 1, lat: 19.076, lng: 72.8777 },
  { name: "Hyderabad", x: 173.3, y: 358.06, hubs: "South hub", hubCount: 1, lat: 17.385, lng: 78.4867 },
  { name: "Bengaluru", x: 159.76, y: 424.53, hubs: "Tech city hub", hubCount: 1, lat: 12.9716, lng: 77.5946 },
];

const STEPS = [
  { n: "01", title: "Choose city", text: "Pick a live EVUDDY city. The map shows the yard." },
  { n: "02", title: "Navigate", text: "Open Google Maps to the exact pickup hub." },
  { n: "03", title: "Pickup OTP", text: "Pay, then show OTP at the yard to take the scooter." },
  { n: "04", title: "Ride & return", text: "IoT on the scooter. Return at the hub when remaining is ₹0." },
];

const PROOFS = [
  { icon: Radio, title: "IoT on every scooter", text: "Live GPS, lock and battery from the vehicle — same as ops." },
  { icon: Zap, title: "Charge & swap at hub", text: "Yards keep packs ready. Swaps never dump a live ride." },
  { icon: ShieldCheck, title: "Yard-verified pickup", text: "OTP after first payment. No scooter leaves without it." },
];

function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const target = Math.max(0, value);
    let frame = 0;
    const steps = 28;
    const id = window.setInterval(() => {
      frame += 1;
      setN(Math.round((target * frame) / steps));
      if (frame >= steps) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [value]);
  return <>{n}</>;
}

export default function EvuddyNetwork() {
  const reduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<CityMark>(FALLBACK_CITIES[3]);
  const [liveCities, setLiveCities] = useState<string[]>([]);
  const [liveHubs, setLiveHubs] = useState<LiveHub[]>([]);
  const [spot, setSpot] = useState({ x: 62, y: 28 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [cityZone, setCityZone] = useState<CityZone>("hub");

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((json) => {
        const names = (json.data || [])
          .map((item: { cityName?: string }) => String(item.cityName || "").trim())
          .filter(Boolean);
        setLiveCities(names);
      })
      .catch(() => setLiveCities([]));

    fetch("/api/hubs")
      .then((res) => res.json())
      .then((json) => setLiveHubs(json.data || []))
      .catch(() => setLiveHubs([]));
  }, []);

  const marks = useMemo(() => {
    const fromApi = liveCities
      .map((name) => {
        const hit = Object.keys(CITY_COORDS).find((key) => key.toLowerCase() === name.toLowerCase());
        if (!hit) return null;
        const point = CITY_COORDS[hit];
        const cityHubs = liveHubs.filter((hub) => String(hub.city || "").toLowerCase() === name.toLowerCase());
        const first = cityHubs[0];
        return {
          name,
          x: point.x,
          y: point.y,
          lat: first?.latitude || point.lat,
          lng: first?.longitude || point.lng,
          hubCount: cityHubs.length,
          hubs: first?.hubName
            ? first.hubName
            : cityHubs.length
              ? `${cityHubs.length} live hub${cityHubs.length === 1 ? "" : "s"}`
              : "EVUDDY hub",
        };
      })
      .filter((item): item is CityMark => Boolean(item));

    return fromApi.length > 0 ? fromApi : FALLBACK_CITIES;
  }, [liveCities, liveHubs]);

  const selected = marks.find((city) => city.name === active.name) ?? marks[0] ?? FALLBACK_CITIES[0];

  const selectCity = (city: CityMark, openMaps: boolean) => {
    setActive(city);
    if (openMaps) openGoogleMaps(city.lat, city.lng, `EVUDDY ${city.name}`);
  };

  const networkPath = marks.map((city, i) => `${i === 0 ? "M" : "L"} ${city.x} ${city.y}`).join(" ");
  const liveHubTotal = liveHubs.length || marks.reduce((n, city) => n + city.hubCount, 0);
  const ticker = [...marks, ...marks].map((city) => city.name);

  const onStageMove = (event: React.MouseEvent<HTMLElement>) => {
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return;
    setSpot({
      x: ((event.clientX - box.left) / box.width) * 100,
      y: ((event.clientY - box.top) / box.height) * 100,
    });
  };

  const onMapMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    setTilt({ x: py * -10, y: px * 14 });
  };

  return (
    <section
      id="network"
      ref={stageRef}
      onMouseMove={onStageMove}
      className="relative overflow-hidden bg-[#F7FBFA] text-[#0F172A]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90 transition-opacity duration-300"
        style={{
          background: `radial-gradient(520px circle at ${spot.x}% ${spot.y}%, rgba(24,179,104,0.16), transparent 42%), radial-gradient(420px circle at 80% 10%, rgba(236,42,140,0.08), transparent 36%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 evuddy-net-grid opacity-[0.35]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#18B368] to-transparent" />

      <div className="relative mx-auto max-w-[1240px] px-4 pb-8 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/20 bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#15803d] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#18B368]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#18B368]" />
            </span>
            Live EVUDDY network
          </p>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] sm:text-5xl lg:text-[3.4rem]">
            India, wired for
            <span className="mt-1 block bg-gradient-to-r from-[#18B368] to-[#EC2A8C] bg-clip-text text-transparent">
              electric pickup.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-base">
            Hover the map. Nodes pulse. Packets travel city to city. Tap a hub and Google Maps opens the real yard.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Cities live", value: marks.length, suffix: "" },
            { label: "Pickup hubs", value: liveHubTotal, suffix: "" },
            { label: "GPS to yard", value: 1, suffix: " Maps" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white bg-white/80 px-5 py-5 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl"
            >
              <p className="text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
                {item.suffix === " Maps" ? (
                  "Google"
                ) : (
                  <CountUp value={item.value} />
                )}
                {item.suffix === " Maps" ? <span className="text-[#18B368]"> Maps</span> : null}
              </p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-stretch">
          <div className="flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Select a city</p>
            <div className="mt-3 grid max-h-[320px] gap-2 overflow-y-auto pr-1 sm:max-h-none sm:grid-cols-2 lg:grid-cols-1">
              {marks.map((city) => {
                const on = selected.name === city.name;
                return (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => setActive(city)}
                    className={`group flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition duration-300 ${
                      on
                        ? "border-[#18B368] bg-[#18B368] text-white shadow-[0_12px_32px_rgba(24,179,104,0.28)]"
                        : "border-slate-100 bg-white text-[#0F172A] hover:border-[#18B368]/40 hover:shadow-sm"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <MapPin size={16} className={on ? "text-white" : "text-[#18B368]"} />
                      <span className="truncate font-semibold">{city.name}</span>
                    </span>
                    <span className={`shrink-0 text-xs ${on ? "text-white/80" : "text-slate-400"}`}>
                      {city.hubCount > 0 ? `${city.hubCount} hub${city.hubCount === 1 ? "" : "s"}` : "Hub"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#18B368]">Selected hub</p>
              <p className="mt-2 text-2xl font-black tracking-tight">{selected.name}</p>
              <p className="mt-1 text-sm text-slate-500">{selected.hubs}</p>
              <a
                href={googleMapsUrl(selected.lat, selected.lng, `EVUDDY ${selected.name}`)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#18B368] text-sm font-semibold text-white shadow-[0_12px_40px_rgba(24,179,104,0.45)] transition hover:bg-[#16a05c]"
              >
                <Navigation size={15} />
                Open in Google Maps
              </a>
            </div>
          </div>

          <div
            className="relative isolate overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]"
            onMouseMove={onMapMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            style={{
              transform: reduceMotion ? undefined : `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transformStyle: "preserve-3d",
              transition: "transform 180ms ease-out",
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(24,179,104,0.12),transparent_55%)]" />
            <div className="evuddy-net-scan pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#18B368]/10 to-transparent" />
            <svg
              viewBox={INDIA_VIEWBOX}
              className="relative mx-auto h-auto w-full max-w-[560px] px-3 py-8 sm:py-10"
              role="img"
              aria-label="Glowing map of India with EVUDDY hub cities"
            >
              <defs>
                <linearGradient id="evuddy-land-light" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ECFDF5" />
                  <stop offset="100%" stopColor="#BBF7D0" />
                </linearGradient>
                <filter id="evuddy-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path d={INDIA_PATH} fill="url(#evuddy-land-light)" />
              <path
                d={INDIA_PATH}
                fill="none"
                stroke="#18B368"
                strokeWidth="2.8"
                strokeLinejoin="round"
                filter="url(#evuddy-glow)"
                opacity="0.9"
              />
              {networkPath ? (
                <>
                  <path
                    d={networkPath}
                    fill="none"
                    stroke="#18B368"
                    strokeWidth="2"
                    strokeDasharray="6 10"
                    opacity="0.7"
                    className="evuddy-net-dash"
                  />
                    <circle r="4" fill="#18B368" filter="url(#evuddy-glow)">
                    <animateMotion dur="7s" repeatCount="indefinite" path={networkPath} />
                  </circle>
                  <circle r="3" fill="#EC2A8C">
                    <animateMotion dur="11s" begin="2s" repeatCount="indefinite" path={networkPath} />
                  </circle>
                </>
              ) : null}
              {marks.map((city) => {
                const on = selected.name === city.name;
                return (
                  <g
                    key={city.name}
                    className="cursor-pointer"
                    onMouseEnter={() => setActive(city)}
                    onClick={() => selectCity(city, selected.name === city.name)}
                  >
                    <circle cx={city.x} cy={city.y} r={on ? 22 : 12} fill="#18B368" opacity={on ? 0.28 : 0.14} />
                    <circle
                      cx={city.x}
                      cy={city.y}
                      r={on ? 7 : 4.5}
                      fill={on ? "#0F172A" : "#18B368"}
                      filter="url(#evuddy-glow)"
                    />
                    {on ? (
                      <circle cx={city.x} cy={city.y} r="11" fill="none" stroke="#18B368" strokeWidth="1.6" className="evuddy-net-ring" />
                    ) : null}
                  </g>
                );
              })}
            </svg>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 text-xs font-medium text-slate-500 shadow-sm backdrop-blur-md sm:left-6 sm:right-6">
              <span className="flex items-center gap-2 font-semibold text-[#0F172A]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#18B368]" />
                {selected.name}
              </span>
              <span className="hidden text-[#18B368] sm:inline">{selected.hubs}</span>
            </div>
          </div>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-full border border-slate-100 bg-white py-2.5 shadow-sm">
          <div className="evuddy-net-ticker flex w-max gap-8 whitespace-nowrap px-6 text-sm font-semibold tracking-[0.14em] text-slate-400">
            {ticker.map((name, i) => (
              <span key={`${name}-${i}`} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#18B368]" />
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {PROOFS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-[#18B368]/40 hover:shadow-[0_18px_40px_rgba(24,179,104,0.12)]"
            >
              <item.icon size={20} className="text-[#18B368]" />
              <p className="mt-3 text-sm font-semibold">{item.title}</p>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            How a hub ride works
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.n} className="rounded-2xl border border-slate-100 bg-white px-4 py-5 shadow-sm">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[#18B368]">{step.n}</p>
                <p className="mt-2 text-sm font-semibold">{step.title}</p>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-[1240px] px-4 pt-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#18B368]">City operations</p>
              <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                Pickup, charge, hub — in motion.
              </h3>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-500">
              Live scooters on the north lane. Cars south. Yards off-road. The same split a real EV city uses.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium" role="tablist" aria-label="City operation zones">
            {(
              [
                { id: "pickup", label: "Pickup yard", on: "bg-[#18B368] text-white", off: "bg-[#18B368]/10 text-[#15803d]" },
                { id: "charge", label: "EV charge", on: "bg-sky-600 text-white", off: "bg-sky-50 text-sky-700" },
                { id: "hub", label: "EVUDDY hub", on: "bg-[#18B368] text-white", off: "bg-[#18B368]/10 text-[#15803d]" },
              ] as const
            ).map((chip) => (
              <button
                key={chip.id}
                type="button"
                role="tab"
                aria-selected={cityZone === chip.id}
                onClick={() => setCityZone(chip.id)}
                className={`rounded-full px-3 py-1 transition ${cityZone === chip.id ? chip.on : chip.off}`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
        <div className="relative mt-6 w-full overflow-hidden">
          <EvuddyEcosystem zone={cityZone} />
        </div>
      </div>

      <style>{`
        .evuddy-net-grid {
          background-image: linear-gradient(rgba(24,179,104,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(24,179,104,0.08) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse at center, black 35%, transparent 78%);
        }
        @keyframes evuddy-net-dash { to { stroke-dashoffset: -80; } }
        @keyframes evuddy-net-ring {
          0% { r: 8; opacity: 0.8; }
          100% { r: 22; opacity: 0; }
        }
        @keyframes evuddy-net-scan { 0% { top: -20%; } 100% { top: 110%; } }
        @keyframes evuddy-net-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .evuddy-net-dash { animation: evuddy-net-dash 6s linear infinite; }
        .evuddy-net-ring { animation: evuddy-net-ring 1.8s ease-out infinite; }
        .evuddy-net-scan { animation: evuddy-net-scan 5.5s linear infinite; }
        .evuddy-net-ticker { animation: evuddy-net-ticker 28s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-net-dash, .evuddy-net-ring, .evuddy-net-scan, .evuddy-net-ticker { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
