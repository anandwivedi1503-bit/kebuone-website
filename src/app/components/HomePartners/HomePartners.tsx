const PARTNERS = [
  { name: "Flipkart", src: "/partners/flipkart.png" },
  { name: "Swiggy", src: "/partners/swiggy.png" },
  { name: "Zomato", src: "/partners/zomato.png" },
  { name: "Blinkit", src: "/partners/blinkit.svg" },
  { name: "Zepto", src: "/partners/zepto.svg" },
  { name: "Instamart", src: "/partners/instamart.jpg" },
];

export default function HomePartners() {
  return (
    <section aria-label="Delivery partners" className="border-y border-[#E4DDD2] bg-[#FBF9F5] py-16 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.28em] text-[#5F6B63]">
          Delivery partners
        </p>
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-10 lg:grid-cols-6 lg:gap-x-8">
          {PARTNERS.map((item) => (
            <span
              key={item.name}
              className="flex min-h-[96px] flex-col items-center justify-center gap-3 px-3"
            >
              <img
                src={item.src}
                alt={item.name}
                className="h-11 w-auto max-w-[128px] object-contain"
              />
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5F6B63]">
                {item.name}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
