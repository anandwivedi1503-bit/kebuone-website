"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeFilm() {
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMotionOk(!reduce);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#1C1917]">
      {motionOk ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          autoPlay
          muted
          loop
          playsInline
          poster="/brand/hub-yard.png"
        >
          <source src="/kebu-final.mp4" type="video/mp4" />
        </video>
      ) : (
        <img
          src="/brand/hub-yard.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/35 to-transparent" />
      <div className="ev-film-sheen pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex min-h-[380px] max-w-[1440px] flex-col justify-end px-5 py-16 sm:min-h-[480px] sm:px-8 lg:px-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-white/65">
          Smart electric mobility
        </p>
        <h2 className="font-display mt-3 max-w-xl text-4xl font-medium text-white sm:text-5xl">
          Pickup at the yard.
          <span className="mt-1 block italic text-white/85">Ride with OTP.</span>
        </h2>
        <Link href="/ride-options" className="mt-8 w-fit">
          <span className="inline-flex min-h-12 items-center gap-2 bg-white px-8 text-[13px] font-medium tracking-[0.08em] text-[#1C1917]">
            Book an EV
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
      <style>{`
        @keyframes ev-film-sheen {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .ev-film-sheen {
          background-image: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%);
          background-size: 220% 100%;
          animation: ev-film-sheen 9s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ev-film-sheen { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
