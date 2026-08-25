"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { useEvuddySideSrc } from "@/app/components/Hero/useEvuddySideSrc";

export default function AboutScrollRide() {
  const ref = useRef<HTMLElement>(null);
  const bikeSrc = useEvuddySideSrc();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const left = useTransform(scrollYProgress, [0.1, 0.9], ["6%", "70%"]);
  const top = useTransform(scrollYProgress, [0.1, 0.9], ["68%", "18%"]);

  return (
    <section
      ref={ref}
      className="relative h-[210vh] bg-white"
      aria-label="EVUDDY scooter on the road"
    >
      <div className="sticky top-0 flex h-[100svh] min-h-[640px] items-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-32deg, rgba(24,179,104,0.22) 0 42px, transparent 42px 120px)",
          }}
        />

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1000 700"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M 70 560 C 240 510, 390 250, 880 150"
            fill="none"
            stroke="#93C5FD"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray="11 13"
            opacity="0.85"
          />
        </svg>

        <div className="relative z-10 mx-auto w-full max-w-3xl px-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#18B368]">
            About EVUDDY
          </p>
          <h2 className="mt-4 text-[32px] font-black leading-[1.08] tracking-[-0.05em] text-[#08112F] sm:text-5xl lg:text-6xl">
            Transforming the future of mobility
            <span className="mt-2 block text-[#18B368]">through every EVUDDY ride</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            Scroll to ride. The scooter moves along the city path while EVUDDY
            stays the same idea: affordable electric mobility you can book, ride
            and own.
          </p>
        </div>

        <motion.img
          src={bikeSrc || "/new-bike.jpeg"}
          alt="EVUDDY electric scooter"
          style={{ left, top }}
          className="pointer-events-none absolute z-20 w-[150px] -translate-x-1/2 -translate-y-1/2 scale-x-[-1] drop-shadow-[0_18px_24px_rgba(15,23,42,0.22)] sm:w-[210px] lg:w-[248px]"
        />
      </div>
    </section>
  );
}
