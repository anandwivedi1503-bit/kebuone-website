"use client";

import { useEffect, useMemo, useState } from "react";
import { DIWALI_SESSION_KEY, isDiwaliSeason } from "@/lib/festiveSeason";
import type { FestiveCampaign } from "@/lib/festiveCalendar";
import EvuddyFestiveWelcomePoster from "../Festive/EvuddyFestiveWelcomePoster";
import "./diwali.css";

const LIGHT_COLORS = ["#F4C430", "#1F6B4A", "#FFD700", "#18573C"];

function StringLights() {
  const bulbs = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        color: LIGHT_COLORS[i % LIGHT_COLORS.length],
        delay: `${(i * 0.11) % 1.6}s`,
      })),
    []
  );

  return (
    <div className="relative hidden h-7 w-full sm:block" aria-hidden>
      <svg className="h-full w-full" viewBox="0 0 1200 32" preserveAspectRatio="none">
        <path
          d="M0 8 Q150 22 300 8 T600 8 T900 8 T1200 8"
          fill="none"
          stroke="rgba(28,25,23,0.25)"
          strokeWidth="1.5"
        />
      </svg>
      <div className="absolute inset-x-0 top-1 flex justify-between px-1">
        {bulbs.map((bulb, i) => (
          <span
            key={i}
            className="evuddy-string-light h-2.5 w-2.5 rounded-full shadow-[0_0_10px_currentColor]"
            style={{
              backgroundColor: bulb.color,
              color: bulb.color,
              animationDelay: bulb.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Sparkles() {
  const sparks = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: `${(i * 17 + 7) % 100}%`,
        delay: `${(i * 0.7) % 8}s`,
        duration: `${10 + (i % 5)}s`,
        size: 3 + (i % 3),
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[1000] overflow-hidden" aria-hidden>
      {sparks.map((s, i) => (
        <span
          key={i}
          className="evuddy-sparkle absolute bottom-[-8px] rounded-full bg-[#FFD700]/80"
          style={{
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}
    </div>
  );
}

function FestiveRibbon({ text }: { text: string }) {
  return (
    <div className="flex justify-center px-3" aria-hidden>
      <div className="max-w-xl rounded-full border border-[#F4C430]/50 bg-gradient-to-r from-[#1F6B4A] via-[#18573C] to-[#F4C430] px-4 py-1.5 text-center text-[10px] font-medium tracking-[0.18em] text-[#FFFBEB] shadow-lg sm:text-[11px]">
        {text}
      </div>
    </div>
  );
}

function FestiveBelowNav({ ribbon }: { ribbon: string }) {
  return (
    <div className="evuddy-festive-below-nav" aria-hidden>
      <StringLights />
      <FestiveRibbon text={ribbon} />
    </div>
  );
}

export default function DiwaliCelebration({ campaign }: { campaign?: FestiveCampaign | null }) {
  const sessionKey = campaign?.sessionKey ?? DIWALI_SESSION_KEY;
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !sessionStorage.getItem(sessionKey);
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!isDiwaliSeason()) return;
    document.documentElement.dataset.evuddyDiwali = "1";
    document.documentElement.dataset.evuddyFestive = "diwali";
    const accent = campaign?.logoAccent ?? "#F4C430";
    document.documentElement.style.setProperty("--evuddy-festive-accent", accent);
    try {
      const seen = sessionStorage.getItem(sessionKey);
      if (!seen) setShowWelcome(true);
    } catch {
      setShowWelcome(true);
    }
    return () => {
      delete document.documentElement.dataset.evuddyDiwali;
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

  if (!isDiwaliSeason()) return null;

  const ribbon = campaign?.ribbon ?? "✦ शुभ दीपावली · Happy Diwali · Ride electric, ride bright ✦";
  const welcomeTitle = campaign?.welcomeTitle ?? "शुभ Deepawali";
  const welcomeBody =
    campaign?.welcomeBody ??
    "Light up the city with a safe electric ride. Happy Diwali from the EVUDDY family — may your journeys stay bright, smooth, and pollution-free.";

  return (
    <>
      <FestiveBelowNav ribbon={ribbon} />
      <Sparkles />
      <EvuddyFestiveWelcomePoster
        open={showWelcome}
        onClose={closeWelcome}
        title={welcomeTitle}
        body={welcomeBody}
      />
    </>
  );
}
