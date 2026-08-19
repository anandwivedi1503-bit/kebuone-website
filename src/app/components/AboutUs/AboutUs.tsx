import Image from "next/image";
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

export default function AboutUs() {
  return (
    <div className="bg-[#F4F7F8] text-[#08112F]">
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-[0.12]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%2318B368' stroke-width='1.2'%3E%3Ccircle cx='36' cy='40' r='14'/%3E%3Cpath d='M86 30h30M86 42h22M24 104h36M42 86v36M118 88l20 20M118 108l20-20'/%3E%3Crect x='108' y='28' width='30' height='20' rx='4'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#7CFFB2_0%,#18B368_46%,transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-8 top-28 h-64 w-64 rounded-full opacity-35 [background-image:radial-gradient(#ffffff_1.1px,transparent_1.15px)] [background-size:13px_13px]"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:px-10">
          <div>
            <Image
              src="/Evuddy-logo-dark-E.png"
              alt="EVUDDY"
              width={260}
              height={78}
              className="h-12 w-auto object-contain sm:h-14"
            />
            <p className="mt-3 text-[11px] font-bold tracking-[0.32em] text-[#08112F]">
              SMART · ELECTRIC · MOBILITY
            </p>
            <h1 className="mt-8 text-5xl font-black tracking-[-0.06em] sm:text-7xl">
              About <span className="text-[#18B368]">Us</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              EVUDDY is building India&apos;s next-generation EV mobility
              ecosystem through B2B, B2C, and Rent-to-Own solutions.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ride-options"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#18B368] px-8 font-bold text-white shadow-[0_18px_40px_rgba(24,179,104,0.28)]"
              >
                Book an EV <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/Leadership"
                className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-bold text-[#18B368]"
              >
                Meet leadership
              </Link>
            </div>
          </div>

          <figure className="overflow-hidden rounded-[32px] bg-white p-3 shadow-[0_36px_100px_rgba(8,17,47,0.12)] ring-1 ring-[#18B368]/10">
            <Image
              src="/about/about-poster.png"
              alt="EVUDDY About Us — mission and vision"
              width={1024}
              height={1365}
              priority
              className="h-auto w-full rounded-[24px] object-cover"
            />
          </figure>
        </div>
      </section>

      <section className="px-4 pb-6 sm:px-6 lg:px-10">
        <div className="relative mx-auto max-w-6xl">
          <div
            aria-hidden
            className="absolute inset-x-4 top-3 h-[calc(100%-0.75rem)] rounded-[32px] bg-[#F59E0B] sm:inset-x-2"
          />
          <div className="relative rounded-[32px] bg-[#08112F] px-6 py-10 text-center text-white sm:px-12 sm:py-14">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6EE7A8]">
              <Sparkles className="h-3.5 w-3.5" />
              About EVUDDY
            </p>
            <p className="mx-auto mt-6 max-w-4xl text-base leading-8 text-white/92 sm:text-lg">
              EVUDDY is building India&apos;s next-generation EV mobility
              ecosystem through B2B, B2C, and Rent-to-Own solutions.
            </p>
            <p className="mx-auto mt-5 max-w-4xl text-base leading-8 text-white/92 sm:text-lg">
              Our mission is to make electric mobility affordable, accessible,
              and asset-building for every rider.
            </p>
            <p className="mx-auto mt-5 max-w-4xl text-base leading-8 text-white/92 sm:text-lg">
              We envision empowering gig workers and businesses with sustainable
              transportation while creating a future where every ride can lead
              to ownership.
            </p>
            <div className="mt-10 rounded-2xl bg-[#18B368] px-5 py-3">
              <p className="text-sm font-black tracking-wide">#safeRideWithEvuddy</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
        {facts.map((item) => (
          <div
            key={item.label}
            className="rounded-[24px] border border-white bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
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
              How we work
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
              Affordable. Accessible. Asset-building.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              GST is 5% on rental only (CGST 2.5% + SGST 2.5%). Security deposit
              on normal rentals is refundable and not taxed. Rent to Own has no
              deposit.
            </p>
          </div>
          <div className="rounded-[28px] bg-[#08112F] p-7 text-white sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#86EFAC]">
              What we operate
            </p>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-white/80 sm:text-base">
              <li>B2C rentals for daily riders</li>
              <li>B2B fleets, hubs and delivery partners</li>
              <li>Rent to Own so every ride can lead to ownership</li>
              <li>OTP, KYC, Razorpay and live hub pickup</li>
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

      <section className="px-4 pb-16 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-[32px] bg-[#08112F] px-6 py-10 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[#86EFAC]">
              <Leaf className="h-4 w-4" /> #safeRideWithEvuddy
            </p>
            <h2 className="mt-2 text-3xl font-black">Ride cleaner. Own the journey.</h2>
          </div>
          <Link
            href="/ride-options"
            className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 font-bold text-[#08112F]"
          >
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
