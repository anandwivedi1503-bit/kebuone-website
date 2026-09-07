"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

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
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ReviewRow | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState("");

  const load = async () => {
    const params = new URLSearchParams({
      limit: String(Math.min(500, 80 * pages)),
      page: "1",
    });
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (search.trim()) params.set("q", search.trim());
    const res = await fetch(`/api/reviews?${params}`, { cache: "no-store" });
    const data = await res.json();
    setReviews(data.data || []);
    setHasMore(Boolean(data.pagination?.hasMore));
  };

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 15000);
    return () => clearInterval(timer);
  }, [pages, statusFilter]);

  const patch = async (id: string, body: Record<string, unknown>) => {
    setBusy(id);
    const res = await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy("");
    if (data.success) {
      await load();
      setSelected(data.data);
    }
  };

  const pending = reviews.filter((row) => row.status === "Pending").length;
  const published = reviews.filter((row) => row.status === "Published").length;
  const hidden = reviews.filter((row) => row.status === "Hidden").length;
  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, row) => sum + Number(row.stars || 0), 0) / reviews.length;

  return (
    <PageContainer>
      <DashboardHeader
        title="Rider reviews"
        subtitle="Ratings after a completed ride. Publish, hide, or reply."
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
                onClick={() => setPages((n) => n + 1)}
                className="w-full rounded-xl border border-slate-200 py-3 text-sm"
              >
                Load more
              </button>
            ) : null}
            {!reviews.length ? (
              <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                No reviews yet. Riders rate from Book EV after the yard completes the ride.
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
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
                  className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Public staff reply (optional)"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => void patch(selected._id, { status: "Published", staffReply: reply })}
                    className="rounded-full bg-[#18B368] px-4 py-2 text-sm font-medium text-white"
                  >
                    Publish
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => void patch(selected._id, { status: "Hidden", staffReply: reply })}
                    className="rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-white"
                  >
                    Hide
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => void patch(selected._id, { staffReply: reply })}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm"
                  >
                    Save reply
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
