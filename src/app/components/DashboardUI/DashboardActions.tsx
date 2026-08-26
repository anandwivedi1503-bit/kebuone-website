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
        className="h-10 rounded-xl bg-emerald-600 px-3.5 text-sm font-medium tracking-tight text-white hover:bg-emerald-700"
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={printDashboard}
        className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium tracking-tight text-slate-700 hover:bg-slate-50"
      >
        Print / PDF
      </button>
      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          className="h-10 rounded-xl bg-slate-900 px-3.5 text-sm font-medium tracking-tight text-white hover:bg-slate-800"
        >
          Refresh
        </button>
      ) : null}
    </div>
  );
}
