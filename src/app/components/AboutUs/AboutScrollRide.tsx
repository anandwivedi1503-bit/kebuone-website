"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { useEvuddySideSrc } from "@/app/components/Hero/useEvuddySideSrc";

export default function AboutScrollRide() {
  const sectionRef = useRef<HTMLElement>(null);
  const bikeSrc = useEvuddySideSrc();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const top = useTransform(scrollYProgress, [0, 1], ["4%", "76%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.55, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[320vh] bg-white"
      aria-label="EVUDDY scooter coming down the road"
    >
      <div className="sticky top-0 flex h-[100svh] min-h-[560px] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-32deg, rgba(147,197,253,0.16) 0 32px, transparent 32px 150px)",
          }}
        />

        <div className="relative z-10 grid h-full w-full grid-cols-1 lg:grid-cols-[0.42fr_0.58fr]">
          <div className="relative h-[46vh] lg:h-full">
            <div
              className="absolute inset-y-0 left-1/2 w-[min(42vw,220px)] -translate-x-1/2 bg-[#8FA6B8] shadow-[inset_0_0_0_10px_#6B8498]"
              style={{
                clipPath: "polygon(32% 0, 68% 0, 96% 100%, 4% 100%)",
              }}
            />
            <div
              className="absolute inset-y-0 left-1/2 w-[min(30vw,150px)] -translate-x-1/2 bg-[#A9BCCB]"
              style={{
                clipPath: "polygon(34% 0, 66% 0, 90% 100%, 10% 100%)",
              }}
            />
            <div
              className="absolute inset-y-[4%] left-1/2 w-1 -translate-x-1/2"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, #fff 0 18px, transparent 18px 36px)",
              }}
            />

            <motion.img
              src={bikeSrc || "/new-bike.jpeg"}
              alt="EVUDDY scooter"
              style={{ top, scale }}
              className="pointer-events-none absolute left-1/2 z-20 w-14 -translate-x-1/2 drop-shadow-[0_10px_12px_rgba(15,23,42,0.28)] sm:w-16 lg:w-[72px]"
            />
          </div>

          <div className="flex items-center px-6 pb-10 lg:px-12 lg:pb-0">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#18B368]">
                About EVUDDY
              </p>
              <h1 className="mt-4 text-[30px] font-black leading-[1.08] tracking-[-0.05em] text-[#08112F] sm:text-5xl">
                Transforming the future of mobility
                <span className="mt-2 block text-[#18B368]">
                  through every EVUDDY ride
                </span>
              </h1>
              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                EVUDDY is building India&apos;s next-generation EV mobility
                ecosystem through B2B, B2C, and Rent-to-Own solutions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
