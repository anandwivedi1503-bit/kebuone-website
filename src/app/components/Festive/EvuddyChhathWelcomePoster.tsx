"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

import { CHHATH_POSTER } from "@/lib/festivePosterCopy";
import { YELLOW_SCOOTER_CUTOUT } from "@/lib/scooterAssets";
import { ChhathMarigoldBand, ChhathOfferingRow, ChhathSunRays } from "./ChhathPosterDecor";
import FestivePosterModalFrame from "./FestivePosterModalFrame";
import "./chhath-welcome-poster.css";

const CHHATH_HERO = "/brand/chhath-sunrise-ghat.jpg";

export type EvuddyChhathWelcomePosterProps = {
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
  const { left, right } = CHHATH_POSTER;

  return (
    <article className="evuddy-chhath-poster">
      <div className="evuddy-chhath-poster__hero">
        <img
          className="evuddy-chhath-poster__hero-photo"
          src={CHHATH_HERO}
          alt="Chhath Puja sunrise at the river ghat with traditional offerings"
        />
        <div className="evuddy-chhath-poster__water-shimmer" aria-hidden />
        <ChhathSunRays />
        <div className="evuddy-chhath-poster__hero-fade" aria-hidden />
        <div className="evuddy-chhath-poster__brand">
          <div className="evuddy-chhath-poster__logo-chip">
            <img src="/Evuddy-logo-dark-E.png" alt="EVUDDY" width={200} height={44} />
          </div>
          <p className="evuddy-chhath-poster__kicker">
            {CHHATH_POSTER.kicker}
            <span>
              {" "}
              · {CHHATH_POSTER.kickerEn}
            </span>
          </p>
        </div>
        <Image
          src={YELLOW_SCOOTER_CUTOUT}
          alt="EVUDDY yellow electric scooter"
          width={640}
          height={480}
          className="evuddy-chhath-poster__scooter-img"
          priority
        />
      </div>
      <ChhathOfferingRow />
      <ChhathMarigoldBand />

      <div className="evuddy-chhath-poster__copy">
        <h2>{title}</h2>
        <p>{body}</p>
      </div>

      <div className="evuddy-chhath-poster__facts">
        <div>
          <p className="evuddy-chhath-poster__fact-label">{left.line1}</p>
          <p className="evuddy-chhath-poster__fact-stat">
            <span>{left.prefix}</span>
            {left.stat}
          </p>
          <p className="evuddy-chhath-poster__fact-note">{left.line2}</p>
        </div>
        <div>
          <p className="evuddy-chhath-poster__fact-label">{right.line1}</p>
          <p className="evuddy-chhath-poster__fact-stat">
            <span>{right.prefix}</span>
            {right.stat}
          </p>
          <p className="evuddy-chhath-poster__fact-note">{right.line2}</p>
        </div>
      </div>

      {showActions ? (
        <div className="evuddy-chhath-poster__actions">
          <Link href="/ride-options" onClick={onClose} className="evuddy-chhath-poster__cta-primary">
            {CHHATH_POSTER.ctaPrimary}
          </Link>
          <button type="button" onClick={onClose} className="evuddy-chhath-poster__cta-secondary">
            {CHHATH_POSTER.ctaSecondary}
          </button>
        </div>
      ) : null}

      <footer className="evuddy-chhath-poster__bar">
        <span>
          {CHHATH_POSTER.footerCities} · {CHHATH_POSTER.hashtag}
        </span>
        <span>{CHHATH_POSTER.tc}</span>
      </footer>
    </article>
  );
}

export default function EvuddyChhathWelcomePoster({
  open,
  onClose,
  title,
  body,
  asModal = true,
}: EvuddyChhathWelcomePosterProps) {
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
      className="evuddy-welcome-poster-modal-shell fixed inset-0 z-[1200] flex items-center justify-center bg-[#0a1134]/55 p-3 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evuddy-chhath-poster-title"
    >
      <FestivePosterModalFrame
        remeasureKey={`${title}|${body}`}
        closeButton={
          <button
            type="button"
            onClick={onClose}
            className="evuddy-welcome-poster__close"
            aria-label="Close Chhath Puja poster"
          >
            <X size={18} />
          </button>
        }
      >
        <PosterArt title={title} body={body} onClose={onClose} showActions />
        <p id="evuddy-chhath-poster-title" className="sr-only">
          {title}
        </p>
      </FestivePosterModalFrame>
    </div>
  );
}
