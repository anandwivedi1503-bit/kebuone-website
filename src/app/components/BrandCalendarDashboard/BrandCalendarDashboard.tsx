"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Image as ImageIcon, Megaphone, RefreshCw, Save } from "lucide-react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import DashboardCard from "../DashboardUI/DashboardCard";

const THEMES = [
  ["diwali", "Diwali"],
  ["chhath", "Chhath"],
  ["holi", "Holi"],
  ["republic", "Republic Day"],
  ["independence", "Independence Day"],
  ["christmas", "Christmas"],
  ["eid", "Eid"],
  ["navratri", "Navratri"],
  ["rakhi", "Raksha Bandhan"],
  ["newyear", "New Year"],
  ["childrens", "Children’s Day"],
  ["custom", "Custom day"],
  ["normal", "Normal theme (turn campaign off)"],
] as const;

type Campaign = {
  _id: string;
  id: string;
  name: string;
  theme: (typeof THEMES)[number][0];
  start: string;
  end: string;
  ribbon: string;
  welcomeTitle: string;
  welcomeBody: string;
  logoAccent: string;
  heroImage: string;
  priority: number;
  status: "draft" | "published" | "archived";
  updatedAt?: string;
};

type CampaignForm = Omit<Campaign, "_id" | "id" | "status" | "updatedAt">;

function istToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function blankForm(): CampaignForm {
  const today = istToday();
  return {
    name: "",
    theme: "normal",
    start: today,
    end: today,
    ribbon: "",
    welcomeTitle: "",
    welcomeBody: "",
    logoAccent: "#F4C400",
    heroImage: "",
    priority: 0,
  };
}

function errorMessage(data: { message?: string }, fallback: string) {
  return data.message || fallback;
}

function currentCampaignState(campaign: Campaign, today: string) {
  if (campaign.status !== "published") return campaign.status;
  if (campaign.start > today) return "scheduled";
  if (campaign.end < today) return "ended";
  return "live";
}

const inputClass = "mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const labelClass = "block text-sm font-semibold text-slate-700";

