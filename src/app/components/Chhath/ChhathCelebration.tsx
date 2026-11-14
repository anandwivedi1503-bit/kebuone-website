"use client";

import { useEffect, useMemo, useState } from "react";
import type { FestiveCampaign } from "@/lib/festiveCalendar";
import EvuddyChhathWelcomePoster from "../Festive/EvuddyChhathWelcomePoster";
import "./chhath.css";

function SunGlints() {
  const glints = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: `${(i * 19 + 5) % 100}%`,
        delay: `${(i * 0.65) % 7}s`,
        duration: `${11 + (i % 4)}s`,
        size: 2 + (i % 3),
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[1000] overflow-hidden" aria-hidden>
      {glints.map((g, i) => (
        <span
          key={i}
          className="evuddy-chhath-glint absolute bottom-[-6px] rounded-full bg-[#FBBF24]/75"
          style={{
            left: g.left,
            width: g.size,
            height: g.size,
            animationDelay: g.delay,
            animationDuration: g.duration,
          }}
        />
      ))}
    </div>
  );
}

export default function ChhathCelebration({ campaign }: { campaign: FestiveCampaign }) {
  const sessionKey = campaign.sessionKey;
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    try {
      setShowWelcome(!sessionStorage.getItem(sessionKey));
    } catch {
      setShowWelcome(true);
    }
  }, [sessionKey]);

  const closeWelcome = () => {
    setShowWelcome(false);
    try {
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <SunGlints />
      <EvuddyChhathWelcomePoster
        open={showWelcome}
        onClose={closeWelcome}
        title={campaign.welcomeTitle}
        body={campaign.welcomeBody}
      />
    </>
  );
}
