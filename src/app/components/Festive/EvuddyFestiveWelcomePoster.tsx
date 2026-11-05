"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

import { FESTIVE_POSTER } from "@/lib/festivePosterCopy";
import { YELLOW_SCOOTER_CUTOUT } from "@/lib/scooterAssets";
import { PosterDiyaRow, PosterStringLights } from "./FestivePosterDecor";
import "../Diwali/diwali.css";
import "./festive-welcome-poster.css";

const FESTIVE_FLATLAY = "/brand/diwali-sweets-flatlay.jpg";

export type EvuddyFestiveWelcomePosterProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
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
      <div className="evuddy-welcome-poster__festive-stage">
        <img
          className="evuddy-welcome-poster__festive-photo"
          src={FESTIVE_FLATLAY}
          alt=""
          aria-hidden
        />
      </div>

      <div className="evuddy-welcome-poster__brand-block">
        <PosterStringLights />
        <div className="evuddy-welcome-poster__logo-plate">
          <img src="/Evuddy-logo-dark-E.png" alt="EVUDDY" width={240} height={56} />
          <p className="evuddy-welcome-poster__logo-tagline">{FESTIVE_POSTER.tagline}</p>
        </div>
        <p className="evuddy-welcome-poster__badge">
          <span className="evuddy-welcome-poster__badge-diya" aria-hidden />
          {FESTIVE_POSTER.badge}
          <span className="opacity-75">·</span>
          {FESTIVE_POSTER.badgeHi}
          <span className="evuddy-welcome-poster__badge-diya" aria-hidden />
        </p>
        <PosterDiyaRow />
      </div>

      <div className="evuddy-welcome-poster__prop-strip" aria-hidden>
        <div className="evuddy-welcome-poster__prop evuddy-welcome-poster__prop--sweets">
          <img src={FESTIVE_FLATLAY} alt="" />
          <span>Mithai</span>
        </div>
        <div className="evuddy-welcome-poster__prop evuddy-welcome-poster__prop--crackers">
          <img src={FESTIVE_FLATLAY} alt="" />
          <span>Crackers</span>
        </div>
      </div>

      <div className="evuddy-welcome-poster__offer-block">
        <span className="evuddy-welcome-poster__rangoli evuddy-welcome-poster__rangoli--tl" aria-hidden />
        <span className="evuddy-welcome-poster__rangoli evuddy-welcome-poster__rangoli--br" aria-hidden />

        <div className="evuddy-welcome-poster__split">
          <OfferPanel
            side="green"
            stat={left.stat}
            prefix={left.prefix}
            line1={left.line1}
            line2={left.line2}
          />
          <OfferPanel
            side="gold"
            stat={right.stat}
            prefix={right.prefix}
            line1={right.line1}
            line2={right.line2}
          />
        </div>

        <p className="evuddy-welcome-poster__plus" aria-hidden>
          +
        </p>

        <div className="evuddy-welcome-poster__scooter-row">
          <Image
            src={YELLOW_SCOOTER_CUTOUT}
            alt="EVUDDY yellow electric scooter"
            width={680}
            height={510}
            className="evuddy-welcome-poster__scooter-img"
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
      className="evuddy-welcome-poster-modal-shell fixed inset-0 z-[1200] flex items-center justify-center bg-[#1C1917]/60 p-3 backdrop-blur-md sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evuddy-festive-poster-title"
    >
      <div className="evuddy-welcome-poster-modal evuddy-welcome-poster-modal-inner relative flex max-h-[min(92svh,920px)] w-full max-w-3xl flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-1 top-1 z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#57534E] shadow-lg ring-1 ring-black/5 transition hover:text-[#1C1917] sm:right-2 sm:top-2"
          aria-label="Close festive poster"
        >
          <X size={18} />
        </button>
        <div className="evuddy-welcome-poster-modal-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain rounded-[20px]">
          <PosterArt title={title} body={body} />
          <div id="evuddy-festive-poster-title" className="sr-only">
            {title}
          </div>
          <div className="rounded-b-[20px] bg-[#FFFBEB] px-1 pb-1">{actions}</div>
        </div>
      </div>
    </div>
  );
}
