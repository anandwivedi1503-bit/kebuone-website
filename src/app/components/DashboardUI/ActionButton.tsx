"use client";

import { ReactNode } from "react";

type ActionButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export default function ActionButton({
  children,
  onClick,
  disabled = false,
  type = "button",
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`h-10 rounded-xl px-4 text-sm font-bold transition ${
        disabled
          ? "cursor-not-allowed bg-slate-200 text-slate-500"
          : "bg-emerald-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-[0_10px_28px_rgba(16,185,129,0.45)]"
      }`}
    >
      {children}
    </button>
  );
}
