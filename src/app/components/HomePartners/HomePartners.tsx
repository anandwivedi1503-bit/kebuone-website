const PARTNERS = [
  { name: "Flipkart Minutes", src: "/partners/flipkart-minutes.svg" },
  { name: "Swiggy", src: "/partners/swiggy.png" },
  { name: "Zomato", src: "/partners/zomato.png" },
  { name: "Blinkit", src: "/partners/blinkit.svg" },
  { name: "Zepto", src: "/partners/zepto.svg" },
  { name: "Instamart", src: "/partners/instamart.svg" },
];

function PartnerCard({ name, src }: { name: string; src: string }) {
  return (
    <span className="flex min-h-[110px] w-[200px] shrink-0 flex-col items-center justify-center gap-3 bg-white px-6 py-5 sm:w-[220px]">
      <img
        src={src}
        alt={name}
        width={160}
        height={44}
        loading="lazy"
        decoding="async"
        className="h-11 w-full max-w-[160px] object-contain object-center"
      />
      <span className="text-center text-[11px] font-medium uppercase tracking-[0.14em] text-[#5F6B63]">
        {name}
      </span>
    </span>
  );
}

export default function HomePartners() {
  const loop = [...PARTNERS, ...PARTNERS];

  return (
    <section aria-label="Delivery partners" className="overflow-hidden border-y border-[#E4DDD2] bg-[#FBF9F5] py-16 sm:py-20">
      <p className="text-center text-[11px] font-medium uppercase tracking-[0.28em] text-[#5F6B63]">
        Delivery partners
      </p>
      <div className="relative mt-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#FBF9F5] to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#FBF9F5] to-transparent sm:w-28" />
        <div className="partner-marquee flex w-max gap-3">
          {loop.map((item, index) => (
            <PartnerCard key={`${item.name}-${index}`} name={item.name} src={item.src} />
          ))}
        </div>
      </div>
    </section>
  );
}
