"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

import { DEFAULT_LIVE_CITY, formatLiveCitiesList } from "@/lib/operatingCities";

type Props = {
  compact?: boolean;
  className?: string;
};

export default function OperatingCitiesNotice({ compact = false, className = "" }: Props) {
  const [cities, setCities] = useState<string[]>([DEFAULT_LIVE_CITY]);

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((data) => {
        const names = (data.data || [])
          .map((row: { cityName?: string }) => String(row.cityName || "").trim())
          .filter(Boolean);
        if (names.length) setCities(names);
      })
      .catch(() => undefined);
  }, []);

  const label = formatLiveCitiesList(cities);

  if (compact) {
    return (
      <p
        className={`text-xs leading-5 text-slate-600 ${className}`}
        role="status"
      >
        <MapPin className="mr-1 inline h-3.5 w-3.5 text-[#18B368]" aria-hidden />
        Live now: <strong className="text-[#0A1134]">{label}</strong>. More cities as we expand.
      </p>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-[#18B368]/20 bg-gradient-to-r from-[#E8F8F0] to-white px-4 py-3 sm:px-5 sm:py-4 ${className}`}
      role="status"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#18B368]">
        Where we operate
      </p>
      <p className="mt-1 text-sm leading-6 text-[#0A1134] sm:text-[15px]">
        EVUDDY bookings and yard pickup are live in{" "}
        <strong>{label}</strong> today. Registering from another city is fine — you can complete KYC,
        and Book EV will open when your city goes live on the map.
      </p>
    </div>
  );
}
