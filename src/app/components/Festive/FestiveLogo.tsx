"use client";

import { useFestiveLive } from "./FestiveLive";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

/** Applies calendar-driven glow to the EVUDDY lockup during active campaigns. */
export default function FestiveLogo({ src, alt, className = "" }: Props) {
  const { ready, campaign } = useFestiveLive();
  const festive = ready && Boolean(campaign);

  return (
    <span className={festive ? "evuddy-festive-logo inline-flex" : "inline-flex"}>
      <img src={src} alt={alt} className={className} />
    </span>
  );
}
