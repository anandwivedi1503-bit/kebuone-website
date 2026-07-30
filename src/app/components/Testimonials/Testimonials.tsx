"use client";

import { motion } from "framer-motion";
import {
  Leaf,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function TrustSection() {
  return (
    <section
      className="
      relative
      overflow-hidden
      py-28
      bg-[radial-gradient(circle_at_top,#FFFFFF_0%,#F9FFF9_55%,#FFF9FC_100%)]
      "
    >
      {/* Ambient Glow */}

      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-[#18B368]/10 blur-[130px]" />

      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-[#EC2A8C]/10 blur-[130px]" />

      <div className="relative mx-auto max-w-[1480px] px-6 lg:px-10">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >

          <div
            className="
            inline-flex
            items-center
            gap-3
            rounded-full
            border
            border-[#18B368]/20
            bg-white/80
            backdrop-blur-xl
            px-6
            py-3
            shadow-lg
            "
          >

            <span className="h-2.5 w-2.5 rounded-full bg-[#18B368]" />

            <span className="font-semibold tracking-wide text-gray-700">
              OUR COMMITMENT
            </span>

          </div>

          <h2
            className="
            mt-8
            text-5xl
            md:text-6xl
            lg:text-7xl
            font-black
            leading-[0.98]
            tracking-[-0.04em]
            text-gray-900
            "
          >

            Built On Trust.

            <br />

            <span
              className="
              bg-gradient-to-r
              from-[#18B368]
              to-[#EC2A8C]
              bg-clip-text
              text-transparent
              "
            >

              Designed For Tomorrow.

            </span>

          </h2>

          <p
            className="
            mx-auto
            mt-8
            max-w-3xl
            text-xl
            leading-9
            text-gray-500
            "
          >

            EVUDDY is committed to creating a smarter,
            cleaner and more reliable mobility ecosystem
            for riders, partners and businesses.

          </p>

        </motion.div>

        {/* ======================================================
    TRUST CARDS
====================================================== */}

<div className="mt-20 grid gap-8 lg:grid-cols-3">

  {/* Card 1 */}

  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: .6 }}
    whileHover={{ y: -8 }}
    className="
    group
    relative
    overflow-hidden
    rounded-[34px]
    border
    border-white/70
    bg-white/85
    backdrop-blur-2xl
    p-8
    shadow-[0_25px_60px_rgba(15,23,42,0.08)]
    "
  >

    <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#18B368]/10 blur-[80px]" />

    <div className="relative z-10">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#18B368] to-[#13A75A] text-white">
        <Leaf size={30} />
      </div>

      <h3 className="mt-8 text-2xl font-bold text-gray-900">
        Electric First
      </h3>

      <p className="mt-5 leading-8 text-gray-500">
        Every decision at EVUDDY is guided by our vision of
        cleaner transportation and a smarter future powered
        by electric mobility.
      </p>

      <div className="mt-8 h-px bg-gray-100" />

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#18B368]">
        EVUDDY Vision
      </p>

    </div>

  </motion.div>

  {/* Card 2 */}

  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: .15 }}
    whileHover={{ y: -8 }}
    className="
    group
    relative
    overflow-hidden
    rounded-[34px]
    border
    border-white/70
    bg-white/85
    backdrop-blur-2xl
    p-8
    shadow-[0_25px_60px_rgba(15,23,42,0.08)]
    "
  >

    <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-[#EC2A8C]/10 blur-[80px]" />

    <div className="relative z-10">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#18B368] to-[#13A75A] text-white">
        <ShieldCheck size={30} />
      </div>

      <h3 className="mt-8 text-2xl font-bold text-gray-900">
        Trust & Transparency
      </h3>

      <p className="mt-5 leading-8 text-gray-500">
        From fair pricing to dependable service,
        we're building EVUDDY around transparency,
        reliability and long-term trust.
      </p>

      <div className="mt-8 h-px bg-gray-100" />

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#18B368]">
        Our Commitment
      </p>

    </div>

  </motion.div>

  {/* Card 3 */}

  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: .3 }}
    whileHover={{ y: -8 }}
    className="
    group
    relative
    overflow-hidden
    rounded-[34px]
    border
    border-white/70
    bg-white/85
    backdrop-blur-2xl
    p-8
    shadow-[0_25px_60px_rgba(15,23,42,0.08)]
    "
  >

    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#18B368]/10 blur-[80px]" />

    <div className="relative z-10">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#18B368] to-[#13A75A] text-white">
        <Sparkles size={30} />
      </div>

      <h3 className="mt-8 text-2xl font-bold text-gray-900">
        Built For Tomorrow
      </h3>

      <p className="mt-5 leading-8 text-gray-500">
        EVUDDY is continuously evolving to deliver
        innovative mobility experiences for riders,
        partners and businesses.
      </p>

      <div className="mt-8 h-px bg-gray-100" />

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#18B368]">
        Future Ready
      </p>

    </div>

  </motion.div>

</div>

{/* ======================================================
    CLOSING QUOTE PANEL
====================================================== */}

<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="
  relative
  mt-20
  overflow-hidden
  rounded-[40px]
  border
  border-white/70
  bg-white/85
  backdrop-blur-2xl
  shadow-[0_30px_80px_rgba(15,23,42,0.08)]
  "
>

  {/* Green Glow */}

  <div
    className="
    absolute
    -left-20
    top-0
    h-56
    w-56
    rounded-full
    bg-[#18B368]/10
    blur-[120px]
    "
  />

  {/* Pink Glow */}

  <div
    className="
    absolute
    -right-20
    bottom-0
    h-56
    w-56
    rounded-full
    bg-[#EC2A8C]/10
    blur-[120px]
    "
  />

  <div
    className="
    relative
    z-10
    mx-auto
    max-w-4xl
    px-8
    py-16
    text-center
    "
  >

    <div
      className="
      mb-8
      inline-flex
      h-16
      w-16
      items-center
      justify-center
      rounded-full
      bg-gradient-to-br
      from-[#18B368]
      to-[#13A75A]
      text-white
      shadow-[0_15px_40px_rgba(24,179,104,0.30)]
      "
    >

      <Sparkles size={30} />

    </div>

    <blockquote
      className="
      text-3xl
      md:text-4xl
      lg:text-5xl
      font-black
      leading-tight
      tracking-[-0.03em]
      text-gray-900
      "
    >
      "The future of mobility isn't just electric.
      It's intelligent, sustainable,
      and built around people."
    </blockquote>

    <p
      className="
      mt-8
      text-lg
      leading-8
      text-gray-500
      "
    >
      At EVUDDY, we're building a platform that connects
      technology, sustainability and everyday convenience
      into one seamless mobility experience.
    </p>

    <div
      className="
      mt-10
      inline-flex
      items-center
      gap-3
      rounded-full
      border
      border-[#18B368]/20
      bg-[#18B368]/5
      px-6
      py-3
      "
    >

      <span className="h-2.5 w-2.5 rounded-full bg-[#18B368]" />

      <span className="font-semibold tracking-wide text-gray-700">
        — TEAM EVUDDY
      </span>

    </div>

  </div>

</motion.div>

      </div>

    </section>
  );
}