"use client";

import { useMemo, useState } from "react";

import {
  FLEET_PARTNER_MIN_FLEET,
  FLEET_PLANS,
  inr,
  parseAmountInput,
  quoteFromRupees,
  quoteFromScooters,
  scaleTable,
  type FleetPlanId,
} from "@/lib/fleetPartnerCalc";

export default function BusinessPlannerPanel() {
  const [planId, setPlanId] = useState<FleetPlanId>("low");
  const [mode, setMode] = useState<"scooters" | "rupees">("scooters");
  const [scooters, setScooters] = useState(String(FLEET_PARTNER_MIN_FLEET));
  const [rupees, setRupees] = useState("300000");

  const plan = FLEET_PLANS[planId];
  const quote = useMemo(() => {
    if (mode === "rupees") {
      return quoteFromRupees(plan, parseAmountInput(rupees));
    }
    return quoteFromScooters(plan, parseAmountInput(scooters));
  }, [mode, plan, rupees, scooters]);

  const scale = useMemo(() => scaleTable(plan), [plan]);

  return (
    <section className="mb-10 rounded-3xl border border-[#18B368]/20 bg-[#F7FAF8] p-5 sm:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#18B368]">
        Staff only · Business planner
      </p>
      <h2 className="mt-2 text-xl font-semibold text-[#0A1134] sm:text-2xl">
        FOCO fleet numbers (not shown to riders)
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5C635E]">
        Same maths as the EVUDDY Fleet Partner PDF and rider investor calculator. Use for partner
        calls — public site stays PDF-only.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["low", "high"] as FleetPlanId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setPlanId(id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              planId === id
                ? "bg-[#18B368] text-white"
                : "border border-[#0A1134]/10 bg-white text-[#0A1134]"
            }`}
          >
            {FLEET_PLANS[id].title}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMode("scooters")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            mode === "scooters"
              ? "bg-[#0A1134] text-white"
              : "border border-[#0A1134]/10 bg-white text-[#0A1134]"
          }`}
        >
          Scooters
        </button>
        <button
          type="button"
          onClick={() => setMode("rupees")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            mode === "rupees"
              ? "bg-[#0A1134] text-white"
              : "border border-[#0A1134]/10 bg-white text-[#0A1134]"
          }`}
        >
          Rupees
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <label className="block text-sm font-medium text-[#0A1134]">
          {mode === "scooters" ? "Number of scooters" : "Investment (₹)"}
          <input
            className="mt-2 w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200"
            inputMode="numeric"
            value={mode === "scooters" ? scooters : rupees}
            onChange={(e) =>
              mode === "scooters" ? setScooters(e.target.value) : setRupees(e.target.value)
            }
          />
        </label>

        <div className="rounded-2xl border border-[#18B368]/15 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#18B368]">
            Estimate
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0A1134]">
            {quote.fleet} scooters · {inr(quote.investment)}
          </div>
          <div className="mt-1 text-lg font-semibold text-[#18B368]">
            {inr(quote.monthly)} / month
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-[#5C635E]">Annual</dt>
              <dd className="font-semibold">{inr(quote.annual)}</dd>
            </div>
            <div>
              <dt className="text-[#5C635E]">48 months</dt>
              <dd className="font-semibold">{inr(quote.tillTerm)}</dd>
            </div>
            <div>
              <dt className="text-[#5C635E]">Per scooter</dt>
              <dd className="font-semibold">{inr(quote.plan.perScooter)}</dd>
            </div>
            <div>
              <dt className="text-[#5C635E]">Ops</dt>
              <dd className="font-semibold">100% EVUDDY (FOCO)</dd>
            </div>
          </dl>
          {quote.leftoverRupees > 0 ? (
            <p className="mt-2 text-xs text-[#5C635E]">
              {inr(quote.leftoverRupees)} leftover — not enough for another scooter.
            </p>
          ) : null}
          {!quote.meetsMin && quote.fleet > 0 ? (
            <p className="mt-2 text-xs text-amber-800">
              Published minimum is {FLEET_PARTNER_MIN_FLEET} scooters.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#0A1134]/8 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#18B368] text-white">
            <tr>
              <th className="px-4 py-3 font-semibold">Fleet</th>
              <th className="px-4 py-3 font-semibold">Investment</th>
              <th className="px-4 py-3 font-semibold">Monthly</th>
              <th className="px-4 py-3 font-semibold">Annual</th>
            </tr>
          </thead>
          <tbody>
            {scale.map((row) => (
              <tr key={row.fleet} className="border-t border-[#0A1134]/6">
                <td className="px-4 py-2 font-medium">{row.fleet}</td>
                <td className="px-4 py-2">{inr(row.investment)}</td>
                <td className="px-4 py-2">{inr(row.monthly)}</td>
                <td className="px-4 py-2">{inr(row.annual)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
