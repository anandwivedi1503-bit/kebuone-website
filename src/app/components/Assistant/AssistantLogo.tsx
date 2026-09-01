"use client";

import Image from "next/image";

/** Dashboard bike mark — keep full circle visible, never cropped. */
export default function AssistantLogo({
  size = 48,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/evuddy.jpeg"
      alt="EVUDDY"
      width={size}
      height={size}
      priority={priority}
      className={`h-full w-full rounded-full object-contain ${className}`}
    />
  );
}
