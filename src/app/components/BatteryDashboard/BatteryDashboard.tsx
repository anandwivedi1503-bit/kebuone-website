"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BatteryCharging, HeartPulse, Wrench } from "lucide-react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import DashboardActions from "../DashboardUI/DashboardActions";
import StatusBadge from "../DashboardUI/StatusBadge";

type Battery = {
  _id: string;
  batteryId: string;
  hubId?: string;
  hubName?: string;
  vehicleId?: string;
  vehicleBatteryPercentage?: number | null;
  vehicleStatus?: string;
  vehicleHub?: string;
  chargePercentage?: number;
  batteryHealth?: number;
  cycleCount?: number;
  status?: string;
  lastChargedAt?: string;
  createdAt?: string;
  fromVehicle?: boolean;
};

const emptyForm = {
  batteryId: "",
  hubId: "",
  hubName: "",
  vehicleId: "",
  chargePercentage: 100,
  batteryHealth: 100,
  cycleCount: 0,
  status: "READY",
};

const fieldClass =
  "mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-emerald-500";

function hoursSince(value?: string) {
  if (!value) return "—";
  const hours = Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60));
  if (!Number.isFinite(hours) || hours < 0) return "—";
  return `${hours}h`;
}

function meterTone(value: number, good = 80, ok = 40) {
  if (value >= good) return "bg-emerald-500";
  if (value >= ok) return "bg-amber-400";
  return "bg-rose-500";
}

function Meter({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className="w-[7.5rem]">
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${meterTone(pct)}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs font-semibold text-slate-600">
        {pct}%{label ? ` · ${label}` : ""}
      </p>
    </div>
  );
}

