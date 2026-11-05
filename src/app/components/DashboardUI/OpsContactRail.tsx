"use client";

import { Mail, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";

import { HELPDESK_EMAIL, HELPDESK_TEL, HELPDESK_PHONE_DISPLAY } from "@/lib/contact";

type Props = {
  title: string;
  phone?: string;
  email?: string;
  entityLabel: string;
  entityId: string;
  notes?: string;
  onSaveNotes: (notes: string) => Promise<void>;
};

export default function OpsContactRail({
  title,
  phone,
  email,
  entityLabel,
  entityId,
  notes: initialNotes = "",
  onSaveNotes,
}: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const riderTel = phone ? `tel:+91${phone.replace(/\D/g, "").slice(-10)}` : HELPDESK_TEL;
  const riderMail = email ? `mailto:${email}` : `mailto:${HELPDESK_EMAIL}`;
  const wa = phone
    ? `https://wa.me/91${phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
        `Hi, this is EVUDDY helpdesk regarding ${entityLabel} ${entityId}.`
      )}`
    : undefined;

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      await onSaveNotes(notes.trim());
      setMsg("Notes saved for the desk.");
    } catch {
      setMsg("Could not save notes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ops-glass-card mb-6 overflow-hidden border border-slate-200/80 bg-gradient-to-br from-white/95 via-sky-50/40 to-emerald-50/50 p-5 shadow-[0_20px_60px_rgba(10,17,52,0.08)] backdrop-blur-xl sm:p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-600">Helpdesk reach</p>
      <h3 className="mt-1 text-lg font-semibold text-[#0a1134]">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">
        Call, email, or WhatsApp from this laptop. Notes stay on {entityLabel} {entityId}.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={riderTel}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-md"
        >
          <Phone size={16} /> Call {phone ? `+91 ${phone}` : HELPDESK_PHONE_DISPLAY}
        </a>
        <a
          href={riderMail}
          className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-800"
        >
          <Mail size={16} /> Email
        </a>
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800"
          >
            <MessageCircle size={16} /> WhatsApp reminder
          </a>
        ) : null}
      </div>
      <label className="mt-4 block text-xs font-semibold text-slate-600">Desk notes</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus:border-[#18b368] focus:ring-2 focus:ring-[#18b368]/20"
        placeholder="Follow-up, cash handed, ID verified, callback time…"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-full bg-[#0a1134] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save notes"}
        </button>
        {msg ? <p className="text-sm text-slate-600">{msg}</p> : null}
      </div>
    </div>
  );
}
