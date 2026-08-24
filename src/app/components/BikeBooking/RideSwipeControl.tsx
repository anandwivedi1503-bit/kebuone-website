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

  const maxTravel = () => Math.max((trackRef.current?.clientWidth || 280) - 64, 120);

  const finish = async (travel: number) => {
    const done = travel >= maxTravel() * 0.82;
    setOffset(0);
    if (!done || disabled || busy) return;
    await onConfirm();
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (disabled || busy) return;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = Math.min(maxTravel(), Math.max(0, event.clientX - rect.left - 32));
    setOffset(next);
  };

  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    void finish(offset);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div className="space-y-2">
      {hint ? <p className="text-sm text-slate-600">{hint}</p> : null}
      <div
        ref={trackRef}
        className={`relative h-16 overflow-hidden rounded-full border ${
          disabled ? "border-slate-200 bg-slate-100" : "border-emerald-200 bg-emerald-50"
        }`}
      >
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold uppercase tracking-[0.14em] text-emerald-800">
          {busy ? "Please wait..." : label}
        </p>
        <button
          type="button"
          disabled={disabled || busy}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute top-1.5 left-1.5 z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#16A34A] text-lg font-black text-white shadow-md disabled:bg-slate-400"
          style={{ transform: `translateX(${offset}px)` }}
          aria-label={label}
        >
          ››
        </button>
      </div>
    </div>
  );
}
