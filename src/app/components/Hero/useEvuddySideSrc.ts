"use client";

import { useEffect, useState } from "react";

import { YELLOW_SCOOTER_CANDIDATES, YELLOW_SCOOTER_CUTOUT } from "@/lib/scooterAssets";

export function useEvuddySideSrc() {
  const [src, setSrc] = useState(YELLOW_SCOOTER_CUTOUT);

  useEffect(() => {
    let cancelled = false;

    const load = (index: number) => {
      if (index >= YELLOW_SCOOTER_CANDIDATES.length) {
        setSrc(YELLOW_SCOOTER_CUTOUT);
        return;
      }
      const file = YELLOW_SCOOTER_CANDIDATES[index];
      const image = new Image();
      image.onload = () => {
        if (!cancelled) setSrc(file);
      };
      image.onerror = () => load(index + 1);
      image.src = file;
    };

    load(0);
    return () => {
      cancelled = true;
    };
  }, []);

  return src;
}
