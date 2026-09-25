"use client";

import { useState, type FormEvent } from "react";
import { PREMIUM_BTN, SpeakAllButton, VoiceArea, VoiceField } from "../FormVoice/FormVoiceDock";

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

  return (
    <section id="careers-apply" className="px-5 py-10 sm:px-8 lg:px-12">
      <form
        onSubmit={submit}
        className="mx-auto max-w-[1440px] space-y-5 rounded-[32px] border border-[#E6EBE7] bg-white p-6 shadow-[0_24px_80px_rgba(28,25,23,0.06)] sm:p-10"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
          Apply
        </p>
        <h2 className="font-display text-3xl font-medium tracking-[-0.03em] text-[#1C1917]">
          Apply to EVUDDY
        </h2>
        <p className="max-w-2xl text-[15px] leading-8 text-[#5C635E]">
          Tap the mic on every field. This creates a hiring ticket. You can also email helpdesk@kebuone.in.
        </p>
        <SpeakAllButton
          onParsed={(parts) => {
            if (parts.name) setName(parts.name);
            if (parts.email) setEmail(parts.email);
          }}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <VoiceField
            label="Full name *"
            required
            value={name}
            onChange={setName}
            placeholder="As on Aadhaar · or tap the mic"
          />
          <VoiceField
            label="Email *"
            required
            type="email"
            value={email}
            onChange={setEmail}
            placeholder='name@email.com · say "at" and "dot"'
          />
        </div>
        <VoiceField
          label="Role *"
          required
          value={role}
          onChange={setRole}
          placeholder="Role you are applying for"
        />
        <VoiceArea
          label="Why EVUDDY *"
          required
          rows={4}
          value={message}
          onChange={setMessage}
          placeholder="Tell us briefly why you want to join"
        />
        {error && <p className="text-sm font-medium text-red-700">{error}</p>}
        {status && <p className="text-sm font-medium text-[#1F6B4A]">{status}</p>}
        <button disabled={loading} className={`${PREMIUM_BTN} sm:w-auto sm:min-w-[240px]`}>
          {loading ? "Sending..." : "Submit application →"}
        </button>
      </form>
    </section>
  );
}
