"use client";

const PARTNERS = [
  { name: "Flipkart Minutes", src: "/partners/flipkart.png" },
  { name: "Swiggy", src: "/partners/swiggy.png" },
  { name: "Zomato", src: "/partners/zomato.png" },
  { name: "Blinkit", src: "/partners/blinkit.svg" },
  { name: "Zepto", src: "/partners/zepto.svg" },
  { name: "Instamart", src: "/partners/instamart.jpg" },
];

export default function HomePartners() {
  const loop = [...PARTNERS, ...PARTNERS];

  return (
    <section aria-label="Delivery partners" className="border-y border-[#E4DDD2] bg-[#FBF9F5] py-16 sm:py-20">
      <style>{`
        @keyframes ev-partner-slide {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .ev-partner-slide { animation: ev-partner-slide 36s linear infinite; }
        .ev-partner-slide:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .ev-partner-slide { animation: none !important; }
        }
      `}</style>
      <p className="text-center text-[11px] font-medium uppercase tracking-[0.28em] text-[#5F6B63]">
        Delivery partners
      </p>
      <div className="relative mt-10 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#FBF9F5] to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#FBF9F5] to-transparent sm:w-28" />
        <div className="ev-partner-slide flex w-max items-center gap-6 px-6 sm:gap-16">
          {loop.map((item, index) => (
            <span
              key={`${item.name}-${index}`}
              className="flex h-28 w-[168px] shrink-0 flex-col items-center justify-center gap-3 sm:w-[200px]"
            >
              <img src={item.src} alt={item.name} className="h-11 w-auto max-w-[132px] object-contain" />
              <span className="px-1 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-[#5F6B63]">
                {item.name}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
