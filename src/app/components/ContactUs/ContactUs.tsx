"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brandMedia";

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
    text: "Fleet operators, dealers, distributors and hubs who want EVUDDY scooters on the road.",
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
  "h-12 w-full border border-[#E4DDD2] bg-[#FBF9F5] px-4 text-sm text-[#1C1917] outline-none focus:border-[#1F6B4A]";

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
    <div className="overflow-x-hidden bg-[#F7F4EE] text-[#1C1917]">
      <section className="relative mx-auto grid max-w-[1440px] items-center gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:px-12">
        <div className="min-w-0">
          <Image
            src="/Evuddy-logo-dark-E.png"
            alt="EVUDDY"
            width={260}
            height={78}
            className="h-10 w-auto max-w-full object-contain sm:h-14"
          />
          <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
            Smart · electric · mobility
          </p>
          <h1 className="font-display mt-4 text-4xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl lg:text-[3.5rem]">
            Contact <span className="italic text-[#1F6B4A]">EVUDDY</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-8 text-[#5C635E]">
            Questions about scooter rentals, Rent to Own, hubs or partnerships —
            the EVUDDY team is here.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/ride-options"
              className="inline-flex w-full items-center justify-center gap-2 bg-[#1F6B4A] px-8 py-3.5 text-[13px] font-medium tracking-[0.08em] text-white hover:bg-[#18573c] sm:w-auto"
            >
              Book an EV <ArrowRight size={16} />
            </Link>
            <Link
              href="/partners#dealer-network"
              className="inline-flex w-full items-center justify-center border border-[#1C1917]/15 px-8 py-3.5 text-[13px] font-medium text-[#1C1917] sm:w-auto"
            >
              Become a dealer
            </Link>
          </div>
        </div>

        <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-[#0B1B16] shadow-[0_18px_40px_rgba(8,17,47,0.12)] sm:rounded-[28px]">
          <img
            src={BRAND.rider}
            alt="EVUDDY electric scooters"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </figure>
      </section>

      <section className="px-5 pb-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px] border-t border-[#E4DDD2] pt-12 text-center sm:pt-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
            Contact
          </p>
          <p className="font-display mx-auto mt-6 max-w-3xl text-2xl font-medium leading-snug text-[#1C1917] sm:text-4xl">
            Reach support, partnerships or hiring.
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-[#5C635E]">
            Every message is about getting riders onto EVUDDY electric scooters safely.
          </p>
          <p className="mt-8 text-[11px] font-medium tracking-[0.22em] text-[#1F6B4A]">
            #safeRideWithEvuddy
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <h2 className="font-display text-3xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-4xl">
          Get in touch
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {directory.map((item) => (
            <article key={item.title} className="border-t border-[#E4DDD2] pt-5">
              <h3 className="text-base font-medium text-[#1C1917]">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[#5C635E]">{item.text}</p>
              {item.href ? (
                <a href={item.href} className="mt-4 inline-block text-sm font-medium text-[#1F6B4A]">
                  {item.value}
                </a>
              ) : (
                <p className="mt-4 text-sm font-medium text-[#1F6B4A]">{item.value}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1440px] items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <form
            onSubmit={submitForm}
            className="space-y-4 border-t border-[#E4DDD2] bg-[#FBF9F5] p-6 sm:p-10"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
              Message
            </p>
            <h2 className="font-display text-3xl font-medium tracking-[-0.03em] text-[#1C1917]">
              Send us a message
            </h2>
            <p className="text-[15px] leading-8 text-[#5C635E]">
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
              className="w-full border border-[#E4DDD2] bg-[#FBF9F5] px-4 py-3 text-sm text-[#1C1917] outline-none focus:border-[#1F6B4A]"
            />
            {error && <p className="text-sm font-medium text-red-700">{error}</p>}
            {status && <p className="text-sm font-medium text-[#1F6B4A]">{status}</p>}
            <button
              disabled={loading}
              type="submit"
              className="inline-flex w-full items-center justify-center bg-[#1F6B4A] px-8 py-3.5 text-[13px] font-medium tracking-[0.08em] text-white hover:bg-[#18573c] disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Sending..." : "Submit enquiry"}
            </button>
          </form>

          <div className="space-y-5">
            <figure className="relative w-full overflow-hidden rounded-[24px] bg-[#08112F] shadow-[0_24px_60px_rgba(8,17,47,0.18)]">
              <video
                src={BRAND.film}
                autoPlay
                muted
                loop
                playsInline
                poster={BRAND.highway}
                className="aspect-video h-auto w-full object-contain object-center"
              />
            </figure>
            <article className="border-t border-[#E4DDD2] pt-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
                Helpdesk
              </p>
              <a
                href="mailto:helpdesk@kebuone.in"
                className="font-display mt-3 inline-block text-2xl font-medium text-[#1C1917]"
              >
                helpdesk@kebuone.in
              </a>
              <a
                href="tel:+918726006512"
                className="mt-2 block text-[15px] font-medium text-[#1F6B4A]"
              >
                +91 8726006512
              </a>
              <p className="mt-3 text-sm leading-7 text-[#5C635E]">
                Summit Building, 7th Floor, Vibhuti Khand, Gomti Nagar, Lucknow,
                Uttar Pradesh 226010.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <div className="mx-auto max-w-[1440px] border-t border-[#E4DDD2] pt-10 text-center">
          <h2 className="font-display text-3xl font-medium text-[#1C1917] sm:text-4xl">
            Ready to ride electric?
          </h2>
          <p className="mt-3 text-[11px] font-medium tracking-[0.22em] text-[#1F6B4A]">
            #safeRideWithEvuddy
          </p>
          <div className="mt-7 flex justify-center">
            <Link
              href="/ride-options"
              className="inline-flex items-center justify-center bg-[#1F6B4A] px-8 py-3.5 text-[13px] font-medium tracking-[0.08em] text-white hover:bg-[#18573c]"
            >
              Book an EV
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
