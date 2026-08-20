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
    text: "₹280 a day for 18 months. Pay ₹280 + 5% GST to start. No security deposit. Full installment, then the scooter is yours.",
  },
];

const values = [
  { title: "Smart", text: "OTP, KYC, live hubs and tracking so every ride is accountable." },
  { title: "Electric", text: "Quiet scooters for commute, delivery and city work." },
  { title: "Dependable", text: "Clear pricing, Razorpay checkout and support when something needs a human." },
  { title: "Asset-building", text: "Rent to Own turns daily riding into ownership, not only a rental receipt." },
];

export default function VisionMission() {
  return (
    <div className="overflow-x-hidden bg-[#F4F7F8] text-[#08112F]">
      <BrandHero
        title="Our"
        accent="Vision"
        subtitle="We envision empowering gig workers and businesses with sustainable transportation while creating a future where every ride can lead to ownership."
        primaryHref="/ride-options"
        primaryLabel="Book an EV"
        secondaryHref="/about"
        secondaryLabel="About EVUDDY"
        posterSrc="/vision/vision-poster.png?v=20260820"
        posterAlt="EVUDDY vision and mission"
      />

      <BrandStatement
        label="Vision & Mission"
        paragraphs={[
          "EVUDDY is building India's next-generation EV mobility ecosystem through B2B, B2C, and Rent-to-Own solutions.",
          "Our mission is to make electric mobility affordable, accessible, and asset-building for every rider.",
          "We envision empowering gig workers and businesses with sustainable transportation while creating a future where every ride can lead to ownership.",
        ]}
      />

      <BrandFilm
        src="/hero-video.mp4"
        eyebrow="The future we are riding toward"
        title="Every ride can lead to ownership."
      />

      <BrandSplit
        eyebrow="Mission"
        title="Affordable. Accessible. Asset-building."
        text="Riders should not choose between a clean commute and a scooter they can never own. Flexible rentals get you moving. Rent to Own turns the same habit into an asset."
        image="/evuddy-scooter.png"
        alt="EVUDDY electric scooter"
      />

      <BrandSplit
        eyebrow="Cities"
        title="Quiet streets. Live operations."
        text="Hubs, OTP pickup, GPS and support keep electric scooters working in real Indian cities for daily riders."
        image="/poster.png"
        alt="EVUDDY fleet on city roads"
        reverse
      />

      <BrandMosaic
        title="The scooter is the story."
        text="The vision is not a slogan. It is the ride people take tomorrow morning."
        photos={[
          { src: "/poster.png", alt: "EVUDDY scooters on city roads" },
          { src: "/bike-rent.jpeg", alt: "EVUDDY rental scooter" },
          { src: "/biker-rent.jpeg", alt: "Rider on an EVUDDY scooter" },
        ]}
      />

      <BrandCardGrid title="What we are building toward">
        {pillars.map((item) => (
          <BrandCard key={item.title} title={item.title} text={item.text} />
        ))}
      </BrandCardGrid>

      <BrandSplit
        eyebrow="The ride"
        title="One scooter. One standard."
        text="Partners and fleets share the same platform as riders: one booking engine, one hub network, one standard of #safeRideWithEvuddy."
        image="/bike-rent.jpeg"
        alt="EVUDDY electric scooter"
      />

      <BrandCardGrid title="SMART · ELECTRIC · MOBILITY">
        {values.map((item) => (
          <BrandCard key={item.title} title={item.title} text={item.text} />
        ))}
      </BrandCardGrid>

      <BrandCta title="Ride cleaner. Own the journey." href="/ride-options" label="Get started" />
    </div>
  );
}
