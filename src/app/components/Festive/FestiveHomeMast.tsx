"use client";

import { useFestiveLive } from "./FestiveLive";

/** In-flow festival bar for the landing hero. It scrolls with the page, so it never sits on top of photos. */
export default function FestiveHomeMast() {
  const { ready, campaign } = useFestiveLive();
  if (!ready || !campaign) return null;

  const line = campaign.ribbon.replace(/✦/g, " ").replace(/\s+/g, " ").trim();

  return (
    <div className={`evuddy-festive-mast evuddy-festive-mast--${campaign.theme}`} role="status">
      <span className="evuddy-festive-mast__sun" aria-hidden />
      <div className="min-w-0">
        <p className="evuddy-festive-mast__title">{campaign.welcomeTitle}</p>
        <p className="evuddy-festive-mast__line">{line}</p>
      </div>
    </div>
  );
}
