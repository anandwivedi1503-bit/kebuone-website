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


  <div className="max-w-[1480px] mx-auto px-6 lg:px-10">

    <div className="pt-36 lg:pt-40 pb-12 text-center">

      {/* Badge */}

      <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{
    scale: 1.04,
    y: -2,
  }}
  transition={{
    duration: 0.5,
  }}
  className="inline-flex items-center gap-3 rounded-full border border-[#18B368]/20 bg-white/90 backdrop-blur-md px-6 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
>
  <motion.span
    animate={{
      scale: [1, 1.3, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
    }}
    className="h-2.5 w-2.5 rounded-full bg-[#18B368]"
  />

  <span className="text-sm font-semibold text-gray-700">
    India's Smart Electric Mobility Platform
  </span>
</motion.div>

      {/* Heading */}

      <motion.h1
  initial={{
    opacity: 0,
    y: 60,
  }}
  animate={{
    opacity: 1,
    y: 0,
  }}
  transition={{
    duration: 0.9,
    ease: "easeOut",
  }}
        className="
        mt-6
        text-6xl
md:text-7xl
lg:text-8xl
xl:text-[110px]
        font-black
        tracking-[-0.035em]
        leading-[0.92]
        text-gray-900
        "
      >

        <span
className="
bg-gradient-to-r
from-[#16C45B]
via-[#18B368]
via-[#4ADE80]
to-[#EC2A8C]
bg-clip-text
text-transparent
"
>
Electric Mobility
</span>

<br />

<span
className="
bg-gradient-to-r
from-[#16C45B]
via-[#18B368]
via-[#4ADE80]
to-[#EC2A8C]
bg-clip-text
text-transparent
"
>
Made
</span>

<span
className="
bg-gradient-to-r
from-[#16C45B]
via-[#18B368]
via-[#4ADE80]
to-[#EC2A8C]
bg-clip-text
text-transparent
"
>
{" "}Effortless
</span>

      </motion.h1>

      {/* Subtitle */}

      <motion.p
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        transition={{ delay:.3 }}
        className="
        mt-8
        mx-auto
        max-w-3xl
        text-xl
        text-gray-500
        leading-9
        "
      >

        The smarter way to move across the city.

        <br />

        Electric rides, instant booking,
and zero emissions.

      </motion.p>

      {/* Buttons */}

      <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.45 }}
  className="
mt-10
flex
justify-center
items-center
gap-5
flex-wrap
"
>

  <Link href="/register">

    <button
      className="
group
flex
items-center
gap-2
rounded-full
bg-gradient-to-r
from-[#18B368]
via-[#16C45B]
to-[#13A657]
px-10
py-4
font-semibold
text-lg
text-white
shadow-[0_14px_40px_rgba(24,179,104,0.35)]
transition-all
duration-300
hover:-translate-y-1
hover:shadow-[0_22px_55px_rgba(24,179,104,0.45)]
active:scale-[0.98]
"
    >

      Book an EV

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

    </button>

  </Link>

  <Link href="/partners">

    <button
      className="
flex
items-center
gap-2
rounded-full
border
border-[#18B368]/20
bg-white/90
backdrop-blur-xl
px-10
py-4
font-semibold
text-lg
text-[#18B368]
shadow-[0_12px_35px_rgba(15,23,42,0.08)]
transition-all
duration-300
hover:-translate-y-1
hover:border-[#18B368]
hover:bg-[#18B368]
hover:text-white
hover:shadow-[0_18px_45px_rgba(24,179,104,0.25)]
"
    >

      Become a Partner

    </button>

  </Link>

</motion.div>

 <motion.div
  initial={{
    opacity: 0,
    y: 50,
    scale: 0.96,
  }}
  animate={{
    opacity: 1,
    y: 0,
    scale: 1,
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

  {/* Green Ambient Glow */}

  <div
    className="
absolute
left-[-60px]
bottom-8
h-[300px]
w-[300px]
rounded-full
bg-[#18B368]/15
blur-[130px]
-z-10
"
  />

  {/* Pink Ambient Glow */}

  <div
    className="
absolute
right-[-60px]
top-10
h-[260px]
w-[260px]
rounded-full
bg-[#EC2A8C]/12
blur-[120px]
-z-10
"
  />

  {/* White Highlight */}

  <div
    className="
absolute
left-1/2
top-0
-translate-x-1/2
h-32
w-[70%]
rounded-full
bg-white/70
blur-[80px]
-z-10
"
  />

  {/* Poster Card */}

  <div
    className="
group
relative
overflow-hidden
rounded-[40px]
border
border-white/80
bg-white/85
backdrop-blur-2xl
shadow-[0_35px_90px_rgba(15,23,42,0.14)]
transition-all
duration-700
hover:-translate-y-2
hover:shadow-[0_50px_120px_rgba(15,23,42,0.18)]
"
  >

    {/* Top Shine */}

    <div
      className="
absolute
top-0
left-0
h-px
w-full
bg-gradient-to-r
from-transparent
via-white
to-transparent
z-20
"
    />

    {/* Poster */}

    <Image
      src="/poster.png"
      alt="EVUDDY"
      width={2400}
      height={1200}
      priority
      className="
w-full
h-auto
object-cover
transition-all
duration-700
group-hover:scale-[1.02]
group-hover:brightness-105
"
    />

    {/* Bottom Gradient */}

    <div
      className="
absolute
bottom-0
left-0
h-28
w-full
bg-gradient-to-t
from-black/5
via-transparent
to-transparent
pointer-events-none
"
    />

  </div>

  {/* ================= Floating Cards ================= */}

{/* Battery */}

<motion.div
animate={{ y: [0, -10, 0] }}
transition={{
duration: 5,
repeat: Infinity,
ease: "easeInOut",
}}
className="
absolute
top-12
-left-8
hidden
lg:flex
items-center
gap-3
rounded-2xl
border
border-white/70
bg-white/90
backdrop-blur-xl
px-5
py-4
shadow-[0_20px_45px_rgba(15,23,42,0.10)]
"
>

<div className="text-2xl">🔋</div>

<div>

<p className="text-sm font-semibold text-gray-900">
120 KM Range
</p>

<p className="text-xs text-gray-500">
Single Charge
</p>

</div>

</motion.div>

{/* Charging */}

<motion.div
animate={{ y: [0, 8, 0] }}
transition={{
duration: 6,
repeat: Infinity,
ease: "easeInOut",
}}
className="
absolute
top-16
-right-8
hidden
lg:flex
items-center
gap-3
rounded-2xl
border
border-white/70
bg-white/90
backdrop-blur-xl
px-5
py-4
shadow-[0_20px_45px_rgba(15,23,42,0.10)]
"
>

<div className="text-2xl">⚡</div>

<div>

<p className="text-sm font-semibold text-gray-900">
Fast Charging
</p>

<p className="text-xs text-gray-500">
Ready in Minutes
</p>

</div>

</motion.div>

{/* Tracking */}

<motion.div
animate={{ y: [0, -8, 0] }}
transition={{
duration: 5.5,
repeat: Infinity,
ease: "easeInOut",
}}
className="
absolute
bottom-20
-left-10
hidden
lg:flex
items-center
gap-3
rounded-2xl
border
border-white/70
bg-white/90
backdrop-blur-xl
px-5
py-4
shadow-[0_20px_45px_rgba(15,23,42,0.10)]
"
>

<div className="text-2xl">📍</div>

<div>

<p className="text-sm font-semibold text-gray-900">
Live Tracking
</p>

<p className="text-xs text-gray-500">
Real-time Location
</p>

</div>

</motion.div>

{/* Safety */}

<motion.div
animate={{ y: [0, 10, 0] }}
transition={{
duration: 6.5,
repeat: Infinity,
ease: "easeInOut",
}}
className="
absolute
bottom-16
-right-10
hidden
lg:flex
items-center
gap-3
rounded-2xl
border
border-white/70
bg-white/90
backdrop-blur-xl
px-5
py-4
shadow-[0_20px_45px_rgba(15,23,42,0.10)]
"
>

<div className="text-2xl">🛡</div>

<div>

<p className="text-sm font-semibold text-gray-900">
Safe & Reliable
</p>

<p className="text-xs text-gray-500">
Verified Rides
</p>

</div>

</motion.div>

  {/* Bottom Platform Glow */}

  <div
    className="
absolute
left-1/2
-bottom-14
-translate-x-1/2
h-24
w-[75%]
rounded-full
bg-[#18B368]/12
blur-[90px]
-z-10
"
  />

</motion.div>

</div>

  </div>

</section>
  );
}