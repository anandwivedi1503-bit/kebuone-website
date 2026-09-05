import type { ImgHTMLAttributes } from "react";

type HomeImgProps = ImgHTMLAttributes<HTMLImageElement> & {
  priority?: boolean;
};

/** Homepage stills are 2–3MB PNGs — never make the browser fetch off-screen ones first. */
export default function HomeImg({
  priority = false,
  alt = "",
  ...props
}: HomeImgProps) {
  return (
    <img
      {...props}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "low"}
    />
  );
}
