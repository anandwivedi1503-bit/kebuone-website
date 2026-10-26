"use client";

import type { ImgHTMLAttributes } from "react";

import { YELLOW_SCOOTER_CUTOUT } from "@/lib/scooterAssets";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  variant?: "cutout" | "side" | "product";
};

const SRC = {
  cutout: YELLOW_SCOOTER_CUTOUT,
  side: "/evuddy-side.png",
  product: "/evuddy-scooter.png",
} as const;

/** Yellow fleet scooter — always object-contain so nothing is cropped on mobile. */
export default function YellowScooterImg({
  variant = "cutout",
  className = "",
  alt = "EVUDDY yellow electric scooter",
  ...props
}: Props) {
  return (
    <img
      {...props}
      src={SRC[variant]}
      alt={alt}
      loading={props.loading ?? "lazy"}
      decoding="async"
      draggable={false}
      className={`max-h-full max-w-full object-contain object-center ${className}`}
    />
  );
}
