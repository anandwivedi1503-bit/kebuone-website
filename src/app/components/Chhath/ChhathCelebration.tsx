"use client";

import { useEffect, useMemo, useState } from "react";
import { CHHATH_SESSION_KEY, isChhathSeason } from "@/lib/festiveSeason";
import type { FestiveCampaign } from "@/lib/festiveCalendar";
import EvuddyChhathWelcomePoster from "../Festive/EvuddyChhathWelcomePoster";
import "./chhath.css";

function SunGlints() {
  const glints = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: `${(i * 19 + 5) % 100}%`,
        delay: `${(i * 0.65) % 7}s`,
        duration: `${11 + (i % 4)}s`,
        size: 2 + (i % 3),
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[1000] overflow-hidden" aria-hidden>
      {glints.map((g, i) => (
        <span
          key={i}
          className="evuddy-chhath-glint absolute bottom-[-6px] rounded-full bg-[#FBBF24]/75"
          style={{
            left: g.left,
            width: g.size,
            height: g.size,
            animationDelay: g.delay,
            animationDuration: g.duration,
          }}
        />
      ))}
    </div>
  );
}

function FestiveRibbon({ text }: { text: string }) {
  return (
    <div className="flex justify-center px-3" aria-hidden>
      <div className="evuddy-chhath-ribbon evuddy-chhath-wave-band max-w-xl rounded-full border border-[#FBBF24]/45 px-4 py-1.5 text-center text-[10px] font-semibold tracking-[0.16em] text-[#FFFBEB] shadow-lg sm:text-[11px]">
        {text}
      </div>
    </div>
  );
}

function FestiveBelowNav({ ribbon }: { ribbon: string }) {
  return (
    <div className="evuddy-festive-below-nav" aria-hidden>
      <FestiveRibbon text={ribbon} />
    </div>
  );
}

export default function ChhathCelebration({ campaign }: { campaign?: FestiveCampaign | null }) {
  const sessionKey = campaign?.sessionKey ?? CHHATH_SESSION_KEY;
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !sessionStorage.getItem(sessionKey);
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!isChhathSeason()) return;
    document.documentElement.dataset.evuddyChhath = "1";
    document.documentElement.dataset.evuddyFestive = "chhath";
    const accent = campaign?.logoAccent ?? "#F97316";
    document.documentElement.style.setProperty("--evuddy-festive-accent", accent);
    try {
      const seen = sessionStorage.getItem(sessionKey);
      if (!seen) setShowWelcome(true);
    } catch {
      setShowWelcome(true);
    }
    return () => {
      delete document.documentElement.dataset.evuddyChhath;
      delete document.documentElement.dataset.evuddyFestive;
      document.documentElement.style.removeProperty("--evuddy-festive-accent");
    };
  }, [sessionKey, campaign?.logoAccent]);

  const closeWelcome = () => {
    setShowWelcome(false);
    try {
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      /* ignore */
    }
  };

  if (!isChhathSeason()) return null;

  const ribbon =
    campaign?.ribbon ?? "✦ छठ पूजा · Chhath Puja · Safe electric rides to every ghat ✦";
  const welcomeTitle = campaign?.welcomeTitle ?? "Chhath Puja wishes from EVUDDY";
  const welcomeBody =
    campaign?.welcomeBody ??
    "Offer your prayers with devotion — reach the ghat on time with a quiet, pollution-free EV ride. Warm wishes from the EVUDDY family.";

  return (
    <>
      <FestiveBelowNav ribbon={ribbon} />
      <SunGlints />
      <EvuddyChhathWelcomePoster
        open={showWelcome}
        onClose={closeWelcome}
        title={welcomeTitle}
        body={welcomeBody}
      />
    </>
  );
}
