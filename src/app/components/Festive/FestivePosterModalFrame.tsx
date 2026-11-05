"use client";

import { useLayoutEffect, useRef, useState } from "react";

const MAX_VIEWPORT_FRACTION = 0.92;
const MAX_HEIGHT_PX = 680;

type ScaleLayout = { scale: number; height: number };

/**
 * Keeps the full festive poster visible in one viewport frame (no inner scroll).
 */
export default function FestivePosterModalFrame({
  children,
  remeasureKey,
  closeButton,
}: {
  children: React.ReactNode;
  remeasureKey?: string;
  closeButton?: React.ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<ScaleLayout>({ scale: 1, height: 0 });

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;

    const measure = () => {
      content.style.transform = "none";
      const maxHeight = Math.min(window.innerHeight * MAX_VIEWPORT_FRACTION, MAX_HEIGHT_PX);
      const maxWidth = frame.clientWidth;
      const naturalHeight = content.offsetHeight;
      const naturalWidth = content.offsetWidth;
      if (!naturalHeight || !maxWidth || !naturalWidth) return;

      const scale = Math.min(1, maxHeight / naturalHeight, maxWidth / naturalWidth);
      setLayout({ scale, height: Math.ceil(naturalHeight * scale) });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(content);
    ro.observe(frame);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [remeasureKey]);

  return (
    <div
      ref={frameRef}
      className="evuddy-welcome-poster-modal-frame"
      style={layout.height > 0 ? { height: layout.height } : undefined}
    >
      {closeButton}
      <div
        ref={contentRef}
        className="evuddy-welcome-poster-modal-scale"
        style={
          layout.scale < 1
            ? { transform: `scale(${layout.scale})`, transformOrigin: "top center" }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
