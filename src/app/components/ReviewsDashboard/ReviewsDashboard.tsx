"use client";

import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { startOpsPoll } from "@/lib/opsPoll";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import StatusBadge from "../DashboardUI/StatusBadge";

type ReviewRow = {
  _id: string;
  reviewId?: string;
  bookingId?: string;
  riderId?: string;
  displayName?: string;
  stars?: number;
  vehicleStars?: number;
  hubStars?: number;
  comment?: string;
  status?: string;
  staffReply?: string;
  hubCode?: string;
  city?: string;
  wouldRecommend?: boolean;
  createdAt?: string;
};

export default function ReviewsDashboard() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef("");
  const loadingMoreRef = useRef(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ReviewRow | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async (loadOlder = false) => {
    if (loadOlder && (!cursorRef.current || loadingMoreRef.current)) return;
    if (loadOlder) {
      loadingMoreRef.current = true;
      setLoadingMore(true);
    }
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (loadOlder) params.set("cursor", cursorRef.current);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`/api/reviews?${params}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success && data.message) {
        setError(data.message);
        if (!loadOlder) setReviews([]);
        return;
      }
      setError("");
      const rows = Array.isArray(data.data) ? data.data : [];
      setReviews((current) => {
        const key = (row: ReviewRow) => String(row._id || row.reviewId);
        if (loadOlder) {
          const seen = new Set(current.map(key));
          return [...current, ...rows.filter((row: ReviewRow) => !seen.has(key(row)) && Boolean(seen.add(key(row))))];
        }
        const seen = new Set(rows.map(key));
        return [...rows, ...current.filter((row) => !seen.has(key(row)))];
      });
      if (loadOlder || !cursorRef.current) {
        cursorRef.current = String(data.pagination?.nextCursor || "");
      }
      setHasMore(Boolean(data.pagination?.hasMore));
    } finally {
      if (loadOlder) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    cursorRef.current = "";
    setReviews([]);
    void load();
    return startOpsPoll(load);
  }, [statusFilter]);

  const patch = async (id: string, body: Record<string, unknown>) => {
    setBusy(id);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Could not save this review.");
        return;
      }
      setMessage(
        body.staffReply !== undefined && !body.status
          ? "Reply saved."
          : "Review updated."
      );
      await load();
      setSelected(data.data);
      if (typeof data.data?.staffReply === "string") {
        setReply(data.data.staffReply);
      }
    } catch {
      setError("Could not save this review. Check your connection.");
    } finally {
      setBusy("");
    }
  };

  const pending = reviews.filter((row) => row.status === "Pending").length;
  const published = reviews.filter((row) => row.status === "Published").length;
  const hidden = reviews.filter((row) => row.status === "Hidden").length;
  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, row) => sum + Number(row.stars || 0), 0) / reviews.length;
  const selectedId = String(selected?.reviewId || selected?._id || "");

  return (
    <PageContainer>
      <DashboardHeader
        title="Rider reviews"
        subtitle="Ratings after a completed ride. Publish, hide, or reply — the same records feed the public site."
      />
      <KPIGrid>
        <KPICard title="Pending" value={pending} subtitle="Need a look" icon={<Star size={22} />} color="yellow" />
        <KPICard title="Published" value={published} subtitle="On the website" icon={<Star size={22} />} color="green" />
        <KPICard title="Hidden" value={hidden} subtitle="Not public" icon={<Star size={22} />} color="red" />
        <KPICard
          title="Average on this page"
          value={avg ? avg.toFixed(1) : "—"}
          subtitle="Stars"
          icon={<Star size={22} />}
          color="blue"
        />
      </KPIGrid>

      <DashboardCard title="Inbox" subtitle="One review per booking. 4–5 stars auto-publish.">
        {error ? (
          <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {message}
          </p>
        ) : null}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load();
            }}
            placeholder="Search booking, rider, comment"
            className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
          >
            <option value="ALL">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Published">Published</option>
            <option value="Hidden">Hidden</option>
          </select>
          <button
            type="button"
            onClick={() => void load()}
            className="h-11 rounded-xl bg-[#0A1134] px-4 text-sm font-medium text-white"
          >
            Search
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-2">
            {reviews.map((row) => (
              <button
                key={row._id}
                type="button"
                onClick={() => {
                  setSelected(row);
                  setReply(row.staffReply || "");
                  setError("");
                  setMessage("");
                }}
                className={`w-full rounded-2xl border px-4 py-3 text-left ${
                  selected?._id === row._id
                    ? "border-[#18B368] bg-emerald-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-[#0A1134]">
                    {row.reviewId} · {row.bookingId}
                  </p>
                  <StatusBadge
                    status={
                      row.status === "Published"
                        ? "active"
                        : row.status === "Pending"
                          ? "warning"
                          : "inactive"
                    }
                    label={row.status}
                  />
                </div>
                <p className="mt-1 text-amber-600">{"★".repeat(Number(row.stars || 0))}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{row.comment || "No comment"}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {row.displayName} · {row.hubCode} {row.city}
                </p>
              </button>
            ))}
            {hasMore ? (
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => void load(true)}
                className="w-full rounded-xl border border-slate-200 py-3 text-sm"
              >
                {loadingMore ? "Loading…" : "Load older reviews"}
              </button>
            ) : null}
            {!reviews.length ? (
              <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                No reviews yet. Riders rate from Book EV after the yard completes the ride.
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F8FBF9] p-5">
            {selected ? (
              <>
                <p className="text-sm font-medium text-[#0A1134]">{selected.reviewId}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {selected.displayName} · rider {selected.riderId}
                </p>
                <p className="mt-3 text-amber-600 text-xl">
                  Overall {"★".repeat(Number(selected.stars || 0))}
                </p>
                <p className="text-sm text-slate-500">
                  Scooter {"★".repeat(Number(selected.vehicleStars || 0))} · Hub{" "}
                  {"★".repeat(Number(selected.hubStars || 0))}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {selected.comment || "No written comment."}
                </p>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={3}
                  className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Public staff reply (optional)"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() =>
                      void patch(selectedId, { status: "Published", staffReply: reply })
                    }
                    className="rounded-full bg-[#18B368] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    Publish
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() =>
                      void patch(selectedId, { status: "Hidden", staffReply: reply })
                    }
                    className="rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    Hide
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => void patch(selectedId, { staffReply: reply })}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm disabled:opacity-60"
                  >
                    {busy ? "Saving..." : "Save reply"}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Select a review.</p>
            )}
          </div>
        </div>
      </DashboardCard>
    </PageContainer>
  );
}
