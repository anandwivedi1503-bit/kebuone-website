import { BRAND } from "@/lib/brandMedia";
import { Building2, MapPinned, ShieldCheck, Zap } from "lucide-react";

import {
  BrandCardGrid,
  BrandCta,
  BrandFilm,
  BrandHero,
  BrandMosaic,
  BrandSplit,
  BrandStatement,
} from "@/app/components/Brand/BrandStoryPage";

const facts = [
  { label: "Hourly", value: "₹60" },
  { label: "Daily", value: "₹230" },
  { label: "Weekly", value: "₹1,610" },
  { label: "Monthly", value: "₹6,900" },
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
    text: "₹280 a day for 18 months. Pay ₹280 + 5% GST every day. No security deposit. Daily receipt. Then the scooter is yours.",
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
    <div className="overflow-x-hidden bg-[#F4F7F8] text-[#08112F]">
      <BrandHero
        title="About"
        accent="Us"
        subtitle="EVUDDY is building India's next-generation EV mobility ecosystem through B2B, B2C, and Rent-to-Own solutions."
        primaryHref="/ride-options"
        primaryLabel="Book an EV"
        secondaryHref="/Leadership"
        secondaryLabel="Meet leadership"
        posterSrc="/about/about-poster.png"
        posterAlt="EVUDDY About Us — mission and vision"
      />

      <BrandStatement
        label="About EVUDDY"
        paragraphs={[
          "EVUDDY is building India's next-generation EV mobility ecosystem through B2B, B2C, and Rent-to-Own solutions.",
          "Our mission is to make electric mobility affordable, accessible, and asset-building for every rider.",
          "We envision empowering gig workers and businesses with sustainable transportation while creating a future where every ride can lead to ownership.",
        ]}
      />

      <BrandFilm
        src={BRAND.film}
        eyebrow="The company"
        title="Smart electric mobility you can book, ride and own."
      />

      <BrandSplit
        eyebrow="Riders"
        title="A scooter when you need it. An asset if you want it."
        text="Hourly to monthly plans for daily riders. GST is 5% on rental only. Normal bookings include a refundable deposit. Rent to Own has no deposit."
        image={BRAND.rider}
        alt="EVUDDY rental scooter"
      />

      <BrandMosaic
        title="One ecosystem. The scooter at the centre."
        text="B2C rentals, hubs, fleets and Rent to Own sit on the same live platform."
        photos={[
          { src: BRAND.highway, alt: "EVUDDY scooters on the open road" },
          { src: BRAND.city, alt: "EVUDDY rental scooter in the city" },
          { src: BRAND.parked, alt: "EVUDDY scooter ready for pickup" },
        ]}
      />

      <section className="mx-auto grid max-w-6xl gap-3 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
        {facts.map((item) => (
          <div
            key={item.label}
            className="rounded-[24px] border border-white bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-black text-[#18B368]">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#18B368]">
              How we work
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Affordable. Accessible. Asset-building.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              GST is 5% on rental only (CGST 2.5% + SGST 2.5%). Security deposit
              on normal rentals is refundable and not taxed. Rent to Own has no
              deposit.
            </p>
          </div>
          <div className="rounded-[28px] bg-[#08112F] p-7 text-white sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#86EFAC]">
              What we operate
            </p>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-white/80 sm:text-base">
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
            className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
          >
            <item.icon className="h-10 w-10 text-[#18B368]" />
            <h3 className="mt-4 text-xl font-black">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
          </article>
        ))}
      </BrandCardGrid>

      <BrandCta title="Ride cleaner. Own the journey." href="/ride-options" label="Get started" />
    </div>
  );
}
