"use client";

import { useEffect, useState } from "react";

const CANDIDATES = [
  "/evuddy-side.png",
  "/evuddy-scooter-cutout.png",
  "/evuddy-scooter.png",
];

function stripStudioBackground(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.drawImage(image, 0, 0);
  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = frame;

  const isBg = (i: number) => {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return lum >= 228 && mx - mn <= 32;
  };

  const seen = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x += 1) {
    stack.push(x, x + (height - 1) * width);
  }
  for (let y = 0; y < height; y += 1) {
    stack.push(y * width, width - 1 + y * width);
  }

  while (stack.length) {
    const p = stack.pop() as number;
    if (p < 0 || p >= width * height || seen[p]) continue;
    seen[p] = 1;
    const i = p * 4;
    if (!isBg(i)) continue;
    data[i + 3] = 0;
    const x = p % width;
    const y = (p / width) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - width);
    if (y < height - 1) stack.push(p + width);
  }

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] === 0) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  ctx.putImageData(frame, 0, 0);
  if (maxX <= minX || maxY <= minY) return canvas.toDataURL("image/png");

  const pad = 4;
  const cut = document.createElement("canvas");
  cut.width = maxX - minX + 1 + pad * 2;
  cut.height = maxY - minY + 1 + pad * 2;
  const cutCtx = cut.getContext("2d");
  if (!cutCtx) return canvas.toDataURL("image/png");
  cutCtx.drawImage(
    canvas,
    minX,
    minY,
    maxX - minX + 1,
    maxY - minY + 1,
    pad,
    pad,
    maxX - minX + 1,
    maxY - minY + 1
  );
  return cut.toDataURL("image/png");
}

export function useEvuddySideSrc() {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = (index: number) => {
      if (index >= CANDIDATES.length) return;
      const image = new Image();
      image.onload = () => {
        if (cancelled) return;
        setSrc(CANDIDATES[index]);
        try {
          const stripped = stripStudioBackground(image);
          if (stripped) setSrc(stripped);
        } catch {
          /* keep the file URL */
        }
      };
      image.onerror = () => load(index + 1);
      image.src = CANDIDATES[index];
    };

    load(0);
    return () => {
      cancelled = true;
    };
  }, []);

  return src;
}
