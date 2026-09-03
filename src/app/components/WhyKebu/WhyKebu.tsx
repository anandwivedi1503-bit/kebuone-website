"use client";

import Link from "next/link";
import { ArrowRight, HeartHandshake, Leaf, MapPinned, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Yard-locked pickup",
    text: "OTP after first payment. No scooter leaves a hub without the yard.",
  },
  {
    icon: MapPinned,
    title: "Live GPS on the scooter",
    text: "Same IoT feed ops use — lock, battery and location while you ride.",
  },
  {
    icon: Leaf,
    title: "Electric, GST-correct",
    text: "5% GST on rent only. Deposit is refundable and not taxed.",
  },
  {
    icon: HeartHandshake,
    title: "24×7 rider helpdesk",
    text: "helpdesk@kebuone.in · +91 8726006512 · tickets on Book EV.",
  },
];

export default function WhyChoose() {
  return (
    <section id="why-choose" className="relative scroll-mt-28 bg-[#FBF9F5] py-20 sm:scroll-mt-40 sm:py-28">
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <span className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
            Why choose EVUDDY
          </span>
          <h2 className="font-display mt-4 text-4xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
            Built for the future of <span className="italic text-[#1F6B4A]">smart mobility</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-8 text-[#5C635E]">
            Technology, sustainability and a customer-first ride experience for modern Indian cities.
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          <div>
            <Leaf size={22} strokeWidth={1.5} className="text-[#1F6B4A]" />
            <h3 className="font-display mt-5 text-3xl font-medium leading-tight text-[#1C1917]">
              Built like India&apos;s next EV network.
            </h3>
            <p className="mt-4 max-w-xl text-[15px] leading-8 text-[#5C635E]">
              Hubs, KYC, Razorpay, OTP pickup and Rent to Own on one platform — for daily riders,
              gig work and people who want to own the scooter.
            </p>
            <span className="mt-6 inline-block text-[12px] uppercase tracking-[0.16em] text-[#1F6B4A]">
              #safeRideWithEvuddy
            </span>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="border-t border-[#E4DDD2] pt-5">
                  <Icon className="text-[#1F6B4A]" size={18} strokeWidth={1.5} />
                  <h4 className="mt-4 text-base font-medium text-[#1C1917]">{item.title}</h4>
                  <p className="mt-2 text-sm leading-7 text-[#5C635E]">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 border-t border-[#E4DDD2] pt-10 text-center">
          <h3 className="font-display text-3xl font-medium text-[#1C1917]">Ready to ride smarter?</h3>
          <p className="mx-auto mt-3 max-w-xl text-[#5C635E]">
            Register once, then book an EVUDDY scooter from your nearest hub.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/ride-options" className="w-full sm:w-auto">
              <span className="inline-flex w-full items-center justify-center gap-2 bg-[#1F6B4A] px-8 py-3.5 text-[13px] font-medium tracking-[0.08em] text-white sm:w-auto">
                Book an EV
                <ArrowRight size={16} />
              </span>
            </Link>
            <Link href="/ride-options" className="w-full sm:w-auto">
              <span className="inline-flex w-full items-center justify-center border border-[#1C1917]/15 px-8 py-3.5 text-[13px] font-medium text-[#1C1917] sm:w-auto">
                I already have an account
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
