"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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
  staffId: "STAFF-001",
  status: "COMPLETED",
};

export default function BatterySwapDashboard() {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAll = async () => {
    const [swapRes, batteryRes, vehicleRes] = await Promise.all([
      fetch("/api/battery-swaps"),
      fetch("/api/batteries"),
      fetch("/api/vehicles"),
    ]);

    const swapData = await swapRes.json();
    const batteryData = await batteryRes.json();
    const vehicleData = await vehicleRes.json();

    setSwaps(swapData.data || []);
    setBatteries(batteryData.data || []);
    setVehicles(vehicleData.data || []);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const stats = useMemo(() => {
    return {
      total: swaps.length,
      completed: swaps.filter((s) => s.status === "COMPLETED").length,
      pending: swaps.filter((s) => s.status === "PENDING").length,
      readyBatteries: batteries.filter((b) => b.status === "READY").length,
    };
  }, [swaps, batteries]);

  const handleChange = (field: keyof typeof emptyForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.vehicleId === vehicleId);

    setFormData((prev) => ({
      ...prev,
      vehicleId,
      hubName: vehicle?.currentHub || prev.hubName,
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

  const patchBattery = async (batteryId: string, body: Record<string, unknown>) => {
    const battery = batteries.find((b) => b.batteryId === batteryId);
    if (!battery?._id) return;

    await fetch(`/api/batteries/${battery._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  };

  const patchVehicle = async (vehicleId: string, body: Record<string, unknown>) => {
    const vehicle = vehicles.find((v) => v.vehicleId === vehicleId);
    if (!vehicle?._id) return;

    await fetch(`/api/vehicles/${vehicle._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const selectedBatteryIn = batteries.find(
      (battery) => battery.batteryId === formData.batteryInId
    );

    const res = await fetch("/api/battery-swaps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!data.success) {
      setMessage("Battery swap save failed.");
      setLoading(false);
      return;
    }

    await patchBattery(formData.batteryOutId, {
      status: "CHARGING",
      vehicleId: "",
      hubId: formData.hubId,
      hubName: formData.hubName,
    });

    await patchBattery(formData.batteryInId, {
      status: "IN-VEHICLE",
      vehicleId: formData.vehicleId,
      hubId: formData.hubId,
      hubName: formData.hubName,
    });

    await patchVehicle(formData.vehicleId, {
      batteryPercentage: selectedBatteryIn?.chargePercentage || 100,
      vehicleStatus: "Available",
    });

    setMessage("Battery swap recorded successfully.");
    setFormData({
      ...emptyForm,
      swapId: createSwapId(),
    });

    await fetchAll();
    setLoading(false);
  };

  const deleteSwap = async (id: string) => {
    if (!confirm("Delete this swap log?")) return;

    await fetch(`/api/battery-swaps/${id}`, {
      method: "DELETE",
    });

    fetchAll();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FF165E]">
          Ground Operations
        </p>
        <h1 className="mt-3 text-4xl font-black text-[#0A1134]">
          Battery Swap Management
        </h1>
        <p className="mt-2 text-gray-500">
          Record battery swaps and automatically update battery and vehicle status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard title="Total Swaps" value={stats.total} color="text-[#0A1134]" />
        <StatCard title="Completed" value={stats.completed} color="text-green-600" />
        <StatCard title="Pending" value={stats.pending} color="text-yellow-600" />
        <StatCard title="Ready Batteries" value={stats.readyBatteries} color="text-[#FF165E]" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-pink-100 bg-white p-6 shadow-xl"
      >
        <h2 className="text-2xl font-black text-[#0A1134]">
          Record New Swap
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <Input
            label="Swap ID"
            value={formData.swapId}
            onChange={(value) => handleChange("swapId", value)}
            required
          />

          <div>
            <label className="text-sm font-bold text-[#0A1134]">
              Vehicle
            </label>
            <select
              value={formData.vehicleId}
              required
              onChange={(e) => handleVehicleChange(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#FF165E]"
            >
              <option value="">Select vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle.vehicleId}>
                  {vehicle.vehicleId} - {vehicle.registrationNumber || "No number"}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Hub ID"
            value={formData.hubId}
            onChange={(value) => handleChange("hubId", value)}
            placeholder="HUB-LKO-001"
          />

          <Input
            label="Hub Name"
            value={formData.hubName}
            onChange={(value) => handleChange("hubName", value)}
            placeholder="Kebu Central Hub"
          />

          <div>
            <label className="text-sm font-bold text-[#0A1134]">
              Battery Out
            </label>
            <select
              value={formData.batteryOutId}
              required
              onChange={(e) => handleChange("batteryOutId", e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#FF165E]"
            >
              <option value="">Select old battery</option>
              {batteries.map((battery) => (
                <option key={battery._id} value={battery.batteryId}>
                  {battery.batteryId} - {battery.status || "READY"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-[#0A1134]">
              Battery In
            </label>
            <select
              value={formData.batteryInId}
              required
              onChange={(e) => handleBatteryInChange(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#FF165E]"
            >
              <option value="">Select charged battery</option>
              {batteries
                .filter((battery) => battery.status === "READY")
                .map((battery) => (
                  <option key={battery._id} value={battery.batteryId}>
                    {battery.batteryId} - {battery.chargePercentage || 100}%
                  </option>
                ))}
            </select>
          </div>

          <Input
            label="Staff ID"
            value={formData.staffId}
            onChange={(value) => handleChange("staffId", value)}
            placeholder="STAFF-001"
          />

          <div>
            <label className="text-sm font-bold text-[#0A1134]">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#FF165E]"
            >
              <option value="COMPLETED">COMPLETED</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>

        {message && (
          <p className="mt-4 font-semibold text-[#FF165E]">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 rounded-xl bg-[#FF165E] px-8 py-4 font-bold text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Swap"}
        </button>
      </form>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-black text-[#0A1134]">
          Swap Logs
        </h2>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="py-4">Swap ID</th>
                <th>Vehicle</th>
                <th>Hub</th>
                <th>Battery Out</th>
                <th>Battery In</th>
                <th>Staff</th>
                <th>Status</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {swaps.map((swap) => (
                <tr key={swap._id} className="border-b text-sm">
                  <td className="py-4 font-bold text-[#0A1134]">
                    {swap.swapId || "-"}
                  </td>
                  <td>{swap.vehicleId || "-"}</td>
                  <td>{swap.hubName || swap.hubId || "-"}</td>
                  <td>{swap.batteryOutId || "-"}</td>
                  <td>{swap.batteryInId || "-"}</td>
                  <td>{swap.staffId || "-"}</td>
                  <td>
                    <span className="rounded-full bg-pink-50 px-3 py-1 font-bold text-[#FF165E]">
                      {swap.status || "PENDING"}
                    </span>
                  </td>
                  <td>
                    {swap.createdAt
                      ? new Date(swap.createdAt).toLocaleString()
                      : "-"}
                  </td>
                  <td>
                    <button
                      onClick={() => deleteSwap(swap._id)}
                      className="rounded-lg bg-red-50 px-4 py-2 font-bold text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {swaps.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-500">
                    No battery swaps recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
      <p className="text-sm font-bold text-gray-500">{title}</p>
      <h3 className={`mt-3 text-4xl font-black ${color}`}>{value}</h3>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-[#0A1134]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#FF165E]"
      />
    </div>
  );
}