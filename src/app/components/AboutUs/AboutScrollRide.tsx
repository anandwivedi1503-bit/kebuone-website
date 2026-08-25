"use client";

import { useEffect, useRef } from "react";

import { useEvuddySideSrc } from "@/app/components/Hero/useEvuddySideSrc";

function Tree() {
  return (
    <div className="flex flex-col items-center">
      <div className="h-8 w-8 rounded-full bg-[#3F9A4F] sm:h-10 sm:w-10" />
      <div className="-mt-1 h-6 w-1.5 rounded-full bg-[#7A4A22]" />
    </div>
  );
}

function House({ wall, roof }: { wall: string; roof: string }) {
  return (
    <div className="relative w-12 sm:w-14">
      <div
        className="h-4 sm:h-5"
        style={{ background: roof, clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
      />
      <div className="relative h-10 overflow-hidden sm:h-12" style={{ background: wall }}>
        <div className="absolute left-1.5 top-2 h-2 w-2 bg-[#7DD3FC]" />
        <div className="absolute right-1.5 top-2 h-2 w-2 bg-[#7DD3FC]" />
        <div className="absolute bottom-0 left-1/2 h-4 w-3 -translate-x-1/2 bg-[#9A3412]" />
      </div>
    </div>
  );
}

const LEFT_SCENE = [
  "tree",
  "house",
  "tree",
  "house",
  "tree",
  "house",
  "tree",
  "house",
] as const;

const RIGHT_SCENE = [
  "house",
  "tree",
  "house",
  "tree",
  "house",
  "tree",
  "house",
  "tree",
] as const;

export default function AboutScrollRide() {
  const sectionRef = useRef<HTMLElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const bikeRef = useRef<HTMLImageElement>(null);
  const bikeSrc = useEvuddySideSrc();

  useEffect(() => {
    const tick = () => {
      const section = sectionRef.current;
      const road = roadRef.current;
      const bike = bikeRef.current;
      if (!section || !road || !bike) return;

      const rect = section.getBoundingClientRect();
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(-rect.top / travel, 0), 1);
      const maxTop = Math.max(road.clientHeight - bike.offsetHeight - 16, 0);
      bike.style.top = `${8 + progress * maxTop}px`;
    };

    tick();
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    return () => {
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
    };
  }, [bikeSrc]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[340vh] bg-[#F7FBFA]"
      aria-label="EVUDDY scooter moving down the road"
    >
      <div className="sticky top-0 flex h-[100svh] min-h-[560px] items-stretch overflow-hidden bg-white">
        <div className="relative flex w-full max-w-[520px] shrink-0 items-stretch justify-center px-3 sm:px-6">
          <div className="flex h-full w-12 flex-col items-center justify-around py-6 sm:w-16">
            {LEFT_SCENE.map((item, index) =>
              item === "tree" ? (
                <Tree key={`l-${index}`} />
              ) : (
                <House
                  key={`l-${index}`}
                  wall={index % 4 === 1 ? "#FDE68A" : "#FED7AA"}
                  roof={index % 4 === 1 ? "#B45309" : "#DC2626"}
                />
              )
            )}
          </div>

          <div
            ref={roadRef}
            className="relative mx-1 h-full w-[92px] shrink-0 rounded-none bg-[#6B7280] sm:mx-2 sm:w-[110px]"
          >
            <div className="absolute inset-y-0 left-0 w-1.5 bg-[#9CA3AF]" />
            <div className="absolute inset-y-0 right-0 w-1.5 bg-[#9CA3AF]" />
            <div
              className="absolute inset-y-3 left-1/2 w-[5px] -translate-x-1/2"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, #fff 0 22px, transparent 22px 40px)",
              }}
            />
            <img
              ref={bikeRef}
              src={bikeSrc || "/new-bike.jpeg"}
              alt="EVUDDY scooter"
              className="pointer-events-none absolute left-1/2 z-10 w-[52px] -translate-x-1/2 sm:w-[58px]"
              style={{ top: 8 }}
            />
          </div>

          <div className="flex h-full w-12 flex-col items-center justify-around py-6 sm:w-16">
            {RIGHT_SCENE.map((item, index) =>
              item === "tree" ? (
                <Tree key={`r-${index}`} />
              ) : (
                <House
                  key={`r-${index}`}
                  wall={index % 4 === 0 ? "#BFDBFE" : "#FBCFE8"}
                  roof={index % 4 === 0 ? "#1D4ED8" : "#9D174D"}
                />
              )
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center px-5 sm:px-10">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#18B368]">
              About EVUDDY
            </p>
            <h1 className="mt-4 text-[28px] font-black leading-[1.08] tracking-[-0.05em] text-[#08112F] sm:text-5xl">
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
    </section>
  );
}
