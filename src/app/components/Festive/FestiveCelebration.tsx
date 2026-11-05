"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import type { FestiveCampaign } from "@/lib/festiveCalendar";
import { getActiveFestiveCampaign } from "@/lib/festiveCalendar";
import "../Diwali/diwali.css";
import "./festive-themes.css";

const LIGHT_COLORS = ["#FF9933", "#FFD700", "#E11D48", "#1F6B4A", "#A855F7", "#F97316"];

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
    <div
      className="pointer-events-none fixed inset-x-0 top-[calc(5.25rem+env(safe-area-inset-top,0px))] z-[1101] hidden h-8 sm:block"
      aria-hidden
    >
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
    <div
      className="evuddy-festive-ribbon pointer-events-none fixed inset-x-0 top-[calc(4.5rem+env(safe-area-inset-top,0px))] z-[1100] flex justify-center px-2 sm:top-[calc(5rem+env(safe-area-inset-top,0px))]"
      aria-hidden
    >
      <p className="max-w-[min(100%,48rem)] truncate rounded-full border border-white/40 bg-[#0A1134]/88 px-4 py-1.5 text-[10px] font-semibold tracking-wide text-white shadow-lg backdrop-blur-md sm:text-xs">
        {text}
      </p>
    </div>
  );
}

function WelcomePoster({
  campaign,
  open,
  onClose,
}: {
  campaign: FestiveCampaign;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#1C1917]/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evuddy-festive-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/20 bg-gradient-to-br from-white via-[#F4FAF7] to-[#E8F8F0] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-[#0A1134] shadow-sm transition hover:bg-white"
          aria-label="Close festive greeting"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#18B368]">
          EVUDDY · {campaign.theme}
        </p>
        <h2
          id="evuddy-festive-title"
          className="font-display mt-3 text-3xl font-semibold tracking-tight text-[#0A1134]"
        >
          {campaign.welcomeTitle}
        </h2>
        <p className="mt-4 text-sm leading-7 text-[#334155]">{campaign.welcomeBody}</p>
        <Link
          href="/ride-options"
          onClick={onClose}
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#18B368] px-6 text-sm font-bold text-white shadow-lg transition hover:bg-[#149658]"
        >
          Book EV in Lucknow
        </Link>
      </div>
    </div>
  );
}

export default function FestiveCelebration() {
  const campaign = useMemo(() => getActiveFestiveCampaign(), []);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  useEffect(() => {
    if (!campaign) return;
    document.documentElement.dataset.evuddyFestive = campaign.theme;
    document.documentElement.style.setProperty("--evuddy-festive-accent", campaign.logoAccent);
    if (campaign.theme === "diwali") {
      document.documentElement.dataset.evuddyDiwali = "1";
    }
    try {
      const seen = sessionStorage.getItem(campaign.sessionKey);
      if (!seen) setWelcomeOpen(true);
    } catch {
      setWelcomeOpen(true);
    }
    return () => {
      delete document.documentElement.dataset.evuddyFestive;
      delete document.documentElement.dataset.evuddyDiwali;
      document.documentElement.style.removeProperty("--evuddy-festive-accent");
    };
  }, [campaign]);

  const closeWelcome = () => {
    if (campaign) {
      try {
        sessionStorage.setItem(campaign.sessionKey, "1");
      } catch {
        /* ignore */
      }
    }
    setWelcomeOpen(false);
  };

  if (!campaign) return null;

  const richLayer = campaign.theme === "diwali";

  return (
    <>
      <FestiveRibbon text={campaign.ribbon} />
      {richLayer ? (
        <>
          <StringLights />
          <Sparkles />
        </>
      ) : null}
      <WelcomePoster campaign={campaign} open={welcomeOpen} onClose={closeWelcome} />
    </>
  );
}
