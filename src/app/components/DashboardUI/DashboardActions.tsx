"use client";

import { downloadCsv, printDashboard } from "@/lib/dashboardExport";

type Props = {
  filename: string;
  rows: Record<string, unknown>[];
  onRefresh?: () => void;
};

export default function DashboardActions({ filename, rows, onRefresh }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => downloadCsv(filename, rows)}
        className="h-10 rounded-xl bg-emerald-600 px-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-[0_10px_28px_rgba(16,185,129,0.45)]"
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={printDashboard}
        className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-800 hover:shadow-[0_8px_20px_rgba(16,185,129,0.18)]"
      >
        Print / PDF
      </button>
      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          className="h-10 rounded-xl bg-slate-900 px-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_10px_24px_rgba(15,23,42,0.35)]"
        >
          Refresh
        </button>
      ) : null}
    </div>
  );
}
