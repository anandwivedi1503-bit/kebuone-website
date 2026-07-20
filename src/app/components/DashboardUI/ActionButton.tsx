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
      shadow-lg
        transition-all
      duration-300
      ${
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
          : "bg-gradient-to-r from-[#D6006E] via-[#FF165E] to-[#FF5556] text-white hover:shadow-2xl hover:scale-[1.02]"
      }
      `}
    >
      {children}
    </button>
  );
}