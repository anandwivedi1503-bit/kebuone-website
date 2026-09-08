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
      const description = `Career application for ${role}. ${name} (${email}). ${message}`.slice(
        0,
        500
      );
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

  const field =
    "h-12 w-full border border-[#E4DDD2] bg-[#FBF9F5] px-4 text-sm text-[#1C1917] outline-none focus:border-[#1F6B4A]";

  return (
    <section id="careers-apply" className="px-5 py-10 sm:px-8 lg:px-12">
      <form
        onSubmit={submit}
        className="mx-auto max-w-[1440px] space-y-4 border-t border-[#E4DDD2] bg-[#FBF9F5] p-6 sm:p-10"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
          Apply
        </p>
        <h2 className="font-display text-3xl font-medium tracking-[-0.03em] text-[#1C1917]">
          Apply to EVUDDY
        </h2>
        <p className="max-w-2xl text-[15px] leading-8 text-[#5C635E]">
          This creates a hiring ticket for the team. You can also email helpdesk@kebuone.in.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className={field}
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={field}
          />
        </div>
        <input
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Role you are applying for"
          className={field}
        />
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us briefly why you want to join"
          rows={4}
          className="w-full border border-[#E4DDD2] bg-[#FBF9F5] px-4 py-3 text-sm text-[#1C1917] outline-none focus:border-[#1F6B4A]"
        />
        {error && <p className="text-sm font-medium text-red-700">{error}</p>}
        {status && <p className="text-sm font-medium text-[#1F6B4A]">{status}</p>}
        <button
          disabled={loading}
          className="inline-flex w-full items-center justify-center bg-[#1F6B4A] px-8 py-3.5 text-[13px] font-medium tracking-[0.08em] text-white hover:bg-[#18573c] disabled:opacity-60 sm:w-auto"
        >
          {loading ? "Sending..." : "Submit application"}
        </button>
      </form>
    </section>
  );
}
