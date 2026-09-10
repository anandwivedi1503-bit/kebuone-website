"use client";

import { useEffect, useMemo, useState } from "react";

import { sessionCanOpen } from "@/lib/adminCan";
import { startOpsPoll } from "@/lib/opsPoll";
import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import DashboardActions from "../DashboardUI/DashboardActions";
import SectionHeader from "../DashboardUI/SectionHeader";
import OpsMoneyStrip from "../DashboardUI/OpsMoneyStrip";

type CommandCenterCounts = {
  riders: number;
  vehicles: number;
  hubs: number;
  activeHubs: number;
  availableVehicles: number;
  activeRides: number;
  openTickets: number;
  processingRefunds: number;
  onlineVehicles: number;
  pendingPartners: number;
  wallets: number;
  totalWalletBalance: number;
  totalRevenue: number;
};

const EMPTY_COUNTS: CommandCenterCounts = {
  riders: 0,
  vehicles: 0,
  hubs: 0,
  activeHubs: 0,
  availableVehicles: 0,
  activeRides: 0,
  openTickets: 0,
  processingRefunds: 0,
  onlineVehicles: 0,
  pendingPartners: 0,
  wallets: 0,
  totalWalletBalance: 0,
  totalRevenue: 0,
};

type AdminDashboardProps = {
  setActiveDashboard?: (dashboard: string) => void;
};

