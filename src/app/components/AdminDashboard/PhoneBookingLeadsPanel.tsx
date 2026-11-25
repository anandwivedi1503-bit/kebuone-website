"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, Plus } from "lucide-react";
import { startOpsPoll } from "@/lib/opsPoll";

import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";
import { HELPDESK_PHONE_DISPLAY, HELPDESK_TEL } from "@/lib/contact";

type Lead = {
  _id: string;
  leadId?: string;
  fullName?: string;
  phone?: string;
  city?: string;
  rentalMode?: string;
  status?: string;
  notes?: string;
  linkedBookingId?: string;
  createdAt?: string;
};

const emptyForm = {
  fullName: "",
  phone: "",
  city: "Lucknow",
  rentalMode: "",
  vehiclePreference: "",
  pickupDate: "",
  notes: "",
  linkedBookingId: "",
};

export default function PhoneBookingLeadsPanel() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const cursorRef = useRef("");
  const loadingMoreRef = useRef(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async (loadOlder = false) => {
    if (loadOlder && (!cursorRef.current || loadingMoreRef.current)) return;
    if (loadOlder) {
      loadingMoreRef.current = true;
      setLoadingMore(true);
    }
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (loadOlder) params.set("cursor", cursorRef.current);
      const res = await fetch(`/api/phone-booking-leads?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        const rows = Array.isArray(data.data) ? data.data : [];
        setLeads((current) => {
          if (loadOlder) {
            const seen = new Set(current.map((row) => row._id));
            return [...current, ...rows.filter((row: Lead) => !seen.has(row._id))];
          }
          const seen = new Set(rows.map((row: Lead) => row._id));
          return [...rows, ...current.filter((row) => !seen.has(row._id))];
        });
        if (loadOlder || !cursorRef.current) cursorRef.current = String(data.pagination?.nextCursor || "");
        setHasMore(Boolean(data.pagination?.hasMore));
      }
    } finally {
      if (loadOlder) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    void load();
    return startOpsPoll(load);
  }, []);

  const submit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/phone-booking-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setForm(emptyForm);
        await load();
      } else {
        alert(data.errors?.join(" ") || data.message || "Could not save.");
      }
    } finally {
      setSaving(false);
    }
  };

  const patchLead = async (id: string, body: Record<string, unknown>) => {
    await fetch(`/api/phone-booking-leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await load();
  };

  return (
    <>
      <SectionHeader
        title="Phone bookings · helpdesk"
        subtitle={`Riders who book by calling ${HELPDESK_PHONE_DISPLAY}. Log details here — same live desk as Book EV.`}
      />
      <DashboardCard
        title="Call-in lead log"
        subtitle="Add after each helpdesk call"
        rightContent={
          <a
            href={HELPDESK_TEL}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-orange-500 px-4 py-2 text-sm font-bold text-white"
          >
            <Phone size={16} /> Dial helpdesk
          </a>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-white p-4 backdrop-blur-md">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-700">New call-in rider</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                placeholder="10-digit mobile"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                placeholder="Hourly / daily / RTO"
                value={form.rentalMode}
                onChange={(e) => setForm({ ...form, rentalMode: e.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                placeholder="Vehicle preference"
                value={form.vehiclePreference}
                onChange={(e) => setForm({ ...form, vehiclePreference: e.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
              />
              <input
                placeholder="Pickup date / time"
                value={form.pickupDate}
                onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
              />
              <textarea
                placeholder="Call notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
              />
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => void submit()}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#0a1134] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              <Plus size={16} /> Save lead
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto rounded-2xl border border-slate-200/80">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2">Lead</th>
                  <th className="px-3 py-2">Rider</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-slate-500">
                      No call-in leads logged yet.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead._id} className="border-b border-slate-100">
                      <td className="px-3 py-3 font-semibold">{lead.leadId}</td>
                      <td className="px-3 py-3">
                        {lead.fullName}
                        <div className="text-xs text-slate-500">
                          <a href={`tel:+91${lead.phone}`} className="text-emerald-700 underline">
                            +91 {lead.phone}
                          </a>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={lead.status || "OPEN"}
                          onChange={(e) => void patchLead(lead._id, { status: e.target.value })}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        >
                          <option value="OPEN">Open</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="BOOKED">Booked</option>
                          <option value="LOST">Lost</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {hasMore ? (
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => void load(true)}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-60"
            >
              {loadingMore ? "Loading…" : "Load older call-in leads"}
            </button>
          ) : null}
        </div>
      </DashboardCard>
    </>
  );
}
