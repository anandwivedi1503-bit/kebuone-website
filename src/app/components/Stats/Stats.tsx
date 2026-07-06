export default function Stats() {
  const stats = [
    {
      number: "25K+",
      title: "Customers Served",
      icon: "👥",
    },
    {
      number: "1500+",
      title: "Service Partners",
      icon: "🤝",
    },
    {
      number: "100+",
      title: "EV Vehicles",
      icon: "⚡",
    },
    {
      number: "24/7",
      title: "Customer Support",
      icon: "🎧",
    },
  ];

  return (
    <section className="relative py-20 md:py-24 lg:py-32 bg-gradient-to-br from-[#081126] via-[#0A1134] to-[#151F45] overflow-hidden text-white">
      {/* Background Glow */}

<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E]"></div>
<div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#EEB440]/10 blur-[180px] rounded-full"></div>
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-pink-500/20 backdrop-blur-md">

  <span className="text-pink-400 uppercase tracking-[4px] font-bold">
    OUR IMPACT
  </span>

  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>

  <span className="text-white/80">
    Growing Every Day
  </span>

</div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mt-4 mb-6 leading-[1.05] max-w-5xl mx-auto">
  Numbers That Reflect
  <br />
  Our Growth Journey
</h2>

          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Building India's next multi-service ecosystem with
            mobility, delivery and trusted home services.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-10">

  <div className="px-5 py-3 rounded-full bg-white/10 border border-white/10">
    ✓ Verified Partners
  </div>

  <div className="px-5 py-3 rounded-full bg-white/10 border border-white/10">
    ✓ Operations First
  </div>

  <div className="px-5 py-3 rounded-full bg-white/10 border border-white/10">
    ✓ Trusted Ecosystem
  </div>

  <div className="px-5 py-3 rounded-full bg-white/10 border border-white/10">
    ✓ Built For Scale
  </div>

</div>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8 mt-10">
          {stats.map((item, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-[24px] lg:rounded-[32px] bg-white/10 backdrop-blur-2xl border border-white/10 p-5 lg:p-7 text-center hover:-translate-y-3 hover:border-pink-500 hover:shadow-[0_30px_80px_rgba(255,22,94,0.20)] transition-all duration-500">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-br from-pink-500/10 via-transparent to-orange-500/10"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E]"></div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-5 rounded-2xl lg:rounded-3xl bg-white/10 flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl group-hover:scale-110 transition-all duration-500">
  {item.icon}
</div>

 <div className="text-xs uppercase tracking-[3px] text-pink-400 mb-3 font-semibold">
  KEBU ONE
</div>

              <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3 bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E] bg-clip-text text-transparent">
                {item.number}
              </h3>

              <div>
  <p className="text-white text-base sm:text-lg lg:text-xl font-semibold">
    {item.title}
  </p>

  <div className="mt-4 w-12 h-[2px] bg-gradient-to-r from-[#EEB440] to-[#FF165E] mx-auto"></div>
</div>
            </div>
          ))}

        </div>
        <div className="text-center mt-20">

  <p className="text-gray-300 text-lg mb-6">
    Powering the future of mobility, delivery and home services
through one unified technology platform.
  </p>

  <a
  href="/register"
  className="inline-block bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E] px-10 py-4 rounded-2xl font-semibold shadow-xl hover:scale-105 transition-all duration-300"
>
  Get Started with Kebu One →
</a>

</div>

      </div>
    </section>
  );
}