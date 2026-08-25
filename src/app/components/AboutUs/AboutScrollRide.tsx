"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

import { useEvuddySideSrc } from "@/app/components/Hero/useEvuddySideSrc";

const ROAD = "M 90 820 C 380 740, 640 430, 1350 170";

export default function AboutScrollRide() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const bikeRef = useRef<HTMLImageElement>(null);
  const bikeSrc = useEvuddySideSrc();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const move = (progress: number) => {
    const path = pathRef.current;
    const bike = bikeRef.current;
    const stage = stageRef.current;
    const svg = path?.ownerSVGElement;
    if (!path || !bike || !stage || !svg) return;

    const matrix = path.getScreenCTM();
    if (!matrix) return;

    const length = path.getTotalLength();
    const point = path.getPointAtLength(
      Math.max(0.02, Math.min(0.96, progress)) * length
    );
    const mapped = svg.createSVGPoint();
    mapped.x = point.x;
    mapped.y = point.y;
    const screen = mapped.matrixTransform(matrix);
    const box = stage.getBoundingClientRect();

    bike.style.transform = `translate3d(${screen.x - box.left}px, ${screen.y - box.top}px, 0) translate(-50%, -78%) scaleX(-1)`;
  };

  useMotionValueEvent(scrollYProgress, "change", move);

  useEffect(() => {
    move(scrollYProgress.get());
    const onResize = () => move(scrollYProgress.get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [scrollYProgress, bikeSrc]);

  return (
    <section ref={sectionRef} className="relative h-[400vh] bg-white">
      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] min-h-[600px] overflow-hidden"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-32deg, rgba(147,197,253,0.2) 0 34px, transparent 34px 150px)",
          }}
        />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <path
            d={ROAD}
            fill="none"
            stroke="#D6E9FB"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            ref={pathRef}
            d={ROAD}
            fill="none"
            stroke="#8FBFEE"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="14 16"
          />
        </svg>

        {bikeSrc ? (
          <img
            ref={bikeRef}
            src={bikeSrc}
            alt=""
            className="pointer-events-none absolute left-0 top-0 z-20 w-[128px] max-w-none origin-center will-change-transform sm:w-[168px] lg:w-[190px]"
          />
        ) : null}

        <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#18B368]">
            About EVUDDY
          </p>
          <h1 className="mt-5 text-[34px] font-black leading-[1.05] tracking-[-0.05em] text-[#08112F] sm:text-6xl">
            Transforming the future of mobility
            <span className="mt-3 block text-[#18B368]">through every EVUDDY ride</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-slate-600 sm:text-lg">
            EVUDDY is building India&apos;s next-generation EV mobility ecosystem
            through B2B, B2C, and Rent-to-Own solutions.
          </p>
        </div>
      </div>
    </section>
  );
}
