#!/usr/bin/env python3
"""Generate favicon.ico and app icons from the EVUDDY app mark."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "evuddy.jpeg"
APP = ROOT / "src" / "app"
PUBLIC = ROOT / "public"
BRAND = PUBLIC / "brand"
EMBLEM = BRAND / "evuddy-app-emblem.png"
MASTER = BRAND / "evuddy-app-icon.png"

# Crop: E + zigzag + scooter only (no wordmark — stays sharp under 32px)
EMBLEM_BOX = (0.12, 0.06, 0.88, 0.50)


def load_source() -> Image.Image:
    return Image.open(SRC).convert("RGBA")


def crop_emblem(im: Image.Image) -> Image.Image:
    w, h = im.size
    x1, y1, x2, y2 = EMBLEM_BOX
    return im.crop((int(w * x1), int(h * y1), int(w * x2), int(h * y2)))


def square_icon(
    im: Image.Image,
    size: int,
    *,
    padding: float = 0.06,
    sharpen: bool = False,
    saturate: float = 1.0,
) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    inner = int(size * (1 - 2 * padding))
    scale = min(inner / im.size[0], inner / im.size[1])
    nw = max(1, int(im.size[0] * scale))
    nh = max(1, int(im.size[1] * scale))
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    if saturate != 1.0:
        resized = ImageEnhance.Color(resized).enhance(saturate)
        resized = ImageEnhance.Contrast(resized).enhance(1.08)
    if sharpen:
        resized = resized.filter(ImageFilter.UnsharpMask(radius=0.9, percent=200, threshold=1))
    canvas.paste(resized, ((size - nw) // 2, (size - nh) // 2), resized)
    return canvas


def square_circle_logo(im: Image.Image, size: int, padding: float = 0.04) -> Image.Image:
    w, h = im.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    mark = im.crop((left, top, left + side, top + side))
    return square_icon(mark, size, padding=padding, sharpen=size <= 48, saturate=1.12)


def save_ico(frames: list[Image.Image], path: Path) -> None:
    ordered = sorted(frames, key=lambda img: img.size[0], reverse=True)
    sizes = [(img.size[0], img.size[1]) for img in ordered]
    ordered[0].save(
        path,
        format="ICO",
        sizes=sizes,
        append_images=ordered[1:],
    )


def main() -> None:
    BRAND.mkdir(parents=True, exist_ok=True)
    src = load_source()
    src.save(MASTER, "PNG", optimize=True)
    emblem = crop_emblem(src)
    emblem.save(EMBLEM, "PNG", optimize=True)

    small_sizes = [16, 32, 48]
    large_sizes = [64, 128, 256]
    ico_frames = [square_icon(emblem, s, padding=0.04, sharpen=True, saturate=1.2) for s in small_sizes]
    ico_frames += [square_circle_logo(src, s) for s in large_sizes]
    save_ico(ico_frames, APP / "favicon.ico")

    # Browsers use app/icon.png for tabs — keep it small + emblem-only (not the full 512 logo).
    square_icon(emblem, 32, padding=0.04, sharpen=True, saturate=1.2).save(
        APP / "icon.png", "PNG", optimize=True
    )
    square_circle_logo(src, 180).save(APP / "apple-icon.png", "PNG", optimize=True)
    square_circle_logo(src, 192).save(PUBLIC / "icon-192.png", "PNG", optimize=True)
    square_circle_logo(src, 512).save(PUBLIC / "icon-512.png", "PNG", optimize=True)

    print("Wrote site icons:", APP / "favicon.ico", f"({len(ico_frames)} sizes)")


if __name__ == "__main__":
    main()