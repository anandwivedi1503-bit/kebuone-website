"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  Leaf,
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
    <div className="bg-[#F7F4EE] text-[#1C1917]">
      <section className="relative overflow-hidden bg-[#1C1917]">
        <Image
          src="/new-vehicle.jpeg"
          alt="EVUDDY electric scooters on city roads"
          fill
          priority
          className="z-0 object-cover object-center"
        />
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(7,17,31,0.78)_0%,rgba(7,17,31,0.45)_48%,rgba(7,17,31,0.88)_100%)]" />
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_82%_18%,rgba(24,179,104,0.28),transparent_34%)]" />

        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-4 pb-16 pt-40 sm:px-6 sm:pb-20 sm:pt-48 lg:px-10 lg:pt-52">
          <motion.div initial="hidden" animate="show" variants={fade} transition={{ duration: 0.7 }}>
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#C8E6D4]">
              Leadership
            </p>
            <h1 className="font-display mt-6 max-w-3xl text-4xl font-medium tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
              Meet the people
              <span className="block italic text-[#C8E6D4]">behind EVUDDY.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-8 text-white/75">
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
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
            Leadership posters
          </p>
          <h2 className="font-display mt-3 max-w-3xl text-3xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
            Chairman, Founder &amp; CEO and General Manager
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-8 text-[#5C635E]">
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
                <figure className="overflow-hidden bg-[#FBF9F5] p-2 ring-1 ring-[#E4DDD2] transition group-hover:-translate-y-0.5">
                  <PosterMedia
                    src={leader.image}
                    alt={`${leader.name}, ${leader.role} of EVUDDY`}
                    frame={leader.id === "chairman" ? "tall" : "standard"}
                  />
                </figure>
                <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.16em] text-[#1F6B4A]">
                  {leader.role}
                </p>
                <h3 className="font-display mt-1 text-2xl font-medium">{leader.name}</h3>
              </button>
            ))}
          </div>

          <LeaderProfile leader={active} />
        </div>
      </section>

      <section id="team" className="bg-[#FBF9F5] px-4 py-20 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
            Team EVUDDY
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
            The people across every function
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-8 text-[#5C635E]">
            Official team posters: Anoop Pathak (Operations Incharge, Shubhrax
            Mobility Ltd), Anand Dhar Dwivedi (SDE), Aanya Singh (Admin &amp; Front
            Desk), Akanksha Maurya (Graphic Designer), and the Marketing Team
            (Aryan Dwivedi, Yashvardhan Jaiswal and Adarsh Pandey), followed by
            the wider functions.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F7F4EE] px-4 pb-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">Our values</p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
            The principles behind every EVUDDY ride
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {values.map((value) => (
              <div key={value.title} className="border-t border-[#E4DDD2] pt-5">
                <value.icon className="h-5 w-5 text-[#1F6B4A]" strokeWidth={1.5} />
                <h3 className="mt-4 text-base font-medium text-[#1C1917]">{value.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#5C635E]">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl border-t border-[#E4DDD2] pt-10 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
            Join the team
          </p>
          <h2 className="font-display mt-4 text-3xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
            Build electric mobility with EVUDDY
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-[#5C635E]">
            We are hiring people who care about riders, cities and clean transport.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 bg-[#1F6B4A] px-8 py-3.5 text-[13px] font-medium tracking-[0.08em] text-white hover:bg-[#18573c]"
            >
              View careers <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 border border-[#1C1917]/15 px-8 py-3.5 text-[13px] font-medium text-[#1C1917]"
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
      className="mt-12 border-t border-[#E4DDD2] bg-[#1C1917] p-7 text-[#F7F4EE] sm:p-10"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#C8E6D4]">
        {leader.role}
      </p>
      <h3 className="font-display mt-3 text-3xl font-medium tracking-[-0.03em]">{leader.name}</h3>
      <p className="mt-2 text-sm text-white/55">{leader.org}</p>
      <p className="mt-6 max-w-4xl text-[15px] leading-8 text-white/80">
        {leader.bio}
      </p>
      <p className="mt-8 text-[11px] font-medium tracking-[0.22em] text-[#C8E6D4]">
        #safeRideWithEvuddy
      </p>
    </motion.div>
  );
}

function posterSrc(src: string) {
  const stamp = "v20260909";
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
    <article className="overflow-hidden border border-[#E4DDD2] bg-[#FBF9F5] p-2">
      {member.image ? (
        <PosterMedia
          src={member.image}
          alt={`${member.name}, ${member.role} at EVUDDY`}
          frame="tall"
        />
      ) : (
        <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-gradient-to-br from-[#E8FFF3] via-white to-[#FFF0F6]">
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="font-display text-4xl font-medium text-[#1F6B4A]">
              {member.role
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </p>
            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F6B63]">
              Poster coming soon
            </p>
          </div>
        </div>
      )}
      <div className="p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#1F6B4A]">
          {member.role}
        </p>
        <h3 className="font-display mt-2 text-xl font-medium">{member.name}</h3>
      </div>
    </article>
  );
}
