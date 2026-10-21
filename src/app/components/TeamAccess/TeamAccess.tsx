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
  staffRole?: string;
  totpEnabled?: boolean;
  isActive: boolean;
};

const jsonHeaders = { "Content-Type": "application/json" };

export default function TeamAccess() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [dashboards, setDashboards] = useState<string[]>(["bookings"]);
  const [hubs, setHubs] = useState("");
  const [namedSuper, setNamedSuper] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/staff", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setError(
          data.message ||
            (res.status === 401
              ? "Sign in as super admin to open Team Access."
              : res.status === 403
                ? "Only super admin can manage team logins."
                : "Could not load team access.")
        );
        setStaff([]);
        return;
      }
      setError("");
      setStaff(data.data || []);
    } catch {
      setError("Could not load team access. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
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
    setSaving(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        credentials: "include",
        headers: jsonHeaders,
        body: JSON.stringify({
          username,
          password,
          displayName,
          dashboards,
          hubs,
          staffRole: namedSuper ? "super" : "staff",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data.success) {
        setError(data.message || "Could not create staff login.");
        return;
      }
      setUsername("");
      setPassword("");
      setDisplayName("");
      setDashboards(["bookings"]);
      setHubs("");
      setNamedSuper(false);
      setMessage("Staff login created. They can add and update on assigned dashboards, but cannot delete.");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this staff login?")) return;
    const res = await fetch(`/api/admin/staff/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!data.success) {
      setError(data.message || "Could not remove this login.");
      return;
    }
    await load();
  };

  const toggleActive = async (row: StaffRow) => {
    const res = await fetch(`/api/admin/staff/${row._id}`, {
      method: "PATCH",
      credentials: "include",
      headers: jsonHeaders,
      body: JSON.stringify({ isActive: !row.isActive }),
    });
    const data = await res.json().catch(() => ({}));
    if (!data.success) {
      setError(data.message || "Could not update this login.");
      return;
    }
    await load();
  };

  const saveDashboards = async (row: StaffRow, next: string[]) => {
    if (row.staffRole === "super") return;
    if (next.length === 0) {
      setError("Select at least one dashboard.");
      return;
    }
    const res = await fetch(`/api/admin/staff/${row._id}`, {
      method: "PATCH",
      credentials: "include",
      headers: jsonHeaders,
      body: JSON.stringify({ dashboards: next }),
    });
    const data = await res.json().catch(() => ({}));
    if (!data.success) {
      setError(data.message || "Could not update dashboards.");
      return;
    }
    await load();
  };

  return (
    <PageContainer>
      <DashboardHeader
        title="Team access"
        subtitle="Super admin only. Assign which desks a login can open. Staff can add and update on those desks, never delete. Username + password is enough — no extra authenticator step."
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
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={namedSuper}
              onChange={(e) => setNamedSuper(e.target.checked)}
            />
            Named super (full ops, no hub limit). Shared env password stays as emergency bootstrap.
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold"
              onClick={() => setDashboards([...STAFF_DASHBOARDS])}
            >
              Select all desks
            </button>
            <button
              type="button"
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold"
              onClick={() => setDashboards(["bookings"])}
            >
              Bookings only
            </button>
          </div>
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
          <button
            type="submit"
            disabled={saving}
            className="h-12 rounded-full bg-[#18B368] px-8 font-bold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add staff login"}
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
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-slate-500" colSpan={5}>
                  Loading team logins...
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-slate-500" colSpan={5}>
                  {error
                    ? "Team list is empty until super admin can load it."
                    : "No staff logins yet. Super admin password still opens everything."}
                </td>
              </tr>
            ) : (
              staff.map((row) => (
                <tr key={row._id} className="border-b border-slate-100 align-top">
                  <td className="px-4 py-3 font-semibold">
                    {row.displayName || row.username}
                    <div className="text-xs text-slate-400">{row.username}</div>
                  </td>
                  <td className="px-4 py-3">
                    {row.staffRole === "super" ? (
                      "All desks"
                    ) : (
                      <div className="grid max-w-xl grid-cols-2 gap-1">
                        {STAFF_DASHBOARDS.map((id) => (
                          <label key={id} className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={(row.dashboards || []).includes(id)}
                              onChange={() => {
                                const current = row.dashboards || [];
                                const next = current.includes(id)
                                  ? current.filter((item) => item !== id)
                                  : [...current, id];
                                void saveDashboards(row, next);
                              }}
                            />
                            {DASHBOARD_LABELS[id] || id}
                          </label>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {(row.hubs || []).length ? (row.hubs || []).join(", ") : "All yards"}
                    {row.staffRole === "super" ? " · named super" : ""}
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
