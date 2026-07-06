export default function VisionMission() {
  return (
    <section className="bg-[#F8F9FC]">

      {/* Hero */}

      <div className="bg-gradient-to-r from-[#0A1134] via-[#14245C] to-[#FF165E] py-24">

        <div className="max-w-7xl mx-auto px-6 text-center">

          <span className="bg-white/10 px-5 py-2 rounded-full text-white font-semibold">
            OUR PURPOSE
          </span>

          <h1 className="text-6xl md:text-7xl font-black text-white mt-8">
            Vision & Mission
          </h1>

          <p className="text-white/80 text-xl max-w-4xl mx-auto mt-8">
            Building a technology-powered ecosystem that transforms mobility,
            deliveries, home services and EV transportation across India.
          </p>

        </div>

      </div>

      {/* Vision & Mission Cards */}

      <div className="max-w-7xl mx-auto px-6 py-24">

        <div className="grid lg:grid-cols-2 gap-10">

          <div className="bg-white rounded-[40px] p-12 shadow-xl border border-gray-100">

            <div className="w-16 h-16 rounded-2xl bg-[#FF165E]/10 flex items-center justify-center text-3xl mb-6">
              🚀
            </div>

            <h2 className="text-5xl font-black text-[#0A1134] mb-8">
              Our Vision
            </h2>

            <p className="text-lg text-gray-600 leading-9">
              To become India's most trusted and reliable multi-service
              platform by seamlessly integrating mobility, deliveries,
              home services and EV-based transportation into one powerful
              ecosystem.
            </p>

            <p className="text-lg text-gray-600 leading-9 mt-6">
              We envision a future where every customer can access
              affordable, safe and dependable services while every
              service partner earns with dignity and transparency.
            </p>

          </div>

          <div className="bg-white rounded-[40px] p-12 shadow-xl border border-gray-100">

            <div className="w-16 h-16 rounded-2xl bg-[#EEB440]/10 flex items-center justify-center text-3xl mb-6">
              🎯
            </div>

            <h2 className="text-5xl font-black text-[#0A1134] mb-8">
              Our Mission
            </h2>

            <p className="text-lg text-gray-600 leading-9">
              Our mission is to create a technology-powered ecosystem
              that delivers reliable urban mobility, affordable deliveries,
              verified home services and sustainable EV transportation.
            </p>

            <p className="text-lg text-gray-600 leading-9 mt-6">
              We are committed to building customer trust through
              transparency, operational excellence, innovation and
              better earning opportunities for our partners.
            </p>

          </div>

        </div>

      </div>

      {/* Mission Pillars */}

      <div className="max-w-7xl mx-auto px-6 pb-24">

        <h2 className="text-5xl font-black text-center text-[#0A1134] mb-16">
          What Drives Us
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">

          <div className="bg-white rounded-3xl p-8 shadow">
            <h3 className="font-bold text-xl mb-3">
              Mobility
            </h3>
            <p className="text-gray-600">
              Reliable transportation solutions.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow">
            <h3 className="font-bold text-xl mb-3">
              Deliveries
            </h3>
            <p className="text-gray-600">
              Fast and affordable logistics.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow">
            <h3 className="font-bold text-xl mb-3">
              Home Services
            </h3>
            <p className="text-gray-600">
              Verified professionals and support.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow">
            <h3 className="font-bold text-xl mb-3">
              EV Future
            </h3>
            <p className="text-gray-600">
              Sustainable mobility ecosystem.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow">
            <h3 className="font-bold text-xl mb-3">
              Partner Growth
            </h3>
            <p className="text-gray-600">
              Better earnings and opportunities.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}