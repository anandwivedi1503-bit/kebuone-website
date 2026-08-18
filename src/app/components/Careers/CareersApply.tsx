"use client";

import { useState, type FormEvent } from "react";

export default function CareersApply() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      const description = `Career application for ${role}. ${name} (${email}). ${message}`.slice(0, 500);
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: `CR-${Date.now()}`,
          userId: email || name,
          category: "OTHER",
          description,
          status: "OPEN",
          assignedTo: "Admin",
        }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.errors?.join(" ") || data.message || "Could not send application.");
        return;
      }
      setName("");
      setEmail("");
      setRole("");
      setMessage("");
      setStatus("Application received. Our team will contact you.");
    } catch {
      setError("Could not send application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="careers-apply" className="bg-[#F7FBFA] px-4 py-16 sm:px-6 lg:px-10">
      <form
        onSubmit={submit}
        className="mx-auto max-w-xl space-y-4 rounded-[28px] bg-white p-6 shadow-sm sm:p-8"
      >
        <h2 className="text-2xl font-black text-[#0F172A]">Apply to EVUDDY</h2>
        <p className="text-sm text-slate-500">
          This creates a support ticket for the hiring team. You can also email careers@evuddy.com.
        </p>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="h-14 w-full rounded-2xl border border-slate-200 px-4"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="h-14 w-full rounded-2xl border border-slate-200 px-4"
        />
        <input
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Role you are applying for"
          className="h-14 w-full rounded-2xl border border-slate-200 px-4"
        />
        <textarea
          required
          minLength={10}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us briefly about your experience"
          className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3"
        />
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
        {status ? <p className="text-sm font-semibold text-[#18B368]">{status}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="h-14 w-full rounded-full bg-[#18B368] font-bold text-white disabled:opacity-60"
        >
          {loading ? "Sending..." : "Submit application"}
        </button>
      </form>
    </section>
  );
}
