import { BRAND } from "@/lib/brandMedia";
import {
  BrandCard,
  BrandCardGrid,
  BrandCta,
  BrandHero,
  BrandSplit,
  BrandStatement,
} from "@/app/components/Brand/BrandStoryPage";

const pillars = [
  {
    title: "Our mission",
    text: "Make electric mobility affordable, accessible, and asset-building for every rider.",
  },
  {
    title: "Our vision",
    text: "Empower gig workers and businesses with sustainable transportation, so every ride can lead to ownership.",
  },
  {
    title: "B2C riders",
    text: "Hourly to monthly rentals with GST only on rental, plus a refundable deposit on normal bookings.",
  },
  {
    title: "Rent to Own",
    text: "₹300 a day GST included for 20 months, plus a one-time refundable security deposit of ₹2,500. Daily receipt. Then the scooter is yours.",
  },
];

const values = [
  { title: "Smart", text: "OTP, KYC, live hubs and tracking so every ride is accountable." },
  { title: "Electric", text: "Quiet scooters for commute, city work and Rent to Own." },
  { title: "Dependable", text: "Clear pricing, Razorpay checkout and support when something needs a human." },
  { title: "Asset-building", text: "Rent to Own turns daily riding into ownership, not only a rental receipt." },
];

export default function VisionMission() {
  return (
    <div className="overflow-x-hidden bg-[#F7F4EE] text-[#1C1917]">
      <BrandHero
        title="Our"
        accent="Vision"
        subtitle="We envision empowering gig workers and businesses with sustainable transportation while creating a future where every ride can lead to ownership."
        primaryHref="/ride-options"
        primaryLabel="Book an EV"
        secondaryHref="/about"
        secondaryLabel="About EVUDDY"
        posterSrc={BRAND.range}
        posterAlt="EVUDDY scooter on the open road"
      />

      <BrandStatement
        label="Vision & Mission"
        paragraphs={[
          "EVUDDY is building India's next-generation EV mobility ecosystem through B2B, B2C, and Rent-to-Own solutions.",
          "Our mission is to make electric mobility affordable, accessible, and asset-building for every rider.",
          "We envision empowering gig workers and businesses with sustainable transportation while creating a future where every ride can lead to ownership.",
        ]}
      />

      <BrandSplit
        eyebrow="Mission"
        title="Affordable. Accessible. Asset-building."
        text="Riders should not choose between a clean commute and a scooter they can never own. Flexible rentals get you moving. Rent to Own turns the same habit into an asset."
        image={BRAND.range}
        alt="EVUDDY electric scooter on the open road"
      />

      <BrandCardGrid title="What we are building toward">
        {pillars.map((item) => (
          <BrandCard key={item.title} title={item.title} text={item.text} />
        ))}
      </BrandCardGrid>

      <BrandCardGrid title="SMART · ELECTRIC · MOBILITY">
        {values.map((item) => (
          <BrandCard key={item.title} title={item.title} text={item.text} />
        ))}
      </BrandCardGrid>

      <BrandCta title="Ride cleaner. Own the journey." href="/ride-options" label="Get started" />
    </div>
  );
}
