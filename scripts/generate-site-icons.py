#!/usr/bin/env python3
"""Generate site icons from the EVUDDY Android launcher (yellow E + bolt)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
# Source of truth: Flutter/Android app home-screen icon (matches Play Store / phone).
SRC = ROOT / "public" / "brand" / "evuddy-android-launcher.png"
APP = ROOT / "src" / "app"
PUBLIC = ROOT / "public"


def load_source() -> Image.Image:
    if not SRC.is_file():
        raise SystemExit(f"Missing launcher icon: {SRC}")
    return Image.open(SRC).convert("RGBA")


def fit_square(im: Image.Image, size: int) -> Image.Image:
    """Uniform scale — full icon visible, never cropped (Gmail-style tab icon)."""
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    scale = min(size / im.size[0], size / im.size[1])
    nw = max(1, round(im.size[0] * scale))
    nh = max(1, round(im.size[1] * scale))
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(resized, ((size - nw) // 2, (size - nh) // 2), resized)
    return canvas


def save_ico(frames: list[Image.Image], path: Path) -> None:
    ordered = sorted(frames, key=lambda img: img.size[0], reverse=True)
    sizes = [(img.size[0], img.size[1]) for img in ordered]
    ordered[0].save(path, format="ICO", sizes=sizes, append_images=ordered[1:])


def main() -> None:
    src = load_source()
    ico_sizes = [16, 32, 48, 64, 128, 256]
    frames = [fit_square(src, s) for s in ico_sizes]
    save_ico(frames, APP / "favicon.ico")

    for size, path in (
        (32, APP / "icon.png"),
        (180, APP / "apple-icon.png"),
        (192, PUBLIC / "icon-192.png"),
        (512, PUBLIC / "icon-512.png"),
    ):
        fit_square(src, size).save(path, "PNG", optimize=True)

    print("Wrote icons from", SRC.name, "—", len(ico_sizes), "favicon layers")


if __name__ == "__main__":
    main()