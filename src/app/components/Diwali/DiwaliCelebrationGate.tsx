"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { presentFestiveToday } from "@/lib/festiveCalendar";

const DiwaliCelebration = dynamic(() => import("./DiwaliCelebration"), { ssr: false });

function isOpsPath(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname === "/admin-login";
}

/** Legacy entry. The live site uses FestiveCelebrationGate, which asks /api/festive-today. */
export default function DiwaliCelebrationGate() {
  const pathname = usePathname() || "";
  const campaign = presentFestiveToday();
  if (!campaign || campaign.theme !== "diwali" || isOpsPath(pathname)) return null;
  return <DiwaliCelebration campaign={campaign} />;
}
