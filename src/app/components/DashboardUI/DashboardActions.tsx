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
        className="h-10 rounded-xl bg-[#18B368] px-3.5 text-sm font-medium tracking-tight text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#14a05c] hover:shadow-[0_8px_20px_rgba(24,179,104,0.35)]"
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={printDashboard}
        className="h-10 rounded-xl border border-[#18B368]/25 bg-white px-3.5 text-sm font-medium tracking-tight text-[#0A1134] transition hover:-translate-y-0.5 hover:border-[#18B368] hover:bg-[#18B368]/10"
      >
        Print / PDF
      </button>
      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          className="h-10 rounded-xl bg-[#0A1134] px-3.5 text-sm font-medium tracking-tight text-white transition hover:-translate-y-0.5 hover:bg-[#152056]"
        >
          Refresh
        </button>
      ) : null}
    </div>
  );
}
