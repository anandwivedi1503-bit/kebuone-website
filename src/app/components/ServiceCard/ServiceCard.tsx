"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

type ServiceCardProps = {
  icon: string;
  title: string;
  description: string;
  color: string;
  image?: string;
  link?: string;
  badge?: string;
  stat?: string;
  tags?: string[];
};

export default function ServiceCard({
  icon,
  title,
  description,
  color,
   image,
   link,
  badge,
  stat,
  tags,
}: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{
  y: -10,
  scale: 1.01,
}}
      transition={{ duration: 0.35 }}
      className="
      group
      relative
      overflow-hidden
      rounded-[40px]
      border
      border-gray-200/70
      shadow-[0_35px_80px_rgba(15,23,42,0.12)]
      bg-[linear-gradient(135deg,#F8FFF9_0%,#FFFFFF_60%,#FFF8FC_100%)]
      "
    >

      <div
  className="
  absolute
  inset-0
  bg-gradient-to-r
  from-[#F8FFF9]
  via-white
  to-[#FFF8FC]
  "
/>

<div
  className="
  absolute
  inset-0
  opacity-25
  bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.9)_50%,transparent_80%)]
  "
/>

<div
  className="
  absolute
  inset-0
  rounded-[40px]
  border
  border-white/50
  "
/>

      {/* Green Glow */}

      <div
        className="
        absolute
        -top-28
        -left-24
        h-[420px]
        w-[420px]
        rounded-full
        bg-[#18B368]/10
        blur-[130px]
        "
      />

      {/* Pink Glow */}

      <div
        className="
        absolute
        -bottom-24
        right-0
        h-[340px]
        w-[340px]
        rounded-full
        bg-[#EC2A8C]/10
        blur-[120px]
        "
      />

      {/* Premium Top Border */}

      <div
        className="
        absolute
        top-0
        left-0
        h-[4px]
        w-full
        bg-gradient-to-r
        from-[#18B368]
        via-[#4ADE80]
        to-[#EC2A8C]
        "
      />

      {/* ================= CONTENT ================= */}

      <div
        className="
        relative
        z-20
        grid
grid-cols-1
lg:grid-cols-2
        gap-16
lg:gap-10
        xl:gap-14
        items-center
        px-5
md:px-8
py-10
md:py-12
        lg:px-16
        lg:py-16
        "
      >
        {/* ================= LEFT SIDE ================= */}

        <div className="max-w-[620px]">

          {badge && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="
              inline-flex
              items-center
              rounded-full
              border
              border-[#18B368]/20
              bg-white/90
              backdrop-blur-xl
              px-5
              py-2
              shadow-lg
              "
            >
              <span className="mr-2 h-2.5 w-2.5 rounded-full bg-[#18B368]" />

              <span className="text-[10px]
md:text-xs font-bold uppercase tracking-[0.20em] text-[#18B368]">
                {badge}
              </span>
            </motion.div>
          )}

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="
            mt-7
            text-4xl
sm:text-5xl
md:text-6xl
lg:text-7xl
            font-black
            leading-[0.95]
            tracking-[-0.04em]
            "
          >
            <>
  <span className="block text-[#18B368]">
    EVUDDY
  </span>

  <span
    className="
    block
    mt-2
    bg-gradient-to-r
    from-[#16C45B]
    via-[#18B368]
    via-[#4ADE80]
    to-[#EC2A8C]
    bg-clip-text
    text-transparent
    "
  >
    Electric Scooter
  </span>
</>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="
            mt-8
            max-w-xl
            text-lg
            leading-9
            text-gray-600
            "
          >
            {description}
          </motion.p>

          <div className="mt-10 flex flex-wrap gap-3">

            {(tags ?? []).map((tag) => (

              <motion.div
                key={tag}
                whileHover={{
                  y: -4,
                  scale: 1.05,
                }}
                className="
                rounded-full
                border
                border-white
                bg-white
                px-5
                py-3
                text-sm
                font-semibold
                text-gray-700
                shadow-lg
                "
              >
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#18B368]" />
{tag}
              </motion.div>

            ))}

          </div>

          <div className="mt-12">

            <Link
              href={link || "#"}
              className="
              inline-flex
              items-center
              gap-3
              rounded-full
              bg-gradient-to-r
              from-[#18B368]
              to-[#13A657]
              px-9
              py-4
              text-lg
              font-semibold
              text-white
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-[0_20px_45px_rgba(24,179,104,.35)]
              hover:scale-105
active:scale-95
before:absolute
before:inset-0
before:bg-white/20
before:opacity-0
hover:before:opacity-100
before:transition-opacity
before:duration-300
relative
overflow-hidden
              "
            >
              Reserve Your EV →
            </Link>

          </div>

        </div>

        {/* ================= RIGHT SIDE ================= */}
        <motion.div
  animate={{
    y: [0, -15, 0],
  }}
  transition={{
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut",
  }}
  className="
relative
flex
justify-center
items-end
pt-12
lg:pl-12
xl:pl-20
"
>

  {/* Green Glow */}

  <div
    className="
    absolute
    h-[420px]
    w-[420px]
    rounded-full
    bg-[#18B368]/15
    blur-[150px]
    "
  />

  {/* Pink Glow */}

  <div
    className="
    absolute
    right-10
    bottom-10
    h-[220px]
    w-[220px]
    rounded-full
    bg-[#EC2A8C]/15
    blur-[120px]
    "
  />

  {/* Center Ambient Light */}

<div
  className="
  absolute
  left-1/2
  top-1/2
  -translate-x-1/2
  -translate-y-1/2
  h-[600px]
  w-[600px]
  rounded-full
  bg-gradient-to-r
  from-[#18B368]/10
  via-white/40
  to-[#EC2A8C]/10
  blur-[170px]
  "
/>

  <div
  className="
  absolute
  bottom-5
  left-1/2
  -translate-x-1/2
  w-[440px]
  h-[40px]
  rounded-full
  bg-gradient-to-r
  from-black/5
  via-black/20
  to-black/5
  blur-2xl
  "
/>

<div
  className="
  absolute
  bottom-8
  left-1/2
  -translate-x-1/2
  w-[280px]
  h-[8px]
  rounded-full
  bg-white/70
  blur-md
  "
/>

  {image && (

    <Image
      src={image}
      alt={title}
      width={720}
      height={720}
      priority
      className="
relative
z-20
w-full
max-w-[260px]
sm:max-w-[320px]
md:max-w-[420px]
lg:max-w-[610px]
xl:max-w-[690px]
2xl:max-w-[740px]
object-contain
drop-shadow-[0_55px_90px_rgba(0,0,0,0.32)]
transition-all
duration-700
group-hover:scale-[1.1]
group-hover:-rotate-[0.5deg]
"
    />
    

  )}
  {/* Floating Card */}

  <motion.div
    animate={{
      y: [0, -8, 0],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
    }}
    className="
    absolute
   top-2
right-0
sm:right-2
md:top-2
md:right-0
lg:top-0
lg:-right-8
xl:-right-10
    z-30
    rounded-3xl
    bg-white/75
backdrop-blur-2xl
    px-4
    py-2.5
    shadow-[0_30px_70px_rgba(15,23,42,0.18)]
    border
    border-white/60
    "
  >

    <p className="text-[10px]
md:text-xs uppercase tracking-[0.22em] text-gray-500">
      Battery Range
    </p>

    <h4 className="mt-2 text-xl
md:text-3xl font-black text-[#18B368]">
      120 KM
    </h4>

  </motion.div>

  {/* Bottom Card */}

  <motion.div
    animate={{
      y: [0, 8, 0],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
    }}
    className="
    absolute
    bottom-2
left-0
sm:left-2
md:bottom-4
md:-left-6
lg:bottom-8
lg:-left-10
xl:-left-12
    z-30
    rounded-3xl
    bg-white/75
backdrop-blur-2xl
    px-6
    py-5
    shadow-[0_30px_70px_rgba(15,23,42,0.18)]
    border
    border-white/60
    "
  >

    <p className="text-[10px]
md:text-xs uppercase tracking-[0.22em] text-gray-500">
      Charging
    </p>

    <h4 className="mt-2 text-xl
md:text-3xl font-black text-[#EC2A8C]">
      Fast
    </h4>
</motion.div>

<motion.div
  animate={{
    x: [0, 6, 0],
  }}
  transition={{
    duration: 5,
    repeat: Infinity,
  }}
  className="
absolute
-left-4
sm:-left-6
md:-left-10
lg:-left-12
top-[48%]
md:top-[42%]
lg:top-[38%]
z-30
rounded-3xl
bg-white/75
backdrop-blur-2xl
px-4
py-3
md:px-6
md:py-5
shadow-[0_30px_70px_rgba(15,23,42,0.18)]
border
border-white/60
"
>

  <p className="text-[10px]
md:text-xs uppercase tracking-[0.22em] text-gray-500">
    Top Speed
  </p>

  <h4 className="mt-2 text-xl
md:text-3xl font-black text-[#18B368]">
    45 km/h
  </h4>

</motion.div>
</motion.div>

      </div>

    </motion.div>
  );
}