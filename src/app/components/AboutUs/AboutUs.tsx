export default function AboutUs() {
  return (
    <section className="bg-white">

      {/* ================= HERO ================= */}

<section className="relative overflow-hidden">

  {/* Background */}

  <div className="absolute inset-0 bg-gradient-to-br from-[#F6FFF8] via-white to-[#FFF7FB]" />

  <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[#18B368]/10 blur-[130px]" />

  <div className="absolute right-0 top-20 h-[500px] w-[500px] rounded-full bg-[#FF165E]/10 blur-[140px]" />

  <div className="relative max-w-7xl mx-auto px-6 py-32">

    <div className="max-w-4xl">

      {/* Badge */}

      <div className="inline-flex items-center gap-3 rounded-full border border-[#18B368]/20 bg-white px-6 py-3 shadow-lg">

        <div className="h-3 w-3 rounded-full bg-[#18B368] animate-pulse" />

        <span className="text-sm font-bold tracking-[0.18em] uppercase text-[#18B368]">

          ABOUT EVUDDY

        </span>

      </div>

      {/* Heading */}

      <h1 className="mt-10 text-6xl md:text-7xl font-black leading-[1.05] tracking-[-0.05em] text-[#08112F]">

        Building India's

        <br />

        <span className="bg-gradient-to-r from-[#16A34A] via-[#18B368] to-[#FF165E] bg-clip-text text-transparent">

          Electric Mobility

        </span>

        <br />

        Ecosystem

      </h1>

      {/* Description */}

      <p className="mt-10 max-w-3xl text-xl leading-9 text-slate-600">

        EVUDDY is building India's next-generation electric mobility ecosystem through

        smart EV rentals,

        B2B fleet solutions,

        B2C mobility,

        and Rent-to-Own programs that empower riders,

        businesses and delivery partners.

      </p>

      {/* CTA */}

      <div className="mt-12 flex flex-wrap gap-5">

        <a
          href="/register"
          className="rounded-full bg-gradient-to-r from-[#16A34A] to-[#18B368] px-9 py-4 font-bold text-white shadow-[0_18px_45px_rgba(24,179,104,.35)] transition-all duration-300 hover:-translate-y-1"
        >

          Become a Rider

        </a>

        <a
          href="/partners"
          className="rounded-full border border-[#18B368]/20 bg-white px-9 py-4 font-bold text-[#18B368] shadow-lg transition-all duration-300 hover:bg-[#18B368] hover:text-white"
        >

          Become a Partner

        </a>

      </div>

    </div>

  </div>
  </section>
  {/* ================= ABOUT EVUDDY ================= */}

<section className="relative py-28 bg-white overflow-hidden">

  <div className="absolute -right-44 top-10 h-[500px] w-[500px] rounded-full bg-[#18B368]/8 blur-[140px]" />

  <div className="max-w-7xl mx-auto px-6">

    <div className="grid lg:grid-cols-2 gap-20 items-center">

      {/* LEFT */}

      <div>

        <div className="inline-flex items-center gap-3 rounded-full bg-[#F5FFF8] px-5 py-3">

          <div className="h-3 w-3 rounded-full bg-[#18B368]" />

          <span className="text-sm font-bold tracking-[0.15em] uppercase text-[#18B368]">

            OUR STORY

          </span>

        </div>

        <h2 className="mt-8 text-5xl md:text-6xl font-black leading-tight tracking-[-0.04em] text-[#08112F]">

          About

          <span className="text-[#18B368]">

            {" "}EVUDDY

          </span>

        </h2>

        <p className="mt-8 text-lg leading-9 text-slate-600">

          EVUDDY is building India's next-generation electric mobility ecosystem through B2B, B2C and Rent-to-Own solutions designed specifically for the evolving needs of modern cities and growing communities.

        </p>

        <p className="mt-6 text-lg leading-9 text-slate-600">

          Our mission is to make electric mobility affordable, accessible and asset-building for every rider by combining technology, clean transportation and operational excellence into one integrated platform.

        </p>

        <p className="mt-6 text-lg leading-9 text-slate-600">

          We envision empowering gig workers, delivery partners and businesses with sustainable transportation while creating a future where every ride can lead to ownership.

        </p>

      </div>

      {/* RIGHT */}

      <div>

        <div className="rounded-[40px] bg-gradient-to-br from-[#08112F] via-[#0A1B47] to-[#102A67] p-10 shadow-[0_35px_90px_rgba(8,17,47,.25)]">

          <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">

            EVUDDY

          </div>

          <h3 className="mt-7 text-4xl font-black text-white">

            Smart Electric Mobility

          </h3>

          <p className="mt-7 text-lg leading-9 text-white/80">

            We are creating a technology-first mobility platform connecting riders, partners, businesses and electric vehicles through a seamless digital ecosystem.

          </p>

          <div className="mt-10 space-y-5">

            <div className="flex items-center gap-4">

              <div className="h-12 w-12 rounded-2xl bg-[#18B368] flex items-center justify-center text-white font-bold">

                ✓

              </div>

              <span className="text-white text-lg">

                Smart EV Rentals

              </span>

            </div>

            <div className="flex items-center gap-4">

              <div className="h-12 w-12 rounded-2xl bg-[#18B368] flex items-center justify-center text-white font-bold">

                ✓

              </div>

              <span className="text-white text-lg">

                B2B Fleet Solutions

              </span>

            </div>

            <div className="flex items-center gap-4">

              <div className="h-12 w-12 rounded-2xl bg-[#18B368] flex items-center justify-center text-white font-bold">

                ✓

              </div>

              <span className="text-white text-lg">

                Rent-to-Own Program

              </span>

            </div>

            <div className="flex items-center gap-4">

              <div className="h-12 w-12 rounded-2xl bg-[#18B368] flex items-center justify-center text-white font-bold">

                ✓

              </div>

              <span className="text-white text-lg">

                Sustainable Future

              </span>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
  </section>

  {/* ================= MISSION & VISION ================= */}

<section className="relative bg-[#F8FCFA] py-28 overflow-hidden">

  <div className="absolute left-0 top-24 h-[420px] w-[420px] rounded-full bg-[#18B368]/8 blur-[130px]" />

  <div className="absolute right-0 bottom-0 h-[420px] w-[420px] rounded-full bg-[#FF165E]/8 blur-[140px]" />

  <div className="max-w-7xl mx-auto px-6">

    <div className="text-center">

      <span className="inline-flex items-center rounded-full bg-[#F3FFF8] px-5 py-2 text-sm font-bold tracking-[0.15em] uppercase text-[#18B368]">

        OUR PURPOSE

      </span>

      <h2 className="mt-6 text-5xl md:text-6xl font-black tracking-[-0.04em] text-[#08112F]">

        Mission & Vision

      </h2>

      <p className="mt-6 max-w-3xl mx-auto text-lg leading-9 text-slate-600">

        Everything we build is driven by a single purpose —
        accelerating India's transition towards smarter,
        cleaner and more accessible electric mobility.

      </p>

    </div>

    <div className="mt-20 grid lg:grid-cols-2 gap-10">

      {/* Mission */}

      <div className="group rounded-[40px] border border-[#18B368]/10 bg-white p-12 shadow-[0_30px_80px_rgba(15,23,42,.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_100px_rgba(24,179,104,.15)]">

        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#18B368] flex items-center justify-center text-3xl text-white">

          🚀

        </div>

        <h3 className="mt-8 text-4xl font-black text-[#08112F]">

          Our Mission

        </h3>

        <p className="mt-6 text-lg leading-9 text-slate-600">

          To make electric mobility affordable,
          accessible and asset-building by delivering
          technology-driven EV solutions for riders,
          businesses and delivery partners across India.

        </p>

      </div>

      {/* Vision */}

      <div className="group rounded-[40px] bg-gradient-to-br from-[#08112F] via-[#0A1B47] to-[#102A67] p-12 shadow-[0_35px_90px_rgba(8,17,47,.22)] transition-all duration-500 hover:-translate-y-2">

        <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">

          🌍

        </div>

        <h3 className="mt-8 text-4xl font-black text-white">

          Our Vision

        </h3>

        <p className="mt-6 text-lg leading-9 text-white/80">

          To become India's most trusted electric
          mobility ecosystem by connecting riders,
          partners and businesses through smart,
          sustainable and technology-first transportation.

        </p>

      </div>

    </div>

  </div>

</section>

{/* ================= EVUDDY JOURNEY ================= */}

<section className="relative bg-[#F8FCFA] py-32 overflow-hidden">

  <div className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-[#18B368]/8 blur-[140px]" />

  <div className="absolute right-0 bottom-0 h-[420px] w-[420px] rounded-full bg-[#FF165E]/8 blur-[140px]" />

  <div className="max-w-7xl mx-auto px-6">

    <div className="text-center max-w-3xl mx-auto">

      <span className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-bold uppercase tracking-[0.15em] text-[#18B368] shadow">

        OUR JOURNEY

      </span>

      <h2 className="mt-6 text-5xl md:text-6xl font-black tracking-[-0.04em] text-[#08112F]">

        Building The Future

      </h2>

      <p className="mt-6 text-lg leading-9 text-slate-600">

        EVUDDY is continuously expanding its electric mobility ecosystem to empower riders, partners and businesses through sustainable innovation.

      </p>

    </div>

    <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

      {[
        {
          year: "2025",
          title: "Company Founded",
          desc: "EVUDDY was established with a vision to transform India's electric mobility ecosystem.",
        },
        {
          year: "Phase 1",
          title: "Platform Launch",
          desc: "Launch of EV rentals, partner onboarding and smart mobility technology platform.",
        },
        {
          year: "Phase 2",
          title: "Scale Across Cities",
          desc: "Expansion into multiple cities with fleet growth, rider network and business partnerships.",
        },
        {
          year: "Future",
          title: "National EV Ecosystem",
          desc: "Building India's most trusted electric mobility platform powered by technology and sustainability.",
        },
      ].map((item) => (

        <div
          key={item.title}
          className="
          rounded-[36px]
          bg-white
          border
          border-slate-200
          p-8
          shadow-[0_20px_60px_rgba(15,23,42,.08)]
          transition-all
          duration-500
          hover:-translate-y-2
          hover:border-[#18B368]/30
          hover:shadow-[0_30px_80px_rgba(24,179,104,.15)]
          "
        >

          <div className="inline-flex rounded-full bg-[#18B368] px-5 py-2 text-white font-bold">

            {item.year}

          </div>

          <h3 className="mt-8 text-2xl font-black text-[#08112F]">

            {item.title}

          </h3>

          <p className="mt-5 leading-8 text-slate-600">

            {item.desc}

          </p>

        </div>

      ))}

    </div>

  </div>

</section>

{/* ================= FINAL CTA ================= */}

<section className="relative overflow-hidden py-32">

  {/* Background */}

  <div className="absolute inset-0 bg-gradient-to-r from-[#08112F] via-[#102A67] to-[#18B368]" />

  <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-white/5 blur-[150px]" />

  <div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-[#18B368]/20 blur-[150px]" />

  <div className="relative max-w-6xl mx-auto px-6 text-center">

    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#A7F3D0] backdrop-blur">

      JOIN INDIA'S EV REVOLUTION

    </span>

    <h2 className="mt-8 text-5xl md:text-7xl font-black leading-tight text-white">

      Drive Smarter.

      <br />

      Ride Greener.

      <br />

      Grow Together.

    </h2>

    <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-white/80">

      Whether you're looking to rent an EV, become a rider partner,
      grow your business fleet or collaborate with EVUDDY,
      we're building India's future of electric mobility together.

    </p>

    <div className="mt-14 flex flex-wrap justify-center gap-6">

      <a
        href="/register"
        className="
        rounded-full
        bg-white
        px-10
        py-5
        text-lg
        font-black
        text-[#08112F]
        shadow-[0_20px_60px_rgba(255,255,255,.18)]
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-[0_28px_80px_rgba(255,255,255,.25)]
        "
      >
        Become a Rider
      </a>

      <a
        href="/partners"
        className="rounded-full border border-white/20 bg-white/10 px-10 py-5 text-lg font-black text-white backdrop-blur transition-all duration-300 hover:bg-[#18B368] hover:text-white hover:border-[#18B368] hover:-translate-y-1">
        Become a Partner
      </a>

    </div>

  </div>

</section>

</section>
  );
}