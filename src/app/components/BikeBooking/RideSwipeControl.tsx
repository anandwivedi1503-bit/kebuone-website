"use client";

import { useRef, useState, type PointerEvent } from "react";

export default function RideSwipeControl({
  label,
  hint,
  disabled,
  busy,
  onConfirm,
}: {
  label: string;
  hint?: string;
  disabled?: boolean;
  busy?: boolean;
  onConfirm: () => Promise<void>;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);
  const dragging = useRef(false);
  const travelRef = useRef(0);
  const startX = useRef(0);

  const maxTravel = () => Math.max((trackRef.current?.clientWidth || 280) - 56, 100);

  const finish = async (travel: number) => {
    const done = travel >= maxTravel() * 0.82;
    travelRef.current = 0;
    setOffset(0);
    if (!done || disabled || busy) return;
    await onConfirm();
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (disabled || busy) return;
    dragging.current = true;
    startX.current = event.clientX - offset;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    const next = Math.min(maxTravel(), Math.max(0, event.clientX - startX.current));
    travelRef.current = next;
    setOffset(next);
  };

  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    void finish(travelRef.current);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }
  };

  return (
    <div className="space-y-2">
      {hint ? <p className="text-sm leading-6 text-slate-600">{hint}</p> : null}
      <div
        ref={trackRef}
        className={`relative h-14 touch-none select-none overflow-hidden rounded-full border sm:h-16 ${
          disabled ? "border-slate-200 bg-slate-100" : "border-emerald-200 bg-emerald-50"
        }`}
        style={{ touchAction: "none" }}
      >
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-14 text-center text-xs font-bold uppercase tracking-[0.12em] text-emerald-800 sm:text-sm sm:tracking-[0.14em]">
          {busy ? "Please wait..." : label}
        </p>
        <button
          type="button"
          disabled={disabled || busy}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute top-1 left-1 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#16A34A] text-lg font-black text-white shadow-md disabled:bg-slate-400 sm:top-1.5 sm:left-1.5 sm:h-[52px] sm:w-[52px]"
          style={{ transform: `translateX(${offset}px)`, touchAction: "none" }}
          aria-label={label}
        >
          ››
        </button>
      </div>
    </div>
  );
}
