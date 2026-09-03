"use client";

import { useEffect, useState } from "react";

export default function HomeClips() {
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMotionOk(!reduce);
  }, []);

  const clips = [
    { src: "/hero-finalback.mp4", poster: "/brand/charge-dusk.png", kicker: "Fleet", title: "Ready at the hub" },
    { src: "/hero-del.mp4", poster: "/brand/gps-detail.png", kicker: "GPS", title: "Live on every ride" },
  ];

  return (
    <section className="bg-[#F7F4EE] pb-4">
      <div className="mx-auto grid max-w-[1440px] gap-px bg-[#E4DDD2] px-5 sm:grid-cols-2 sm:px-8 lg:px-12">
        {clips.map((clip) => (
          <figure key={clip.title} className="relative overflow-hidden bg-[#1C1917]">
            {motionOk ? (
              <video
                className="h-56 w-full object-cover opacity-80 sm:h-72 lg:h-80"
                autoPlay
                muted
                loop
                playsInline
                poster={clip.poster}
              >
                <source src={clip.src} type="video/mp4" />
              </video>
            ) : (
              <img src={clip.poster} alt="" className="h-56 w-full object-cover opacity-80 sm:h-72 lg:h-80" />
            )}
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1C1917] to-transparent px-5 pb-5 pt-12">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">{clip.kicker}</p>
              <p className="font-display mt-1 text-2xl text-white">{clip.title}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
