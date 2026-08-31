"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Radio, ShieldCheck, Zap } from "lucide-react";
import EvuddyEcosystem from "./EvuddyEcosystem";
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

export default function EvuddyNetwork() {
  const [active, setActive] = useState<CityMark>(FALLBACK_CITIES[3]);
  const [liveCities, setLiveCities] = useState<string[]>([]);
  const [liveHubs, setLiveHubs] = useState<LiveHub[]>([]);

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

  useEffect(() => {
    if (!marks.some((city) => city.name === active.name) && marks[0]) {
      setActive(marks[0]);
    }
  }, [marks, active.name]);

  const selectCity = (city: CityMark, openMaps: boolean) => {
    setActive(city);
    if (openMaps) openGoogleMaps(city.lat, city.lng, `EVUDDY ${city.name}`);
  };

  const networkPath = marks.map((city, i) => `${i === 0 ? "M" : "L"} ${city.x} ${city.y}`).join(" ");
  const liveHubTotal = liveHubs.length || marks.reduce((n, city) => n + city.hubCount, 0);

  return (
    <section id="network" className="relative overflow-hidden bg-[#F7FBFA]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#18B368]/40 to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#18B368]/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-64 w-64 rounded-full bg-[#EC2A8C]/6 blur-3xl" />

      <div className="relative mx-auto max-w-[1200px] px-4 pb-6 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/15 bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#15803D]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#18B368]/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#18B368]" />
            </span>
            Live network
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-[#0F172A] sm:text-5xl">
            Hubs you can actually ride from.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-base">
            Same model as India’s EV platforms: a live city network, GPS to the yard, and infrastructure at the hub — not a decorative map.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Cities live", value: String(marks.length) },
            { label: "Pickup hubs", value: String(liveHubTotal) },
            { label: "Navigate", value: "Google Maps" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
            >
              <p className="text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-[28px]">{item.value}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-stretch">
          <div className="flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Select a city</p>
            <div className="mt-3 grid max-h-[340px] gap-1.5 overflow-y-auto pr-1 sm:max-h-none sm:grid-cols-2 lg:grid-cols-1">
              {marks.map((city) => {
                const on = active.name === city.name;
                return (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => setActive(city)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition ${
                      on
                        ? "border-[#18B368] bg-[#18B368] text-white shadow-[0_10px_28px_rgba(24,179,104,0.28)]"
                        : "border-slate-200/90 bg-white text-[#0F172A] hover:border-[#18B368]/40"
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

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#18B368]">Selected hub</p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-[#0F172A]">{active.name}</p>
              <p className="mt-1 text-sm text-slate-500">{active.hubs}</p>
              <a
                href={googleMapsUrl(active.lat, active.lng, `EVUDDY ${active.name}`)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0F172A] text-sm font-semibold text-white transition hover:bg-[#18B368]"
              >
                <Navigation size={15} />
                Open in Google Maps
              </a>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.07)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(24,179,104,0.08),transparent_42%)]" />
            <svg
              viewBox={INDIA_VIEWBOX}
              className="relative mx-auto h-auto w-full max-w-[520px] px-4 py-6 sm:py-8"
              role="img"
              aria-label="Map of India with EVUDDY hub cities"
            >
              <defs>
                <linearGradient id="evuddy-land" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ECFDF5" />
                  <stop offset="100%" stopColor="#D1FAE5" />
                </linearGradient>
                <filter id="evuddy-map-soft" x="-8%" y="-8%" width="116%" height="116%">
                  <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#0F172A" floodOpacity="0.08" />
                </filter>
              </defs>
              <path d={INDIA_PATH} fill="url(#evuddy-land)" filter="url(#evuddy-map-soft)" />
              <path d={INDIA_PATH} fill="none" stroke="#18B368" strokeWidth="2.4" strokeLinejoin="round" />
              {networkPath ? (
                <path
                  d={networkPath}
                  fill="none"
                  stroke="#18B368"
                  strokeWidth="1.6"
                  strokeDasharray="5 7"
                  opacity="0.45"
                  className="evuddy-net-dash"
                />
              ) : null}
              {marks.map((city) => {
                const on = active.name === city.name;
                return (
                  <g
                    key={city.name}
                    className="cursor-pointer"
                    onMouseEnter={() => setActive(city)}
                    onClick={() => selectCity(city, active.name === city.name)}
                  >
                    <circle cx={city.x} cy={city.y} r={on ? 16 : 9} fill="#18B368" opacity={on ? 0.22 : 0.12} />
                    <circle cx={city.x} cy={city.y} r={on ? 5.5 : 3.8} fill={on ? "#0F172A" : "#18B368"} />
                    {on ? (
                      <circle cx={city.x} cy={city.y} r="5.5" fill="none" stroke="#18B368" strokeWidth="2" />
                    ) : null}
                  </g>
                );
              })}
            </svg>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 text-xs font-medium text-slate-500 shadow-sm backdrop-blur sm:left-6 sm:right-6">
              <span className="flex items-center gap-2 text-[#0F172A]">
                <span className="h-2 w-2 rounded-full bg-[#18B368]" />
                {active.name}
              </span>
              <span className="hidden sm:inline">{active.hubs}</span>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {PROOFS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)]"
            >
              <item.icon size={20} className="text-[#18B368]" />
              <p className="mt-3 text-sm font-semibold text-[#0F172A]">{item.title}</p>
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
              <div key={step.n} className="rounded-2xl bg-white/80 px-4 py-5 ring-1 ring-slate-200/80">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[#18B368]">{step.n}</p>
                <p className="mt-2 text-sm font-semibold text-[#0F172A]">{step.title}</p>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-6 border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#18B368]">City operations</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#0F172A] sm:text-3xl">
                Pickup, charge, hub — in one city.
              </h3>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-500">
              Scooters stay in the north lane. Cars stay south. Yards sit off the road — the same split a real EV city uses.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-slate-500">
            <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-[#15803D]">Pickup yard</span>
            <span className="rounded-full bg-[#F1F5F9] px-3 py-1">EV charge</span>
            <span className="rounded-full bg-[#0F172A] px-3 py-1 text-[#6EE7A8]">EVUDDY hub</span>
          </div>
        </div>
        <div className="relative mt-6 w-full overflow-hidden">
          <EvuddyEcosystem />
        </div>
      </div>

      <style>{`
        @keyframes evuddy-net-dash {
          to { stroke-dashoffset: -48; }
        }
        .evuddy-net-dash { animation: evuddy-net-dash 8s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-net-dash { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
