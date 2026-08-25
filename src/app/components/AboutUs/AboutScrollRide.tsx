"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

import { useEvuddySideSrc } from "@/app/components/Hero/useEvuddySideSrc";

const ROAD =
  "M 120 1680 C 520 1580, 820 1280, 1180 1120 S 1880 780, 2360 560 S 2920 280, 3280 160";

export default function AboutScrollRide() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  const bikeRef = useRef<SVGGElement>(null);
  const bikeSrc = useEvuddySideSrc();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const drive = (progress: number) => {
    const path = pathRef.current;
    const world = worldRef.current;
    const bike = bikeRef.current;
    if (!path || !world || !bike) return;

    const length = path.getTotalLength();
    const at = Math.max(0.02, Math.min(0.97, progress)) * length;
    const point = path.getPointAtLength(at);
    const look = path.getPointAtLength(Math.min(length, at + 24));
    const angle = (Math.atan2(look.y - point.y, look.x - point.x) * 180) / Math.PI;
    const tilt = Math.max(-6, Math.min(6, angle * 0.12));

    bike.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${tilt})`);
    world.setAttribute("transform", `translate(${320 - point.x} ${620 - point.y})`);
  };

  useMotionValueEvent(scrollYProgress, "change", drive);

  useEffect(() => {
    drive(scrollYProgress.get());
    const onResize = () => drive(scrollYProgress.get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [scrollYProgress, bikeSrc]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[320vh] bg-white"
      aria-label="EVUDDY scooter driving along the road"
    >
      <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-32deg, rgba(186,220,255,0.28) 0 28px, transparent 28px 160px)",
          }}
        />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <g ref={worldRef}>
            <path
              d={ROAD}
              fill="none"
              stroke="#C5DFF6"
              strokeWidth="110"
              strokeLinecap="round"
            />
            <path
              d={ROAD}
              fill="none"
              stroke="#F4FAFF"
              strokeWidth="78"
              strokeLinecap="round"
            />
            <path
              ref={pathRef}
              d={ROAD}
              fill="none"
              stroke="#6EA8D9"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="22 20"
            />

            <g ref={bikeRef}>
              {bikeSrc ? (
                <g transform="scale(-1 1)">
                  <image
                    href={bikeSrc}
                    x="-92"
                    y="-52"
                    width="184"
                    height="104"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
              ) : null}
            </g>
          </g>
        </svg>

        <div className="relative z-10 mx-auto flex h-full max-w-4xl items-center justify-center px-6 text-center">
          <div className="max-w-2xl rounded-[28px] bg-white/55 px-4 py-8 backdrop-blur-[2px] sm:px-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#18B368]">
              About EVUDDY
            </p>
            <h2 className="mt-4 text-[28px] font-black leading-[1.08] tracking-[-0.05em] text-[#08112F] sm:text-5xl">
              Transforming the future of mobility
              <span className="mt-2 block text-[#18B368]">through every EVUDDY ride</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              EVUDDY is building India&apos;s next-generation EV mobility ecosystem
              through B2B, B2C, and Rent-to-Own solutions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
