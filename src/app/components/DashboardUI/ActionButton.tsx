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
      className={`
      px-6
      py-3
      rounded-2xl
      font-semibold
      transition-all
      duration-300
      shadow-lg

      ${
        disabled
          ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
          : "bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white hover:shadow-[0_15px_35px_rgba(34,197,94,0.35)] hover:-translate-y-1 active:translate-y-0"
      }
      `}
    >
      {children}
    </button>
  );
}