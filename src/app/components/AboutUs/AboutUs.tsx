export default function AboutUs() {
  return (
    <section className="bg-white">

      {/* Hero Section */}

      <div className="bg-gradient-to-r from-[#0A1134] via-[#14245C] to-[#FF165E] py-28">

        <div className="max-w-7xl mx-auto px-6 text-center">

          <span className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-white text-sm font-semibold">
            SHUBHRAX MOBILITY LIMITED
          </span>

          <h1 className="text-6xl md:text-7xl font-black text-white mt-8 leading-tight">
            Building The Future Of
            <br />
            Urban Mobility & Everyday Services
          </h1>

          <p className="text-white/80 text-xl max-w-4xl mx-auto mt-8 leading-8">
            Kebu One is creating India's next-generation multi-service
            ecosystem integrating mobility, deliveries, househelp
            services and EV transportation into one seamless platform.
          </p>

        </div>

      </div>

      {/* Company Story */}

      <div className="max-w-7xl mx-auto px-6 py-24">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>

            <h2 className="text-5xl font-black text-[#0A1134] mb-8">
              About Kebu One
            </h2>

            <p className="text-gray-600 text-lg leading-9 mb-6">
              Kebu One is the flagship brand of Shubhrax Mobility Limited,
              incorporated in 2025 with a vision to transform how people
              move, deliver, connect and access essential services across India.
            </p>

            <p className="text-gray-600 text-lg leading-9 mb-6">
              We are building a powerful multi-service ecosystem combining
              Mobility, Deliveries, Househelp Services and EV Bike Rentals
              into one integrated technology platform.
            </p>

            <p className="text-gray-600 text-lg leading-9">
              Starting from Lucknow, our mission is to create a scalable,
              technology-driven ecosystem designed specifically for India's
              rapidly growing Tier-2 and Tier-3 cities.
            </p>

          </div>

          <div className="bg-gradient-to-br from-[#FF165E] to-[#EEB440] rounded-[40px] p-12 text-white">

            <h3 className="text-4xl font-black mb-6">
              Why We Exist
            </h3>

            <p className="text-lg leading-8">
              We are solving common urban challenges such as ride
              cancellations, long waiting times, inconsistent service
              quality and poor partner economics through technology,
              operations and innovation.
            </p>

          </div>

        </div>

      </div>

      {/* Stats */}

      <div className="bg-[#F8F9FC] py-20">

        <div className="max-w-7xl mx-auto px-6">

          <div className="grid md:grid-cols-4 gap-8">

            <div className="bg-white rounded-3xl p-8 shadow">
              <h3 className="text-5xl font-black text-[#FF165E]">
                2025
              </h3>
              <p className="mt-3 text-gray-600">
                Founded
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow">
              <h3 className="text-5xl font-black text-[#FF165E]">
                4
              </h3>
              <p className="mt-3 text-gray-600">
                Service Categories
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow">
              <h3 className="text-5xl font-black text-[#FF165E]">
                1
              </h3>
              <p className="mt-3 text-gray-600">
                Integrated Platform
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow">
              <h3 className="text-5xl font-black text-[#FF165E]">
                100%
              </h3>
              <p className="mt-3 text-gray-600">
                Future Focused
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Why Kebu One */}

      <div className="max-w-7xl mx-auto px-6 py-24">

        <h2 className="text-5xl font-black text-center text-[#0A1134] mb-16">
          Why Kebu One
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          <div className="bg-white shadow rounded-3xl p-8">
            <h3 className="font-bold text-2xl mb-4">
              Driver First Approach
            </h3>
            <p className="text-gray-600">
              Helping partners earn more and grow sustainably.
            </p>
          </div>

          <div className="bg-white shadow rounded-3xl p-8">
            <h3 className="font-bold text-2xl mb-4">
              Reliable Operations
            </h3>
            <p className="text-gray-600">
              Faster service delivery through active operational management.
            </p>
          </div>

          <div className="bg-white shadow rounded-3xl p-8">
            <h3 className="font-bold text-2xl mb-4">
              Technology + Execution
            </h3>
            <p className="text-gray-600">
              Combining technology and on-ground excellence.
            </p>
          </div>

          <div className="bg-white shadow rounded-3xl p-8">
            <h3 className="font-bold text-2xl mb-4">
              Multi-Service Ecosystem
            </h3>
            <p className="text-gray-600">
              Mobility, deliveries, home services and EV rentals.
            </p>
          </div>

          <div className="bg-white shadow rounded-3xl p-8">
            <h3 className="font-bold text-2xl mb-4">
              Future Ready
            </h3>
            <p className="text-gray-600">
              Focused on EV adoption and smart mobility infrastructure.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}