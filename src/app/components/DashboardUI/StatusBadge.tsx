"use client";

type StatusBadgeProps = {
  status: "active" | "warning" | "danger" | "inactive";
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {

  const styles = {
    active: {
      bg: "bg-green-100",
      text: "text-green-700",
      dot: "bg-green-500",
      label: "ACTIVE",
    },
    warning: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      dot: "bg-yellow-500",
      label: "WARNING",
    },
    danger: {
      bg: "bg-red-100",
      text: "text-red-700",
      dot: "bg-red-500",
      label: "CRITICAL",
    },
    inactive: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      dot: "bg-gray-400",
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
      text-sm
      font-bold
      ${styles[status].bg}
      ${styles[status].text}
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

      {styles[status].label}
    </span>
  );
}