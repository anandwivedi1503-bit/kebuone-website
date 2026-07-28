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
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500",
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
      className={`
      inline-flex
      items-center
      gap-2
      px-4
      py-2
      rounded-full
      border
      ${styles[status].border}
      ${styles[status].bg}
      ${styles[status].text}
      text-sm
      font-semibold
      transition-all
      duration-300
      hover:scale-105
      `}
    >
      <span
        className={`
        w-2.5
        h-2.5
        rounded-full
        ${styles[status].dot}
        animate-pulse
        `}
      />

      {label || styles[status].label}
    </span>
  );
}