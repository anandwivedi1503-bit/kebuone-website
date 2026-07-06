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
      <div className="bg-gradient-to-r from-[#0A1134] via-[#14245C] to-[#FF165E] py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <span className="rounded-full bg-white/10 px-5 py-2 font-semibold text-white">
            CONTACT KEBU ONE
          </span>

          <h1 className="mt-8 text-4xl font-black text-white md:text-7xl">
            Let&apos;s Connect
          </h1>

          <p className="mx-auto mt-6 max-w-4xl text-lg text-white/80 md:text-xl">
            Whether you are a customer, partner, investor, institution or service provider,
            we would love to hear from you.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-xl md:p-10">
            <h2 className="mb-5 text-2xl font-black text-[#0A1134] md:text-3xl">
              Registered Office
            </h2>
            <p className="leading-8 text-gray-600">
              Summit Building, 7th Floor, A-708
              <br />
              Vibhuti Khand, Gomti Nagar
              <br />
              Lucknow, Uttar Pradesh - 226010
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xl md:p-10">
            <h2 className="mb-5 text-2xl font-black text-[#0A1134] md:text-3xl">
              Email Us
            </h2>
            <a href="mailto:info@kebuone.com" className="text-xl font-bold text-[#FF165E]">
              info@kebuone.com
            </a>
            <p className="mt-4 text-gray-600">
              Reach out for partnerships, support, business inquiries, investments and collaborations.
            </p>
          </div>
        </div>

        <div className="mb-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={submitForm} className="grid gap-5 rounded-3xl bg-white p-5 shadow-xl md:grid-cols-2 md:p-10">
            <input name="fullName" value={form.fullName} onChange={updateField} required placeholder="Full Name" className="h-14 rounded-xl border border-gray-200 px-4 outline-none focus:border-[#FF165E]" />
            <input name="email" type="email" value={form.email} onChange={updateField} required placeholder="Email Address" className="h-14 rounded-xl border border-gray-200 px-4 outline-none focus:border-[#FF165E]" />
            <input name="phone" type="tel" value={form.phone} onChange={updateField} required placeholder="Phone Number" className="h-14 rounded-xl border border-gray-200 px-4 outline-none focus:border-[#FF165E]" />
            <input name="subject" value={form.subject} onChange={updateField} required placeholder="Subject" className="h-14 rounded-xl border border-gray-200 px-4 outline-none focus:border-[#FF165E]" />
            <textarea name="message" rows={6} value={form.message} onChange={updateField} required placeholder="Your Message" className="rounded-xl border border-gray-200 p-4 outline-none focus:border-[#FF165E] md:col-span-2" />

            {error && <div className="rounded-xl bg-red-50 p-4 font-semibold text-red-700 md:col-span-2">{error}</div>}
            {status && <div className="rounded-xl bg-green-50 p-4 font-semibold text-green-700 md:col-span-2">{status}</div>}

            <button disabled={loading} type="submit" className="h-14 rounded-2xl bg-gradient-to-r from-[#FF165E] to-[#EEB440] font-bold text-white disabled:opacity-60 md:col-span-2">
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>

          
        </div>
      </div>
    </section>
  );
}