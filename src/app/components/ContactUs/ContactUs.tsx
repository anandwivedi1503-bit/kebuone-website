"use client";

import { useState, type FormEvent } from "react";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactUs() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const updateField = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
    setStatus("");
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: `CT-${Date.now()}`,
          userId: form.email || form.phone || form.fullName,
          category: "OTHER",
          description: `${form.subject}: ${form.message}`.slice(0, 500),
          status: "OPEN",
          assignedTo: "Admin",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.errors?.join(" ") || data.message || "Message failed.");
        return;
      }

      setForm(initialForm);
      setStatus("Message sent successfully. Our team will contact you shortly.");
    } catch {
      setError("Message failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#F8F9FC]">
      {/* ================= HERO ================= */}

<section className="relative overflow-hidden">

  {/* Background */}

  <div className="absolute inset-0 bg-gradient-to-br from-[#F6FFF8] via-white to-[#FFF7FB]" />

  <div className="absolute -left-44 top-0 h-[34rem] w-[34rem] rounded-full bg-[#18B368]/10 blur-[140px]" />

  <div className="absolute right-0 top-0 h-[34rem] w-[34rem] rounded-full bg-[#FF165E]/10 blur-[150px]" />

  <div className="relative max-w-7xl mx-auto px-6 py-32">

    <div className="max-w-4xl">

      {/* Badge */}

      <div className="inline-flex items-center gap-3 rounded-full border border-[#18B368]/20 bg-white px-6 py-3 shadow-lg">

        <div className="h-3 w-3 rounded-full bg-[#18B368] animate-pulse" />

        <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#18B368]">

          CONTACT EVUDDY

        </span>

      </div>

      {/* Heading */}

      <h1 className="mt-10 text-6xl md:text-7xl font-black leading-[1.05] tracking-[-0.05em] text-[#08112F]">

        Let's Build

        <br />

        <span className="bg-gradient-to-r from-[#16A34A] via-[#18B368] to-[#FF165E] bg-clip-text text-transparent">

          The Future

        </span>

        <br />

        Together

      </h1>

      {/* Description */}

      <p className="mt-10 max-w-3xl text-xl leading-9 text-slate-600">

        Whether you're looking to become a rider, partner with EVUDDY,

        explore business opportunities, media collaborations or simply

        have a question, our team is here to help you.

      </p>

      {/* CTA */}

      <div className="mt-12 flex flex-wrap gap-5">

        <a
          href="/ride-options"
          className="
          rounded-full
          bg-gradient-to-r
          from-[#16A34A]
          to-[#18B368]
          px-9
          py-4
          font-bold
          text-white
          shadow-[0_18px_45px_rgba(24,179,104,.35)]
          transition-all
          duration-300
          hover:-translate-y-1
          "
        >

          Become a Rider

        </a>

        <a
          href="/partners"
          className="
          rounded-full
          border
          border-[#18B368]/20
          bg-white
          px-9
          py-4
          font-bold
          text-[#18B368]
          shadow-lg
          transition-all
          duration-300
          hover:bg-[#18B368]
          hover:text-white
          "
        >

          Become a Partner

        </a>

      </div>

      {/* Quick Stats */}

      <div className="mt-16 flex flex-wrap gap-5">

        <div className="rounded-full bg-white px-6 py-3 shadow font-semibold text-[#18B368]">

          ⚡ Fast Response

        </div>

        <div className="rounded-full bg-white px-6 py-3 shadow font-semibold text-[#18B368]">

          🤝 Dedicated Support

        </div>

        <div className="rounded-full bg-white px-6 py-3 shadow font-semibold text-[#18B368]">

          🚀 Business Partnerships

        </div>

      </div>

    </div>

  </div>

</section>

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        {/* ================= CONTACT DIRECTORY ================= */}

<div className="mb-20">

  <div className="text-center">

    <span className="inline-flex items-center rounded-full bg-[#F4FFF8] px-5 py-2 text-sm font-bold uppercase tracking-[0.16em] text-[#18B368]">

      CORPORATE DIRECTORY

    </span>

    <h2 className="mt-6 text-5xl font-black tracking-[-0.04em] text-[#08112F]">

      Get In Touch

    </h2>

    <p className="mt-5 max-w-3xl mx-auto text-lg leading-9 text-slate-600">

      Reach the right EVUDDY team for faster assistance.

    </p>

  </div>

  <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

    {/* Card 1 */}

    <div className="group rounded-[34px] bg-white p-8 border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,.08)] transition-all duration-500 hover:-translate-y-2 hover:border-[#18B368]/30">

      <div className="text-4xl">📞</div>

      <h3 className="mt-6 text-2xl font-black text-[#08112F]">

        Customer Support

      </h3>

      <p className="mt-4 leading-8 text-slate-600">

        Assistance for bookings, rentals, payments and rider support.

      </p>

      <p className="mt-6 font-bold text-[#18B368]">

        support@evuddy.com

      </p>

    </div>

    {/* Card 2 */}

    <div className="group rounded-[34px] bg-white p-8 border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,.08)] transition-all duration-500 hover:-translate-y-2 hover:border-[#18B368]/30">

      <div className="text-4xl">🤝</div>

      <h3 className="mt-6 text-2xl font-black text-[#08112F]">

        Business Partnerships

      </h3>

      <p className="mt-4 leading-8 text-slate-600">

        Fleet operators, franchise partners and strategic collaborations.

      </p>

      <p className="mt-6 font-bold text-[#18B368]">

        partners@evuddy.com

      </p>

    </div>

    {/* Card 3 */}

    <div className="group rounded-[34px] bg-white p-8 border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,.08)] transition-all duration-500 hover:-translate-y-2 hover:border-[#18B368]/30">

      <div className="text-4xl">💼</div>

      <h3 className="mt-6 text-2xl font-black text-[#08112F]">

        Careers

      </h3>

      <p className="mt-4 leading-8 text-slate-600">

        Join our growing team and help shape the future of electric mobility.

      </p>

      <p className="mt-6 font-bold text-[#18B368]">

        careers@evuddy.com

      </p>

    </div>

    {/* Card 5 */}

    <div className="group rounded-[34px] bg-white p-8 border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,.08)] transition-all duration-500 hover:-translate-y-2 hover:border-[#18B368]/30">

      <div className="text-4xl">🏢</div>

      <h3 className="mt-6 text-2xl font-black text-[#08112F]">

        Corporate Office

      </h3>

      <p className="mt-4 leading-8 text-slate-600">

        Summit Building, 7th Floor,
        Gomti Nagar,
        Lucknow, Uttar Pradesh.

      </p>

    </div>

    {/* Card 6 */}

    <div className="group rounded-[34px] bg-gradient-to-br from-[#08112F] to-[#102A67] p-8 shadow-[0_25px_80px_rgba(8,17,47,.20)] transition-all duration-500 hover:-translate-y-2">

      <div className="text-4xl">

        🚀

      </div>

      <h3 className="mt-6 text-2xl font-black text-white">

        Business Growth

      </h3>

      <p className="mt-4 leading-8 text-white/80">

        Looking for large fleet solutions or enterprise partnerships?

      </p>

      <div className="mt-8 inline-flex rounded-full bg-[#18B368] px-5 py-2 text-sm font-bold text-white">

        Let's Talk

      </div>

    </div>

  </div>

</div>

        <div className="mb-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form
  onSubmit={submitForm}
  className="
relative
overflow-hidden
rounded-[40px]
border
border-white
bg-white/95
backdrop-blur-xl
p-8
md:p-12
grid
gap-6
md:grid-cols-2
shadow-[0_35px_100px_rgba(15,23,42,.10)]
"
>

<div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#18B368] via-[#34D399] to-[#FF165E]" /> 
<div className="md:col-span-2 mb-4">

<span className="inline-flex rounded-full bg-[#F3FFF8] px-5 py-2 text-sm font-bold uppercase tracking-[0.15em] text-[#18B368]">

SEND US A MESSAGE

</span>

<h2 className="mt-5 text-4xl font-black text-[#08112F]">

We'd Love To Hear From You

</h2>

<p className="mt-3 text-slate-600 leading-8">

Fill in the form below and our team will respond shortly.

</p>

</div>
            <input name="fullName" value={form.fullName} onChange={updateField} required placeholder="Full Name" className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#08112F]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
hover:border-[#18B368]/40
focus:bg-white
focus:border-[#18B368]
focus:ring-4
focus:ring-[#18B368]/10
" />
            <input name="email" type="email" value={form.email} onChange={updateField} required placeholder="Email Address" className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#08112F]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
hover:border-[#18B368]/40
focus:bg-white
focus:border-[#18B368]
focus:ring-4
focus:ring-[#18B368]/10
" />
            <input name="phone" type="tel" value={form.phone} onChange={updateField} required placeholder="Phone Number" className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#08112F]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
hover:border-[#18B368]/40
focus:bg-white
focus:border-[#18B368]
focus:ring-4
focus:ring-[#18B368]/10
" />
            <input name="subject" value={form.subject} onChange={updateField} required placeholder="Subject" className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#08112F]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
hover:border-[#18B368]/40
focus:bg-white
focus:border-[#18B368]
focus:ring-4
focus:ring-[#18B368]/10
" />
            <textarea name="message" rows={6} value={form.message} onChange={updateField} required placeholder="Your Message" className="
min-h-[180px]
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
p-5
text-[15px]
font-medium
text-[#08112F]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
hover:border-[#18B368]/40
focus:bg-white
focus:border-[#18B368]
focus:ring-4
focus:ring-[#18B368]/10
md:col-span-2
resize-none
" />

            {error && <div className="rounded-xl bg-red-50 p-4 font-semibold text-red-700 md:col-span-2">{error}</div>}
            {status && <div className="rounded-xl bg-green-50 p-4 font-semibold text-green-700 md:col-span-2">{status}</div>}

            <button disabled={loading} type="submit" className="
md:col-span-2
h-16
rounded-2xl
bg-gradient-to-r
from-[#16A34A]
via-[#22C55E]
to-[#18B368]
font-bold
tracking-wide
text-white
shadow-[0_20px_50px_rgba(24,179,104,.35)]
transition-all
duration-300
hover:-translate-y-1
hover:shadow-[0_30px_70px_rgba(24,179,104,.45)]
active:scale-[0.98]
disabled:opacity-60
">
              {loading ? "Sending Message..." : "Submit Enquiry"}
            </button>
          </form>

          <div className="space-y-6">

  {/* Corporate Office */}

  <div className="rounded-[34px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,.08)]">

    <div className="text-4xl">🏢</div>

    <h3 className="mt-5 text-3xl font-black text-[#08112F]">

      Corporate Office

    </h3>

    <p className="mt-5 leading-8 text-slate-600">

      Summit Building, 7th Floor

      <br />

      Vibhuti Khand

      <br />

      Gomti Nagar

      <br />

      Lucknow

      <br />

      Uttar Pradesh - 226010

    </p>

  </div>

  {/* General Contact */}

  <div className="rounded-[34px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,.08)]">

    <div className="text-4xl">📧</div>

    <h3 className="mt-5 text-3xl font-black text-[#08112F]">

      General Enquiries

    </h3>

    <p className="mt-5 text-slate-600">

      Have a question?

      Need assistance?

      Our team is happy to help.

    </p>

    <a

      href="mailto:info@evuddy.com"

      className="mt-6 inline-block text-lg font-bold text-[#18B368] hover:underline"

    >

      info@evuddy.com

    </a>

  </div>

  {/* Executive Director */}

  <div className="overflow-hidden rounded-[36px] bg-gradient-to-br from-[#08112F] via-[#102A67] to-[#18B368] p-8 text-white shadow-[0_30px_80px_rgba(8,17,47,.25)]">

    <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">

      EXECUTIVE DIRECTOR

    </span>

    <h3 className="mt-6 text-4xl font-black">

      Anwar Khan

    </h3>

    <p className="mt-4 text-white/80 leading-8">

      For strategic partnerships, corporate collaborations,

      franchise opportunities and business expansion,

      feel free to connect with the Executive Director's office.

    </p>

    <a

      href="mailto:director@evuddy.com"

      className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-bold text-[#08112F] transition-all hover:scale-105"

    >

      Contact Executive Office

    </a>

  </div>

</div>

          
        </div>
      {/* ================= WHY CONTACT EVUDDY ================= */}

<section className="relative overflow-hidden bg-[#F8FCFA] py-28">

  {/* Background Glow */}

  <div className="absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-[#18B368]/8 blur-[140px]" />

  <div className="absolute right-0 bottom-0 h-[420px] w-[420px] rounded-full bg-[#FF165E]/8 blur-[140px]" />

  <div className="relative mx-auto max-w-7xl px-6">

    <div className="text-center">

      <span className="inline-flex rounded-full bg-[#F3FFF8] px-5 py-2 text-sm font-bold uppercase tracking-[0.15em] text-[#18B368]">

        WHY EVUDDY

      </span>

      <h2 className="mt-6 text-5xl md:text-6xl font-black tracking-[-0.04em] text-[#08112F]">

        We're Always Here To Help

      </h2>

      <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-slate-600">

        Every enquiry matters to us. Whether you're a rider,
        partner or business, our dedicated team ensures a
        quick, transparent and professional response.

      </p>

    </div>

    <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

      {/* Card */}

      <div className="rounded-[34px] bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2">

        <div className="text-5xl">⚡</div>

        <h3 className="mt-6 text-2xl font-black text-[#08112F]">

          Fast Response

        </h3>

        <p className="mt-4 leading-8 text-slate-600">

          Our team works to respond as quickly as possible.

        </p>

      </div>

      {/* Card */}

      <div className="rounded-[34px] bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2">

        <div className="text-5xl">🤝</div>

        <h3 className="mt-6 text-2xl font-black text-[#08112F]">

          Dedicated Team

        </h3>

        <p className="mt-4 leading-8 text-slate-600">

          Every request reaches the appropriate department.

        </p>

      </div>

      {/* Card */}

      <div className="rounded-[34px] bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2">

        <div className="text-5xl">🔒</div>

        <h3 className="mt-6 text-2xl font-black text-[#08112F]">

          Secure Communication

        </h3>

        <p className="mt-4 leading-8 text-slate-600">

          Your information stays safe and confidential.

        </p>

      </div>

      {/* Card */}

      <div className="rounded-[34px] bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2">

        <div className="text-5xl">💚</div>

        <h3 className="mt-6 text-2xl font-black text-[#08112F]">

          Customer First

        </h3>

        <p className="mt-4 leading-8 text-slate-600">

          Delivering exceptional support is at the heart of EVUDDY.

        </p>

      </div>

    </div>

  </div>

</section>

{/* ================= FINAL CTA ================= */}

<section className="relative overflow-hidden py-28">

  <div className="absolute inset-0 bg-gradient-to-r from-[#08112F] via-[#102A67] to-[#18B368]" />

  <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-white/5 blur-[140px]" />

  <div className="relative mx-auto max-w-6xl px-6 text-center">

    <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-bold uppercase tracking-[0.16em] text-[#A7F3D0]">

      START YOUR EV JOURNEY

    </span>

    <h2 className="mt-8 text-5xl md:text-7xl font-black leading-tight text-white">

      Let's Build

      <br />

      India's Future

      <br />

      Together

    </h2>

    <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-white/80">

      Join thousands of riders and partners building the future
      of sustainable electric mobility with EVUDDY.

    </p>

    <div className="mt-14 flex flex-wrap justify-center gap-6">

      <a
        href="/ride-options"
        className="rounded-full bg-white px-10 py-5 text-lg font-black text-[#08112F] transition-all duration-300 hover:-translate-y-2"
      >

        Become a Rider

      </a>

      <a
        href="/partners"
        className="rounded-full border border-white/20 bg-white/10 px-10 py-5 text-lg font-black text-white backdrop-blur transition-all duration-300 hover:bg-[#18B368] hover:text-white hover:border-[#18B368] hover:-translate-y-1"
      >

        Become a Partner

      </a>

    </div>

  </div>

</section>

      </div>
    </section>
  );
}