"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  msUntilNextIstMidnight,
  presentFestiveToday,
  type FestivePresentation,
} from "@/lib/festiveCalendar";

type LiveState = {
  ready: boolean;
  campaign: FestivePresentation | null;
};

const FestiveLiveContext = createContext<LiveState>({ ready: false, campaign: null });

export function useFestiveLive() {
  return useContext(FestiveLiveContext);
}

function applyTheme(campaign: FestivePresentation | null) {
  const root = document.documentElement;
  delete root.dataset.evuddyFestive;
  delete root.dataset.evuddyChhath;
  delete root.dataset.evuddyDiwali;
  root.style.removeProperty("--evuddy-festive-accent");
  if (!campaign) return;
  root.dataset.evuddyFestive = campaign.theme;
  root.style.setProperty("--evuddy-festive-accent", campaign.logoAccent);
  if (campaign.theme === "chhath") root.dataset.evuddyChhath = "1";
  if (campaign.theme === "diwali") root.dataset.evuddyDiwali = "1";
}

export default function FestiveLiveProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LiveState>({ ready: false, campaign: null });

  useEffect(() => {
    let cancelled = false;

    const publish = (campaign: FestivePresentation | null) => {
      if (cancelled) return;
      applyTheme(campaign);
      setState({ ready: true, campaign });
    };

    const load = async () => {
      try {
        const res = await fetch("/api/festive-today", { cache: "no-store" });
        if (!res.ok) throw new Error("festive-today");
        const json = (await res.json()) as { campaign?: FestivePresentation | null };
        publish(json.campaign ?? null);
      } catch {
        publish(presentFestiveToday());
      }
    };

    load();
    const poll = window.setInterval(load, 10 * 60 * 1000);
    let midnight = 0;
    const armMidnight = () => {
      midnight = window.setTimeout(() => {
        load().finally(() => {
          if (!cancelled) armMidnight();
        });
      }, msUntilNextIstMidnight());
    };
    armMidnight();

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.clearTimeout(midnight);
    };
  }, []);

  return <FestiveLiveContext.Provider value={state}>{children}</FestiveLiveContext.Provider>;
}
