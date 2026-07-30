"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Wallet,
  Smartphone,
  Users,
} from "lucide-react";

export default function PartnerSection() {
  return (
    <section
      id="partner"
      className="
      relative
      overflow-hidden
      py-28
      bg-[radial-gradient(circle_at_top,#F8FFF9_0%,#FFFFFF_45%,#FFF8FC_100%)]
      "
    >

      {/* Green Glow */}

      <div
        className="
        absolute
        -left-32
        top-20
        h-[420px]
        w-[420px]
        rounded-full
        bg-[#18B368]/10
        blur-[150px]
        "
      />

      {/* Pink Glow */}

      <div
        className="
        absolute
        -right-32
        bottom-10
        h-[420px]
        w-[420px]
        rounded-full
        bg-[#EC2A8C]/10
        blur-[150px]
        "
      />

      <div className="relative mx-auto max-w-[1480px] px-6 lg:px-10">

        {/* Badge */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
            bg-white/80
            backdrop-blur-xl
            px-6
            py-3
            shadow-lg
            "
          >

            <span className="h-2.5 w-2.5 rounded-full bg-[#18B368]" />

            <span className="font-semibold tracking-wide text-gray-700">
              PARTNER WITH EVUDDY
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

          Grow Together.

          <br />

          <span
            className="
            bg-gradient-to-r
            from-[#18B368]
            via-[#39D46B]
            to-[#EC2A8C]
            bg-clip-text
            text-transparent
            "
          >

            Build The Future.

          </span>

        </motion.h2>

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

          Join EVUDDY as a business partner and become
          part of a technology-driven electric mobility
          ecosystem designed for long-term growth.

        </motion.p>

        {/* ======================================================
    PARTNER PANEL
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
  rounded-[42px]
  border
  border-white/70
  bg-white/85
  backdrop-blur-2xl
  shadow-[0_30px_80px_rgba(15,23,42,0.08)]
  "
>

  {/* Ambient Glow */}

  <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#18B368]/10 blur-[120px]" />
  <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#EC2A8C]/10 blur-[120px]" />

  <div className="relative z-10 p-8 lg:p-12">

    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">

      {/* Left Side */}

      <div>

        <span className="inline-flex rounded-full bg-[#18B368]/10 px-4 py-2 text-sm font-semibold text-[#18B368]">
          WHY PARTNER WITH US
        </span>

        <h3 className="mt-6 text-4xl font-black leading-tight text-gray-900 lg:text-5xl">
          Build your business
          <br />
          with EVUDDY.
        </h3>

        <p className="mt-6 max-w-xl text-lg leading-8 text-gray-500">
          Whether you're a fleet owner, service provider or entrepreneur,
          EVUDDY provides the technology, support and ecosystem to help
          you grow with confidence.
        </p>

      </div>

      {/* Right Side */}

      <div className="grid gap-5 sm:grid-cols-2">

        {/* Benefit 1 */}

        <div className="rounded-3xl border border-gray-100 bg-white/80 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

          <Wallet className="text-[#18B368]" size={34} />

          <h4 className="mt-5 text-xl font-bold text-gray-900">
            Higher Earnings
          </h4>

          <p className="mt-3 text-gray-500 leading-7">
            Unlock new revenue opportunities through our growing EV ecosystem.
          </p>

        </div>

        {/* Benefit 2 */}

        <div className="rounded-3xl border border-gray-100 bg-white/80 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

          <Smartphone className="text-[#18B368]" size={34} />

          <h4 className="mt-5 text-xl font-bold text-gray-900">
            Smart Technology
          </h4>

          <p className="mt-3 text-gray-500 leading-7">
            Manage bookings, operations and growth from one platform.
          </p>

        </div>

        {/* Benefit 3 */}

        <div className="rounded-3xl border border-gray-100 bg-white/80 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

          <Briefcase className="text-[#18B368]" size={34} />

          <h4 className="mt-5 text-xl font-bold text-gray-900">
            Business Growth
          </h4>

          <p className="mt-3 text-gray-500 leading-7">
            Expand alongside a modern mobility platform built for the future.
          </p>

        </div>

        {/* Benefit 4 */}

        <div className="rounded-3xl border border-gray-100 bg-white/80 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

          <Users className="text-[#18B368]" size={34} />

          <h4 className="mt-5 text-xl font-bold text-gray-900">
            Strong Community
          </h4>

          <p className="mt-3 text-gray-500 leading-7">
            Collaborate with partners who share the vision of smarter mobility.
          </p>

        </div>

      </div>

    </div>

    {/* CTA */}

    <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-[28px] border border-[#18B368]/15 bg-[#18B368]/5 p-6 md:flex-row">

      <div>

        <h4 className="text-2xl font-bold text-gray-900">
          Ready to grow with EVUDDY?
        </h4>

        <p className="mt-2 text-gray-500">
          Join our partner network and be part of the next generation of urban mobility.
        </p>

      </div>

      <Link href="/partner">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="
          inline-flex
          items-center
          gap-3
          rounded-full
          bg-gradient-to-r
          from-[#18B368]
          to-[#12A857]
          px-8
          py-4
          font-semibold
          text-white
          shadow-[0_15px_40px_rgba(24,179,104,0.30)]
          "
        >
          Become a Partner
          <ArrowRight size={20} />
        </motion.button>
      </Link>

    </div>

  </div>

</motion.div>

      </div>

    </section>
  );
}