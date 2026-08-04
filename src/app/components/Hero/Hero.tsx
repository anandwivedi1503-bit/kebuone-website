"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {


return (
    <section
  id="home"
  className="
relative
overflow-hidden
min-h-screen
bg-[radial-gradient(circle_at_top,#F8FFF9_0%,#FFFFFF_40%,#FFF8FC_100%)]
"
>

  {/* Left Glow */}

<div
className="
absolute
-top-32
-left-32
h-[500px]
w-[500px]
rounded-full
bg-[#18B368]/10
blur-[140px]
"
/>

{/* Right Glow */}

<div
className="
absolute
top-10
-right-20
h-[420px]
w-[420px]
rounded-full
bg-[#EC2A8C]/8
blur-[120px]
"
/>

 {/* Premium Grid */}

<div
className="
absolute
inset-0
opacity-[0.03]
bg-[linear-gradient(to_right,#0F172A_1px,transparent_1px),linear-gradient(to_bottom,#0F172A_1px,transparent_1px)]
bg-[size:80px_80px]
pointer-events-none
"
/>

<motion.div
animate={{
y:[0,-20,0],
x:[0,15,0]
}}
transition={{
duration:9,
repeat:Infinity,
ease:"easeInOut"
}}
className="
absolute
top-40
left-[12%]
hidden
lg:block
h-3
w-3
rounded-full
bg-[#18B368]
opacity-70
"
/>

<motion.div
animate={{
y:[0,20,0],
x:[0,-12,0]
}}
transition={{
duration:11,
repeat:Infinity,
ease:"easeInOut"
}}
className="
absolute
top-56
right-[12%]
hidden
lg:block
h-4
w-4
rounded-full
bg-[#EC2A8C]
opacity-60
"
/>

  <div className="max-w-[1480px] mx-auto px-6 lg:px-10">

    <div className="relative pt-36 lg:pt-44 pb-16 text-center">

  {/* Premium Badge */}

  <motion.div
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="
    inline-flex
    items-center
    gap-3
    rounded-full
    border
    border-[#18B368]/20
    bg-white/70
    backdrop-blur-2xl
    px-7
    py-3
    shadow-[0_20px_50px_rgba(15,23,42,0.08)]
    "
  >

    <span className="relative flex h-3 w-3">

      <span className="absolute inline-flex h-full w-full rounded-full bg-[#18B368] opacity-75 animate-ping" />

      <span className="relative inline-flex h-3 w-3 rounded-full bg-[#18B368]" />

    </span>

    <span className="text-sm font-bold tracking-wide text-slate-700">

      INDIA'S SMART ELECTRIC MOBILITY PLATFORM

    </span>

  </motion.div>

  {/* Main Heading */}

  <motion.h1
    initial={{ opacity: 0, y: 60 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
duration:1.2,
ease:[0.22,1,0.36,1]
}}
    className="
    mt-10
    text-5xl
    md:text-7xl
    lg:text-8xl
    xl:text-[112px]
    font-black
    tracking-[-0.06em]
    leading-[0.88]
    "
  >

    <span
      className="
      bg-gradient-to-r
      from-[#16C45B]
      via-[#18B368]
      to-[#EC2A8C]
      bg-clip-text
      text-transparent
      "
    >

      Move Smarter.

    </span>

    <br />

    <span className="text-[#0F172A]">

      Ride

    </span>

    {" "}

    <span
      className="
      bg-gradient-to-r
      from-[#16C45B]
      via-[#18B368]
      to-[#EC2A8C]
      bg-clip-text
      text-transparent
      "
    >

      Electric.

    </span>

  </motion.h1>

  {/* Description */}

  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{
      delay: .35,
      duration: .8,
    }}
    className="
    mx-auto
    mt-10
    max-w-3xl
    text-lg
    md:text-xl
    leading-8
    md:leading-9
    text-slate-500
    "
  >

    Experience India's next-generation electric mobility ecosystem
    designed for effortless city commuting, smart technology,
    sustainable transportation and premium riding comfort.

  </motion.p>

     {/* ================= Premium CTA ================= */}

<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    delay: 0.45,
    duration: 0.8,
  }}
  className="
  mt-14
  flex
  flex-wrap
  items-center
  justify-center
  gap-5
  "
>

  {/* Primary Button */}

  <Link href="/register">

    <button
      className="
      group
      relative
      overflow-hidden
      rounded-full
      bg-gradient-to-r
      from-[#18B368]
      via-[#16C45B]
      to-[#13A657]
      px-10
      py-4
      text-lg
      font-bold
      text-white
      shadow-[0_20px_60px_rgba(24,179,104,.35)]
      transition-all
      duration-500
      hover:scale-[1.03]
      hover:shadow-[0_30px_80px_rgba(24,179,104,.45)]
      active:scale-[0.98]
      "
    >

      <span
        className="
        absolute
        inset-0
        translate-x-[-100%]
        bg-gradient-to-r
        from-transparent
        via-white/30
        to-transparent
        transition-transform
        duration-700
        group-hover:translate-x-[100%]
        "
      />

      <span className="relative flex items-center gap-3">

        Reserve Your EV

        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="transition-transform duration-300 group-hover:translate-x-1"
        >
          <path
            d="M5 12h14M13 5l7 7-7 7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

      </span>

    </button>

  </Link>

  {/* Secondary Button */}

  <Link href="/partners">

    <button
      className="
      rounded-full
      border
      border-white
      bg-white/70
      backdrop-blur-2xl
      px-10
      py-4
      text-lg
      font-bold
      text-[#18B368]
      shadow-[0_18px_55px_rgba(15,23,42,.08)]
      transition-all
      duration-500
      hover:-translate-y-1
      hover:bg-white
      hover:scale-[1.03]
      hover:shadow-[0_25px_70px_rgba(15,23,42,.12)]
      "
    >

      Become a Partner

    </button>

  </Link>

</motion.div>

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{
    delay: .7,
  }}
  className="
  mt-10
  flex
  flex-wrap
  justify-center
  gap-6
  text-sm
  md:text-base
  font-semibold
  text-slate-600
  "
>

  <div className="flex items-center gap-2">

    <span className="h-2 w-2 rounded-full bg-[#18B368]" />

    Zero Emissions

  </div>

  <div className="flex items-center gap-2">

    <span className="h-2 w-2 rounded-full bg-[#18B368]" />

    120 KM Certified Range

  </div>

  <div className="flex items-center gap-2">

    <span className="h-2 w-2 rounded-full bg-[#18B368]" />

    Smart Connected Ride

  </div>

  <div className="flex items-center gap-2">

    <span className="h-2 w-2 rounded-full bg-[#18B368]" />

    Fast Charging

  </div>

</motion.div>

 <motion.div
  initial={{
opacity:0,
y:80,
scale:0.92,
rotate:-1
}}
  animate={{
opacity:1,
y:0,
scale:1,
rotate:0
}}
  transition={{
    duration: 0.9,
    delay: 0.55,
    ease: "easeOut",
  }}
  className="
relative
mt-16
max-w-[1480px]
mx-auto
"
>

  {/* ================= Premium Lighting ================= */}

<div
className="
absolute
left-1/2
top-1/2
-translate-x-1/2
-translate-y-1/2
w-[900px]
h-[900px]
rounded-full
bg-[#18B368]/10
blur-[170px]
"
/>

<div
className="
absolute
right-[-120px]
top-12
w-[420px]
h-[420px]
rounded-full
bg-[#EC2A8C]/10
blur-[150px]
"
/>

<div
className="
absolute
left-[-120px]
bottom-0
w-[420px]
h-[420px]
rounded-full
bg-[#18B368]/10
blur-[150px]
"
/>

{/* ================= Glass Container ================= */}

<div
className="
group
relative
overflow-hidden
rounded-[48px]
border
border-white/60
bg-white/55
backdrop-blur-3xl
shadow-[0_45px_140px_rgba(15,23,42,.16)]
hover:shadow-[0_70px_170px_rgba(15,23,42,.20)]
transition-all
duration-700
"
>

{/* Premium Shine */}

<div
className="
absolute
inset-0
pointer-events-none
opacity-20
bg-[linear-gradient(120deg,transparent_15%,white_50%,transparent_85%)]
translate-x-[-120%]
group-hover:translate-x-[120%]
transition-transform
duration-[1800ms]
"
/>

<Image
src="/poster.png"
alt="EVUDDY"
width={2400}
height={1400}
priority
className="
w-full
h-auto
object-contain
transition-all
duration-700
group-hover:scale-[1.015]
"
/>

{/* Soft Bottom Fade */}

<div
className="
absolute
bottom-0
left-0
w-full
h-36
bg-gradient-to-t
from-white/40
to-transparent
pointer-events-none
"
/>

</div>

    {/* Bottom Gradient */}

    <div
className="
absolute
left-1/2
-bottom-16
-translate-x-1/2
w-[78%]
h-24
rounded-full
bg-gradient-to-r
from-[#18B368]/15
via-white/50
to-[#EC2A8C]/15
blur-[90px]
-z-10
"
/>



  {/* ================= Floating Cards ================= */}

{/* ================= PREMIUM FLOATING WIDGETS ================= */}

{/* Top Left */}

<motion.div
animate={{ y:[0,-8,0] }}
transition={{
duration:5,
repeat:Infinity,
ease:"easeInOut"
}}
className="
absolute
top-10
left-6
hidden
xl:flex
rounded-[28px]
bg-white/75
backdrop-blur-3xl
border
border-white/60
px-6
py-5
shadow-[0_25px_70px_rgba(15,23,42,.12)]
"
>

<div>

<p className="text-xs uppercase tracking-[0.25em] text-slate-400">

Battery Range

</p>

<h3 className="mt-2 text-4xl font-black text-[#18B368]">

120 KM

</h3>

<p className="mt-1 text-sm text-slate-500">

Single Charge

</p>

</div>

</motion.div>

{/* Top Right */}

<motion.div
animate={{ y:[0,8,0] }}
transition={{
duration:6,
repeat:Infinity,
ease:"easeInOut"
}}
className="
absolute
top-12
right-6
hidden
xl:flex
rounded-[28px]
bg-white/75
backdrop-blur-3xl
border
border-white/60
px-6
py-5
shadow-[0_25px_70px_rgba(15,23,42,.12)]
"
>

<div>

<p className="text-xs uppercase tracking-[0.25em] text-slate-400">

Charging

</p>

<h3 className="mt-2 text-4xl font-black text-[#EC2A8C]">

Fast

</h3>

<p className="mt-1 text-sm text-slate-500">

Quick Recharge

</p>

</div>

</motion.div>

{/* Bottom Left */}

<motion.div
animate={{ y:[0,-6,0] }}
transition={{
duration:5.5,
repeat:Infinity
}}
className="
absolute
bottom-20
left-10
hidden
xl:flex
rounded-[28px]
bg-white/75
backdrop-blur-3xl
border
border-white/60
px-6
py-5
shadow-[0_25px_70px_rgba(15,23,42,.12)]
"
>

<div>

<p className="text-xs uppercase tracking-[0.25em] text-slate-400">

Tracking

</p>

<h3 className="mt-2 text-3xl font-black text-[#18B368]">

GPS Live

</h3>

<p className="mt-1 text-sm text-slate-500">

Always Connected

</p>

</div>

</motion.div>

{/* Bottom Right */}

<motion.div
animate={{ y:[0,6,0] }}
transition={{
duration:6,
repeat:Infinity
}}
className="
absolute
bottom-16
right-10
hidden
xl:flex
rounded-[28px]
bg-white/75
backdrop-blur-3xl
border
border-white/60
px-6
py-5
shadow-[0_25px_70px_rgba(15,23,42,.12)]
"
>

<div>

<p className="text-xs uppercase tracking-[0.25em] text-slate-400">

Ride Mode

</p>

<h3 className="mt-2 text-3xl font-black text-[#18B368]">

Smart EV

</h3>

<p className="mt-1 text-sm text-slate-500">

Premium Experience

</p>

</div>

</motion.div>

  {/* Bottom Platform Glow */}

 </motion.div>

 <div className="mt-24 text-center">

<p className="text-xs uppercase tracking-[0.35em] text-slate-400">

BUILT FOR

</p>

<div className="mt-8 flex flex-wrap justify-center gap-8 text-base font-semibold text-slate-500">

<span>Daily Commuters</span>

<span>Businesses</span>

<span>Fleet Operators</span>

<span>Delivery Partners</span>

<span>Gig Workers</span>

</div>

</div>

</div>

  </div>

</section>
  );
}