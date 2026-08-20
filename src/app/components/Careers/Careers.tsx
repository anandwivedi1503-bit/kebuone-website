import {
  BrandCard,
  BrandCardGrid,
  BrandCta,
  BrandFilm,
  BrandHero,
  BrandMosaic,
  BrandSplit,
  BrandStatement,
} from "@/app/components/Brand/BrandPage";
import CareersApply from "./CareersApply";

const why = [
  {
    title: "Fast growth",
    text: "Grow with an emerging electric mobility company building hubs, rentals and Rent to Own.",
  },
  {
    title: "Real product work",
    text: "OTP, KYC, bookings, Razorpay and live operations — not slide-deck mobility.",
  },
  {
    title: "Clean cities",
    text: "Every scooter on EVUDDY replaces a petrol commute with a quieter electric ride.",
  },
  {
    title: "Ownership culture",
    text: "Small teams, clear accountability, and work that riders feel the next day.",
  },
];

const teams = [
  { title: "Technology", text: "Apps, APIs, dashboards and the live booking platform." },
  { title: "Operations", text: "Hubs, fleet readiness, pickup OTP and rider support." },
  { title: "Business", text: "Partners, B2B fleets and city expansion." },
  { title: "Customer success", text: "Riders, KYC and every ticket that keeps trust high." },
  { title: "Fleet", text: "Vehicles, batteries and availability across hubs." },
  { title: "Marketing", text: "Brand, campaigns and #safeRideWithEvuddy." },
  { title: "People", text: "Hiring, culture and a team that can scale with cities." },
  { title: "Finance", text: "GST-correct pricing, payouts and operational control." },
];

const steps = [
  { title: "01  Apply", text: "Share your role, email and a short note. We log it for hiring." },
  { title: "02  Review", text: "We match skills to open work in product, ops or growth." },
  { title: "03  Conversation", text: "A focused call on how you would help riders and hubs." },
  { title: "04  Offer", text: "Clear role, city and the EVUDDY mission you would own." },
];

export default function Careers() {
  return (
    <div className="bg-[#F4F7F8] text-[#08112F]">
      <BrandHero
        title="Join"
        accent="EVUDDY"
        subtitle="Help build India's next-generation EV mobility ecosystem — B2B, B2C and Rent-to-Own — with a team that ships."
        primaryHref="#careers-apply"
        primaryLabel="Apply now"
        secondaryHref="/about"
        secondaryLabel="About EVUDDY"
        posterSrc="/careers/careers-poster.png?v=20260820"
        posterAlt="EVUDDY careers — join the team building smart electric mobility"
      />

      <BrandStatement
        label="Careers"
        paragraphs={[
          "Join EVUDDY and help build India's next-generation EV mobility ecosystem.",
          "Work on B2B, B2C and Rent-to-Own solutions that make electric mobility affordable, accessible and asset-building.",
          "We look for people who care about riders, cities and a future where every ride can lead to ownership.",
        ]}
      />

      <BrandFilm
        src="/kebu-final.mp4"
        eyebrow="Life at EVUDDY"
        title="The work is on the street, in hubs, and in the product."
      />

      <BrandSplit
        eyebrow="The work"
        title="You will see riders use what you ship."
        text="Booking, KYC, pickup OTP, payments and fleet status are live. Join if you want product, operations and cities in the same week — not a distant roadmap."
        image="/biker-rent.jpeg"
        alt="Rider on an EVUDDY electric scooter"
      />

      <BrandSplit
        eyebrow="Delivery & gig"
        title="Build mobility that earns."
        text="Delivery partners and gig workers need machines that start, last and can become an asset. Rent to Own is part of the job, not a side project."
        image="/delivery.jpeg"
        alt="Delivery mobility with EVUDDY"
        reverse
      />

      <BrandMosaic
        title="Same brand. Many kinds of work."
        text="Engineering, hubs, support, growth and finance share one mission: smart, electric, dependable rides."
        photos={[
          { src: "/poster.png", alt: "EVUDDY scooters in the city" },
          { src: "/bike-rent.jpeg", alt: "Electric scooter rental" },
          { src: "/evuddy.jpeg", alt: "EVUDDY brand" },
        ]}
      />

      <BrandCardGrid title="Why people join">
        {why.map((item) => (
          <BrandCard key={item.title} title={item.title} text={item.text} />
        ))}
      </BrandCardGrid>

      <BrandSplit
        eyebrow="Product in motion"
        title="From garage energy to a city fleet."
        text="If you like moving between design, code, hubs and rider conversations, this is the pace. We hire for ownership, not job titles that sit still."
        image="/hero-finalback.mp4"
        alt="EVUDDY in motion"
        video
      />

      <BrandCardGrid title="Teams we hire for">
        {teams.map((item) => (
          <BrandCard key={item.title} title={item.title} text={item.text} />
        ))}
      </BrandCardGrid>

      <BrandCardGrid title="How hiring works">
        {steps.map((item) => (
          <BrandCard key={item.title} title={item.title} text={item.text} />
        ))}
      </BrandCardGrid>

      <CareersApply />

      <BrandCta title="Ready to build with us?" href="mailto:careers@evuddy.com" label="Email careers" />
    </div>
  );
}
