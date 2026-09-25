import { BRAND } from "@/lib/brandMedia";
import { Building2, MapPinned, ShieldCheck, Zap } from "lucide-react";

import {
  BrandCardGrid,
  BrandCta,
  BrandHero,
  BrandSplit,
  BrandStatement,
} from "@/app/components/Brand/BrandStoryPage";

const facts = [
  { label: "Hourly", value: "₹60" },
  { label: "Daily", value: "₹250" },
  { label: "Weekly", value: "₹1,750" },
  { label: "Monthly", value: "₹7,500" },
];

const pillars = [
  {
    icon: Zap,
    title: "Flexible EV rentals",
    text: "Hourly to monthly plans with GST only on rental, plus a refundable deposit on normal bookings.",
  },
  {
    icon: ShieldCheck,
    title: "Rent to Own",
    text: "₹300 a day GST included for 20 months, plus a one-time refundable security deposit of ₹2,500. Daily receipt. Then the scooter is yours.",
  },
  {
    icon: Building2,
    title: "Partners and fleets",
    text: "Dealers from ₹5 lakh, distributors from ₹10 lakh, hubs and B2B fleets share one live operations platform.",
  },
  {
    icon: MapPinned,
    title: "Live operations",
    text: "KYC, OTP pickup, GPS tracking and support so every ride is accountable.",
  },
];

export default function AboutUs() {
  return (
    <div className="overflow-x-hidden bg-[#F7F4EE] text-[#1C1917]">
      <BrandHero
        title="About"
        accent="Us"
        subtitle="EVUDDY is building India's next-generation EV mobility ecosystem through B2B, B2C, and Rent-to-Own solutions."
        primaryHref="/ride-options"
        primaryLabel="Book an EV"
        secondaryHref="/Leadership"
        secondaryLabel="Meet leadership"
        posterSrc={BRAND.yard}
        posterAlt="EVUDDY flagship hub"
      />

      <BrandStatement
        label="About EVUDDY"
        paragraphs={[
          "EVUDDY is building India's next-generation EV mobility ecosystem through B2B, B2C, and Rent-to-Own solutions.",
          "Our mission is to make electric mobility affordable, accessible, and asset-building for every rider.",
          "We envision empowering gig workers and businesses with sustainable transportation while creating a future where every ride can lead to ownership.",
        ]}
      />

      <BrandSplit
        eyebrow="Riders"
        title="A scooter when you need it. An asset if you want it."
        text="Hourly to monthly plans for daily riders. Fares are GST included. Rentals and Rent to Own include a refundable ₹2,500 deposit."
        image={BRAND.cityCommute}
        alt="EVUDDY rental scooter on a city commute"
      />

      <section className="mx-auto grid max-w-[1440px] gap-8 px-5 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12">
        {facts.map((item) => (
          <div key={item.label} className="border-t border-[#E4DDD2] pt-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F6B63]">
              {item.label}
            </p>
            <p className="font-display mt-2 text-3xl font-medium text-[#1F6B4A]">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="bg-[#FBF9F5] py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
              How we work
            </p>
            <h2 className="font-display mt-3 text-3xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-4xl">
              Affordable. Accessible. <span className="italic text-[#1F6B4A]">Asset-building.</span>
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-8 text-[#5C635E]">
              Published fares are GST included (CGST 2.5% + SGST 2.5% already in the price).
              Security deposit of ₹2,500 on rentals and Rent to Own is refundable and not taxed.
            </p>
          </div>
          <div className="border-t border-[#E4DDD2] pt-6 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#1F6B4A]">
              What we operate
            </p>
            <ul className="mt-6 space-y-4 text-[15px] leading-8 text-[#5C635E]">
              <li>B2C rentals for daily riders</li>
              <li>B2B fleets, hubs and delivery partners</li>
              <li>Rent to Own so every ride can lead to ownership</li>
              <li>OTP, KYC, Razorpay and live hub pickup</li>
            </ul>
          </div>
        </div>
      </section>

      <BrandCardGrid title="How EVUDDY works for you">
        {pillars.map((item) => (
          <article
            key={item.title}
            className="border-t border-[#E4DDD2] pt-5"
          >
            <item.icon className="text-[#1F6B4A]" size={18} strokeWidth={1.5} />
            <h3 className="mt-4 text-base font-medium text-[#1C1917]">{item.title}</h3>
            <p className="mt-2 text-sm leading-7 text-[#5C635E]">{item.text}</p>
          </article>
        ))}
      </BrandCardGrid>

      <BrandCta title="Ride cleaner. Own the journey." href="/ride-options" label="Get started" />
    </div>
  );
}
