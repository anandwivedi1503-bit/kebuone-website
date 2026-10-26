"use client";

import type { ImgHTMLAttributes } from "react";

import { BRAND_SCOOTER_PHOTO } from "@/lib/scooterAssets";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  variant?: "cutout" | "side" | "product";
};

const SRC = {
  cutout: BRAND_SCOOTER_PHOTO,
  side: BRAND_SCOOTER_PHOTO,
  product: BRAND_SCOOTER_PHOTO,
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
