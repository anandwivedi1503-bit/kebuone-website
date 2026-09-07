"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const EvuddyAssistant = dynamic(
  () => import("./EvuddyAssistant"),
  { ssr: false }
);

function isOpsPath(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname === "/admin-login"
  );
}

/** Load Eva after idle, and never on ops pages (avoids Firebase on every admin click). */
export default function EvuddyAssistantGate() {
  const pathname = usePathname() || "";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isOpsPath(pathname)) {
      setReady(false);
      return;
    }
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof win.requestIdleCallback === "function") {
      const idle = win.requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => win.cancelIdleCallback?.(idle);
    }
    const timer = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!ready || isOpsPath(pathname)) return null;
  return <EvuddyAssistant />;
}
