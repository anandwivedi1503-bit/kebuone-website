"use client";

import { downloadCsv } from "@/lib/dashboardExport";

type Props = {
  filename: string;
  rows: Record<string, unknown>[];
  /** @deprecated Live desks auto-refresh via ops poll — no manual refresh button. */
  onRefresh?: () => void;
};

export default function DashboardActions({ filename, rows }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => downloadCsv(filename, rows)}
        className="h-10 rounded-xl bg-[#18B368] px-3.5 text-sm font-medium tracking-tight text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#14a05c] hover:shadow-[0_8px_20px_rgba(24,179,104,0.35)]"
      >
        Download Excel (CSV)
      </button>
    </div>
  );
}
