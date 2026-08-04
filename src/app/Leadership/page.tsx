export default function LeadershipPage() {
  return (
    <section className="bg-white">

      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden pt-36 pb-32">

        {/* Background */}

        <div className="absolute inset-0 bg-gradient-to-br from-[#08112F] via-[#102A67] to-[#18B368]" />

        <div className="absolute -left-44 top-0 h-[520px] w-[520px] rounded-full bg-[#18B368]/20 blur-[150px]" />

        <div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-[#FF165E]/10 blur-[150px]" />

        <div className="relative max-w-7xl mx-auto px-5
md:px-6 text-center">

          {/* Badge */}

          <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl px-6 py-3">

            <div className="h-3 w-3 rounded-full bg-[#22C55E] animate-pulse" />

            <span className="uppercase tracking-[0.18em] text-sm font-bold text-white">

              LEADERSHIP

            </span>

          </div>

          {/* Heading */}

          <h1 className="mt-10 text-4xl
sm:text-5xl
md:text-6xl
lg:text-7xl font-black leading-[1.05] tracking-[-0.05em] text-white">

            Meet The Leaders

            <br />

            <span className="bg-gradient-to-r from-[#22C55E] via-white to-[#A7F3D0] bg-clip-text text-transparent">

              Driving EVUDDY

            </span>

          </h1>

          {/* Description */}

          <p className="
mx-auto
mt-10
max-w-4xl
text-base
md:text-lg
lg:text-xl
leading-8
md:leading-9
text-white/80
">

            Behind every successful journey is a passionate team.
            Meet the leaders shaping EVUDDY's vision of creating India's
            next-generation electric mobility ecosystem through innovation,
            technology and sustainable transportation.

          </p>

          {/* Buttons */}

          <div className="mt-14 flex flex-wrap justify-center gap-6">

            <a
              href="/careers"
              className="
              rounded-full
              bg-white
              px-7
md:px-10
py-4
md:py-5
              text-lg
              font-black
              text-[#08112F]
              shadow-[0_20px_60px_rgba(255,255,255,.25)]
              transition-all
              duration-300
              hover:-translate-y-2
              hover:shadow-[0_30px_70px_rgba(255,255,255,.35)]
              "
            >

              Join Our Team

            </a>

            <a
              href="/about"
              className="
              rounded-full
              border
              border-white/20
              bg-white/10
              backdrop-blur
              px-7
md:px-10
py-4
md:py-5
              text-lg
              font-black
              text-white
              transition-all
              duration-300
              hover:bg-[#18B368]
              hover:border-[#18B368]
              hover:-translate-y-2
              "
            >

              About EVUDDY

            </a>

          </div>

        </div>

      </section>

      {/* ================= LEADERSHIP TEAM ================= */}

<section className="relative overflow-hidden bg-[#F8FCFA] py-20 md:py-28">

  <div className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-[#18B368]/8 blur-[140px]" />

  <div className="absolute right-0 bottom-0 h-[420px] w-[420px] rounded-full bg-[#FF165E]/8 blur-[140px]" />

  <div className="mx-auto max-w-7xl px-5
md:px-6">

    {/* Heading */}

    <div className="text-center">

      <span className="inline-flex rounded-full bg-white px-5 py-2 text-sm font-bold uppercase tracking-[0.15em] text-[#18B368] shadow">

        LEADERSHIP TEAM

      </span>

      <h2 className="mt-6 text-4xl
sm:text-5xl
md:text-6xl font-black tracking-[-0.04em] text-[#08112F]">

        The People Behind EVUDDY

      </h2>

      <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-slate-600">

        Our leadership team brings together experience, vision and innovation
        to build India's next-generation electric mobility ecosystem.

      </p>

    </div>

    {/* Cards */}

    <div className="mt-20 grid gap-10 lg:grid-cols-3">

      {/* Founder & CEO */}

      <div className="group overflow-hidden rounded-[36px] bg-white shadow-[0_30px_80px_rgba(15,23,42,.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_45px_90px_rgba(24,179,104,.18)]">

        <div className="h-[360px]
md:h-[430px] overflow-hidden bg-slate-100">

          <img
            src="/founder.jpg"
            alt="Founder & CEO"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />

        </div>

        <div className="p-8">

          <span className="rounded-full bg-[#F4FFF8] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#18B368]">

            Founder & CEO

          </span>

          <h3 className="mt-6 text-3xl font-black text-[#08112F]">

            Your Name

          </h3>

          <p className="mt-5 leading-8 text-slate-600">

            Visionary entrepreneur leading EVUDDY with a mission to make
            electric mobility accessible, affordable and technology-driven
            across India.

          </p>

        </div>

      </div>

      {/* Chairman */}

      <div className="group overflow-hidden rounded-[36px] bg-white shadow-[0_30px_80px_rgba(15,23,42,.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_45px_90px_rgba(24,179,104,.18)]">

        <div className="h-[360px]
md:h-[430px] overflow-hidden bg-slate-100">

          <img
            src="/chairman.jpg"
            alt="Chairman"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />

        </div>

        <div className="p-8">

          <span className="rounded-full bg-[#F4FFF8] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#18B368]">

            Chairman

          </span>

          <h3 className="mt-6 text-3xl font-black text-[#08112F]">

            Chairman Name

          </h3>

          <p className="mt-5 leading-8 text-slate-600">

            Providing strategic leadership, governance and long-term vision
            while guiding EVUDDY's sustainable growth journey.

          </p>

        </div>

      </div>

      {/* Executive Director */}

      <div className="group overflow-hidden rounded-[36px] bg-white shadow-[0_30px_80px_rgba(15,23,42,.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_45px_90px_rgba(24,179,104,.18)]">

        <div className="h-[360px]
md:h-[430px] overflow-hidden bg-slate-100">

          <img
            src="/executive-director.jpg"
            alt="Executive Director"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

        </div>

        <div className="p-8">

          <span className="rounded-full bg-[#F4FFF8] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#18B368]">

            Executive Director

          </span>

          <h3 className="mt-6 text-3xl font-black text-[#08112F]">

            Director Name

          </h3>

          <p className="mt-3 leading-8 text-slate-600">

            Driving execution, operational excellence and customer-centric
            innovation to deliver a world-class EV mobility experience.

          </p>

        </div>

      </div>

    </div>

  </div>

</section>

{/* ================= MANAGEMENT TEAM ================= */}

<section className="relative overflow-hidden bg-white py-28">

  <div className="absolute -right-40 top-20 h-[420px] w-[420px] rounded-full bg-[#18B368]/8 blur-[140px]" />

  <div className="mx-auto max-w-7xl px-5
md:px-6">

    <div className="text-center">

      <span className="inline-flex rounded-full bg-[#F4FFF8] px-5 py-2 text-sm font-bold uppercase tracking-[0.15em] text-[#18B368]">

        MANAGEMENT TEAM

      </span>

      <h2 className="mt-6 text-5xl md:text-6xl font-black tracking-[-0.04em] text-[#08112F]">

        Our Leadership Across Functions

      </h2>

      <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-slate-600">

        A strong organization is built by talented people across every department. Meet the professionals driving innovation, operations and growth at EVUDDY.

      </p>

    </div>

    <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

      {/* Operations */}

      <ManagementCard
        image="/operations-head.jpg"
        name="Operations Head"
        role="Operations"
      />

      {/* Technology */}

      <ManagementCard
        image="/technology-head.jpg"
        name="Technology Head"
        role="Technology"
      />

      {/* Finance */}

      <ManagementCard
        image="/finance-head.jpg"
        name="Finance Head"
        role="Finance"
      />

      {/* HR */}

      <ManagementCard
        image="/hr-head.jpg"
        name="HR Head"
        role="Human Resources"
      />

      {/* Marketing */}

      <ManagementCard
        image="/marketing-head.jpg"
        name="Marketing Head"
        role="Marketing"
      />

      {/* Business */}

      <ManagementCard
        image="/business-head.jpg"
        name="Business Development Head"
        role="Business Development"
      />

    </div>

  </div>

</section>

{/* ================= TEAM EVUDDY ================= */}

<section className="relative overflow-hidden bg-[#F8FCFA] py-28">

  <div className="absolute left-0 top-10 h-[450px] w-[450px] rounded-full bg-[#18B368]/8 blur-[140px]" />

  <div className="max-w-7xl mx-auto px-5
md:px-6">

    <div className="text-center">

      <span className="inline-flex rounded-full bg-white px-5 py-2 text-sm font-bold uppercase tracking-[0.15em] text-[#18B368] shadow">

        TEAM EVUDDY

      </span>

      <h2 className="mt-6 text-4xl
sm:text-5xl
md:text-6xl font-black tracking-[-0.04em] text-[#08112F]">

        Built By Passionate People

      </h2>

      <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-slate-600">

        Behind every successful ride is an incredible team working across
        technology, operations, customer experience, finance, marketing
        and business development.

      </p>

    </div>

    {/* Team Image */}

    <div
className="
mt-20
overflow-hidden
rounded-[40px]
shadow-[0_35px_90px_rgba(15,23,42,.12)]
"
>

      <img
        src="/team.jpg"
        alt="Team EVUDDY"
    
 className="
w-full
h-full
object-cover
transition
duration-700
group-hover:scale-105
"
/>
    

    </div>

    {/* Highlights */}

    <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

      <div className="rounded-[30px] bg-white p-6 md:p-8 shadow">

        <h3 className="
text-3xl
md:text-4xl
font-black
leading-tight
text-[#18B368]
">

          100%

        </h3>

        <p className="mt-4 text-lg text-slate-600">

          Customer Focused

        </p>

      </div>

      <div className="rounded-[30px] bg-white p-6 md:p-8 shadow">

        <h3 className="
text-3xl
md:text-4xl
font-black
leading-tight
text-[#18B368]
">

          Innovation

        </h3>

        <p className="mt-4 text-lg text-slate-600">

          Technology Driven

        </p>

      </div>

      <div className="rounded-[30px] bg-white p-6 md:p-8 shadow">

        <h3 className="
text-3xl
md:text-4xl
font-black
leading-tight
text-[#18B368]
">

          One Team

        </h3>

        <p className="mt-4 text-lg text-slate-600">

          Shared Vision

        </p>

      </div>

      <div className="rounded-[30px] bg-white p-6 md:p-8 shadow">

        <h3 className="
text-3xl
md:text-4xl
font-black
leading-tight
text-[#18B368]
">

          Future

        </h3>

        <p className="mt-4 text-lg text-slate-600">

          Electric Mobility

        </p>

      </div>

    </div>

  </div>

</section>

{/* ================= CORPORATE VALUES ================= */}

<section className="relative overflow-hidden bg-white py-20 md:py-28">

  <div className="absolute -right-40 top-20 h-[450px] w-[450px] rounded-full bg-[#18B368]/8 blur-[150px]" />

  <div className="mx-auto max-w-7xl px-5
md:px-6">

    <div className="text-center">

      <span className="inline-flex rounded-full bg-[#F4FFF8] px-5 py-2 text-sm font-bold uppercase tracking-[0.15em] text-[#18B368]">

        OUR VALUES

      </span>

      <h2 className="mt-6 text-4xl
sm:text-5xl
md:text-6xl font-black tracking-[-0.04em] text-[#08112F]">

        The Principles That Guide EVUDDY

      </h2>

      <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-slate-600">

        Every decision we make is guided by our commitment to innovation,
        integrity, sustainability and delivering exceptional value to our
        riders, partners and communities.

      </p>

    </div>

    <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

      {/* Integrity */}

      <div className="group rounded-[34px] border border-slate-200 bg-white p-6 md:p-10 shadow-[0_25px_70px_rgba(15,23,42,.08)] transition-all duration-500 hover:-translate-y-2 hover:border-[#18B368]/30 hover:shadow-[0_40px_90px_rgba(24,179,104,.15)]">

        <div className="text-4xl">🤝</div>

        <h3 className="mt-8 text-3xl font-black text-[#08112F]">
          Integrity
        </h3>

        <p className="mt-5 leading-8 text-slate-600">
          We operate with honesty, transparency and accountability in every interaction.
        </p>

      </div>

      {/* Innovation */}

      <div className="group rounded-[34px] border border-slate-200 bg-white p-6 md:p-10 shadow-[0_25px_70px_rgba(15,23,42,.08)] transition-all duration-500 hover:-translate-y-2 hover:border-[#18B368]/30 hover:shadow-[0_40px_90px_rgba(24,179,104,.15)]">

        <div className="text-4xl">💡</div>

        <h3 className="mt-8 text-3xl font-black text-[#08112F]">
          Innovation
        </h3>

        <p className="mt-5 leading-8 text-slate-600">
          We embrace technology and continuous improvement to solve real-world mobility challenges.
        </p>

      </div>

      {/* Customer First */}

      <div className="group rounded-[34px] border border-slate-200 bg-white p-6 md:p-10 shadow-[0_25px_70px_rgba(15,23,42,.08)] transition-all duration-500 hover:-translate-y-2 hover:border-[#18B368]/30 hover:shadow-[0_40px_90px_rgba(24,179,104,.15)]">

        <div className="text-4xl">❤️</div>

        <h3 className="mt-8 text-3xl font-black text-[#08112F]">
          Customer First
        </h3>

        <p className="mt-5 leading-8 text-slate-600">
          Every feature, every ride and every service begins with the customer experience.
        </p>

      </div>

      {/* Sustainability */}

      <div className="group rounded-[34px] border border-slate-200 bg-white p-6 md:p-10 shadow-[0_25px_70px_rgba(15,23,42,.08)] transition-all duration-500 hover:-translate-y-2 hover:border-[#18B368]/30 hover:shadow-[0_40px_90px_rgba(24,179,104,.15)]">

        <div className="text-4xl">🌱</div>

        <h3 className="mt-8 text-3xl font-black text-[#08112F]">
          Sustainability
        </h3>

        <p className="mt-5 leading-8 text-slate-600">
          We believe electric mobility is the foundation of a cleaner and greener future.
        </p>

      </div>

      {/* Excellence */}

      <div className="group rounded-[34px] border border-slate-200 bg-white p-6 md:p-10 shadow-[0_25px_70px_rgba(15,23,42,.08)] transition-all duration-500 hover:-translate-y-2 hover:border-[#18B368]/30 hover:shadow-[0_40px_90px_rgba(24,179,104,.15)]">

        <div className="text-4xl">🏆</div>

        <h3 className="mt-8 text-3xl font-black text-[#08112F]">
          Excellence
        </h3>

        <p className="mt-5 leading-8 text-slate-600">
          We strive to exceed expectations through quality, reliability and operational excellence.
        </p>

      </div>

      {/* Collaboration */}

      <div className="group rounded-[34px] border border-slate-200 bg-white p-6 md:p-10 shadow-[0_25px_70px_rgba(15,23,42,.08)] transition-all duration-500 hover:-translate-y-2 hover:border-[#18B368]/30 hover:shadow-[0_40px_90px_rgba(24,179,104,.15)]">

        <div className="text-4xl">🚀</div>

        <h3 className="mt-8 text-3xl font-black text-[#08112F]">
          Collaboration
        </h3>

        <p className="mt-5 leading-7
md:leading-8 text-slate-600">
          We succeed together by empowering our teams, partners and communities to grow with us.
        </p>

      </div>

    </div>

  </div>

</section>

    </section>
  );
}

function ManagementCard({
  image,
  name,
  role,
}: {
  image: string;
  name: string;
  role: string;
}) {
  return (
    <div
      className="
      group
      overflow-hidden
      rounded-[32px]
      border
      border-slate-200
      bg-white
      shadow-[0_25px_70px_rgba(15,23,42,.08)]
      transition-all
      duration-500
      hover:-translate-y-2
      hover:shadow-[0_35px_80px_rgba(24,179,104,.15)]
      "
    >
      <div className="h-[300px] overflow-hidden bg-slate-100">

        <img
          src={image}
          alt={name}
        
        className="
        w-full
       h-[280px]
        md:h-[500px]
        object-cover
        transition
       duration-700
       hover:scale-105
           "
        />

      </div>

      <div className="p-6 text-center">

        <span className="rounded-full bg-[#F4FFF8] px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-[#18B368]">

          {role}

        </span>

        <h3 className="mt-5 text-2xl font-black text-[#08112F]">

          {name}

        </h3>

      </div>

    </div>
  );
}