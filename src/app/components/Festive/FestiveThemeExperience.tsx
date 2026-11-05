"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import type { FestiveCampaign } from "@/lib/festiveCalendar";
import "../Diwali/diwali.css";
import "./festive-themes.css";

function AnimatedRibbon({ text, accent }: { text: string; accent: string }) {
  const doubled = useMemo(() => `${text}   ·   ${text}   ·   `, [text]);
  return (
    <div
      className="overflow-hidden border-y border-white/20 py-1.5"
      style={{
        background: `linear-gradient(90deg, color-mix(in srgb, ${accent} 92%, #0a1134), color-mix(in srgb, ${accent} 55%, #18b368), color-mix(in srgb, ${accent} 92%, #0a1134))`,
      }}
      aria-hidden
    >
      <div className="evuddy-festive-marquee-track whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.22em] text-white sm:text-[11px]">
        <span className="px-8">{doubled}</span>
        <span className="px-8">{doubled}</span>
      </div>
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
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#0a1134]/60 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-lg overflow-hidden rounded-[28px] p-[1px] shadow-[0_32px_90px_rgba(0,0,0,0.45)]"
        style={{
          background: `linear-gradient(135deg, ${campaign.logoAccent}, #18b368, #0a1134)`,
        }}
      >
        <div className="relative rounded-[27px] bg-gradient-to-br from-white via-[#f4faf7] to-[#eef6ff] px-6 py-8 sm:px-9 sm:py-10">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-2 text-slate-500 transition hover:bg-slate-900/5"
            aria-label="Close greeting"
          >
            <X size={20} />
          </button>
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[27px]" aria-hidden>
            <span
              className="evuddy-firework-ring absolute left-[8%] top-[15%] h-20 w-20 rounded-full border-2 opacity-40"
              style={{ borderColor: campaign.logoAccent }}
            />
            <span
              className="evuddy-firework-ring absolute right-[6%] bottom-[18%] h-16 w-16 rounded-full border-2 opacity-35"
              style={{ borderColor: campaign.logoAccent, animationDelay: "1.1s" }}
            />
          </div>
          <p
            className="text-center text-[11px] font-bold uppercase tracking-[0.28em]"
            style={{ color: campaign.logoAccent }}
          >
            EVUDDY · {campaign.theme}
          </p>
          <h2 className="font-display mt-3 text-center text-4xl font-semibold tracking-tight text-[#0a1134] sm:text-5xl">
            {campaign.welcomeTitle}
          </h2>
          <p className="mt-4 text-center text-[15px] leading-7 text-slate-600">{campaign.welcomeBody}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/ride-options"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${campaign.logoAccent}, #18b368)` }}
            >
              Book EV in Lucknow
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-7 py-3.5 text-sm font-semibold text-slate-800"
            >
              Explore the site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FestiveThemeExperience({ campaign }: { campaign: FestiveCampaign }) {
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.evuddyFestive = campaign.theme;
    document.documentElement.style.setProperty("--evuddy-festive-accent", campaign.logoAccent);
    try {
      if (!sessionStorage.getItem(campaign.sessionKey)) setWelcomeOpen(true);
    } catch {
      setWelcomeOpen(true);
    }
    return () => {
      delete document.documentElement.dataset.evuddyFestive;
      document.documentElement.style.removeProperty("--evuddy-festive-accent");
    };
  }, [campaign]);

  const closeWelcome = () => {
    try {
      sessionStorage.setItem(campaign.sessionKey, "1");
    } catch {
      /* ignore */
    }
    setWelcomeOpen(false);
  };

  return (
    <>
      <div className="evuddy-festive-below-nav">
        <AnimatedRibbon text={campaign.ribbon.replace(/✦/g, "").trim()} accent={campaign.logoAccent} />
      </div>
      <WelcomePoster campaign={campaign} open={welcomeOpen} onClose={closeWelcome} />
    </>
  );
}
