"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  CalendarCheck,
  MapPinned,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="
      relative
      overflow-hidden
      bg-white
      py-32
      "
    >
      {/* Left Glow */}

      <div
        className="
        absolute
        -left-40
        top-10
        h-[420px]
        w-[420px]
        rounded-full
        bg-[#18B368]/10
        blur-[140px]
        "
      />

      {/* Right Glow */}

      <div
        className="
        absolute
        -right-32
        bottom-0
        h-[360px]
        w-[360px]
        rounded-full
        bg-[#EC2A8C]/10
        blur-[120px]
        "
      />

      <div className="relative mx-auto max-w-[1480px] px-6 lg:px-10">

        {/* Badge */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
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
            px-6
            py-3
            backdrop-blur-xl
            shadow-[0_15px_40px_rgba(15,23,42,0.08)]
            "
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#18B368]" />

            <span className="text-sm font-semibold text-gray-700 tracking-wide">
              HOW IT WORKS
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
          leading-[1]
          text-gray-900
          "
        >
          Move Smarter.

          <br />

          <span
            className="
            bg-gradient-to-r
            from-[#18B368]
            via-[#34D399]
            to-[#EC2A8C]
            bg-clip-text
            text-transparent
            "
          >
            Ride Better.
          </span>
        </motion.h2>

        {/* Subtitle */}

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: .25 }}
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
          From choosing a service to reaching your destination,
          EVUDDY makes every journey effortless, reliable
          and eco-friendly.
        </motion.p>

        {/* Timeline */}

        <div className="relative mt-24 hidden lg:block">

          <div
            className="
            absolute
            left-0
            right-0
            top-8
            h-[2px]
            rounded-full
            bg-gradient-to-r
            from-[#18B368]
            via-[#7ED957]
            to-[#EC2A8C]
            "
          />

          <div className="grid grid-cols-4">

            {[1,2,3,4].map((step)=>(
              <div
                key={step}
                className="flex justify-center"
              >
                <div
                  className="
                  relative
                  z-20
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white
                  bg-white
                  text-xl
                  font-black
                  text-[#18B368]
                  shadow-[0_15px_40px_rgba(15,23,42,0.10)]
                  "
                >
                  {`0${step}`}
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* ============================
    STEPS
============================ */}

<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.7 }}
  className="
  mt-16
  grid
  gap-8
  md:grid-cols-2
  xl:grid-cols-4
  "
>

  {/* STEP 1 */}

  <motion.div
    whileHover={{
      y: -10,
      scale: 1.02,
    }}
    transition={{ duration: .3 }}
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
    shadow-[0_20px_60px_rgba(15,23,42,0.08)]
    "
  >

    <span
      className="
      absolute
      right-6
      top-4
      text-7xl
      font-black
      text-[#18B368]/8
      select-none
      "
    >
      01
    </span>

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
      to-[#0FA958]
      text-white
      shadow-lg
      transition-transform
      duration-300
      group-hover:rotate-6
      group-hover:scale-110
      "
    >
      <LayoutGrid size={30} />
    </div>

    <h3 className="mt-8 text-2xl font-bold text-gray-900">
      Choose a Service
    </h3>

    <p className="mt-4 text-gray-500 leading-8">
      Browse EV rides, rentals,
      deliveries and home services
      from one smart platform.
    </p>

  </motion.div>

  {/* STEP 2 */}

  <motion.div
    whileHover={{
      y: -10,
      scale: 1.02,
    }}
    transition={{ duration: .3 }}
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
    shadow-[0_20px_60px_rgba(15,23,42,0.08)]
    "
  >

    <span
      className="
      absolute
      right-6
      top-4
      text-7xl
      font-black
      text-[#18B368]/8
      "
    >
      02
    </span>

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
      to-[#0FA958]
      text-white
      shadow-lg
      transition-transform
      duration-300
      group-hover:rotate-6
      group-hover:scale-110
      "
    >
      <CalendarCheck size={30} />
    </div>

    <h3 className="mt-8 text-2xl font-bold text-gray-900">
      Book Instantly
    </h3>

    <p className="mt-4 text-gray-500 leading-8">
      Enter your pickup and destination,
      choose the best option and
      confirm within seconds.
    </p>

  </motion.div>

  {/* STEP 3 */}

  <motion.div
    whileHover={{
      y: -10,
      scale: 1.02,
    }}
    transition={{ duration: .3 }}
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
    shadow-[0_20px_60px_rgba(15,23,42,0.08)]
    "
  >

    <span
      className="
      absolute
      right-6
      top-4
      text-7xl
      font-black
      text-[#18B368]/8
      "
    >
      03
    </span>

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
      to-[#0FA958]
      text-white
      shadow-lg
      transition-transform
      duration-300
      group-hover:rotate-6
      group-hover:scale-110
      "
    >
      <MapPinned size={30} />
    </div>

    <h3 className="mt-8 text-2xl font-bold text-gray-900">
      Track Live
    </h3>

    <p className="mt-4 text-gray-500 leading-8">
      Follow your booking with
      real-time tracking and live
      journey updates.
    </p>

  </motion.div>

  {/* STEP 4 */}

  <motion.div
    whileHover={{
      y: -10,
      scale: 1.02,
    }}
    transition={{ duration: .3 }}
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
    shadow-[0_20px_60px_rgba(15,23,42,0.08)]
    "
  >

    <span
      className="
      absolute
      right-6
      top-4
      text-7xl
      font-black
      text-[#18B368]/8
      "
    >
      04
    </span>

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
      to-[#0FA958]
      text-white
      shadow-lg
      transition-transform
      duration-300
      group-hover:rotate-6
      group-hover:scale-110
      "
    >
      <ShieldCheck size={30} />
    </div>

    <h3 className="mt-8 text-2xl font-bold text-gray-900">
      Enjoy the Experience
    </h3>

    <p className="mt-4 text-gray-500 leading-8">
      Ride with confidence through
      trusted partners and a smarter,
      greener mobility platform.
    </p>

  </motion.div>

</motion.div>

{/* ============================
  {/* ============================
    PREMIUM CTA
============================ */}

<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="
  relative
  mt-24
  overflow-hidden
  rounded-[42px]
  border
  border-white/70
  bg-white/80
  backdrop-blur-2xl
  shadow-[0_30px_80px_rgba(15,23,42,0.10)]
  "
>

  {/* Background Glow */}

  <div
    className="
    absolute
    -left-20
    top-0
    h-72
    w-72
    rounded-full
    bg-[#18B368]/10
    blur-[120px]
    "
  />

  <div
    className="
    absolute
    -right-16
    bottom-0
    h-64
    w-64
    rounded-full
    bg-[#EC2A8C]/10
    blur-[120px]
    "
  />

  <div
    className="
    relative
    z-10
    px-8
    py-14
    lg:px-16
    lg:py-16
    "
  >

    <div
      className="
      flex
      flex-col
      items-center
      justify-between
      gap-10
      lg:flex-row
      "
    >

      {/* Left */}

      <div className="max-w-2xl">

        <span
          className="
          inline-flex
          rounded-full
          bg-[#18B368]/10
          px-5
          py-2
          text-sm
          font-semibold
          text-[#18B368]
          "
        >
          READY TO GET STARTED?
        </span>

        <h3
          className="
          mt-6
          text-4xl
          md:text-5xl
          font-black
          tracking-[-0.03em]
          leading-tight
          text-gray-900
          "
        >
          Experience Smarter
          <br />

          <span
            className="
            bg-gradient-to-r
            from-[#18B368]
            via-[#35D56A]
            to-[#EC2A8C]
            bg-clip-text
            text-transparent
            "
          >
            Urban Mobility
          </span>

        </h3>

        <p
          className="
          mt-6
          text-lg
          leading-8
          text-gray-500
          "
        >
          Whether you're commuting, renting an EV,
          booking a delivery or accessing home services,
          EVUDDY brings everything together through one
          seamless platform.
        </p>

      </div>

      {/* Right */}

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
          shadow-[0_18px_50px_rgba(24,179,104,0.35)]
          transition-all
          duration-300
          "
        >

          Book an EV

          <ArrowRight
            size={22}
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

{/* Bottom Fade */}

<div
  className="
  absolute
  bottom-0
  left-0
  h-28
  w-full
  bg-gradient-to-t
  from-[#18B368]/5
  via-transparent
  to-transparent
  pointer-events-none
  "
/>

      </div>
    </section>
  );
}