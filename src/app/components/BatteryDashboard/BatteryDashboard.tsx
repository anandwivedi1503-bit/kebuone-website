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
  const [search, setSearch] = useState("");

const [statusFilter, setStatusFilter] =
  useState("ALL");
  const [editingBattery, setEditingBattery] =
  useState<Battery | null>(null);

const [showEditModal, setShowEditModal] =
  useState(false);

  const fetchBatteries = async () => {
    const res = await fetch("/api/batteries");
    const data = await res.json();
    setBatteries(data.data || []);
  };

  useEffect(() => {

  fetchBatteries();

  const interval = setInterval(() => {
    fetchBatteries();
  }, 30000);

  return () => clearInterval(interval);

}, []);

  const stats = useMemo(() => {
 return {
  total: batteries.length,

  ready: batteries.filter(
    (b) => b.status === "READY"
  ).length,

  charging: batteries.filter(
    (b) => b.status === "CHARGING"
  ).length,

  inVehicle: batteries.filter(
    (b) => b.status === "IN-VEHICLE"
  ).length,

  maintenance: batteries.filter(
    (b) => b.status === "MAINTENANCE"
  ).length,

  averageCharge:
    batteries.length === 0
      ? 0
      : Math.round(
          batteries.reduce(
            (sum, b) => sum + (b.chargePercentage || 0),
            0
          ) / batteries.length
        ),

  averageHealth:
    batteries.length === 0
      ? 0
      : Math.round(
          batteries.reduce(
            (sum, b) => sum + (b.batteryHealth || 0),
            0
          ) / batteries.length
        ),

  replacementNeeded: batteries.filter(
    (b) => (b.batteryHealth || 0) < 50
  ).length,
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

  const filteredBatteries = batteries.filter(
  (battery) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      battery.batteryId
        ?.toLowerCase()
        .includes(keyword) ||

      battery.vehicleId
        ?.toLowerCase()
        .includes(keyword) ||

      battery.hubName
        ?.toLowerCase()
        .includes(keyword) ||

      battery.hubId
        ?.toLowerCase()
        .includes(keyword);

    const matchesStatus =
      statusFilter === "ALL" ||
      battery.status === statusFilter;

    return matchesSearch && matchesStatus;
  }
);

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

  const saveBattery = async () => {

  if (!editingBattery) return;

  const res = await fetch(
    `/api/batteries/${editingBattery._id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editingBattery),
    }
  );

  const data = await res.json();

  if (data.success) {

    setShowEditModal(false);

    setEditingBattery(null);

    fetchBatteries();

  }

};

  return (
    <>
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
        <StatCard title=" Maintenance" value={stats.maintenance} color="text-red-600" />
        <StatCard
  title="Avg Charge"
  value={stats.averageCharge}
  color="text-blue-600"
/>

<StatCard
  title="Avg Health"
  value={stats.averageHealth}
  color="text-green-600"
/>

<StatCard
  title="Replace Soon"
  value={stats.replacementNeeded}
  color="text-red-600"
/>
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

        <div className="mt-6 grid gap-4 md:grid-cols-2">

  <input
    type="text"
    placeholder="Search Battery ID, Vehicle ID or Hub..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="
    rounded-xl
    border
    border-gray-200
    px-4
    py-3
    outline-none
    focus:border-[#FF165E]
    "
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="
    rounded-xl
    border
    border-gray-200
    px-4
    py-3
    outline-none
    focus:border-[#FF165E]
    "
  >
    <option value="ALL">All Status</option>
    <option value="READY">READY</option>
    <option value="CHARGING">CHARGING</option>
    <option value="IN-VEHICLE">IN-VEHICLE</option>
    <option value="MAINTENANCE">MAINTENANCE</option>
  </select>

</div>

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
                <th>Last Charged</th>
                <th>Charging Age</th>
                <th>Status</th>
                <th>Quick Update</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredBatteries.map((battery) => (
                <tr key={battery._id} className="border-b text-sm">
                  <td className="py-4 font-bold text-[#0A1134]">
                    {battery.batteryId || "-"}
                  </td>
                  <td>{battery.hubName || battery.hubId || "-"}</td>
                  <td>{battery.vehicleId || "-"}</td>
                  <td>
  <div className="flex items-center gap-2">

    <span
      className={
        battery.chargePercentage! <= 20
          ? "font-bold text-red-600"
          : battery.chargePercentage! <= 50
          ? "font-bold text-yellow-600"
          : "font-bold text-green-600"
      }
    >
      {battery.chargePercentage ?? 0}%
    </span>

    {battery.chargePercentage! <= 20 && (
      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
        LOW
      </span>
    )}

  </div>
</td>
                  <td>
  <div className="flex items-center gap-2">

    <span
      className={
        (battery.batteryHealth ?? 0) >= 80
          ? "font-bold text-green-600"
          : (battery.batteryHealth ?? 0) >= 50
          ? "font-bold text-yellow-600"
          : "font-bold text-red-600"
      }
    >
      {battery.batteryHealth ?? 0}%
    </span>

    {(battery.batteryHealth ?? 0) < 50 && (
      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
        Replace Soon
      </span>
    )}

  </div>
</td>
                  <td>{battery.cycleCount ?? 0}</td>

<td>
  {battery.lastChargedAt
    ? new Date(battery.lastChargedAt).toLocaleString("en-IN")
    : "--"}
</td>

<td>
  {battery.lastChargedAt
    ? `${Math.floor(
        (Date.now() -
          new Date(battery.lastChargedAt).getTime()) /
          (1000 * 60 * 60)
      )} hrs`
    : "--"}
</td>

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

<div className="flex gap-2">

<button
  onClick={() => {

    setEditingBattery({ ...battery });

    setShowEditModal(true);

  }}
  className="rounded-lg bg-blue-50 px-4 py-2 font-bold text-blue-600"
>

Edit

</button>

<button
  onClick={() => deleteBattery(battery._id)}
  className="rounded-lg bg-red-50 px-4 py-2 font-bold text-red-600"
>

Delete

</button>

</div>

</td>
                </tr>
              ))}

              {filteredBatteries.length === 0 && (
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

    {showEditModal && editingBattery && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">

          <h2 className="mb-6 text-3xl font-black text-[#0A1134]">
            Edit Battery
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            <Input
              label="Hub Name"
              value={editingBattery.hubName || ""}
              onChange={(value) =>
                setEditingBattery({
                  ...editingBattery,
                  hubName: value,
                })
              }
            />

            <Input
              label="Vehicle ID"
              value={editingBattery.vehicleId || ""}
              onChange={(value) =>
                setEditingBattery({
                  ...editingBattery,
                  vehicleId: value,
                })
              }
            />

            <Input
              label="Charge Percentage"
              type="number"
              value={editingBattery.chargePercentage || 0}
              onChange={(value) =>
                setEditingBattery({
                  ...editingBattery,
                  chargePercentage: Number(value),
                })
              }
            />

            <Input
              label="Battery Health"
              type="number"
              value={editingBattery.batteryHealth || 0}
              onChange={(value) =>
                setEditingBattery({
                  ...editingBattery,
                  batteryHealth: Number(value),
                })
              }
            />

            <Input
              label="Cycle Count"
              type="number"
              value={editingBattery.cycleCount || 0}
              onChange={(value) =>
                setEditingBattery({
                  ...editingBattery,
                  cycleCount: Number(value),
                })
              }
            />

            <div>
              <label className="text-sm font-bold text-[#0A1134]">
                Status
              </label>

              <select
                value={editingBattery.status || "READY"}
                onChange={(e) =>
                  setEditingBattery({
                    ...editingBattery,
                    status: e.target.value,
                  })
                }
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4"
              >
                <option value="READY">READY</option>
                <option value="CHARGING">CHARGING</option>
                <option value="IN-VEHICLE">IN-VEHICLE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>

          </div>

          <div className="mt-8 flex justify-end gap-4">

            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingBattery(null);
              }}
              className="rounded-xl border px-6 py-3"
            >
              Cancel
            </button>

            <button
              onClick={saveBattery}
              className="rounded-xl bg-[#FF165E] px-8 py-3 font-bold text-white"
            >
              Save Changes
            </button>

          </div>

        </div>
      </div>
    )}

  </>
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