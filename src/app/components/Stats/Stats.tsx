"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const benefits = [
  {
    title: "Higher earnings",
    text: "New revenue through a growing EV rental ecosystem.",
  },
  {
    title: "Smart operations",
    text: "Manage bookings, hubs and growth from one platform.",
  },
  {
    title: "Business growth",
    text: "Expand with a mobility brand built for Indian cities.",
  },
  {
    title: "Strong community",
    text: "Work with partners who share a cleaner mobility vision.",
  },
];

export default function PartnerSection() {
  return (
    <section id="partner" className="bg-[#06140F] py-24 text-white sm:py-32">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="ev-kicker">Partner with EVUDDY</p>
          <h2 className="ev-display mt-4 text-4xl sm:text-6xl">
            Fleet, hub, franchise.
            <span className="italic text-[#18B368]"> One EV network.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-white/60">
            Join as a franchise, fleet or hub partner in a technology-led electric mobility network.
          </p>
        </div>

        <div className="mt-16 grid gap-10 border-t border-white/10 pt-12 lg:grid-cols-2">
          <div>
            <p className="ev-kicker">Why partner with us</p>
            <h3 className="ev-display mt-4 text-3xl sm:text-5xl">Build your business with EVUDDY.</h3>
            <p className="mt-4 max-w-md text-white/60">
              Fleet owners, operators and entrepreneurs get the technology and support to scale with confidence.
            </p>
          </div>
          <div className="grid sm:grid-cols-2">
            {benefits.map((item) => (
              <div key={item.title} className="border-t border-white/10 py-6 sm:px-6 sm:first:pl-0">
                <h4 className="font-semibold text-white">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-white/55">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-10 sm:flex-row sm:items-center">
          <div>
            <h4 className="ev-display text-3xl">Ready to grow with EVUDDY?</h4>
            <p className="mt-2 text-sm text-white/55">Join the partner network for the next wave of urban EV mobility.</p>
          </div>
          <Link href="/partners#partner-form" className="ev-cta w-full sm:w-auto">
            Become a Partner
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
