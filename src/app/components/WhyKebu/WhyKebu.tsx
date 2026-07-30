"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Leaf,
  ShieldCheck,
  MapPinned,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";

export default function WhyChoose() {
  return (
    <section
      id="why-choose"
      className="
      relative
      overflow-hidden
      bg-[radial-gradient(circle_at_top,#F8FFF9_0%,#FFFFFF_45%,#FFF8FC_100%)]
      py-32
      "
    >
      {/* Left Ambient Glow */}

      <div
        className="
        absolute
        -left-40
        top-20
        h-[420px]
        w-[420px]
        rounded-full
        bg-[#18B368]/10
        blur-[150px]
        "
      />

      {/* Right Ambient Glow */}

      <div
        className="
        absolute
        -right-32
        bottom-10
        h-[380px]
        w-[380px]
        rounded-full
        bg-[#EC2A8C]/10
        blur-[130px]
        "
      />

      <div className="relative mx-auto max-w-[1480px] px-6 lg:px-10">

        {/* Badge */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
          className="flex justify-center"
        >

          <div
            className="
            inline-flex
            items-center
            gap-3
            rounded-full
            border
            border-[#18B368]/20
            bg-white/90
            backdrop-blur-xl
            px-6
            py-3
            shadow-[0_15px_40px_rgba(15,23,42,0.08)]
            "
          >

            <span className="h-2.5 w-2.5 rounded-full bg-[#18B368]" />

            <span className="text-sm font-semibold tracking-wide text-gray-700">
              WHY CHOOSE EVUDDY
            </span>

          </div>

        </motion.div>

        {/* Heading */}

        <motion.h2
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: .1 }}
          className="
          mt-8
          text-center
          text-5xl
          md:text-6xl
          lg:text-7xl
          font-black
          tracking-[-0.04em]
          leading-[0.98]
          text-gray-900
          "
        >

          Built For The Future

          <br />

          <span
            className="
            bg-gradient-to-r
            from-[#18B368]
            via-[#3AD46A]
            to-[#EC2A8C]
            bg-clip-text
            text-transparent
            "
          >

            Of Smart Mobility

          </span>

        </motion.h2>

        {/* Subtitle */}

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: .2 }}
          className="
          mx-auto
          mt-8
          max-w-3xl
          text-center
          text-xl
          leading-9
          text-gray-500
          "
        >

          EVUDDY combines technology, sustainability
          and customer-first experiences to redefine
          urban transportation for modern cities.

        </motion.p>

        {/* ======================================================
    FEATURE GRID
====================================================== */}

<div className="mt-24 grid gap-8 lg:grid-cols-2">

  {/* ================= LARGE FEATURE CARD ================= */}

  <motion.div
    initial={{ opacity: 0, x: -40 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: .7 }}
    whileHover={{ y: -8 }}
    className="
    group
    relative
    overflow-hidden
    rounded-[42px]
    border
    border-white/70
    bg-white/85
    backdrop-blur-2xl
    p-10
    shadow-[0_30px_80px_rgba(15,23,42,0.08)]
    "
  >

    {/* Green Glow */}

    <div
      className="
      absolute
      -right-16
      -top-16
      h-56
      w-56
      rounded-full
      bg-[#18B368]/10
      blur-[100px]
      "
    />

    <div className="relative z-10">

      <div
        className="
        flex
        h-16
        w-16
        items-center
        justify-center
        rounded-2xl
        bg-gradient-to-br
        from-[#18B368]
        to-[#12A857]
        text-white
        "
      >

        <Leaf size={32} />

      </div>

      <h3 className="mt-8 text-4xl font-black text-gray-900 leading-tight">
        Sustainable
        <br />
        By Design
      </h3>

      <p className="mt-6 text-lg leading-8 text-gray-500 max-w-xl">
        EVUDDY is building an electric-first ecosystem
        focused on smarter transportation, cleaner cities
        and a better everyday mobility experience.
      </p>

      <div
        className="
        mt-10
        inline-flex
        rounded-full
        bg-[#18B368]/10
        px-5
        py-2
        font-semibold
        text-[#18B368]
        "
      >
        Future Ready Platform
      </div>

    </div>

  </motion.div>

  {/* ================= SMALL CARDS ================= */}

  <div className="grid gap-8 sm:grid-cols-2">

    {/* CARD 1 */}

    <motion.div
      whileHover={{ y: -8 }}
      className="
      rounded-[32px]
      border
      border-white/70
      bg-white/85
      backdrop-blur-xl
      p-8
      shadow-[0_20px_50px_rgba(15,23,42,0.08)]
      "
    >

      <ShieldCheck className="text-[#18B368]" size={34} />

      <h4 className="mt-6 text-2xl font-bold text-gray-900">
        Trusted Partners
      </h4>

      <p className="mt-3 text-gray-500 leading-7">
        Verified service providers focused on safety,
        reliability and quality.
      </p>

    </motion.div>

    {/* CARD 2 */}

    <motion.div
      whileHover={{ y: -8 }}
      className="
      rounded-[32px]
      border
      border-white/70
      bg-white/85
      backdrop-blur-xl
      p-8
      shadow-[0_20px_50px_rgba(15,23,42,0.08)]
      "
    >

      <MapPinned className="text-[#18B368]" size={34} />

      <h4 className="mt-6 text-2xl font-bold text-gray-900">
        Smart Tracking
      </h4>

      <p className="mt-3 text-gray-500 leading-7">
        Live updates keep you informed from booking
        until your journey is complete.
      </p>

    </motion.div>

    {/* CARD 3 */}

    <motion.div
      whileHover={{ y: -8 }}
      className="
      rounded-[32px]
      border
      border-white/70
      bg-white/85
      backdrop-blur-xl
      p-8
      shadow-[0_20px_50px_rgba(15,23,42,0.08)]
      "
    >

      <Leaf className="text-[#18B368]" size={34} />

      <h4 className="mt-6 text-2xl font-bold text-gray-900">
        Electric First
      </h4>

      <p className="mt-3 text-gray-500 leading-7">
        Cleaner transportation with sustainability
        at the heart of every journey.
      </p>

    </motion.div>

    {/* CARD 4 */}

    <motion.div
      whileHover={{ y: -8 }}
      className="
      rounded-[32px]
      border
      border-white/70
      bg-white/85
      backdrop-blur-xl
      p-8
      shadow-[0_20px_50px_rgba(15,23,42,0.08)]
      "
    >

      <HeartHandshake className="text-[#18B368]" size={34} />

      <h4 className="mt-6 text-2xl font-bold text-gray-900">
        Customer First
      </h4>

      <p className="mt-3 text-gray-500 leading-7">
        Transparent pricing, responsive support
        and a seamless booking experience.
      </p>

    </motion.div>

  </div>

</div>

{/* ======================================================
    BOTTOM STRIP + CTA
====================================================== */}

<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="
  mt-20
  relative
  overflow-hidden
  rounded-[40px]
  border
  border-white/70
  bg-white/80
  backdrop-blur-2xl
  shadow-[0_25px_70px_rgba(15,23,42,0.08)]
  "
>

  {/* Ambient Glow */}

  <div
    className="
    absolute
    -left-20
    top-0
    h-60
    w-60
    rounded-full
    bg-[#18B368]/10
    blur-[110px]
    "
  />

  <div
    className="
    absolute
    -right-20
    bottom-0
    h-60
    w-60
    rounded-full
    bg-[#EC2A8C]/10
    blur-[110px]
    "
  />

  <div
    className="
    relative
    z-10
    px-8
    py-10
    lg:px-14
    lg:py-12
    "
  >

    {/* Feature Strip */}

    <div
      className="
      flex
      flex-wrap
      items-center
      justify-center
      gap-6
      text-center
      "
    >

      {[
        "100% Electric Focus",
        "Verified Partners",
        "Live Tracking",
        "Customer First",
      ].map((item) => (
        <div
          key={item}
          className="
          flex
          items-center
          gap-3
          rounded-full
          border
          border-[#18B368]/15
          bg-white/70
          px-5
          py-3
          "
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#18B368]" />

          <span className="font-medium text-gray-700">
            {item}
          </span>
        </div>
      ))}

    </div>

    {/* CTA */}

    <div
      className="
      mt-12
      flex
      flex-col
      items-center
      justify-center
      text-center
      "
    >

      <h3
        className="
        text-3xl
        md:text-4xl
        font-black
        tracking-[-0.03em]
        text-gray-900
        "
      >
        Ready To Ride Smarter?
      </h3>

      <p
        className="
        mt-4
        max-w-2xl
        text-lg
        leading-8
        text-gray-500
        "
      >
        Join EVUDDY and experience reliable, sustainable
        and technology-driven urban mobility built for the future.
      </p>

      <Link href="/register">

        <motion.button
          whileHover={{
            scale: 1.05,
            y: -3,
          }}
          whileTap={{
            scale: 0.98,
          }}
          className="
          group
          mt-8
          inline-flex
          items-center
          gap-3
          rounded-full
          bg-gradient-to-r
          from-[#18B368]
          via-[#16C45B]
          to-[#119D52]
          px-10
          py-5
          text-lg
          font-semibold
          text-white
          shadow-[0_20px_55px_rgba(24,179,104,0.35)]
          transition-all
          duration-300
          "
        >

          Book an EV

          <ArrowRight
            size={20}
            className="
            transition-transform
            duration-300
            group-hover:translate-x-1
            "
          />

        </motion.button>

      </Link>

    </div>

  </div>

 </motion.div>

      </div>

    </section>
  );
}