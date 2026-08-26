"use client";

type StatusBadgeProps = {
  status: "active" | "warning" | "danger" | "inactive";
  label?: string;
};

export default function StatusBadge({
  status,
  label,
}: StatusBadgeProps) {
  const styles = {
    active: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      glow: "shadow-[0_0_12px_rgba(16,185,129,0.35)]",
      label: "ACTIVE",
    },
    warning: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
      glow: "shadow-[0_0_12px_rgba(245,158,11,0.35)]",
      label: "PENDING",
    },
    danger: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
      glow: "shadow-[0_0_12px_rgba(244,63,94,0.35)]",
      label: "CRITICAL",
    },
    inactive: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
      dot: "bg-slate-400",
      glow: "",
      label: "OFFLINE",
    },
  };

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 truncate rounded-full border px-2.5 py-1 text-[11px] font-bold ${styles[status].border} ${styles[status].bg} ${styles[status].text} ${styles[status].glow}`}
    >
      <span className={`ops-live-dot h-1.5 w-1.5 shrink-0 rounded-full ${styles[status].dot}`} />
      {label || styles[status].label}
    </span>
  );
}
