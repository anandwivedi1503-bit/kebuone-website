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
      label: "ACTIVE",
    },
    warning: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
      label: "PENDING",
    },
    danger: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
      label: "CRITICAL",
    },
    inactive: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
      dot: "bg-slate-400",
      label: "OFFLINE",
    },
  };

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 truncate rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles[status].border} ${styles[status].bg} ${styles[status].text}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles[status].dot}`} />
      {label || styles[status].label}
    </span>
  );
}
