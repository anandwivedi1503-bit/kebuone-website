"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

import { FESTIVE_POSTER } from "@/lib/festivePosterCopy";
import { YELLOW_SCOOTER_CUTOUT } from "@/lib/scooterAssets";
import "./festive-welcome-poster.css";

function MiniDiya() {
  return (
    <span className="inline-block h-3 w-4 rounded-b-full bg-gradient-to-b from-[#FF9933] to-[#C2410C]" aria-hidden>
      <span className="relative -top-2.5 mx-auto block h-2 w-1.5 rounded-full bg-gradient-to-t from-[#F97316] to-[#FDE047] shadow-[0_0_8px_#FBBF24]" />
    </span>
  );
}

export type EvuddyFestiveWelcomePosterProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  /** When false, renders poster only (preview page). */
  asModal?: boolean;
};

function PosterArt({ title, body }: { title: string; body: string }) {
  return (
    <article className="evuddy-welcome-poster w-full max-w-2xl">
      <div className="evuddy-welcome-poster__flatlay" aria-hidden>
        <img src="/brand/diwali-sweets-flatlay.jpg" alt="" />
      </div>

      <div className="evuddy-welcome-poster__logo-row">
        <div className="evuddy-welcome-poster__logo-chip">
          <img src="/Evuddy-logo-dark-E.png" alt="EVUDDY" width={220} height={48} />
        </div>
        <p className="text-center text-[11px] font-semibold tracking-[0.2em] text-[#78716C] uppercase">
          {FESTIVE_POSTER.tagline}
        </p>
        <p className="evuddy-welcome-poster__badge">
          <MiniDiya />
          {FESTIVE_POSTER.badge}
          <span className="opacity-90">·</span>
          {FESTIVE_POSTER.badgeHi}
          <MiniDiya />
        </p>
      </div>

      <div className="evuddy-welcome-poster__split">
        <div className="evuddy-welcome-poster__panel evuddy-welcome-poster__panel--green">
          <p className="evuddy-welcome-poster__panel-title">{FESTIVE_POSTER.leftHeadline}</p>
          <p className="evuddy-welcome-poster__panel-sub">{FESTIVE_POSTER.leftSub}</p>
        </div>
        <span className="evuddy-welcome-poster__plus" aria-hidden>
          +
        </span>
        <div className="evuddy-welcome-poster__panel evuddy-welcome-poster__panel--gold">
          <p className="evuddy-welcome-poster__panel-title">{FESTIVE_POSTER.rightHeadline}</p>
          <p className="evuddy-welcome-poster__panel-sub">{FESTIVE_POSTER.rightSub}</p>
        </div>
        <div className="evuddy-welcome-poster__scooter">
          <Image
            src={YELLOW_SCOOTER_CUTOUT}
            alt="EVUDDY yellow electric scooter"
            width={640}
            height={480}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>

      <div className="evuddy-welcome-poster__title-block">
        <h2>{title}</h2>
        <p>{body}</p>
        <p className="mt-2 text-[12px] font-bold tracking-[0.18em] text-[#1F6B4A] uppercase">
          {FESTIVE_POSTER.hashtag}
        </p>
      </div>

      <div className="evuddy-welcome-poster__footer">
        <span>{FESTIVE_POSTER.footerCities}</span>
        <span>{FESTIVE_POSTER.tc}</span>
      </div>
    </article>
  );
}

export default function EvuddyFestiveWelcomePoster({
  open,
  onClose,
  title,
  body,
  asModal = true,
}: EvuddyFestiveWelcomePosterProps) {
  if (!open && asModal) return null;

  const actions = (
    <div className="evuddy-welcome-poster__actions">
      <Link href="/ride-options" onClick={onClose} className="evuddy-welcome-poster__cta-primary">
        {FESTIVE_POSTER.ctaPrimary}
      </Link>
      <button type="button" onClick={onClose} className="evuddy-welcome-poster__cta-secondary">
        {FESTIVE_POSTER.ctaSecondary}
      </button>
    </div>
  );

  if (!asModal) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <PosterArt title={title} body={body} />
        {actions}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#0A1134]/65 p-3 backdrop-blur-md sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evuddy-festive-poster-title"
    >
      <div className="evuddy-welcome-poster-modal relative w-full max-w-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-1 -top-1 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#57534E] shadow-lg ring-1 ring-black/5 transition hover:text-[#1C1917] sm:right-2 sm:top-2"
          aria-label="Close festive poster"
        >
          <X size={18} />
        </button>
        <PosterArt title={title} body={body} />
        <div id="evuddy-festive-poster-title" className="sr-only">
          {title}
        </div>
        <div className="rounded-b-[24px] bg-[#FFFBEB] px-1 pb-1">{actions}</div>
      </div>
    </div>
  );
}
