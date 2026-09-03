const PARTNERS = [
  { name: "Flipkart Minutes", src: "/partners/flipkart-minutes.svg" },
  { name: "Swiggy", src: "/partners/swiggy.png" },
  { name: "Zomato", src: "/partners/zomato.png" },
  { name: "Blinkit", src: "/partners/blinkit.svg" },
  { name: "Zepto", src: "/partners/zepto.svg" },
  { name: "Instamart", src: "/partners/instamart.svg" },
];

export default function HomePartners() {
  return (
    <section aria-label="Delivery partners" className="border-y border-[#E4DDD2] bg-[#FBF9F5] py-16 sm:py-20">
      <p className="text-center text-[11px] font-medium uppercase tracking-[0.28em] text-[#5F6B63]">
        Delivery partners
      </p>
      <div className="mx-auto mt-10 grid max-w-[1440px] grid-cols-2 gap-3 px-5 sm:grid-cols-3 sm:px-8 lg:grid-cols-6 lg:px-12">
        {PARTNERS.map((item) => (
          <span
            key={item.name}
            className="flex min-h-[118px] flex-col items-center justify-center gap-3 bg-white px-4 py-5"
          >
            <img
              src={item.src}
              alt={item.name}
              className="h-12 w-auto max-w-[150px] object-contain object-center"
            />
            <span className="text-center text-[11px] font-medium uppercase tracking-[0.14em] text-[#5F6B63]">
              {item.name}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
