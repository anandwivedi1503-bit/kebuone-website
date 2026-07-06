"use client";

import { ReactNode } from "react";

type ActionButtonProps = {
  children: ReactNode;
  onClick?: () => void;
};

export default function ActionButton({
  children,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
      px-6
      py-3
      rounded-2xl
      bg-gradient-to-r
      from-[#D6006E]
      via-[#FF165E]
      to-[#FF5556]
      text-white
      font-semibold
      shadow-lg
      hover:shadow-2xl
      hover:scale-[1.02]
      transition-all
      duration-300
      "
    >
      {children}
    </button>
  );
}