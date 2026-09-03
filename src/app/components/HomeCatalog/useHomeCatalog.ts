"use client";

import { useEffect, useState } from "react";
import { HOME_CATALOG_FALLBACK, type HomeCatalog } from "@/lib/homeCatalog";

export function useHomeCatalog() {
  const [catalog, setCatalog] = useState<HomeCatalog>(HOME_CATALOG_FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/home-catalog")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json?.success && json.data) setCatalog(json.data as HomeCatalog);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { catalog, loaded };
}
