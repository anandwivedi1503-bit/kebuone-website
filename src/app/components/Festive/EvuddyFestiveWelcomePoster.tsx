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
      <div className="evuddy-welcome-poster__hero">
        <img
          className="evuddy-welcome-poster__hero-photo"
          src={FESTIVE_FLATLAY}
          alt="Diwali sweets, marigolds and rose petals"
        />
        <div className="evuddy-welcome-poster__hero-fade" aria-hidden />
        <PosterStringLights />
        <div className="evuddy-welcome-poster__brand">
          <div className="evuddy-welcome-poster__logo-chip">
            <img src="/Evuddy-logo-dark-E.png" alt="EVUDDY" width={200} height={44} />
          </div>
          <p className="evuddy-welcome-poster__kicker">
            {FESTIVE_POSTER.kicker}
            <span>
              {" "}
              · {FESTIVE_POSTER.kickerEn}
            </span>
          </p>
        </div>
        <Image
          src={YELLOW_SCOOTER_CUTOUT}
          alt="EVUDDY yellow electric scooter"
          width={640}
          height={480}
          className="evuddy-welcome-poster__scooter-img"
          priority
        />
      </div>
      <PosterDiyaRow />

      <div className="evuddy-welcome-poster__copy">
        <h2>{title}</h2>
        <p>{body}</p>
      </div>

      <div className="evuddy-welcome-poster__facts">
        <div>
          <p className="evuddy-welcome-poster__fact-label">{left.line1}</p>
          <p className="evuddy-welcome-poster__fact-stat">
            <span>{left.prefix}</span>
            {left.stat}
          </p>
          <p className="evuddy-welcome-poster__fact-note">{left.line2}</p>
        </div>
        <div>
          <p className="evuddy-welcome-poster__fact-label">{right.line1}</p>
          <p className="evuddy-welcome-poster__fact-stat">
            <span>{right.prefix}</span>
            {right.stat}
          </p>
          <p className="evuddy-welcome-poster__fact-note">{right.line2}</p>
        </div>
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
      <div className="mx-auto w-full max-w-[420px]">
        <PosterArt title={title} body={body} onClose={onClose} showActions />
      </div>
    );
  }

  return (
    <div
      className="evuddy-welcome-poster-modal-shell fixed inset-0 z-[1200] flex items-center justify-center bg-[#0a1134]/50 p-3 backdrop-blur-sm sm:p-4"
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
