"use client";

import { useEffect, useMemo, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import DashboardCard from "../DashboardUI/DashboardCard";
import DashboardActions from "../DashboardUI/DashboardActions";

type BookingRow = {
  bookingId?: string;
  userName?: string;
  rentalMode?: string;
  rideStatus?: string;
  paymentStatus?: string;
  pendingAmount?: number;
  createdAt?: string;
  updatedAt?: string;
};

type TxnRow = {
  transactionId?: string;
  bookingId?: string;
  userName?: string;
  amount?: number;
  transactionType?: string;
  status?: string;
  createdAt?: string;
};

type AuditRow = {
  _id?: string;
  actor?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  bookingId?: string;
  riderId?: string;
  detail?: string;
  createdAt?: string;
};

export default function AuditLogsDashboard() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [transactions, setTransactions] = useState<TxnRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const auditRes = await fetch("/api/audit-logs?limit=300", { cache: "no-store" });
        const auditData = await auditRes.json();
        if (auditRes.ok && Array.isArray(auditData.data) && auditData.data.length > 0) {
          setAuditLogs(auditData.data);
          setBookings([]);
          setTransactions([]);
          return;
        }

        const [bookingRes, txnRes] = await Promise.all([
          fetch("/api/bookings?limit=300", { cache: "no-store" }),
          fetch("/api/transactions?limit=300", { cache: "no-store" }),
        ]);
        const bookingData = await bookingRes.json();
        const txnData = await txnRes.json();
        setAuditLogs([]);
        setBookings(bookingData.data || []);
        setTransactions(txnData.data || []);
      } finally {
        setLoading(false);
      }
    };

    void load();
    const interval = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const rows = useMemo(() => {
    if (auditLogs.length > 0) {
      return auditLogs.map((item) => ({
        id: String(item._id || `${item.action}-${item.createdAt}`),
        when: item.createdAt || "",
        source: item.entity || "Audit",
        detail: `${item.action || "-"} · ${item.actor || "System"} · ${item.bookingId || item.entityId || "-"} · ${item.detail || ""}`,
      }));
    }

    const bookingEvents = bookings.map((item) => ({
      id: `B-${item.bookingId}`,
      when: item.updatedAt || item.createdAt || "",
      source: "Booking",
      detail: `${item.bookingId || "-"} · ${item.userName || "Rider"} · ${item.rentalMode || "-"} · ${item.rideStatus || "-"} / ${item.paymentStatus || "-"} · pending ₹${Number(item.pendingAmount || 0).toLocaleString("en-IN")}`,
    }));
    const txnEvents = transactions.map((item) => ({
      id: `T-${item.transactionId}`,
      when: item.createdAt || "",
      source: "Transaction",
      detail: `${item.transactionId || "-"} · ${item.userName || "Rider"} · ${item.transactionType || "-"} · ${item.status || "-"} · ₹${Number(item.amount || 0).toLocaleString("en-IN")}`,
    }));

    return [...bookingEvents, ...txnEvents]
      .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
      .slice(0, 80);
  }, [auditLogs, bookings, transactions]);

  return (
    <PageContainer>
      <DashboardHeader
        title="Audit Logs"
        subtitle="Staff actions and booking events from the live database. Falls back to bookings and payments if no audit rows exist yet."
      />
      <div className="mb-6">
        <DashboardActions
          filename="AuditLogs.csv"
          rows={rows.map((row) => ({
            When: row.when,
            Source: row.source,
            Activity: row.detail,
          }))}
        />
      </div>
      <DashboardCard>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Activity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8" colSpan={3}>
                    Loading live records...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-slate-500" colSpan={3}>
                    No booking or payment activity yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {row.when ? new Date(row.when).toLocaleString("en-IN") : "-"}
                    </td>
                    <td className="px-4 py-3 font-semibold">{row.source}</td>
                    <td className="px-4 py-3">{row.detail}</td>
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
