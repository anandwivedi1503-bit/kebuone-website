"use client";

import { useCallback, useEffect, useState } from "react";
import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import DashboardCard from "../DashboardUI/DashboardCard";

type CityRecord = {
  _id: string;
  cityName: string;
  state?: string;
  status: "Active" | "Inactive" | string;
};

export default function CityManagement() {
  const [cities, setCities] = useState<CityRecord[]>([]);
  const [cityName, setCityName] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCities = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/cities", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to load cities.");
      }

      setCities(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to load cities."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCities();
  }, [loadCities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cityName.trim()) {
      alert("City name is required.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cityName: cityName.trim(),
          state: state.trim(),
          status: "Active",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to add city.");
      }

      alert("City added successfully.");
      setCityName("");
      setState("");
      await loadCities();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to add city."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <DashboardHeader
        title="City Management"
        subtitle="Add cities here first. Hubs and booking will use the same city data."
      />

      <DashboardCard
        title="Add City"
        subtitle="Create cities before adding hubs and vehicles."
      >
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-3 block font-bold text-[#0A1134]">
              City Name *
            </label>
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="Example: Bengaluru"
              className="h-14 w-full rounded-2xl border border-pink-100 bg-pink-50/40 px-5"
            />
          </div>

          <div>
            <label className="mb-3 block font-bold text-[#0A1134]">
              State
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Example: Karnataka"
              className="h-14 w-full rounded-2xl border border-pink-100 bg-pink-50/40 px-5"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-[#FF165E] px-8 py-4 font-bold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add City"}
            </button>
          </div>
        </form>
      </DashboardCard>

      <DashboardCard
        title="Active Cities"
        subtitle="These cities appear in booking and hub management."
      >
        {loading ? (
          <p>Loading cities...</p>
        ) : cities.length === 0 ? (
          <p className="text-gray-500">
            No cities found. Add at least one city.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-pink-100 bg-pink-50">
                  <th className="px-6 py-4 text-left">City</th>
                  <th className="px-6 py-4 text-left">State</th>
                  <th className="px-6 py-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((city) => (
                  <tr key={String(city._id)} className="border-b border-pink-50">
                    <td className="px-6 py-4 font-semibold">{city.cityName}</td>
                    <td className="px-6 py-4">{city.state || "—"}</td>
                    <td className="px-6 py-4">{city.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </PageContainer>
  );
}