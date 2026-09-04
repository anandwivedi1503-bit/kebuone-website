"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  Leaf,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { board, team, type LeaderPoster, type TeamMember } from "./leadershipData";

const values = [
  {
    icon: BadgeCheck,
    title: "Integrity",
    text: "Honest decisions, transparent operations, and accountability on every ride.",
  },
  {
    icon: Zap,
    title: "Innovation",
    text: "OTP, live tracking and Rent to Own — technology that makes EV riding simple.",
  },
  {
    icon: Users,
    title: "Customer first",
    text: "Every hub, booking and support flow starts with the rider experience.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    text: "Electric scooters for daily commute, delivery and ownership without extra noise.",
  },
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function Leadership() {
  const [active, setActive] = useState(board[0]);

  return (
    <div className="bg-[#F4FBF7] text-[#08112F]">
      <section className="relative overflow-hidden bg-[#08112F]">
        <Image
          src="/new-vehicle.jpeg"
          alt="EVUDDY electric scooters on city roads"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.72)_0%,rgba(7,17,31,0.5)_45%,rgba(7,17,31,0.9)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(24,179,104,0.28),transparent_34%)]" />

        <div className="relative mx-auto flex min-h-[68vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-36 sm:px-6 sm:pb-20 lg:px-10">
          <motion.div initial="hidden" animate="show" variants={fade} transition={{ duration: 0.7 }}>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold tracking-[0.22em] text-white backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#6EE7A8]" />
              LEADERSHIP
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
              Meet the people
              <span className="block bg-gradient-to-r from-[#6EE7A8] via-white to-[#D8F3E4] bg-clip-text text-transparent">
                behind EVUDDY.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              Sunil Pathak, Bindu Singh and Anjali Mishra lead EVUDDY, with
              Operations Incharge Anoop Pathak and the wider team behind every
              safe electric ride.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="leaders" className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(24,179,104,0.12),transparent_32%),radial-gradient(circle_at_100%_8%,rgba(24,179,104,0.08),transparent_28%)]" />

        <div className="relative mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#18B368]">
            Leadership posters
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.05em] sm:text-5xl">
            Chairman, Founder &amp; CEO and General Manager
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Official posters for Sunil Pathak, Bindu Singh and Anjali Mishra.
            Open any poster to read the profile.
          </p>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {board.map((leader) => (
              <button
                key={leader.id}
                type="button"
                onClick={() => setActive(leader)}
                className={`group text-left transition ${
                  active.id === leader.id ? "scale-[1.01]" : ""
                }`}
              >
                <figure className="overflow-hidden rounded-[28px] bg-white p-2.5 shadow-[0_28px_80px_rgba(8,17,47,0.1)] ring-1 ring-[#18B368]/10 transition group-hover:-translate-y-1 group-hover:shadow-[0_36px_90px_rgba(24,179,104,0.16)]">
                  <PosterMedia
                    src={leader.image}
                    alt={`${leader.name}, ${leader.role} of EVUDDY`}
                    frame={leader.id === "chairman" ? "tall" : "standard"}
                  />
                </figure>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#18B368]">
                  {leader.role}
                </p>
                <h3 className="mt-1 text-2xl font-black">{leader.name}</h3>
              </button>
            ))}
          </div>

          <LeaderProfile leader={active} />
        </div>
      </section>

      <section id="team" className="bg-white px-4 py-20 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#18B368]">
            Team EVUDDY
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.05em] sm:text-5xl">
            The people across every function
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Official team posters: Anoop Pathak (Operations Incharge, Shubhrax
            Mobility Ltd), Anand Dhar Dwivedi (SDE), Aanya Singh (Admin &amp; Front
            Desk), and Akanksha Maurya (Graphic Designer), followed by the wider
            functions.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 pb-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#18B368]">Our values</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.05em] sm:text-5xl">
            The principles behind every EVUDDY ride
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-[28px] border border-slate-100 bg-[#F7FBFA] p-7 transition hover:-translate-y-1 hover:border-[#18B368]/25 hover:bg-white hover:shadow-[0_24px_60px_rgba(24,179,104,0.12)]"
              >
                <value.icon className="h-8 w-8 text-[#18B368]" />
                <h3 className="mt-5 text-2xl font-black">{value.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-[#08112F] px-5 py-10 text-white sm:rounded-[36px] sm:px-14 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6EE7A8]">
            Join the team
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.05em] sm:text-5xl">
            Build electric mobility with EVUDDY
          </h2>
          <p className="mt-4 max-w-xl text-white/70">
            We are hiring people who care about riders, cities and clean transport.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 rounded-full bg-[#18B368] px-6 py-3 font-bold text-white"
            >
              View careers <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-bold text-white"
            >
              About EVUDDY
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function LeaderProfile({ leader }: { leader: LeaderPoster }) {
  return (
    <motion.div
      key={leader.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 overflow-hidden rounded-[32px] bg-[#08112F] p-7 text-white shadow-[0_30px_80px_rgba(8,17,47,0.18)] sm:p-10"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#6EE7A8]">
        {leader.role}
      </p>
      <h3 className="mt-3 text-3xl font-black tracking-[-0.04em]">{leader.name}</h3>
      <p className="mt-2 text-sm font-semibold text-white/60">{leader.org}</p>
      <p className="mt-6 max-w-4xl text-sm leading-7 text-white/88 sm:text-base sm:leading-8">
        {leader.bio}
      </p>
      <div className="mt-8 max-w-sm rounded-2xl bg-[#18B368] px-5 py-3 text-center">
        <p className="text-sm font-black tracking-wide">#safeRideWithEvuddy</p>
      </div>
    </motion.div>
  );
}

function posterSrc(src: string) {
  const stamp = "v20260901";
  if (!src) return src;
  if (/^https?:\/\//.test(src)) {
    return src.includes("?") ? `${src}&${stamp}` : `${src}?${stamp}`;
  }
  return `${src}?${stamp}`;
}

function PosterMedia({
  src,
  alt,
  frame = "standard",
}: {
  src: string;
  alt: string;
  frame?: "tall" | "standard";
  priority?: boolean;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-[20px] bg-[#E7EEE9] ${
        frame === "tall" ? "aspect-[941/1672]" : "aspect-[1087/1447]"
      }`}
    >
      <img
        src={posterSrc(src)}
        alt={alt}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          maxWidth: "none",
          maxHeight: "none",
          objectFit: "contain",
          objectPosition: "center",
        }}
      />
    </div>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-100 bg-white p-2.5 shadow-[0_16px_40px_rgba(8,17,47,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(24,179,104,0.12)]">
      {member.image ? (
        <PosterMedia
          src={member.image}
          alt={`${member.name}, ${member.role} at EVUDDY`}
          frame="tall"
        />
      ) : (
        <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-gradient-to-br from-[#E8FFF3] via-white to-[#FFF0F6]">
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-4xl font-black text-[#18B368]">
              {member.role
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Poster coming soon
            </p>
          </div>
        </div>
      )}
      <div className="p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#18B368]">
          {member.role}
        </p>
        <h3 className="mt-2 text-xl font-black">{member.name}</h3>
      </div>
    </article>
  );
}
