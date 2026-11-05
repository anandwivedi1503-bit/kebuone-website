"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

import { FESTIVE_POSTER } from "@/lib/festivePosterCopy";
import { YELLOW_SCOOTER_CUTOUT } from "@/lib/scooterAssets";
import "./festive-welcome-poster.css";

function MiniDiya() {
  return (
    <span className="inline-block h-2.5 w-3.5 rounded-b-full bg-gradient-to-b from-[#FF9933] to-[#C2410C]" aria-hidden>
      <span className="relative -top-2 mx-auto block h-1.5 w-1 rounded-full bg-gradient-to-t from-[#F97316] to-[#FDE047] shadow-[0_0_6px_#FBBF24]" />
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

function OfferPanel({
  side,
  stat,
  prefix,
  line1,
  line2,
}: {
  side: "green" | "gold";
  stat: string;
  prefix: string;
  line1: string;
  line2: string;
}) {
  return (
    <div
      className={`evuddy-welcome-poster__panel evuddy-welcome-poster__panel--${side === "green" ? "green" : "gold"}`}
    >
      <span className="evuddy-welcome-poster__stat-bg" aria-hidden>
        {stat}
      </span>
      <div className="evuddy-welcome-poster__offer">
        <div className="evuddy-welcome-poster__offer-stat">
          <span className="evuddy-welcome-poster__offer-prefix">{prefix}</span>
          <span>{stat}</span>
        </div>
        <p className="evuddy-welcome-poster__offer-line1">{line1}</p>
        <p className="evuddy-welcome-poster__offer-line2">{line2}</p>
      </div>
    </div>
  );
}

function PosterArt({ title, body }: { title: string; body: string }) {
  const { left, right } = FESTIVE_POSTER;

  return (
    <article className="evuddy-welcome-poster w-full max-w-3xl">
      <span className="evuddy-welcome-poster__rangoli evuddy-welcome-poster__rangoli--tl" aria-hidden />
      <span className="evuddy-welcome-poster__rangoli evuddy-welcome-poster__rangoli--br" aria-hidden />

      <header className="evuddy-welcome-poster__top">
        <img src="/Evuddy-logo-dark-E.png" alt="EVUDDY" width={200} height={44} />
        <p className="evuddy-welcome-poster__badge">
          <MiniDiya />
          {FESTIVE_POSTER.badge}
          <span className="opacity-80">·</span>
          {FESTIVE_POSTER.badgeHi}
          <MiniDiya />
        </p>
        <p className="hidden text-[9px] font-bold tracking-[0.2em] text-[#78716C] uppercase sm:block">
          {FESTIVE_POSTER.tagline}
        </p>
      </header>
      <div className="evuddy-welcome-poster__festoon" aria-hidden />

      <div className="evuddy-welcome-poster__split">
        <OfferPanel
          side="green"
          stat={left.stat}
          prefix={left.prefix}
          line1={left.line1}
          line2={left.line2}
        />
        <span className="evuddy-welcome-poster__plus" aria-hidden>
          +
        </span>
        <OfferPanel
          side="gold"
          stat={right.stat}
          prefix={right.prefix}
          line1={right.line1}
          line2={right.line2}
        />
        <div className="evuddy-welcome-poster__scooter">
          <Image
            src={YELLOW_SCOOTER_CUTOUT}
            alt="EVUDDY yellow electric scooter"
            width={680}
            height={510}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>

      <div className="evuddy-welcome-poster__message">
        <h2>{title}</h2>
        <p>{body}</p>
        <p className="evuddy-welcome-poster__hook">{FESTIVE_POSTER.hook}</p>
        <p className="evuddy-welcome-poster__tag">
          {FESTIVE_POSTER.hashtag} · {FESTIVE_POSTER.footerAction}
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
      <div className="mx-auto w-full max-w-3xl">
        <PosterArt title={title} body={body} />
        {actions}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#0A1134]/70 p-3 backdrop-blur-md sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evuddy-festive-poster-title"
    >
      <div className="evuddy-welcome-poster-modal relative w-full max-w-3xl">
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
        <div className="rounded-b-[20px] bg-[#FFFBEB] px-1 pb-1">{actions}</div>
      </div>
    </div>
  );
}
