"use client";

import { useEffect, useState } from "react";
import { getActiveFestiveCampaign } from "@/lib/festiveCalendar";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

/** Applies calendar-driven glow to the EVUDDY lockup during active campaigns. */
export default function FestiveLogo({ src, alt, className = "" }: Props) {
  const [festive, setFestive] = useState(false);

  useEffect(() => {
    setFestive(Boolean(getActiveFestiveCampaign()));
  }, []);

  return (
    <span className={festive ? "evuddy-festive-logo inline-flex" : "inline-flex"}>
      <img src={src} alt={alt} className={className} />
    </span>
  );
}
