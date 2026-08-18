import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Leaf,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const facts = [
  { label: "Hourly", value: "₹60" },
  { label: "Daily", value: "₹230" },
  { label: "Weekly", value: "₹1,610" },
  { label: "Monthly", value: "₹6,900" },
];

const pillars = [
  {
    icon: Zap,
    title: "Flexible EV rentals",
    text: "Hourly to monthly plans with GST only on rental, plus a refundable deposit on normal bookings.",
  },
  {
    icon: ShieldCheck,
    title: "Rent to Own",
    text: "₹280 a day for 18 months. Start with ₹280 + 5% GST. No security deposit. Full installment, then ownership.",
  },
  {
    icon: Building2,
    title: "Partners and fleets",
    text: "Hubs, B2B fleets and delivery partners share one live operations platform.",
  },
  {
    icon: MapPinned,
    title: "Live operations",
    text: "KYC, OTP pickup, GPS tracking and support so every ride is accountable.",
  },
];

const journey = [
  {
    year: "2025",
    title: "Founded",
    text: "EVUDDY by Kebu One started to make electric scooters easy to book and own in Indian cities.",
  },
  {
    year: "Now",
    title: "Live platform",
    text: "Riders register with phone OTP, choose a plan, pay on Razorpay, and pick up from hubs.",
  },
  {
    year: "Next",
    title: "More cities",
    text: "Grow hubs, partners and Rent to Own so more riders can commute clean and build an asset.",
  },
];

export default function AboutUs() {
  return (
    <div className="bg-[#F7FBFA] text-[#0F172A]">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(24,179,104,0.14),transparent_34%),radial-gradient(circle_at_90%_0%,rgba(236,42,140,0.08),transparent_28%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/15 bg-white px-4 py-2 text-[11px] font-bold tracking-[0.16em] text-slate-600 shadow-sm">
            <Sparkles className="h-4 w-4 text-[#18B368]" />
            ABOUT EVUDDY
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Electric mobility that is easy to book, and possible to own.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            EVUDDY is Kebu One&apos;s electric scooter platform for daily riders,
            delivery partners and businesses. We combine rentals, Rent to Own,
            hubs and live tracking in one product.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/ride-options"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#18B368] px-8 font-bold text-white shadow-[0_18px_40px_rgba(24,179,104,0.28)]"
            >
              Book an EV <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/partners"
              className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-bold text-[#18B368]"
            >
              Become a partner
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-4 pb-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
        {facts.map((item) => (
          <div
            key={item.label}
            className="rounded-[24px] border border-slate-100 bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-black text-[#18B368]">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#18B368]">
              Our story
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
              Built for Indian cities
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Commuting should not mean petrol costs, paperwork chaos or a scooter
              you can never own. EVUDDY makes electric rides bookable in minutes
              after KYC, with clear pricing and hub pickup.
            </p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              GST is 5% on rental only (CGST 2.5% + SGST 2.5%). Security deposit
              on normal rentals is refundable and not taxed. Rent to Own has no
              deposit.
            </p>
          </div>
          <div className="rounded-[28px] bg-[#0F172A] p-7 text-white sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#86EFAC]">
              What we operate
            </p>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-white/80 sm:text-base">
              <li>Phone OTP registration and admin KYC approval</li>
              <li>Flexible rental or 18-month Rent to Own</li>
              <li>Razorpay checkout, wallets and live booking status</li>
              <li>Hub pickup with OTP, GPS and support tickets</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
        <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">
          How EVUDDY works for you
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {pillars.map((item) => (
            <article
              key={item.title}
              className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
            >
              <item.icon className="h-10 w-10 text-[#18B368]" />
              <h3 className="mt-4 text-xl font-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            Journey
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {journey.map((item) => (
              <article
                key={item.year}
                className="rounded-[28px] border border-slate-100 bg-[#F7FBFA] p-6"
              >
                <p className="text-sm font-bold text-[#18B368]">{item.year}</p>
                <h3 className="mt-2 text-xl font-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-10">
        <h2 className="text-3xl font-black">Mission and vision</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-2xl font-black">Mission</h3>
            <p className="mt-3 text-slate-600 leading-7">
              Make electric mobility affordable, accessible and asset-building
              for riders, delivery partners and businesses across India.
            </p>
          </article>
          <article className="rounded-[28px] bg-[#18B368] p-6 text-white sm:p-8">
            <h3 className="text-2xl font-black">Vision</h3>
            <p className="mt-3 leading-7 text-white/90">
              Be India&apos;s most trusted electric scooter ecosystem — rent,
              ride, return or own — with technology you can see working.
            </p>
          </article>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-[32px] bg-[#0F172A] px-6 py-10 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[#86EFAC]">
              <Leaf className="h-4 w-4" /> Join the network
            </p>
            <h2 className="mt-2 text-3xl font-black">Ride cleaner. Grow together.</h2>
          </div>
          <Link
            href="/ride-options"
            className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 font-bold text-[#0F172A]"
          >
            Get started
          </Link>
        </div>
      </section>
    </div>
   );
}