"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

import { useEvuddySideSrc } from "@/app/components/Hero/useEvuddySideSrc";

const ROAD =
  "M 60 820 C 220 790, 310 680, 430 600 S 680 470, 860 400 S 1120 280, 1380 210";

export default function AboutScrollRide() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const bikeRef = useRef<SVGGElement>(null);
  const bikeSrc = useEvuddySideSrc();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const placeBike = (progress: number) => {
    const path = pathRef.current;
    const bike = bikeRef.current;
    if (!path || !bike) return;

    const length = path.getTotalLength();
    const distance = Math.max(0, Math.min(0.985, progress)) * length;
    const point = path.getPointAtLength(distance);
    const ahead = path.getPointAtLength(Math.min(length, distance + 18));
    const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
    const tilt = Math.max(-8, Math.min(8, angle * 0.18));

    bike.setAttribute(
      "transform",
      `translate(${point.x} ${point.y}) rotate(${tilt})`
    );
  };

  useMotionValueEvent(scrollYProgress, "change", placeBike);

  useEffect(() => {
    placeBike(scrollYProgress.get());
    const onResize = () => placeBike(scrollYProgress.get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [scrollYProgress, bikeSrc]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[260vh] bg-white"
      aria-label="EVUDDY scooter riding the road as you scroll"
    >
      <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-28deg, rgba(147,197,253,0.16) 0 36px, transparent 36px 140px)",
          }}
        />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <path
            d={ROAD}
            fill="none"
            stroke="#D7E9FB"
            strokeWidth="72"
            strokeLinecap="round"
          />
          <path
            d={ROAD}
            fill="none"
            stroke="#F8FBFF"
            strokeWidth="42"
            strokeLinecap="round"
          />
          <path
            ref={pathRef}
            d={ROAD}
            fill="none"
            stroke="#7EB0DE"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="16 18"
          />

          <g ref={bikeRef}>
            {bikeSrc ? (
              <g transform="scale(-1 1)">
                <image
                  href={bikeSrc}
                  x="-150"
                  y="-86"
                  width="300"
                  height="172"
                  preserveAspectRatio="xMidYMid meet"
                />
              </g>
            ) : null}
          </g>
        </svg>

        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#18B368]">
            About EVUDDY
          </p>
          <h2 className="mt-4 text-[30px] font-black leading-[1.08] tracking-[-0.05em] text-[#08112F] sm:text-5xl lg:text-[56px]">
            Transforming the future of mobility
            <span className="mt-2 block text-[#18B368]">through every EVUDDY ride</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            EVUDDY is building India&apos;s next-generation EV mobility ecosystem
            through B2B, B2C, and Rent-to-Own solutions.
          </p>
        </div>
      </div>
    </section>
  );
}
