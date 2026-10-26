"use client";

import type { ImgHTMLAttributes } from "react";

import { YELLOW_SCOOTER_CUTOUT, YELLOW_SCOOTER_RIDE } from "@/lib/scooterAssets";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  /** cutout = transparent PNG for GPS/maps; ride = full yellow scooter photo */
  variant?: "cutout" | "ride";
};

const SRC = {
  cutout: YELLOW_SCOOTER_CUTOUT,
  ride: YELLOW_SCOOTER_RIDE,
} as const;

/** Yellow fleet scooter — cutout has no background; ride is full brand still. */
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
      className={`max-h-full max-w-full ${
        variant === "cutout" ? "object-contain object-center" : "object-cover object-center"
      } ${className}`}
    />
  );
}