export default function BrandCalendarDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<CampaignForm>(blankForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const today = useMemo(() => istToday(), []);
  const selected = campaigns.find((campaign) => campaign.id === selectedId) || null;

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/brand-campaigns", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(errorMessage(data, "Campaigns could not be loaded."));
      const rows = Array.isArray(data.data) ? data.data : [];
      setCampaigns(rows);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Campaigns could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const selectCampaign = (campaign: Campaign) => {
    setSelectedId(campaign.id);
    setForm(toForm(campaign));
    setError("");
    setNotice("");
  };

  const startNew = () => {
    setSelectedId("");
    setForm(blankForm());
    setError("");
    setNotice("");
  };

  const setField = <K extends keyof CampaignForm>(key: K, value: CampaignForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveFields = async () => {
    if (selected?.status === "published" && !window.confirm("This campaign is published. Saving will update the live website and app campaign immediately.")) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(
        selected ? `/api/admin/brand-campaigns/${encodeURIComponent(selected.id)}` : "/api/admin/brand-campaigns",
        {
          method: selected ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(errorMessage(data, "Campaign could not be saved."));
      setSelectedId(data.data.id);
      setForm(toForm(data.data));
      setNotice(selected ? "Campaign saved." : "Draft created. Publish it when you are ready.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Campaign could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (status: Campaign["status"]) => {
    if (!selected) return;
    const prompts: Record<Campaign["status"], string> = {
      published: "Publish this campaign? It will appear on the website and app during its IST date window.",
      draft: "Pause this campaign? The legacy calendar may take over for this date window.",
      archived: "Archive this campaign? It will stop the managed campaign and suppress the legacy calendar for its date window.",
    };
    if (!window.confirm(prompts[status])) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/brand-campaigns/${encodeURIComponent(selected.id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(errorMessage(data, "Campaign status could not be changed."));
      setForm(toForm(data.data));
      setNotice(status === "published" ? "Campaign published." : status === "draft" ? "Campaign paused." : "Campaign archived.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Campaign status could not be changed.");
    } finally {
      setSaving(false);
    }
  };

  const uploadPoster = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    setNotice("");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/admin/brand-campaigns/upload", {
        method: "POST",
        credentials: "include",
        body,
      });
      const data = await response.json();
      if (!response.ok || !data.success || typeof data.url !== "string") {
        throw new Error(errorMessage(data, "Poster could not be uploaded."));
      }
      setField("heroImage", data.url);
      setNotice("Poster uploaded and optimized. Save the campaign to use it.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Poster could not be uploaded.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageContainer>
      <DashboardHeader
        title="Shared brand calendar"
        subtitle="Schedule the supported campaign message, accent, theme, and poster once for the website and Evuddy app. The app refreshes from the shared API."
      />

      {error ? <p role="alert" className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</p> : null}
      {notice ? <p role="status" className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{notice}</p> : null}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <DashboardCard title={selected ? "Edit campaign" : "New campaign"} subtitle="Dates use India Standard Time (IST), inclusive of both days.">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void saveFields(); }}>
            <label className={`${labelClass} sm:col-span-2`}>
              Internal campaign name
              <input className={inputClass} maxLength={100} required value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="Example: Republic Day 2027" />
            </label>
            <label className={labelClass}>
              Theme preset
              <select className={inputClass} value={form.theme} onChange={(event) => setField("theme", event.target.value as CampaignForm["theme"])}>
                {THEMES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            {form.theme === "custom" ? <p className="-mt-2 rounded-xl bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-900 sm:col-span-2">Use Custom day for any date or occasion that is not listed. Set the campaign dates, copy, accent color, and poster below; the website and app use the same campaign data.</p> : null}
            <label className={labelClass}>
              Priority for overlapping campaigns
              <input className={inputClass} type="number" min={0} max={999} step={1} value={form.priority} onChange={(event) => setField("priority", Number(event.target.value))} />
            </label>
            <label className={labelClass}>
              Start date (IST)
              <input className={inputClass} type="date" required value={form.start} onChange={(event) => setField("start", event.target.value)} />
            </label>
            <label className={labelClass}>
              End date (IST)
              <input className={inputClass} type="date" required value={form.end} onChange={(event) => setField("end", event.target.value)} />
            </label>
            {form.theme !== "normal" ? <>
              <label className={`${labelClass} sm:col-span-2`}>
                Ribbon message
                <input className={inputClass} maxLength={180} required value={form.ribbon} onChange={(event) => setField("ribbon", event.target.value)} placeholder="The short message shown across the app and site" />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Welcome title
                <input className={inputClass} maxLength={120} required value={form.welcomeTitle} onChange={(event) => setField("welcomeTitle", event.target.value)} />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Welcome message
                <textarea className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" maxLength={500} required value={form.welcomeBody} onChange={(event) => setField("welcomeBody", event.target.value)} />
              </label>
              <label className={labelClass}>
                Accent color
                <span className="mt-1 flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
                  <input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(form.logoAccent) ? form.logoAccent : "#F4C400"} onChange={(event) => setField("logoAccent", event.target.value.toUpperCase())} aria-label="Choose accent color" />
                  <span className="text-sm font-mono text-slate-700">{form.logoAccent}</span>
                </span>
              </label>
              <label className={labelClass}>
                Poster image URL
                <input className={inputClass} type="url" value={form.heroImage.startsWith("/") ? "" : form.heroImage} onChange={(event) => setField("heroImage", event.target.value)} placeholder="https://res.cloudinary.com/…" />
              </label>
              <label className={labelClass}>
                Upload poster image
                <input className="mt-1 block w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-emerald-800" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => { void uploadPoster(event.target.files?.[0]); event.currentTarget.value = ""; }} />
                <span className="mt-1 block text-xs font-normal text-slate-500">JPG, PNG, or WebP · max 5 MB · resized and served through the image CDN.</span>
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Or poster path on evuddy.com
                <input className={inputClass} value={form.heroImage.startsWith("/") ? form.heroImage : ""} onChange={(event) => setField("heroImage", event.target.value)} placeholder="/brand/festival-poster.webp" />
                <span className="mt-1 block text-xs font-normal text-slate-500">Choose a JPG, PNG, or WebP under /brand on evuddy.com. The API stores only the URL, not the image bytes.</span>
              </label>
            </> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 sm:col-span-2">This scheduled entry returns the website and app to their normal theme for these dates.</p>}

            {form.theme !== "normal" && form.heroImage ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-600"><ImageIcon size={15} /> Poster preview</p>
                {/* Admin-provided public URLs are previewed directly; clients fetch the same URL. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.heroImage} alt="Campaign poster preview" className="max-h-56 rounded-xl object-contain" referrerPolicy="no-referrer" />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0A1134] px-5 text-sm font-semibold text-white disabled:opacity-50">
                <Save size={16} /> {saving ? "Saving…" : selected?.status === "published" ? "Save live changes" : selected ? "Save draft" : "Create draft"}
              </button>
              <button type="button" onClick={startNew} className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700">New campaign</button>
            </div>
          </form>
        </DashboardCard>

        <DashboardCard
          title="Scheduled campaigns"
          subtitle="Published items take effect within the date window; highest priority wins when windows overlap."
          rightContent={<button type="button" onClick={() => { setLoading(true); void load(); }} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh</button>}
        >
          {loading ? <p className="py-8 text-sm text-slate-500">Loading campaigns…</p> : campaigns.length === 0 ? <p className="py-8 text-sm text-slate-500">No managed campaigns yet. Existing calendar entries remain active until you publish a managed campaign for their date window.</p> : (
            <div className="space-y-2">
              {campaigns.map((campaign) => {
                const state = currentCampaignState(campaign, today);
                return (
                  <button key={campaign.id} type="button" onClick={() => selectCampaign(campaign)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedId === campaign.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-slate-900">{campaign.name}</span>
                        <span className="mt-1 block text-xs text-slate-500">{campaign.start} → {campaign.end} · {THEMES.find(([value]) => value === campaign.theme)?.[1]}</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${state === "live" ? "bg-emerald-100 text-emerald-800" : state === "scheduled" ? "bg-blue-100 text-blue-800" : state === "draft" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>{state}</span>
                    </div>
                    <span className="mt-2 flex items-center gap-2 text-xs text-slate-500"><span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: campaign.logoAccent }} />Priority {campaign.priority}</span>
                  </button>
                );
              })}
            </div>
          )}

          {selected ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><Megaphone size={16} /> Publication controls</p>
              <p className="mb-3 text-xs leading-5 text-slate-600">Pausing returns control to the legacy calendar for the same dates. Archiving suppresses the legacy calendar for this date window too.</p>
              <div className="flex flex-wrap gap-2">
                {selected.status !== "published" ? <button type="button" disabled={saving} onClick={() => void setStatus("published")} className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white disabled:opacity-50">Publish</button> : <button type="button" disabled={saving} onClick={() => void setStatus("draft")} className="h-10 rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-semibold text-amber-900 disabled:opacity-50">Pause</button>}
                {selected.status !== "archived" ? <button type="button" disabled={saving} onClick={() => void setStatus("archived")} className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-50">Archive</button> : null}
              </div>
            </div>
          ) : null}
        </DashboardCard>
      </div>

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
        <p className="flex items-center gap-2 font-bold"><CalendarDays size={16} /> What changes without an app release?</p>
        <p className="mt-1">The existing clients already read this shared calendar. Published ribbons, welcome copy, theme preset, accent color, and poster URL update on the website and app after their next refresh (normally within 10 minutes, or when the app resumes). New screen layouts, new theme presets, and the Play Store launcher icon still need a client release.</p>
      </div>
    </PageContainer>
  );
}

function toForm(campaign: Campaign): CampaignForm {
  return {
    name: campaign.name,
    theme: campaign.theme,
    start: campaign.start,
    end: campaign.end,
    ribbon: campaign.ribbon || "",
    welcomeTitle: campaign.welcomeTitle || "",
    welcomeBody: campaign.welcomeBody || "",
    logoAccent: campaign.logoAccent || "#F4C400",
    heroImage: campaign.heroImage || "",
    priority: Number(campaign.priority || 0),
  };
}
