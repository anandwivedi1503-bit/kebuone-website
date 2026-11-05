"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { DIWALI_SESSION_KEY, isDiwaliSeason } from "@/lib/festiveSeason";
import type { FestiveCampaign } from "@/lib/festiveCalendar";
import "./diwali.css";

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

function DiyaIcon({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      <div className="evuddy-diya-glow mx-auto h-3 w-8 rounded-b-full bg-gradient-to-b from-[#FF9933] to-[#C2410C]" />
      <div className="evuddy-diya-flame absolute -top-3 left-1/2 h-4 w-3 rounded-full bg-gradient-to-t from-[#F97316] via-[#FDE047] to-[#FFF7ED] shadow-[0_0_12px_#FBBF24]" />
    </div>
  );
}

function WelcomePoster({
  open,
  onClose,
  title,
  body,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#1C1917]/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evuddy-diwali-title"
    >
      <div className="relative max-w-lg overflow-hidden rounded-[28px] border border-[#FFD700]/35 bg-gradient-to-br from-[#1C1917] via-[#422006] to-[#1F6B4A] p-[1px] shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
        <div className="relative rounded-[27px] bg-gradient-to-br from-[#FFF7ED] via-[#FFFBEB] to-[#ECFDF5] px-6 py-8 sm:px-9 sm:py-10">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-2 text-[#78716C] transition hover:bg-[#1C1917]/5 hover:text-[#1C1917]"
            aria-label="Close Diwali greeting"
          >
            <X size={20} />
          </button>

          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[27px]" aria-hidden>
            <span className="evuddy-firework-ring absolute left-[12%] top-[18%] h-16 w-16 rounded-full border-2 border-[#E11D48]/40" />
            <span
              className="evuddy-firework-ring absolute right-[10%] top-[28%] h-20 w-20 rounded-full border-2 border-[#FF9933]/35"
              style={{ animationDelay: "0.9s" }}
            />
            <span
              className="evuddy-firework-ring absolute bottom-[20%] left-[40%] h-14 w-14 rounded-full border-2 border-[#1F6B4A]/35"
              style={{ animationDelay: "1.4s" }}
            />
          </div>

          <div className="relative flex justify-center gap-6">
            <DiyaIcon />
            <DiyaIcon className="scale-110" />
            <DiyaIcon />
          </div>

          <p className="mt-5 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-[#B45309]">
            EVUDDY wishes you
          </p>
          <h2
            id="evuddy-diwali-title"
            className="font-display mt-2 text-center text-4xl font-semibold tracking-[-0.03em] text-[#1C1917] sm:text-5xl"
          >
            {title}
          </h2>
          <p className="mt-3 text-center text-[15px] leading-7 text-[#57534E]">{body}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/ride-options"
              onClick={onClose}
              className="inline-flex items-center justify-center bg-[#1F6B4A] px-7 py-3.5 text-[13px] font-medium tracking-[0.08em] text-white hover:bg-[#18573c]"
            >
              Book an EV ride
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center border border-[#1C1917]/15 px-7 py-3.5 text-[13px] font-medium text-[#1C1917]"
            >
              Continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FestiveRibbon({ text }: { text: string }) {
  return (
    <div className="flex justify-center px-3" aria-hidden>
      <div className="max-w-xl rounded-full border border-[#FFD700]/40 bg-gradient-to-r from-[#7C2D12]/90 via-[#B45309]/90 to-[#1F6B4A]/90 px-4 py-1.5 text-center text-[10px] font-medium tracking-[0.18em] text-[#FFFBEB] shadow-lg sm:text-[11px]">
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
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!isDiwaliSeason()) return;
    document.documentElement.dataset.evuddyDiwali = "1";
    document.documentElement.dataset.evuddyFestive = "diwali";
    try {
      const seen = sessionStorage.getItem(DIWALI_SESSION_KEY);
      if (!seen) setShowWelcome(true);
    } catch {
      setShowWelcome(true);
    }
    return () => {
      delete document.documentElement.dataset.evuddyDiwali;
      delete document.documentElement.dataset.evuddyFestive;
    };
  }, []);

  const closeWelcome = () => {
    setShowWelcome(false);
    try {
      sessionStorage.setItem(DIWALI_SESSION_KEY, "1");
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
      <WelcomePoster
        open={showWelcome}
        onClose={closeWelcome}
        title={welcomeTitle}
        body={welcomeBody}
      />
    </>
  );
}
