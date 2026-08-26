"use client";

import { useEffect, useMemo, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import DashboardCard from "../DashboardUI/DashboardCard";
import DashboardActions from "../DashboardUI/DashboardActions";

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
  const [auditLogs, setAuditLogs] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const auditRes = await fetch("/api/audit-logs?limit=500", { cache: "no-store" });
        const auditData = await auditRes.json();
        setAuditLogs(Array.isArray(auditData.data) ? auditData.data : []);
      } finally {
        setLoading(false);
      }
    };

    void load();
    const interval = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const rows = useMemo(() => {
    return auditLogs.map((item) => ({
      id: String(item._id || `${item.action}-${item.createdAt}`),
      when: item.createdAt || "",
      source: item.entity || "Audit",
      detail: `${item.action || "-"} · ${item.actor || "System"} · ${item.bookingId || item.entityId || "-"} · ${item.detail || ""}`,
    }));
  }, [auditLogs]);

  return (
    <PageContainer>
      <DashboardHeader
        title="Audit Logs"
        subtitle="Staff actions recorded in the audit log. Empty means no staff actions have been written yet — this is not booking or payment history."
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
                    No audit rows yet. Bookings and payments are on their own dashboards.
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
