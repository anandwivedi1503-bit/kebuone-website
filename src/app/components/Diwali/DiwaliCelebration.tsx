"use client";

import { useEffect, useMemo, useState } from "react";
import type { FestiveCampaign } from "@/lib/festiveCalendar";
import EvuddyFestiveWelcomePoster from "../Festive/EvuddyFestiveWelcomePoster";
import "./diwali.css";

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

export default function DiwaliCelebration({ campaign }: { campaign: FestiveCampaign }) {
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
      <Sparkles />
      <EvuddyFestiveWelcomePoster
        open={showWelcome}
        onClose={closeWelcome}
        title={campaign.welcomeTitle}
        body={campaign.welcomeBody}
      />
    </>
  );
}
