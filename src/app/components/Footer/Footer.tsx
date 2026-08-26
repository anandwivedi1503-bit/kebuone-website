"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Mail,
  Phone,
  Clock,
} from "lucide-react";

import {
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaFacebookF,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer
      id="footer"
      className="relative overflow-hidden bg-[#07111F] text-white"
    >
      {/* =======================================
          Background Effects
      ======================================= */}

      <div className="absolute inset-0">

        <div className="absolute -top-48 -left-40 h-[500px] w-[500px] rounded-full bg-[#18B368]/15 blur-[140px]" />

        <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-pink-500/10 blur-[140px]" />

      </div>

      {/* Watermark */}

      <div className="pointer-events-none absolute inset-0 hidden items-center justify-center overflow-hidden lg:flex">

        <h1 className="select-none text-[220px] font-black tracking-[25px] text-white/[0.025]">

          EVUDDY

        </h1>

      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* =======================================
              Premium CTA
        ======================================= */}

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: .8 }}
          viewport={{ once: true }}
          className="py-12 sm:py-24"
        >

          <div
            className="
            rounded-[28px]
            sm:rounded-[40px]
            border
            border-white/10
            bg-white/5
            backdrop-blur-2xl
            p-6
            sm:p-10
            md:p-16
            "
          >

            <div className="mx-auto max-w-4xl text-center">

              <span
                className="
                inline-flex
                rounded-full
                border
                border-[#18B368]/30
                bg-[#18B368]/10
                px-5
                py-2
                text-sm
                font-semibold
                uppercase
                tracking-[0.12em]
                sm:tracking-[0.25em]
                text-[#6EE7A8]
                "
              >
                Ready For The Future?
              </span>

              <h2 className="mt-8 text-3xl font-black leading-tight sm:text-5xl md:text-7xl">
                Move Smarter.
                <br />
                Move Electric.
              </h2>

              <p
                className="
                mx-auto
                mt-8
                max-w-2xl
                text-lg
                leading-8
                text-gray-300
                "
              >
                Join EVUDDY and experience India&apos;s next generation
                electric mobility ecosystem designed for riders,
                businesses and everyday commuters.
              </p>

              <div
                className="
                mt-12
                flex
                flex-col
                justify-center
                gap-5
                sm:flex-row
                "
              >

                <Link
                  href="/ride-options"
                  className="inline-flex h-14 w-full items-center justify-center rounded-full bg-[#18B368] px-8 text-lg font-semibold transition hover:bg-[#14A35E] sm:w-auto"
                >
                  Book an EV

                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>

                <Link
                  href="/partners#partner-form"
                  className="inline-flex h-14 w-full items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 text-lg font-semibold backdrop-blur-xl transition hover:border-[#18B368] hover:bg-[#18B368]/10 sm:w-auto"
                >
                  Become a Partner
                </Link>

              </div>

            </div>

          </div>

        </motion.div>

        {/* =======================================
      Footer Main Grid
======================================= */}

<div className="grid gap-10 pb-16 sm:gap-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">

  {/* ================= Brand ================= */}

  <div>

    <Link
      href="/"
      className="inline-flex items-center"
    >
      <Image
        src="/Evuddy-logo-dark-E.png"
        alt="EVUDDY"
        width={170}
        height={60}
        priority
      />
    </Link>

    <h3 className="mt-8 text-3xl font-bold leading-tight">

      Smarter.
      <br />
      Cleaner.
      <br />
      Connected.

    </h3>

    <p
      className="
      mt-6
      max-w-md
      text-gray-400
      leading-8
      "
    >
      EVUDDY is building a smarter electric mobility
      ecosystem that connects riders, businesses and
      cities through sustainable transportation,
      intelligent technology and trusted partners.
    </p>

    <div className="mt-10 space-y-5">

      <div className="flex items-start gap-4">

        <MapPin
          className="
          mt-1
          h-5
          w-5
          text-[#18B368]
          "
        />

        <p className="text-gray-300">

          Lucknow, India

        </p>

      </div>

      <div className="flex items-center gap-4">

        <Mail
          className="
          h-5
          w-5
          text-[#18B368]
          "
        />

        <a
          href="mailto:info@kebuone.com"
          className="transition hover:text-white"
        >
          info@kebuone.com
        </a>

      </div>

      <div className="flex items-center gap-4">

        <Phone
          className="
          h-5
          w-5
          text-[#18B368]
          "
        />

        <a
          href="tel:+918726006516"
          className="transition hover:text-white"
        >
          +91 8726006516
        </a>

      </div>

      <div className="flex items-center gap-4">

        <Clock
          className="
          h-5
          w-5
          text-[#18B368]
          "
        />

        <span>

          24×7 Customer Support

        </span>

      </div>

    </div>

  </div>

  {/* ================= Company ================= */}

  <div>

    <h4
      className="
      mb-8
      text-xl
      font-bold
      "
    >
      Company
    </h4>

    <div className="space-y-5">

      <Link
        href="/ride-options"
        className="block text-gray-400 transition hover:text-white"
      >
        Book a Scooter
      </Link>

      <Link
        href="/register"
        className="block text-gray-400 transition hover:text-white"
      >
        Rider Registration
      </Link>

      <Link
        href="/about"
        className="block text-gray-400 transition hover:text-white"
      >
        About Us
      </Link>

      <Link
        href="/vision"
        className="block text-gray-400 transition hover:text-white"
      >
        Our Vision
      </Link>

      <Link
        href="/partners"
        className="block text-gray-400 transition hover:text-white"
      >
        Become a Partner
      </Link>

      <Link
        href="/partners#partner-form"
        className="block text-gray-400 transition hover:text-white"
      >
        Fleet Partner Investment
      </Link>

      <Link
        href="/careers"
        className="block text-gray-400 transition hover:text-white"
      >
        Careers
      </Link>

      <Link
        href="/contact"
        className="block text-gray-400 transition hover:text-white"
      >
        Contact
      </Link>

    </div>

  </div>

  {/* ================= Follow Us ================= */}

  <div>

    <h4
      className="
      mb-8
      text-xl
      font-bold
      "
    >
      Follow Us
    </h4>

    <div className="space-y-4">

      <motion.a
        whileHover={{ x: 8 }}
        href="https://www.instagram.com/evuddy_bike?igsh=OXlhcXpnYnJqcXEx/"
        target="_blank"
        rel="noopener noreferrer"
        className="
        flex
        items-center
        gap-3
        text-gray-400
        transition
        hover:text-white
        "
      >
        <FaInstagram size={20} />
        Instagram
      </motion.a>

      <motion.a
        whileHover={{ x: 8 }}
        href="https://www.linkedin.com/company/kebu-one/"
        target="_blank"
        rel="noopener noreferrer"
        className="
        flex
        items-center
        gap-3
        text-gray-400
        transition
        hover:text-white
        "
      >
        <FaLinkedinIn size={20} />
        LinkedIn
      </motion.a>

      <motion.a
        whileHover={{ x: 8 }}
        href="https://youtube.com/@kebuone?si=ertP6rbNyGOyjRW9"
        target="_blank"
        rel="noopener noreferrer"
        className="
        flex
        items-center
        gap-3
        text-gray-400
        transition
        hover:text-white
        "
      >
        <FaYoutube size={20} />
        YouTube
      </motion.a>

      <motion.a
        whileHover={{ x: 8 }}
        href="#"
        className="
        flex
        items-center
        gap-3
        text-gray-400
        transition
        hover:text-white
        "
      >
        <FaFacebookF size={20} />
        Facebook
      </motion.a>

    </div>

    </div>

</div>

{/* =======================================
      Divider
======================================= */}

<div className="border-t border-white/10" />

{/* =======================================
      Bottom Footer
======================================= */}

<div
  className="
  flex
  flex-col
  gap-10
  py-10
  lg:flex-row
  lg:items-center
  lg:justify-between
  "
>

  {/* Left */}

  <div>

    <p className="text-gray-400">

      © {new Date().getFullYear()} Shubhrax Mobility Ltd.

    </p>

    <p className="mt-2 text-sm text-gray-500">

      Driving India&apos;s Future Of Electric Mobility.

    </p>

  </div>

  {/* Center */}

  <div
    className="
    flex
    flex-wrap
    gap-8
    text-sm
    "
  >

    <Link
      href="/privacy-policy"
      className="
      text-gray-400
      transition
      hover:text-white
      "
    >
      Privacy Policy
    </Link>

    <Link
      href="/terms-and-conditions"
      className="
      text-gray-400
      transition
      hover:text-white
      "
    >
      Terms & Conditions
    </Link>

    <Link
      href="/refund-policy"
      className="
      text-gray-400
      transition
      hover:text-white
      "
    >
      Refund Policy
    </Link>

    <Link
      href="/contact"
      className="
      text-gray-400
      transition
      hover:text-white
      "
    >
      Contact
    </Link>

  </div>

  {/* Right */}

  <div
    className="
    flex
    items-center
    gap-5
    "
  >

    <motion.a
      whileHover={{
        y: -5,
        scale: 1.08,
      }}
      whileTap={{
        scale: .95,
      }}
      href="https://www.instagram.com/kebuone/"
      target="_blank"
      rel="noopener noreferrer"
      className="
      flex
      h-12
      w-12
      items-center
      justify-center
      rounded-full
      border
      border-white/10
      bg-white/5
      transition-all
      duration-300
      hover:border-[#18B368]
      hover:bg-[#18B368]/15
      "
    >
      <FaInstagram size={20} />
    </motion.a>

    <motion.a
      whileHover={{
        y: -5,
        scale: 1.08,
      }}
      whileTap={{
        scale: .95,
      }}
      href="https://www.linkedin.com/company/kebu-one/"
      target="_blank"
      rel="noopener noreferrer"
      className="
      flex
      h-12
      w-12
      items-center
      justify-center
      rounded-full
      border
      border-white/10
      bg-white/5
      transition-all
      duration-300
      hover:border-[#18B368]
      hover:bg-[#18B368]/15
      "
    >
      <FaLinkedinIn size={20} />
    </motion.a>

    <motion.a
      whileHover={{
        y: -5,
        scale: 1.08,
      }}
      whileTap={{
        scale: .95,
      }}
      href="https://youtube.com/@kebuone?si=ertP6rbNyGOyjRW9"
      target="_blank"
      rel="noopener noreferrer"
      className="
      flex
      h-12
      w-12
      items-center
      justify-center
      rounded-full
      border
      border-white/10
      bg-white/5
      transition-all
      duration-300
      hover:border-[#18B368]
      hover:bg-[#18B368]/15
      "
    >
      <FaYoutube size={20} />
    </motion.a>

    <motion.a
      whileHover={{
        y: -5,
        scale: 1.08,
      }}
      whileTap={{
        scale: .95,
      }}
      href="#"
      className="
      flex
      h-12
      w-12
      items-center
      justify-center
      rounded-full
      border
      border-white/10
      bg-white/5
      transition-all
      duration-300
      hover:border-[#18B368]
      hover:bg-[#18B368]/15
      "
    >
      <FaFacebookF size={20} />
    </motion.a>

  </div>

</div>

  </div>

</footer>
);
}