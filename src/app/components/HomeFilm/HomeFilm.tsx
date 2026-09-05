"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brandMedia";

function FilmCopy() {
  return (
    <>
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/70 sm:tracking-[0.26em]">
        Smart electric mobility
      </p>
      <h2 className="font-display mt-3 max-w-xl text-[1.85rem] font-medium leading-[1.15] text-white sm:text-4xl lg:text-5xl">
        Pickup at the yard.
        <span className="mt-2 block italic text-white/90">Ride with OTP.</span>
      </h2>
      <Link href="/ride-options" className="pointer-events-auto mt-6 inline-block sm:mt-8">
        <span className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-white px-8 text-[13px] font-medium tracking-[0.08em] text-[#1C1917] sm:w-auto">
          Book an EV
          <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    </>
  );
}

export default function HomeFilm() {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          videoRef.current?.pause();
          return;
        }
        setSrc(BRAND.film);
      },
      { rootMargin: "240px" }
    );

    io.observe(frame);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!src) return;
    void videoRef.current?.play().catch(() => {});
  }, [src]);

  return (
    <section className="relative bg-[#1C1917]">
      <div ref={frameRef} className="relative overflow-hidden">
        <div className="relative h-[min(72svh,560px)] w-full sm:h-auto sm:aspect-[3/2] lg:aspect-[16/9]">
          <img
            src={BRAND.filmPoster}
            alt="Rider on an EVUDDY scooter at dusk"
            className="absolute inset-0 h-full w-full object-cover object-[center_80%] sm:object-[center_62%] lg:object-center"
            decoding="async"
          />
          {src ? (
            <video
              ref={videoRef}
              src={src}
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover object-[center_80%] sm:object-[center_62%] lg:object-center"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/15 to-transparent sm:via-[#1C1917]/40" />
          <div className="absolute inset-x-0 bottom-0 mx-auto hidden max-w-[1440px] px-5 pb-10 pt-24 sm:block sm:px-8 sm:pb-14 lg:px-12">
            <FilmCopy />
          </div>
        </div>
        <div className="px-5 py-8 sm:hidden">
          <FilmCopy />
        </div>
      </div>
    </section>
  );
}
