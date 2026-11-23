"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { YELLOW_SCOOTER_CUTOUT } from "@/lib/scooterAssets";
import { BRAND } from "@/lib/brandMedia";

const PLANS = [
  { name: "Hourly", price: "₹60", sub: "City hops" },
  { name: "Daily", price: "₹250", sub: "Commute" },
  { name: "Weekly", price: "₹1,400", sub: "Work week" },
];

export default function ModernLandingPreview() {
  const root = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end end"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 120]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function onHeroMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: nx, y: ny });
  }

  return (
    <div ref={root} className="evuddy-landing-preview min-h-[100svh] bg-[#0A0C0B] text-[#F7F4EE]">
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left bg-[#FFCC00]"
      />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0A0C0B]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <span className="text-[13px] font-semibold tracking-[0.2em] text-[#FFCC00]">EVUDDY</span>
          <span className="rounded-full border border-[#FFCC00]/40 px-3 py-1 text-[10px] uppercase tracking-widest text-[#FFCC00]">
            Blueprint preview
          </span>
          <Link href="/" className="text-[12px] text-white/70 hover:text-white">
            ← Live site
          </Link>
        </div>
      </header>

      <motion.section
        style={{ y: heroY }}
        className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-5 pt-24 pb-16"
        onPointerMove={onHeroMove}
      >
        <div
          className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#1F6B4A]/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-[#FFCC00]/15 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/55">Lucknow · live hubs</p>
            <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,4.2rem)] font-medium leading-[1.02] tracking-[-0.03em]">
              Electric mobility,
              <span className="mt-1 block text-[#FFCC00]">told in 3D motion.</span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-white/65">
              Scroll-driven depth like Apple product pages · cinematic hub storytelling like premium auto brands · EVUDDY
              yellow stays the hero. Booking, Razorpay, and festive API unchanged underneath.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex min-h-12 items-center justify-center bg-[#FFCC00] px-8 text-[13px] font-semibold tracking-wide text-[#1C1917]"
              >
                Book an EV
              </motion.span>
              <span className="inline-flex min-h-12 items-center justify-center border border-white/25 px-8 text-[13px] tracking-wide text-white/90">
                Register rider
              </span>
            </div>
            <div className="mt-10 flex gap-8 text-[12px] text-white/50">
              <span>120 km range</span>
              <span>Pay from ₹1</span>
              <span>Hub OTP pickup</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            style={{
              perspective: 1200,
            }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <motion.div
              style={{
                rotateX: -tilt.y * 8,
                rotateY: tilt.x * 10,
                transformStyle: "preserve-3d",
              }}
              className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#1a2420] to-[#0d0f0e] p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/45">Phase 2 · WebGL / R3F slot</p>
              <motion.div
                style={{ translateZ: 40 }}
                className="relative mt-4 flex h-[72%] items-end justify-center"
              >
                <Image
                  src={YELLOW_SCOOTER_CUTOUT}
                  alt="EVUDDY scooter"
                  width={520}
                  height={520}
                  className="h-auto w-[92%] max-w-sm object-contain drop-shadow-[0_24px_48px_rgba(255,204,0,0.25)]"
                  priority
                />
              </motion.div>
              <motion.div style={{ translateZ: 20 }} className="absolute bottom-6 left-6 right-6">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] text-white/50">Live GPS · {BRAND.city}</p>
                  <p className="text-sm font-medium text-white">Hub → yard route animates on scroll</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <section className="border-t border-white/10 bg-[#121615] px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#FFCC00]"
          >
            Registration · glass UI
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 grid gap-8 lg:grid-cols-2"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <p className="text-sm text-white/70">Floating labels · inline OTP · same `/register` contract</p>
              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-[11px] uppercase tracking-wider text-white/45">Mobile</span>
                  <input
                    readOnly
                    placeholder="10-digit number"
                    className="mt-2 w-full border border-white/15 bg-black/30 px-4 py-3 text-white outline-none ring-[#FFCC00] transition focus:ring-2"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-wider text-white/45">Full name</span>
                  <input
                    readOnly
                    placeholder="As on Aadhaar"
                    className="mt-2 w-full border border-white/15 bg-black/30 px-4 py-3 text-white outline-none ring-[#FFCC00] transition focus:ring-2"
                  />
                </label>
                <button
                  type="button"
                  className="w-full bg-[#1F6B4A] py-3 text-[13px] font-semibold tracking-wide text-white"
                >
                  Continue — OTP on phone
                </button>
              </div>
            </div>
            <Image
              src={BRAND.register}
              alt="Rider registration"
              width={720}
              height={480}
              className="hidden h-full w-full rounded-2xl object-cover object-center opacity-90 lg:block"
            />
          </motion.div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl text-white">Plans that scroll into view</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {PLANS.map((plan, i) => (
              <motion.article
                key={plan.name}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-[#181C1A] p-6"
              >
                <p className="text-[11px] uppercase tracking-widest text-white/45">{plan.sub}</p>
                <p className="mt-2 text-2xl font-semibold text-[#FFCC00]">{plan.price}</p>
                <p className="mt-1 text-lg text-white">{plan.name}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-12 text-center text-[13px] text-white/50">
        <p>This URL is a design preview only. Production home stays at `/` until you approve the blueprint.</p>
        <Link href="/" className="mt-3 inline-block text-[#FFCC00] hover:underline">
          Back to evuddy.com
        </Link>
      </footer>
    </div>
  );
}