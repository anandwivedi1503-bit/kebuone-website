"use client";

import { usePathname } from "next/navigation";
import ChhathCelebration from "../Chhath/ChhathCelebration";
import DiwaliCelebration from "../Diwali/DiwaliCelebration";
import FestiveThemeExperience from "./FestiveThemeExperience";
import { useFestiveLive } from "./FestiveLive";

function isOpsPath(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname === "/admin-login";
}

/** Poster for the festival `/api/festive-today` resolved. The landing skin is CSS on that same theme. */
export default function FestiveCelebrationGate() {
  const pathname = usePathname() || "";
  const { ready, campaign } = useFestiveLive();
  if (!ready || !campaign || isOpsPath(pathname)) return null;

  if (campaign.theme === "diwali") {
    return <DiwaliCelebration campaign={campaign} />;
  }

  if (campaign.theme === "chhath") {
    return <ChhathCelebration campaign={campaign} />;
  }

  return <FestiveThemeExperience campaign={campaign} />;
}
