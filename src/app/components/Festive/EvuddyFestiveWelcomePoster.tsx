"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

import { FESTIVE_POSTER } from "@/lib/festivePosterCopy";
import { YELLOW_SCOOTER_CUTOUT } from "@/lib/scooterAssets";
import FestivePosterModalFrame from "./FestivePosterModalFrame";
import { PosterDiyaRow, PosterStringLights } from "./FestivePosterDecor";
import "./festive-welcome-poster.css";

const FESTIVE_FLATLAY = "/brand/diwali-sweets-flatlay.jpg";

export type EvuddyFestiveWelcomePosterProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  asModal?: boolean;
};

function PosterArt({
  title,
  body,
  onClose,
  showActions,
}: {
  title: string;
  body: string;
  onClose: () => void;
  showActions: boolean;
}) {
  const { left, right } = FESTIVE_POSTER;

  return (
    <article className="evuddy-welcome-poster">
      <header className="evuddy-welcome-poster__head">
        <img className="evuddy-welcome-poster__head-photo" src={FESTIVE_FLATLAY} alt="" aria-hidden />
        <div className="evuddy-welcome-poster__head-shade" aria-hidden />
        <div className="evuddy-welcome-poster__head-ui">
          <PosterStringLights />
          <div className="evuddy-welcome-poster__logo-chip">
            <img src="/Evuddy-logo-dark-E.png" alt="EVUDDY" width={200} height={44} />
          </div>
          <p className="evuddy-welcome-poster__badge">
            {FESTIVE_POSTER.badge} · {FESTIVE_POSTER.badgeHi}
          </p>
        </div>
      </header>

      <div className="evuddy-welcome-poster__offers">
        <div className="evuddy-welcome-poster__panel evuddy-welcome-poster__panel--green">
          <p className="evuddy-welcome-poster__stat">
            <span>{left.prefix}</span>
            {left.stat}
          </p>
          <p className="evuddy-welcome-poster__line1">{left.line1}</p>
          <p className="evuddy-welcome-poster__line2">{left.line2}</p>
        </div>
        <div className="evuddy-welcome-poster__panel evuddy-welcome-poster__panel--gold">
          <p className="evuddy-welcome-poster__stat">
            <span>{right.prefix}</span>
            {right.stat}
          </p>
          <p className="evuddy-welcome-poster__line1">{right.line1}</p>
          <p className="evuddy-welcome-poster__line2">{right.line2}</p>
        </div>
        <span className="evuddy-welcome-poster__plus" aria-hidden>
          +
        </span>
      </div>

      <div className="evuddy-welcome-poster__scooter-strip">
        <Image
          src={YELLOW_SCOOTER_CUTOUT}
          alt="EVUDDY yellow electric scooter"
          width={520}
          height={390}
          className="evuddy-welcome-poster__scooter-img"
          priority
        />
      </div>
      <PosterDiyaRow />

      <div className="evuddy-welcome-poster__copy">
        <h2>{title}</h2>
        <p>{body}</p>
      </div>

      {showActions ? (
        <div className="evuddy-welcome-poster__actions">
          <Link href="/ride-options" onClick={onClose} className="evuddy-welcome-poster__cta-primary">
            {FESTIVE_POSTER.ctaPrimary}
          </Link>
          <button type="button" onClick={onClose} className="evuddy-welcome-poster__cta-secondary">
            {FESTIVE_POSTER.ctaSecondary}
          </button>
        </div>
      ) : null}

      <footer className="evuddy-welcome-poster__bar">
        <span>
          {FESTIVE_POSTER.footerCities} · {FESTIVE_POSTER.hashtag}
        </span>
        <span>{FESTIVE_POSTER.tc}</span>
      </footer>
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

  if (!asModal) {
    return (
      <div className="mx-auto w-full max-w-[640px]">
        <PosterArt title={title} body={body} onClose={onClose} showActions />
      </div>
    );
  }

  return (
    <div
      className="evuddy-welcome-poster-modal-shell fixed inset-0 z-[1200] flex items-center justify-center bg-[#1C1917]/55 p-3 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evuddy-festive-poster-title"
    >
      <FestivePosterModalFrame
        remeasureKey={`${title}|${body}`}
        closeButton={
          <button
            type="button"
            onClick={onClose}
            className="evuddy-welcome-poster__close"
            aria-label="Close festive poster"
          >
            <X size={18} />
          </button>
        }
      >
        <PosterArt title={title} body={body} onClose={onClose} showActions />
        <p id="evuddy-festive-poster-title" className="sr-only">
          {title}
        </p>
      </FestivePosterModalFrame>
    </div>
  );
}
