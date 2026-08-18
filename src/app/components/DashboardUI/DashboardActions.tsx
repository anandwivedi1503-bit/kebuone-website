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
        className="h-11 rounded-xl bg-[#18B368] px-4 text-sm font-bold text-white"
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={printDashboard}
        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
      >
        Print / PDF
      </button>
      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          className="h-11 rounded-xl bg-[#0F172A] px-4 text-sm font-bold text-white"
        >
          Refresh
        </button>
      ) : null}
    </div>
  );
}
