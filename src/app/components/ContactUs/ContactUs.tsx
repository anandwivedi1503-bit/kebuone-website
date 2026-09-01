"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const directory = [
  {
    title: "Customer Support",
    text: "Bookings, rentals, payments and rider help for EVUDDY scooters.",
    value: "helpdesk@kebuone.in",
    href: "mailto:helpdesk@kebuone.in",
  },
  {
    title: "Helpdesk phone",
    text: "Call EVUDDY helpdesk for booking and ride support.",
    value: "+91 8726006512",
    href: "tel:+918726006512",
  },
  {
    title: "Business Partnerships",
    text: "Fleet operators, hubs and partners who want EVUDDY scooters on the road.",
    value: "helpdesk@kebuone.in",
    href: "mailto:helpdesk@kebuone.in",
  },
  {
    title: "Careers",
    text: "Join the team building smart electric mobility.",
    value: "helpdesk@kebuone.in",
    href: "mailto:helpdesk@kebuone.in",
  },
  {
    title: "Corporate Office",
    text: "Summit Building, 7th Floor, Gomti Nagar, Lucknow, Uttar Pradesh.",
    value: "Lucknow",
    href: "",
  },
];

const fieldClass =
  "h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-[#08112F] outline-none focus:border-[#18B368]";

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
    <div className="overflow-x-hidden bg-[#F4F7F8] text-[#08112F]">
      <section className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-2 lg:gap-12 lg:px-10">
        <div className="min-w-0">
          <Image
            src="/Evuddy-logo-dark-E.png"
            alt="EVUDDY"
            width={260}
            height={78}
            className="h-10 w-auto max-w-full object-contain sm:h-14"
          />
          <p className="mt-3 text-[10px] font-bold tracking-[0.22em] text-[#08112F] sm:text-[11px] sm:tracking-[0.32em]">
            SMART · ELECTRIC · MOBILITY
          </p>
          <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-[-0.05em] sm:mt-7 sm:text-6xl">
            Contact <span className="text-[#18B368]">EVUDDY</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Questions about scooter rentals, Rent to Own, hubs or partnerships —
            the EVUDDY team is here.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/ride-options"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#18B368] px-6 text-sm font-bold text-white sm:h-14 sm:w-auto sm:px-8 sm:text-base"
            >
              Book an EV <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/partners#partner-form"
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-[#18B368] sm:h-14 sm:w-auto sm:px-8 sm:text-base"
            >
              Become a Partner
            </Link>
          </div>
        </div>

        <figure className="relative aspect-[1600/589] w-full overflow-hidden rounded-[24px] bg-[#0B1B16] shadow-[0_18px_40px_rgba(8,17,47,0.12)] sm:rounded-[28px]">
          <img
            src="/poster.png"
            alt="EVUDDY electric scooters"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              maxWidth: "none",
              objectFit: "contain",
            }}
          />
        </figure>
      </section>

      <section className="px-4 pb-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl rounded-[24px] bg-[#08112F] px-5 py-8 text-center text-white sm:rounded-[32px] sm:px-12 sm:py-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6EE7A8] sm:text-[11px]">
            Contact
          </p>
          <p className="mx-auto mt-4 max-w-4xl text-sm leading-7 text-white/92 sm:text-lg sm:leading-8">
            Reach support, partnerships or hiring. Every message is about getting
            riders onto EVUDDY electric scooters safely.
          </p>
          <div className="mt-7 rounded-2xl bg-[#18B368] px-4 py-3 sm:mt-8">
            <p className="text-xs font-black tracking-wide sm:text-sm">#safeRideWithEvuddy</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <h2 className="text-2xl font-black tracking-[-0.04em] sm:text-4xl">Get in touch</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
          {directory.map((item) => (
            <article
              key={item.title}
              className="rounded-[22px] border border-slate-100 bg-white p-5 sm:p-6"
            >
              <h3 className="text-lg font-black sm:text-xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              {item.href ? (
                <a href={item.href} className="mt-4 inline-block text-sm font-bold text-[#18B368]">
                  {item.value}
                </a>
              ) : (
                <p className="mt-4 text-sm font-bold text-[#18B368]">{item.value}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-6xl items-start gap-6 lg:grid-cols-2 lg:gap-12">
          <form
            onSubmit={submitForm}
            className="space-y-4 rounded-[28px] bg-white p-6 shadow-[0_20px_50px_rgba(8,17,47,0.06)] sm:p-10"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18B368]">
              Message
            </p>
            <h2 className="text-2xl font-black sm:text-3xl">Send us a message</h2>
            <p className="text-sm leading-6 text-slate-500">
              We will get back to you about EVUDDY rentals, hubs or partnerships.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="fullName"
                value={form.fullName}
                onChange={updateField}
                required
                placeholder="Full name"
                className={fieldClass}
              />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                required
                placeholder="Email"
                className={fieldClass}
              />
            </div>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={updateField}
              required
              placeholder="Phone number"
              className={fieldClass}
            />
            <input
              name="subject"
              value={form.subject}
              onChange={updateField}
              required
              placeholder="Subject"
              className={fieldClass}
            />
            <textarea
              name="message"
              rows={5}
              value={form.message}
              onChange={updateField}
              required
              placeholder="Your message"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[#08112F] outline-none focus:border-[#18B368]"
            />
            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
            {status && <p className="text-sm font-semibold text-[#18B368]">{status}</p>}
            <button
              disabled={loading}
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#18B368] px-8 font-bold text-white disabled:opacity-60 sm:h-14 sm:w-auto"
            >
              {loading ? "Sending..." : "Submit enquiry"}
            </button>
          </form>

          <div className="space-y-5">
            <figure className="relative mx-auto aspect-[9/16] w-full max-w-[380px] overflow-hidden rounded-[24px] bg-[#08112F] shadow-[0_24px_60px_rgba(8,17,47,0.18)]">
              <video
                src="/kebu-final.mp4"
                autoPlay
                muted
                loop
                playsInline
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </figure>
            <article className="rounded-[22px] border border-slate-100 bg-white p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#18B368]">
                Helpdesk
              </p>
              <a
                href="mailto:helpdesk@kebuone.in"
                className="mt-2 inline-block text-xl font-black text-[#08112F]"
              >
                helpdesk@kebuone.in
              </a>
              <a
                href="tel:+918726006512"
                className="mt-2 block text-lg font-black text-[#08112F]"
              >
                +91 8726006512
              </a>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Summit Building, 7th Floor, Vibhuti Khand, Gomti Nagar, Lucknow,
                Uttar Pradesh 226010.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 sm:pb-16 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 rounded-[24px] bg-[#08112F] px-5 py-8 text-white sm:flex-row sm:items-center sm:justify-between sm:rounded-[32px] sm:px-10">
          <div>
            <p className="text-sm font-bold text-[#86EFAC]">#safeRideWithEvuddy</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Ready to ride electric?</h2>
          </div>
          <Link
            href="/ride-options"
            className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full bg-white px-8 font-bold text-[#08112F] sm:h-14 sm:w-auto"
          >
            Book an EV
          </Link>
        </div>
      </section>
    </div>
  );
}