function statusTone(status?: string): "active" | "warning" | "danger" | "inactive" {
  if (status === "READY" || status === "IN-VEHICLE") return "active";
  if (status === "CHARGING") return "warning";
  if (status === "MAINTENANCE") return "danger";
  return "inactive";
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export default function BatteryDashboard() {
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingBattery, setEditingBattery] = useState<Battery | null>(null);
  const [selectedBattery, setSelectedBattery] = useState<Battery | null>(null);

  const fetchBatteries = async () => {
    const res = await fetch("/api/batteries", { cache: "no-store" });
    const data = await res.json();
    setBatteries(data.data || []);
  };

  useEffect(() => {
    void fetchBatteries();
    const interval = window.setInterval(() => void fetchBatteries(), 15000);
    return () => window.clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    return {
      total: batteries.length,
      ready: batteries.filter((b) => b.status === "READY").length,
      charging: batteries.filter((b) => b.status === "CHARGING").length,
      inVehicle: batteries.filter((b) => b.status === "IN-VEHICLE").length,
      maintenance: batteries.filter((b) => b.status === "MAINTENANCE").length,
      averageCharge:
        batteries.length === 0
          ? 0
          : Math.round(
              batteries.reduce((sum, b) => sum + (b.chargePercentage || 0), 0) / batteries.length
            ),
      averageHealth: (() => {
        const withHealth = batteries.filter((b) => Number.isFinite(Number(b.batteryHealth)));
        if (withHealth.length === 0) return 0;
        return Math.round(
          withHealth.reduce((sum, b) => sum + Number(b.batteryHealth || 0), 0) / withHealth.length
        );
      })(),
      replacementNeeded: batteries.filter((b) => (b.batteryHealth || 0) < 50).length,
    };
  }, [batteries]);

  const handleChange = (field: keyof typeof emptyForm, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const filteredBatteries = batteries.filter((battery) => {
    const keyword = search.toLowerCase();
    const matchesSearch =
      battery.batteryId?.toLowerCase().includes(keyword) ||
      battery.vehicleId?.toLowerCase().includes(keyword) ||
      battery.hubName?.toLowerCase().includes(keyword) ||
      battery.hubId?.toLowerCase().includes(keyword);
    const matchesStatus = statusFilter === "ALL" || battery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/batteries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        chargePercentage: Number(formData.chargePercentage),
        batteryHealth: Number(formData.batteryHealth),
        cycleCount: Number(formData.cycleCount),
        lastChargedAt: new Date(),
      }),
    });
    const data = await res.json();
    if (!data.success) {
      setMessage(data.message || "Battery save failed.");
      setLoading(false);
      return;
    }
    setMessage("Battery added to hub inventory.");
    setFormData(emptyForm);
    await fetchBatteries();
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/batteries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    void fetchBatteries();
  };

  const deleteBattery = async (id: string) => {
    if (!confirm("Delete this battery?")) return;
    await fetch(`/api/batteries/${id}`, { method: "DELETE" });
    void fetchBatteries();
  };

  const saveBattery = async () => {
    if (!editingBattery) return;
    const res = await fetch(`/api/batteries/${editingBattery._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingBattery),
    });
    const data = await res.json();
    if (data.success) {
      setEditingBattery(null);
      void fetchBatteries();
    }
  };

  return (
    <PageContainer>
      <DashboardHeader
        title="Battery inventory"
        subtitle="READY packs go on Battery Swap. IN-VEHICLE charge is the same % as Vehicle / IoT for that scooter. Packs shown from inventory plus any pack ID currently fitted on a vehicle."
      />

      <KPIGrid>
        <KPICard title="Packs" value={String(stats.total)} subtitle="In inventory" icon={<BatteryCharging size={22} />} color="blue" />
        <KPICard title="Ready" value={String(stats.ready)} subtitle="Can be swapped in" icon={<BatteryCharging size={22} />} color="green" />
        <KPICard title="On scooter" value={String(stats.inVehicle)} subtitle="IN-VEHICLE" icon={<BatteryCharging size={22} />} color="purple" />
        <KPICard title="Charging" value={String(stats.charging)} subtitle={`Avg charge ${stats.averageCharge}%`} icon={<BatteryCharging size={22} />} color="yellow" />
        <KPICard title="Health" value={`${stats.averageHealth}%`} subtitle="Fleet average" icon={<HeartPulse size={22} />} color="green" />
        <KPICard title="Replace soon" value={String(stats.replacementNeeded)} subtitle="Health under 50%" icon={<Wrench size={22} />} color="red" />
      </KPIGrid>

      <DashboardCard title="Add pack" subtitle="New hub inventory. Vehicle ID is optional until a swap fits it.">
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Battery ID">
            <input className={fieldClass} value={formData.batteryId} required placeholder="BAT-001" onChange={(e) => handleChange("batteryId", e.target.value)} />
          </Field>
          <Field label="Hub ID">
            <input className={fieldClass} value={formData.hubId} placeholder="HUB-LKO-001" onChange={(e) => handleChange("hubId", e.target.value)} />
          </Field>
          <Field label="Hub name">
            <input className={fieldClass} value={formData.hubName} placeholder="Central hub" onChange={(e) => handleChange("hubName", e.target.value)} />
          </Field>
          <Field label="Vehicle (optional)">
            <input className={fieldClass} value={formData.vehicleId} placeholder="Only if already fitted" onChange={(e) => handleChange("vehicleId", e.target.value)} />
          </Field>
          <Field label="Charge %">
            <input className={fieldClass} type="number" min={0} max={100} value={formData.chargePercentage} onChange={(e) => handleChange("chargePercentage", Number(e.target.value))} />
          </Field>
          <Field label="Health %">
            <input className={fieldClass} type="number" min={0} max={100} value={formData.batteryHealth} onChange={(e) => handleChange("batteryHealth", Number(e.target.value))} />
          </Field>
          <Field label="Cycles">
            <input className={fieldClass} type="number" min={0} value={formData.cycleCount} onChange={(e) => handleChange("cycleCount", Number(e.target.value))} />
          </Field>
          <Field label="Status">
            <select className={fieldClass} value={formData.status} onChange={(e) => handleChange("status", e.target.value)}>
              <option value="READY">READY</option>
              <option value="CHARGING">CHARGING</option>
              <option value="IN-VEHICLE">IN-VEHICLE</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </Field>
          <div className="flex items-end gap-3 md:col-span-2 xl:col-span-4">
            <button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#0F172A] px-6 text-sm font-bold text-white disabled:opacity-60">
              {loading ? "Saving..." : "Add battery"}
            </button>
            {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}
          </div>
        </form>
      </DashboardCard>

      <div className="mt-8 mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid w-full gap-3 md:grid-cols-2 lg:max-w-xl">
          <input
            className={fieldClass}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pack, vehicle or hub"
          />
          <select className={fieldClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All statuses</option>
            <option value="READY">READY</option>
            <option value="CHARGING">CHARGING</option>
            <option value="IN-VEHICLE">IN-VEHICLE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
        </div>
        <DashboardActions
          filename="BatteryInventory.csv"
          rows={filteredBatteries.map((b) => ({
            BatteryID: b.batteryId,
            Hub: b.hubName || b.hubId,
            Vehicle: b.vehicleId,
            Charge: b.chargePercentage,
            Health: b.batteryHealth,
            Cycles: b.cycleCount,
            Status: b.status,
          }))}
          onRefresh={() => void fetchBatteries()}
        />
      </div>

      <DashboardCard title="Live inventory" subtitle={`${filteredBatteries.length} packs`}>
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <th className="sticky top-0 bg-white px-4 py-3">Pack</th>
                <th className="sticky top-0 bg-white px-4 py-3">Hub</th>
                <th className="sticky top-0 bg-white px-4 py-3">Vehicle</th>
                <th className="sticky top-0 bg-white px-4 py-3">Charge</th>
                <th className="sticky top-0 bg-white px-4 py-3">Health</th>
                <th className="sticky top-0 bg-white px-4 py-3">Cycles</th>
                <th className="sticky top-0 bg-white px-4 py-3">Last charged</th>
                <th className="sticky top-0 bg-white px-4 py-3">Age</th>
                <th className="sticky top-0 bg-white px-4 py-3">Status</th>
                <th className="sticky top-0 bg-white px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatteries.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-slate-500" colSpan={10}>
                    No packs match this filter.
                  </td>
                </tr>
              ) : (
                filteredBatteries.map((battery) => (
                  <tr key={battery._id} className="border-t border-slate-100">
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle font-semibold text-slate-900">
                      {battery.batteryId || "—"}
                    </td>
                    <td className="max-w-[10rem] truncate px-4 py-3.5 align-middle text-slate-600">
                      {battery.hubName || battery.hubId || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle text-slate-600">
                      {battery.vehicleId || "—"}
                      {battery.vehicleId ? (
                        <span className="mt-1 block text-[11px] font-semibold text-slate-500">
                          Scooter pack {Number(battery.vehicleBatteryPercentage ?? battery.chargePercentage ?? 0)}%
                          {battery.vehicleStatus ? ` · ${battery.vehicleStatus}` : ""}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <Meter value={battery.chargePercentage || 0} label={Number(battery.chargePercentage || 0) <= 20 ? "Low" : undefined} />
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <Meter
                        value={battery.batteryHealth || 0}
                        label={
                          Number(battery.batteryHealth || 0) < 50
                            ? "Replace"
                            : Number(battery.batteryHealth || 0) >= 80
                              ? "Good"
                              : undefined
                        }
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle text-slate-600">
                      {battery.cycleCount ?? 0}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle text-slate-500">
                      {battery.lastChargedAt ? new Date(battery.lastChargedAt).toLocaleString("en-IN") : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle text-slate-500">
                      {hoursSince(battery.lastChargedAt)}
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <StatusBadge status={statusTone(battery.status)} label={battery.status || "—"} />
                        <select
                          value={battery.status}
                          disabled={Boolean(battery.fromVehicle)}
                          onChange={(e) => void updateStatus(battery._id, e.target.value)}
                          className="h-10 w-36 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold disabled:opacity-50"
                        >
                          <option value="READY">READY</option>
                          <option value="CHARGING">CHARGING</option>
                          <option value="IN-VEHICLE">IN-VEHICLE</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex justify-end gap-2 whitespace-nowrap">
                        <button type="button" onClick={() => setSelectedBattery(battery)} className="h-9 rounded-xl bg-slate-100 px-3 text-xs font-bold text-slate-700">
                          View
                        </button>
                        {battery.fromVehicle ? (
                          <span className="self-center text-[11px] font-semibold text-slate-500">From vehicle</span>
                        ) : (
                          <>
                        <button type="button" onClick={() => setEditingBattery({ ...battery })} className="h-9 rounded-xl bg-sky-50 px-3 text-xs font-bold text-sky-700">
                          Edit
                        </button>
                        <button type="button" onClick={() => void deleteBattery(battery._id)} className="h-9 rounded-xl bg-rose-50 px-3 text-xs font-bold text-rose-700">
                          Delete
                        </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {editingBattery ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900">Edit {editingBattery.batteryId}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Hub name">
                <input className={fieldClass} value={editingBattery.hubName || ""} onChange={(e) => setEditingBattery({ ...editingBattery, hubName: e.target.value })} />
              </Field>
              <Field label="Vehicle ID">
                <input className={fieldClass} value={editingBattery.vehicleId || ""} onChange={(e) => setEditingBattery({ ...editingBattery, vehicleId: e.target.value })} />
              </Field>
              <Field label="Charge %">
                <input className={fieldClass} type="number" value={editingBattery.chargePercentage || 0} onChange={(e) => setEditingBattery({ ...editingBattery, chargePercentage: Number(e.target.value) })} />
              </Field>
              <Field label="Health %">
                <input className={fieldClass} type="number" value={editingBattery.batteryHealth || 0} onChange={(e) => setEditingBattery({ ...editingBattery, batteryHealth: Number(e.target.value) })} />
              </Field>
              <Field label="Cycles">
                <input className={fieldClass} type="number" value={editingBattery.cycleCount || 0} onChange={(e) => setEditingBattery({ ...editingBattery, cycleCount: Number(e.target.value) })} />
              </Field>
              <Field label="Status">
                <select className={fieldClass} value={editingBattery.status || "READY"} onChange={(e) => setEditingBattery({ ...editingBattery, status: e.target.value })}>
                  <option value="READY">READY</option>
                  <option value="CHARGING">CHARGING</option>
                  <option value="IN-VEHICLE">IN-VEHICLE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </Field>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingBattery(null)} className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-bold">
                Cancel
              </button>
              <button type="button" onClick={() => void saveBattery()} className="h-11 rounded-2xl bg-[#0F172A] px-6 text-sm font-bold text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedBattery ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Pack</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{selectedBattery.batteryId}</h2>
              </div>
              <button type="button" onClick={() => setSelectedBattery(null)} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold">
                Close
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                <p><span className="font-semibold text-slate-900">Hub</span> {selectedBattery.hubName || selectedBattery.hubId || "—"}</p>
                <p><span className="font-semibold text-slate-900">Vehicle</span> {selectedBattery.vehicleId || "—"}</p>
                <p><span className="font-semibold text-slate-900">Status</span> {selectedBattery.status || "—"}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                <p><span className="font-semibold text-slate-900">Charge</span> {selectedBattery.chargePercentage ?? 0}%</p>
                <p><span className="font-semibold text-slate-900">Health</span> {selectedBattery.batteryHealth ?? 0}%</p>
                <p><span className="font-semibold text-slate-900">Cycles</span> {selectedBattery.cycleCount ?? 0}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Last charged {selectedBattery.lastChargedAt ? new Date(selectedBattery.lastChargedAt).toLocaleString("en-IN") : "—"}
            </p>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