const rupee = (value: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function AdminDashboard({ setActiveDashboard }: AdminDashboardProps) {
  const [search, setSearch] = useState("");
  const [adminSession, setAdminSession] = useState<{
    role: "super" | "staff";
    username: string;
    dashboards: string[];
  } | null>(null);
  const [counts, setCounts] = useState<CommandCenterCounts>(EMPTY_COUNTS);
  const [bookings, setBookings] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [searchHits, setSearchHits] = useState<
    Array<{ id: string; title: string; subtitle: string; dashboard: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  const canOpen = (dashboard: string) => sessionCanOpen(adminSession, dashboard);
  const openDashboard = (dashboard: string) => {
    if (!canOpen(dashboard)) return;
    setActiveDashboard?.(dashboard);
  };

  const loadDashboard = async () => {
    try {
      const res = await fetch("/api/admin/command-center", { cache: "no-store" });
      const data = await res.json();
      if (!data.success) return;
      setCounts({ ...EMPTY_COUNTS, ...(data.counts || {}) });
      setBookings(data.recent?.bookings || []);
      setTickets(data.recent?.tickets || []);
      setPartners(data.recent?.partners || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" });
        const data = await res.json();
        if (data.success) setAdminSession(data.data);
      } catch {
        setAdminSession(null);
      }
    };
    void loadSession();
  }, []);

  useEffect(() => {
    void loadDashboard();
    return startOpsPoll(() => {
      void loadDashboard();
    });
  }, []);

  useEffect(() => {
    const keyword = search.trim();
    if (keyword.length < 2) {
      setSearchHits([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/command-center?q=${encodeURIComponent(keyword)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        setSearchHits(
          Array.isArray(data.hits)
            ? data.hits.slice(0, 20).map((hit: any) => ({
                id: String(hit.id || hit.title),
                title: String(hit.title || "Result"),
                subtitle: String(hit.detail || hit.badge || ""),
                dashboard: String(hit.dashboard || "bookings"),
              }))
            : []
        );
      } catch {
        setSearchHits([]);
      }
    }, 280);
    return () => window.clearTimeout(timer);
  }, [search]);

  const sheetRows = useMemo(
    () =>
      bookings.map((booking) => ({
        BookingID: booking.bookingId || "",
        Rider: booking.userName || "",
        Phone: booking.userPhone || "",
        Vehicle: booking.vehicleId || "",
        RideStatus: booking.rideStatus || "",
        PaymentStatus: booking.paymentStatus || "",
        Received: booking.receivedAmount ?? "",
        Pending: booking.pendingAmount ?? "",
        Hub: booking.pickupHubName || booking.startHub || "",
      })),
    [bookings]
  );

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-96 items-center justify-center text-xl font-semibold">
          Loading admin home...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <DashboardHeader
        title="Admin home"
        subtitle="Same live snapshot as the other desks. Open a count to jump to that desk. Sidebar already lists every module."
      />

      <OpsMoneyStrip />

      <DashboardActions
        filename="admin-live-bookings"
        rows={sheetRows}
        onRefresh={() => void loadDashboard()}
      />

      <KPIGrid>
        <KPICard
          title="Riders"
          value={counts.riders}
          subtitle="Open users"
          icon="👥"
          color="pink"
          onClick={() => openDashboard("users")}
        />
        <KPICard
          title="Fleet"
          value={counts.vehicles}
          subtitle={`${counts.onlineVehicles} online`}
          icon="🚲"
          color="green"
          onClick={() => openDashboard("fleet")}
        />
        <KPICard
          title="Active rides"
          value={counts.activeRides}
          subtitle="Live bookings"
          icon="🛵"
          color="blue"
          onClick={() => openDashboard("bookings")}
        />
        <KPICard
          title="Hubs"
          value={counts.activeHubs}
          subtitle={`${counts.hubs} registered`}
          icon="📍"
          color="yellow"
          onClick={() => openDashboard("hub")}
        />
        <KPICard
          title="Revenue"
          value={rupee(counts.totalRevenue)}
          subtitle="Rent + GST collected"
          icon="₹"
          color="purple"
          onClick={() => openDashboard("revenue")}
        />
        <KPICard
          title="Open tickets"
          value={counts.openTickets}
          subtitle={`${counts.processingRefunds} refunds pending`}
          icon="🎧"
          color="red"
          onClick={() => openDashboard("support")}
        />
        <KPICard
          title="Wallets"
          value={counts.wallets}
          subtitle={rupee(counts.totalWalletBalance)}
          icon="👛"
          color="green"
          onClick={() => openDashboard("wallet")}
        />
        <KPICard
          title="Partner forms"
          value={counts.pendingPartners}
          subtitle="Pending review"
          icon="🤝"
          color="blue"
          onClick={() => openDashboard("partner")}
        />
      </KPIGrid>

      <SectionHeader
        title="Find a record"
        subtitle="Search riders, bookings, tickets or wallets. Click a row to open that desk."
      />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search rider, booking, ticket, vehicle..."
        className="mb-6 h-14 w-full rounded-2xl border border-pink-100 bg-white px-5 outline-none focus:ring-2 focus:ring-pink-200"
      />
      {searchHits.length > 0 ? (
        <DashboardCard title="Search results" subtitle="Opens the matching desk">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-pink-100 bg-pink-50">
                  <th className="px-6 py-4 text-left font-bold">Record</th>
                  <th className="px-6 py-4 text-left font-bold">Detail</th>
                  <th className="px-6 py-4 text-left font-bold">Desk</th>
                </tr>
              </thead>
              <tbody>
                {searchHits.map((hit) => (
                  <tr
                    key={`${hit.dashboard}-${hit.id}`}
                    className="cursor-pointer border-b border-pink-50 hover:bg-pink-50/40"
                    onClick={() => openDashboard(hit.dashboard)}
                  >
                    <td className="px-6 py-4 font-semibold">{hit.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{hit.subtitle}</td>
                    <td className="px-6 py-4 text-sm">{hit.dashboard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      ) : null}

      <SectionHeader title="Live bookings" subtitle="Latest rides from the same booking ledger." />
      <DashboardCard title="Bookings" subtitle="Tap a row to open Booking Management">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-pink-100 bg-pink-50">
                <th className="px-6 py-4 text-left font-bold">Booking</th>
                <th className="px-6 py-4 text-left font-bold">Rider</th>
                <th className="px-6 py-4 text-left font-bold">Vehicle</th>
                <th className="px-6 py-4 text-left font-bold">Ride</th>
                <th className="px-6 py-4 text-left font-bold">Payment</th>
                <th className="px-6 py-4 text-right font-bold">Received</th>
                <th className="px-6 py-4 text-right font-bold">Pending</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    No live bookings yet.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking._id || booking.bookingId}
                    className="cursor-pointer border-b border-pink-50 hover:bg-pink-50/40"
                    onClick={() => openDashboard("bookings")}
                  >
                    <td className="px-6 py-4 font-semibold">{booking.bookingId || "—"}</td>
                    <td className="px-6 py-4">
                      {booking.userName || "—"}
                      <div className="text-xs text-slate-500">{booking.userPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{booking.vehicleId || "—"}</td>
                    <td className="px-6 py-4 text-sm">{booking.rideStatus || "—"}</td>
                    <td className="px-6 py-4 text-sm">{booking.paymentStatus || "—"}</td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {rupee(Number(booking.receivedAmount || 0))}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-orange-600">
                      {rupee(Number(booking.pendingAmount || 0))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      <SectionHeader title="Open tickets" subtitle="Same queue as Support." />
      <DashboardCard title="Tickets" subtitle="Tap a row to open Support">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-pink-100 bg-pink-50">
                <th className="px-6 py-4 text-left font-bold">Ticket</th>
                <th className="px-6 py-4 text-left font-bold">Category</th>
                <th className="px-6 py-4 text-left font-bold">Priority</th>
                <th className="px-6 py-4 text-left font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    No tickets in this snapshot.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket._id || ticket.ticketId}
                    className="cursor-pointer border-b border-pink-50 hover:bg-pink-50/40"
                    onClick={() => openDashboard("support")}
                  >
                    <td className="px-6 py-4 font-semibold">{ticket.ticketId || "—"}</td>
                    <td className="px-6 py-4 text-sm">{String(ticket.category || "").replace(/_/g, " ")}</td>
                    <td className="px-6 py-4 text-sm">{ticket.priority || "—"}</td>
                    <td className="px-6 py-4 text-sm">{ticket.status || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      <SectionHeader title="Partner applications" subtitle="Same forms as Partner Applications." />
      <DashboardCard title="Partners" subtitle="Tap a row to open Partners">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-pink-100 bg-pink-50">
                <th className="px-6 py-4 text-left font-bold">Name</th>
                <th className="px-6 py-4 text-left font-bold">Type</th>
                <th className="px-6 py-4 text-left font-bold">City</th>
                <th className="px-6 py-4 text-left font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    No partner forms in this snapshot.
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr
                    key={partner._id}
                    className="cursor-pointer border-b border-pink-50 hover:bg-pink-50/40"
                    onClick={() => openDashboard("partner")}
                  >
                    <td className="px-6 py-4 font-semibold">{partner.fullName || "—"}</td>
                    <td className="px-6 py-4 text-sm">{partner.partnerType || "—"}</td>
                    <td className="px-6 py-4 text-sm">{partner.city || "—"}</td>
                    <td className="px-6 py-4 text-sm">{partner.applicationStatus || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </PageContainer>
  );
}
