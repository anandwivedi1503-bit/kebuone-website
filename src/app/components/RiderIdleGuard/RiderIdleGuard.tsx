"use client";

import { useEffect } from "react";

import {
  clearRiderActivityClock,
  riderIdleExpired,
  touchRiderActivity,
} from "@/lib/riderSessionIdle";
import { logoutRider } from "@/lib/riderPlanGate";

const EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

export default function RiderIdleGuard() {
  useEffect(() => {
    touchRiderActivity();

    const onActivity = () => touchRiderActivity();
    for (const name of EVENTS) {
      window.addEventListener(name, onActivity, { passive: true });
    }

    const interval = window.setInterval(() => {
      if (!riderIdleExpired()) return;
      clearRiderActivityClock();
      void logoutRider();
    }, 30_000);

    return () => {
      for (const name of EVENTS) {
        window.removeEventListener(name, onActivity);
      }
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
