"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Repeat2, BatteryCharging, Bike } from "lucide-react";

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
  chargePercentage?: number;
  status?: string;
};

type Vehicle = {
  _id: string;
  vehicleId: string;
  registrationNumber?: string;
  currentHub?: string;
  vehicleStatus?: string;
  currentBatteryId?: string;
  batteryPercentage?: number;
};

type Swap = {
  _id: string;
  swapId: string;
  hubId?: string;
  hubName?: string;
  vehicleId?: string;
  batteryOutId?: string;
  batteryInId?: string;
  staffId?: string;
  remarks?: string;
  status?: string;
  createdAt?: string;
};

const createSwapId = () => `SWAP-${Date.now()}`;

const emptyForm = {
  swapId: createSwapId(),
  hubId: "",
  hubName: "",
  vehicleId: "",
  batteryOutId: "",
  batteryInId: "",
  staffId: "",
};

const fieldClass =
  "mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-emerald-500";

function statusTone(status?: string): "active" | "warning" | "danger" | "inactive" {
  if (status === "COMPLETED") return "active";
  if (status === "PENDING") return "warning";
  if (status === "FAILED") return "danger";
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

export default function BatterySwapDashboard() {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingSwap, setEditingSwap] = useState<Swap | null>(null);

  const fetchAll = async () => {
    const [swapRes, batteryRes, vehicleRes] = await Promise.all([
      fetch("/api/battery-swaps", { cache: "no-store" }),
      fetch("/api/batteries", { cache: "no-store" }),
      fetch("/api/vehicles", { cache: "no-store" }),
    ]);
    const swapData = await swapRes.json();
    const batteryData = await batteryRes.json();
    const vehicleData = await vehicleRes.json();
    setSwaps(swapData.data || []);
    setBatteries(batteryData.data || []);
    setVehicles(vehicleData.data || []);
  };

  useEffect(() => {
    void fetchAll();
    const interval = window.setInterval(() => void fetchAll(), 15000);
    return () => window.clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    return {
      total: swaps.length,
      completed: swaps.filter((s) => s.status === "COMPLETED").length,
      pending: swaps.filter((s) => s.status === "PENDING").length,
      readyBatteries: batteries.filter((b) => b.status === "READY").length,
    };
  }, [swaps, batteries]);

  const filteredSwaps = swaps.filter((swap) => {
    const keyword = search.toLowerCase();
    const matchesSearch =
      swap.swapId?.toLowerCase().includes(keyword) ||
      swap.vehicleId?.toLowerCase().includes(keyword) ||
      swap.batteryOutId?.toLowerCase().includes(keyword) ||
      swap.batteryInId?.toLowerCase().includes(keyword) ||
      swap.hubName?.toLowerCase().includes(keyword) ||
      swap.staffId?.toLowerCase().includes(keyword);
    const matchesStatus = statusFilter === "ALL" || swap.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleChange = (field: keyof typeof emptyForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.vehicleId === vehicleId);
    setFormData((prev) => ({
      ...prev,
      vehicleId,
      hubName: vehicle?.currentHub || prev.hubName,
      batteryOutId: vehicle?.currentBatteryId || prev.batteryOutId,
    }));
  };

  const handleBatteryInChange = (batteryId: string) => {
    const battery = batteries.find((b) => b.batteryId === batteryId);
    setFormData((prev) => ({
      ...prev,
      batteryInId: batteryId,
      hubId: battery?.hubId || prev.hubId,
      hubName: battery?.hubName || prev.hubName,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    if (formData.batteryOutId === formData.batteryInId) {
      setMessage("Battery in and battery out cannot be the same pack.");
      setLoading(false);
      return;
    }
    const selectedBatteryIn = batteries.find((battery) => battery.batteryId === formData.batteryInId);
    const selectedBatteryOut = batteries.find((battery) => battery.batteryId === formData.batteryOutId);
    const res = await fetch("/api/battery-swaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        status: "COMPLETED",
        batteryInPercentage: selectedBatteryIn?.chargePercentage ?? 100,
        batteryOutPercentage: selectedBatteryOut?.chargePercentage ?? 0,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      setMessage(String(data.message || "Battery swap save failed."));
      setLoading(false);
      return;
    }
    setMessage("Swap recorded. Pack inventory, scooter charge, and the live booking are updated.");
    setFormData({ ...emptyForm, swapId: createSwapId() });
    await fetchAll();
    setLoading(false);
  };

  const deleteSwap = async (id: string) => {
    if (!confirm("Delete this swap log?")) return;
    const res = await fetch(`/api/battery-swaps/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) {
      setMessage(String(data.message || "Completed swaps cannot be deleted."));
      return;
    }
    void fetchAll();
  };

  const saveSwap = async () => {
    if (!editingSwap) return;
    const res = await fetch(`/api/battery-swaps/${editingSwap._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffId: editingSwap.staffId,
        remarks: editingSwap.remarks,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setEditingSwap(null);
      void fetchAll();
    }
  };

  return (
    <PageContainer>
      <DashboardHeader
        title="Battery swap"
        subtitle="Fit a READY pack onto a scooter. Outgoing pack goes to charging. Vehicle charge and the live booking stay in sync."
      />

      <KPIGrid>
        <KPICard title="Swaps" value={String(stats.total)} subtitle="Logged" icon={<Repeat2 size={22} />} color="blue" />
        <KPICard title="Completed" value={String(stats.completed)} subtitle="Inventory updated" icon={<Repeat2 size={22} />} color="green" />
        <KPICard title="Ready packs" value={String(stats.readyBatteries)} subtitle="Available to fit" icon={<BatteryCharging size={22} />} color="yellow" />
        <KPICard title="Scooters" value={String(vehicles.length)} subtitle="On this hub list" icon={<Bike size={22} />} color="purple" />
      </KPIGrid>

      <DashboardCard title="Record a swap" subtitle="Select the scooter first so Battery Out fills from the pack currently fitted.">
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Swap ID">
            <input className={fieldClass} value={formData.swapId} required onChange={(e) => handleChange("swapId", e.target.value)} />
          </Field>
          <Field label="Vehicle">
            <select className={fieldClass} value={formData.vehicleId} required onChange={(e) => handleVehicleChange(e.target.value)}>
              <option value="">Select vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle.vehicleId}>
                  {vehicle.vehicleId} · {vehicle.registrationNumber || "no plate"} · {vehicle.vehicleStatus || ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Hub">
            <input className={fieldClass} value={formData.hubName} placeholder="Filled from vehicle or pack" onChange={(e) => handleChange("hubName", e.target.value)} />
          </Field>
          <Field label="Battery out">
            <select className={fieldClass} value={formData.batteryOutId} required onChange={(e) => handleChange("batteryOutId", e.target.value)}>
              <option value="">Pack coming off the scooter</option>
              {batteries
                .filter((battery) => {
                  if (formData.vehicleId) {
                    return battery.batteryId === formData.batteryOutId || battery.vehicleId === formData.vehicleId;
                  }
                  return battery.status === "IN-VEHICLE";
                })
                .map((battery) => (
                  <option key={battery._id} value={battery.batteryId}>
                    {battery.batteryId} · {battery.chargePercentage ?? 0}%
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Battery in">
            <select className={fieldClass} value={formData.batteryInId} required onChange={(e) => handleBatteryInChange(e.target.value)}>
              <option value="">Charged READY pack</option>
              {batteries
                .filter((battery) => battery.status === "READY" && battery.batteryId !== formData.batteryOutId)
                .map((battery) => (
                  <option key={battery._id} value={battery.batteryId}>
                    {battery.batteryId} · {battery.chargePercentage || 100}%
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Staff">
            <input className={fieldClass} value={formData.staffId} placeholder="Yard staff name or ID" onChange={(e) => handleChange("staffId", e.target.value)} />
          </Field>
          <div className="flex items-end gap-3 md:col-span-2 xl:col-span-3">
            <button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#0F172A] px-6 text-sm font-bold text-white disabled:opacity-60">
              {loading ? "Saving..." : "Complete swap"}
            </button>
            {message ? <p className="text-sm font-semibold text-emerald-800">{message}</p> : null}
          </div>
        </form>
      </DashboardCard>

      <div className="mt-8 mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid w-full gap-3 md:grid-cols-2 lg:max-w-xl">
          <input
            className={fieldClass}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search swap, vehicle, pack or hub"
          />
          <select className={fieldClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        <DashboardActions
          filename="BatterySwaps.csv"
          rows={filteredSwaps.map((s) => ({
            SwapID: s.swapId,
            Vehicle: s.vehicleId,
            Hub: s.hubName || s.hubId,
            BatteryOut: s.batteryOutId,
            BatteryIn: s.batteryInId,
            Staff: s.staffId,
            Status: s.status,
            When: s.createdAt,
          }))}
          onRefresh={() => void fetchAll()}
        />
      </div>

      <DashboardCard title="Swap log" subtitle="Completed swaps cannot delete inventory. Edit only staff / remarks.">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <th className="sticky top-0 bg-white px-4 py-3">Swap</th>
                <th className="sticky top-0 bg-white px-4 py-3">Vehicle</th>
                <th className="sticky top-0 bg-white px-4 py-3">Hub</th>
                <th className="sticky top-0 bg-white px-4 py-3">Out</th>
                <th className="sticky top-0 bg-white px-4 py-3">In</th>
                <th className="sticky top-0 bg-white px-4 py-3">Staff</th>
                <th className="sticky top-0 bg-white px-4 py-3">Status</th>
                <th className="sticky top-0 bg-white px-4 py-3">When</th>
                <th className="sticky top-0 bg-white px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSwaps.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-slate-500" colSpan={9}>
                    No swaps recorded yet.
                  </td>
                </tr>
              ) : (
                filteredSwaps.map((swap) => (
                  <tr key={swap._id} className="border-t border-slate-100">
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle font-semibold text-slate-900">
                      {swap.swapId || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle text-slate-600">
                      {swap.vehicleId || "—"}
                    </td>
                    <td className="max-w-[10rem] truncate px-4 py-3.5 align-middle text-slate-600">
                      {swap.hubName || swap.hubId || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle text-slate-600">
                      {swap.batteryOutId || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle text-slate-600">
                      {swap.batteryInId || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle text-slate-600">
                      {swap.staffId || "—"}
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <StatusBadge status={statusTone(swap.status)} label={swap.status || "—"} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle text-slate-500">
                      {swap.createdAt ? new Date(swap.createdAt).toLocaleString("en-IN") : "—"}
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex justify-end gap-2 whitespace-nowrap">
                        <button type="button" onClick={() => setEditingSwap({ ...swap })} className="h-9 rounded-xl bg-sky-50 px-3 text-xs font-bold text-sky-700">
                          Edit
                        </button>
                        <button type="button" onClick={() => void deleteSwap(swap._id)} className="h-9 rounded-xl bg-rose-50 px-3 text-xs font-bold text-rose-700">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {editingSwap ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900">Edit {editingSwap.swapId}</h2>
            <p className="mt-2 text-sm text-slate-500">Pack IDs stay as recorded. Only staff and remarks can change.</p>
            <div className="mt-6 grid gap-4">
              <Field label="Staff">
                <input className={fieldClass} value={editingSwap.staffId || ""} onChange={(e) => setEditingSwap({ ...editingSwap, staffId: e.target.value })} />
              </Field>
              <Field label="Remarks">
                <input className={fieldClass} value={editingSwap.remarks || ""} onChange={(e) => setEditingSwap({ ...editingSwap, remarks: e.target.value })} />
              </Field>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingSwap(null)} className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-bold">
                Cancel
              </button>
              <button type="button" onClick={() => void saveSwap()} className="h-11 rounded-2xl bg-[#0F172A] px-6 text-sm font-bold text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
