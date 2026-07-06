"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Battery = {
  _id: string;
  batteryId: string;
  hubId?: string;
  hubName?: string;
  vehicleId?: string;
  chargePercentage?: number;
  batteryHealth?: number;
  cycleCount?: number;
  status?: string;
  lastChargedAt?: string;
  createdAt?: string;
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

export default function BatteryDashboard() {
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchBatteries = async () => {
    const res = await fetch("/api/batteries");
    const data = await res.json();
    setBatteries(data.data || []);
  };

  useEffect(() => {
    fetchBatteries();
  }, []);

  const stats = useMemo(() => {
    return {
      total: batteries.length,
      ready: batteries.filter((b) => b.status === "READY").length,
      charging: batteries.filter((b) => b.status === "CHARGING").length,
      inVehicle: batteries.filter((b) => b.status === "IN-VEHICLE").length,
    };
  }, [batteries]);

  const handleChange = (
    field: keyof typeof emptyForm,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/batteries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      setMessage("Battery save failed.");
      setLoading(false);
      return;
    }

    setMessage("Battery added successfully.");
    setFormData(emptyForm);
    await fetchBatteries();
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/batteries/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    fetchBatteries();
  };

  const deleteBattery = async (id: string) => {
    if (!confirm("Delete this battery?")) return;

    await fetch(`/api/batteries/${id}`, {
      method: "DELETE",
    });

    fetchBatteries();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FF165E]">
          Battery Operations
        </p>
        <h1 className="mt-3 text-4xl font-black text-[#0A1134]">
          Battery Management
        </h1>
        <p className="mt-2 text-gray-500">
          Add batteries, track stock and update charging status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard title="Total Batteries" value={stats.total} color="text-[#0A1134]" />
        <StatCard title="Ready" value={stats.ready} color="text-green-600" />
        <StatCard title="Charging" value={stats.charging} color="text-yellow-600" />
        <StatCard title="In Vehicle" value={stats.inVehicle} color="text-[#FF165E]" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-pink-100 bg-white p-6 shadow-xl"
      >
        <h2 className="text-2xl font-black text-[#0A1134]">
          Add New Battery
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <Input
            label="Battery ID"
            value={formData.batteryId}
            onChange={(value) => handleChange("batteryId", value)}
            placeholder="BAT-001"
            required
          />

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

          <Input
            label="Vehicle ID"
            value={formData.vehicleId}
            onChange={(value) => handleChange("vehicleId", value)}
            placeholder="KEBU-002"
          />

          <Input
            label="Charge Percentage"
            type="number"
            value={formData.chargePercentage}
            onChange={(value) => handleChange("chargePercentage", Number(value))}
          />

          <Input
            label="Battery Health"
            type="number"
            value={formData.batteryHealth}
            onChange={(value) => handleChange("batteryHealth", Number(value))}
          />

          <Input
            label="Cycle Count"
            type="number"
            value={formData.cycleCount}
            onChange={(value) => handleChange("cycleCount", Number(value))}
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
              <option value="READY">READY</option>
              <option value="CHARGING">CHARGING</option>
              <option value="IN-VEHICLE">IN-VEHICLE</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
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
          {loading ? "Saving..." : "Add Battery"}
        </button>
      </form>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-black text-[#0A1134]">
          Battery Inventory
        </h2>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="py-4">Battery ID</th>
                <th>Hub</th>
                <th>Vehicle</th>
                <th>Charge</th>
                <th>Health</th>
                <th>Cycles</th>
                <th>Status</th>
                <th>Quick Update</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {batteries.map((battery) => (
                <tr key={battery._id} className="border-b text-sm">
                  <td className="py-4 font-bold text-[#0A1134]">
                    {battery.batteryId || "-"}
                  </td>
                  <td>{battery.hubName || battery.hubId || "-"}</td>
                  <td>{battery.vehicleId || "-"}</td>
                  <td>{battery.chargePercentage ?? 0}%</td>
                  <td>{battery.batteryHealth ?? 0}%</td>
                  <td>{battery.cycleCount ?? 0}</td>
                  <td>
                    <span className="rounded-full bg-pink-50 px-3 py-1 font-bold text-[#FF165E]">
                      {battery.status || "READY"}
                    </span>
                  </td>
                  <td>
                    <select
                      value={battery.status || "READY"}
                      onChange={(e) => updateStatus(battery._id, e.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2"
                    >
                      <option value="READY">READY</option>
                      <option value="CHARGING">CHARGING</option>
                      <option value="IN-VEHICLE">IN-VEHICLE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteBattery(battery._id)}
                      className="rounded-lg bg-red-50 px-4 py-2 font-bold text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {batteries.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-500">
                    No batteries added yet.
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