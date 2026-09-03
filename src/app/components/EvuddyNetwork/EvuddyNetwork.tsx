"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Cpu, KeyRound, MapPin, Navigation, Radio, ShieldCheck, Warehouse, Zap } from "lucide-react";
import { GpsScooterMark } from "../Hero/GpsScooter";
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

function projectIndia(lat: number, lng: number) {
  const x = ((lng - 68.1) / (97.4 - 68.1)) * 430 + 25;
  const y = ((37.1 - lat) / (37.1 - 8)) * 480 + 40;
  return {
    x: Math.min(460, Math.max(20, x)),
    y: Math.min(530, Math.max(70, y)),
  };
}

function cityPoint(name: string, lat?: number, lng?: number) {
  const hit = Object.keys(CITY_COORDS).find((key) => key.toLowerCase() === name.toLowerCase());
  if (hit) return CITY_COORDS[hit];
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { ...projectIndia(lat as number, lng as number), lat: lat as number, lng: lng as number };
  }
  return { x: 210.3, y: 215.78, lat: 26.8467, lng: 80.9462 };
}

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
    const fromApi = liveCities.map((name) => {
      const cityHubs = liveHubs.filter(
        (hub) => String(hub.city || "").toLowerCase() === name.toLowerCase()
      );
      const first = cityHubs[0];
      const lat = Number(first?.latitude);
      const lng = Number(first?.longitude);
      const point = cityPoint(name, lat, lng);
      return {
        name,
        x: point.x,
        y: point.y,
        lat: Number.isFinite(lat) ? lat : point.lat,
        lng: Number.isFinite(lng) ? lng : point.lng,
        hubCount: cityHubs.length,
        hubs: first?.hubName
          ? first.hubName
          : cityHubs.length
            ? `${cityHubs.length} live hub${cityHubs.length === 1 ? "" : "s"}`
            : "EVUDDY hub",
      } satisfies CityMark;
    });

    return fromApi.length > 0 ? fromApi : FALLBACK_CITIES;
  }, [liveCities, liveHubs]);

  useEffect(() => {
    if (marks.length && !marks.some((city) => city.name === active.name)) {
      setActive(marks[0]);
    }
  }, [marks, active.name]);

  const selected = marks.find((city) => city.name === active.name) ?? marks[0] ?? FALLBACK_CITIES[0];

  const selectCity = (city: CityMark, openMaps: boolean) => {
    setActive(city);
    if (openMaps) openGoogleMaps(city.lat, city.lng, `EVUDDY ${city.name}`);
  };

  const networkPath = marks.map((city, i) => `${i === 0 ? "M" : "L"} ${city.x} ${city.y}`).join(" ");
  const liveHubTotal = liveHubs.length || marks.reduce((n, city) => n + city.hubCount, 0);
  const ticker = [...marks, ...marks].map((city) => city.name);

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
      className="relative scroll-mt-28 overflow-x-hidden bg-[#F7F4EE] text-[#1C1917] sm:scroll-mt-40"
    >
      <div className="relative mx-auto max-w-[1440px] px-5 pb-10 pt-20 sm:px-8 sm:pt-28 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
            Live EVUDDY network
          </p>
          <h2 className="font-display mt-4 text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
            Hubs across India.
            <span className="mt-1 block italic text-[#1F6B4A]">Pickup at the yard.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-8 text-[#5C635E]">
            Choose a live city. Open Google Maps to the hub. Pay, show OTP, ride — return when remaining rent is ₹0.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-8 border-y border-[#E4DDD2] py-8 sm:grid-cols-3">
          {[
            { label: "Cities live", value: marks.length, suffix: "" },
            { label: "Pickup hubs", value: liveHubTotal, suffix: "" },
            { label: "GPS to yard", value: 1, suffix: " Maps" },
          ].map((item) => (
            <div
              key={item.label}
              className={item.suffix === " Maps" ? "col-span-2 sm:col-span-1" : ""}
            >
              <p className="font-display text-4xl font-medium tracking-tight text-[#1C1917]">
                {item.suffix === " Maps" ? (
                  <>
                    Google<span className="text-[#1F6B4A]"> Maps</span>
                  </>
                ) : (
                  <CountUp value={item.value} />
                )}
              </p>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8A847A]">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#5F6B63]">Select a city</p>
            <div className="mt-3 max-h-[320px] overflow-y-auto border-t border-[#E4DDD2] sm:max-h-none">
              {marks.map((city) => {
                const on = selected.name === city.name;
                return (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => setActive(city)}
                    className={`flex w-full items-center justify-between border-b border-[#E4DDD2] py-3.5 text-left transition ${
                      on ? "text-[#1F6B4A]" : "text-[#1C1917] hover:text-[#1F6B4A]"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <MapPin size={16} strokeWidth={1.5} className="text-[#1F6B4A]" />
                      <span className="break-words font-medium">{city.name}</span>
                    </span>
                    <span className="shrink-0 text-xs text-[#8A847A]">
                      {city.hubCount > 0 ? `${city.hubCount} hub${city.hubCount === 1 ? "" : "s"}` : "Hub"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 border-t border-[#E4DDD2] pt-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F6B63]">Selected hub</p>
              <p className="font-display mt-2 text-3xl font-medium tracking-tight">{selected.name}</p>
              <p className="mt-1 text-sm text-[#5C635E]">{selected.hubs}</p>
              <a
                href={googleMapsUrl(selected.lat, selected.lng, `EVUDDY ${selected.name}`)}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 bg-[#1F6B4A] text-[13px] font-medium tracking-[0.08em] text-white transition hover:bg-[#18573c]"
              >
                <Navigation size={15} />
                Open in Google Maps
              </a>
            </div>
          </div>

          <div
            className="relative isolate border border-[#E4DDD2] bg-[#FBF9F5]"
            onMouseMove={(event) => {
              if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 1024) return;
              onMapMove(event);
            }}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            style={{
              transform: reduceMotion ? undefined : `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transformStyle: "preserve-3d",
              transition: "transform 220ms ease-out",
            }}
          >
            <svg
              viewBox={INDIA_VIEWBOX}
              className="relative mx-auto h-auto w-full max-w-[560px] px-2 pb-16 pt-6 sm:px-3 sm:py-10 sm:pb-16"
              role="img"
              aria-label="Map of India with EVUDDY hub cities"
            >
              <defs>
                <linearGradient id="evuddy-land-light" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F4F0E6" />
                  <stop offset="100%" stopColor="#E4EDE6" />
                </linearGradient>
                <filter id="evuddy-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.4" result="blur" />
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
                stroke="#1F6B4A"
                strokeWidth="1.6"
                strokeLinejoin="round"
                opacity="0.85"
              />
              {networkPath ? (
                <>
                  <path
                    d={networkPath}
                    fill="none"
                    stroke="#1F6B4A"
                    strokeWidth="1.4"
                    strokeDasharray="4 8"
                    opacity="0.55"
                    className="evuddy-net-dash"
                  />
                  <g>
                    <animateMotion dur="8s" repeatCount="indefinite" rotate="auto" path={networkPath} />
                    <g transform="scale(0.85)">
                      <GpsScooterMark />
                    </g>
                  </g>
                </>
              ) : null}
              {liveHubs
                .filter((hub) => Number.isFinite(Number(hub.latitude)) && Number.isFinite(Number(hub.longitude)))
                .map((hub, index) => {
                  const pin = projectIndia(Number(hub.latitude), Number(hub.longitude));
                  return (
                    <g key={`hub-${hub.hubName || index}`}>
                      <circle cx={pin.x} cy={pin.y} r="7" fill="#1F6B4A" opacity="0.16" />
                      <circle cx={pin.x} cy={pin.y} r="2.8" fill="#1F6B4A" />
                    </g>
                  );
                })}
              {marks.map((city) => {
                const on = selected.name === city.name;
                return (
                  <g
                    key={city.name}
                    className="cursor-pointer"
                    onMouseEnter={() => setActive(city)}
                    onClick={() => selectCity(city, selected.name === city.name)}
                  >
                    <circle cx={city.x} cy={city.y} r={on ? 18 : 10} fill="#1F6B4A" opacity={on ? 0.2 : 0.1} />
                    <circle
                      cx={city.x}
                      cy={city.y}
                      r={on ? 6 : 4}
                      fill={on ? "#C45B2D" : "#1F6B4A"}
                    />
                    <text
                      x={city.x + 8}
                      y={city.y + (on ? -12 : 16)}
                      fill="#1C1917"
                      fontSize="11"
                      fontWeight="500"
                      className="hidden sm:inline"
                      pointerEvents="none"
                    >
                      {city.name}
                    </text>
                    {on ? (
                      <circle cx={city.x} cy={city.y} r="11" fill="none" stroke="#C45B2D" strokeWidth="1.2" className="evuddy-net-ring" />
                    ) : null}
                  </g>
                );
              })}
            </svg>
            <div className="flex items-center justify-between gap-2 border-t border-[#E4DDD2] px-4 py-3 text-xs text-[#5C635E] sm:px-6">
              <span className="font-medium text-[#1C1917]">{selected.name}</span>
              <span className="hidden sm:inline">{selected.hubs}</span>
            </div>
          </div>
        </div>

        <div className="relative mt-10 overflow-hidden border-y border-[#E4DDD2] py-3">
          <div className="evuddy-net-ticker flex w-max gap-10 whitespace-nowrap px-6 text-[12px] font-medium uppercase tracking-[0.18em] text-[#8A847A]">
            {ticker.map((name, i) => (
              <span key={`${name}-${i}`} className="inline-flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#1F6B4A]" />
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {PROOFS.map((item) => (
            <div key={item.title} className="border-t border-[#E4DDD2] pt-5">
              <item.icon size={18} strokeWidth={1.5} className="text-[#1F6B4A]" />
              <p className="mt-3 text-sm font-medium">{item.title}</p>
              <p className="mt-1.5 text-sm leading-6 text-[#5C635E]">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#5F6B63]">
            How a hub ride works
          </p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.n} className="border-t border-[#E4DDD2] pt-5">
                <p className="text-[11px] tracking-[0.16em] text-[#8A847A]">{step.n}</p>
                <p className="font-display mt-3 text-xl font-medium">{step.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#5C635E]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative border-t border-[#E4DDD2] bg-[#FBF9F5]">
        <div className="mx-auto max-w-[1440px] px-5 pt-12 sm:px-8 lg:px-12">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#5F6B63]">City operations</p>
              <h3 className="font-display mt-2 text-3xl font-medium tracking-[-0.03em]">
                Pickup, charge, hub — in motion.
              </h3>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#5C635E]">
              Scooters stay on the north lane. Cars stay south. Yards never sit on the road.
            </p>
          </div>
          <div
            className="mt-6 inline-flex border border-[#E4DDD2] bg-[#F7F4EE] p-1"
            role="tablist"
            aria-label="City operation zones"
          >
            {(
              [
                { id: "pickup", label: "Pickup yard" },
                { id: "charge", label: "EV charge" },
                { id: "hub", label: "EVUDDY hub" },
              ] as const
            ).map((chip) => (
              <button
                key={chip.id}
                type="button"
                role="tab"
                aria-selected={cityZone === chip.id}
                onClick={() => setCityZone(chip.id)}
                className={`px-4 py-2 text-[12px] font-medium tracking-[0.04em] transition ${
                  cityZone === chip.id
                    ? "bg-[#1F6B4A] text-white"
                    : "text-[#5C635E] hover:text-[#1C1917]"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
        <div className="relative mt-8 w-full overflow-hidden">
          <EvuddyEcosystem zone={cityZone} />
        </div>
        <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-8 sm:px-8 lg:px-12">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Warehouse,
                kicker: "Live yard",
                title: "Hub",
                text: "Every scooter starts and ends at a gated EVUDDY hub — never a random street.",
              },
              {
                icon: Cpu,
                kicker: "On the vehicle",
                title: "IoT lock",
                text: "GPS, lock and battery stream from the scooter, the same feed ops uses.",
              },
              {
                icon: KeyRound,
                kicker: "Gate control",
                title: "Pickup OTP",
                text: "The yard OTP only appears after first payment. No pay, no scooter.",
              },
            ].map((item) => (
              <div key={item.title} className="border-t border-[#E4DDD2] pt-5">
                <item.icon size={18} strokeWidth={1.5} className="text-[#1F6B4A]" />
                <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.18em] text-[#8A847A]">{item.kicker}</p>
                <p className="font-display mt-1 text-xl font-medium text-[#1C1917]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#5C635E]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes evuddy-net-dash { to { stroke-dashoffset: -80; } }
        @keyframes evuddy-net-ring {
          0% { r: 8; opacity: 0.7; }
          100% { r: 20; opacity: 0; }
        }
        @keyframes evuddy-net-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .evuddy-net-dash { animation: evuddy-net-dash 8s linear infinite; }
        .evuddy-net-ring { animation: evuddy-net-ring 2.2s ease-out infinite; }
        .evuddy-net-ticker { animation: evuddy-net-ticker 32s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-net-dash, .evuddy-net-ring, .evuddy-net-ticker { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
