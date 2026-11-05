"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { getActiveFestiveCampaign } from "@/lib/festiveCalendar";

const FestiveCelebration = dynamic(() => import("./FestiveCelebration"), { ssr: false });

function isOpsPath(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname === "/admin-login";
}

/** Seasonal marketing layer (IST calendar) on public pages only. */
export default function FestiveCelebrationGate() {
  const pathname = usePathname() || "";
  if (!getActiveFestiveCampaign() || isOpsPath(pathname)) return null;
  return <FestiveCelebration />;
}
