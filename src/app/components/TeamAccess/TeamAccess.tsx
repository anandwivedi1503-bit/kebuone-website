"use client";

import { FormEvent, useEffect, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import DashboardCard from "../DashboardUI/DashboardCard";
import { DASHBOARD_LABELS, STAFF_DASHBOARDS } from "@/lib/adminRoles";

type StaffRow = {
  _id: string;
  username: string;
  displayName?: string;
  dashboards: string[];
  hubs?: string[];
  isActive: boolean;
};

export default function TeamAccess() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [dashboards, setDashboards] = useState<string[]>(["bookings"]);
  const [hubs, setHubs] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/staff", { cache: "no-store" });
    const data = await res.json();
    if (data.success) setStaff(data.data || []);
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleDashboard = (id: string) => {
    setDashboards((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, displayName, dashboards, hubs }),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.message || "Could not create staff login.");
      return;
    }
    setUsername("");
    setPassword("");
    setDisplayName("");
    setDashboards(["bookings"]);
    setHubs("");
    setMessage("Staff login created. They can add and update on assigned dashboards, but cannot delete.");
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this staff login?")) return;
    await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
    await load();
  };

  const toggleActive = async (row: StaffRow) => {
    await fetch(`/api/admin/staff/${row._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.isActive }),
    });
    await load();
  };

  return (
    <PageContainer>
      <DashboardHeader
        title="Team access"
        subtitle="Super admin only. Create dashboard logins that can add and update, but never delete."
      />
      <DashboardCard>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="h-12 rounded-2xl border border-slate-200 px-4"
            />
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 8)"
              className="h-12 rounded-2xl border border-slate-200 px-4"
            />
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
              className="h-12 rounded-2xl border border-slate-200 px-4"
            />
          </div>
          <input
            value={hubs}
            onChange={(e) => setHubs(e.target.value)}
            placeholder="Hub codes (optional, comma-separated). Leave empty for all yards."
            className="h-12 w-full rounded-2xl border border-slate-200 px-4"
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {STAFF_DASHBOARDS.map((id) => (
              <label key={id} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={dashboards.includes(id)}
                  onChange={() => toggleDashboard(id)}
                />
                {DASHBOARD_LABELS[id] || id}
              </label>
            ))}
          </div>
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          {message ? <p className="text-sm font-semibold text-[#18B368]">{message}</p> : null}
          <button type="submit" className="h-12 rounded-full bg-[#18B368] px-8 font-bold text-white">
            Add staff login
          </button>
        </form>
      </DashboardCard>

      <div className="mt-6 overflow-x-auto rounded-[24px] bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Dashboards</th>
              <th className="px-4 py-3">Hubs</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-slate-500" colSpan={5}>
                  No staff logins yet. Super admin password still opens everything.
                </td>
              </tr>
            ) : (
              staff.map((row) => (
                <tr key={row._id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold">
                    {row.displayName || row.username}
                    <div className="text-xs text-slate-400">{row.username}</div>
                  </td>
                  <td className="px-4 py-3">
                    {(row.dashboards || [])
                      .map((id) => DASHBOARD_LABELS[id] || id)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    {(row.hubs || []).length ? (row.hubs || []).join(", ") : "All yards"}
                  </td>
                  <td className="px-4 py-3">{row.isActive ? "Active" : "Off"}</td>
                  <td className="px-4 py-3">
                    <button className="mr-3 font-bold text-[#18B368]" onClick={() => void toggleActive(row)}>
                      {row.isActive ? "Disable" : "Enable"}
                    </button>
                    <button className="font-bold text-red-600" onClick={() => void remove(row._id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
