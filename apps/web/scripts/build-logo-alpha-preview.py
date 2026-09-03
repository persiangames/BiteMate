"""Build a preview alpha logo animation that keeps BiteMate + tagline intact."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
FFMPEG = Path(
    r"C:\Users\My_PC\AppData\Roaming\Python\Python311\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
)
SOURCE = ROOT / "apps/web/public/brand/logo-animation-4k.mp4"
PREVIEW = ROOT / "apps/web/public/brand/preview"
FRAMES = PREVIEW / "_frames"
KEYED = PREVIEW / "_keyed"

BG = np.array([243.0, 235.0, 218.0], dtype=np.float32)


def key_rgba(rgb: np.ndarray) -> np.ndarray:
    """Remove cream studio backdrop; keep white Bite, gradient Mate, and tagline."""
    px = rgb.astype(np.float32)
    r, g, b = px[:, :, 0], px[:, :, 1], px[:, :, 2]
    dist = np.sqrt((r - BG[0]) ** 2 + (g - BG[1]) ** 2 + (b - BG[2]) ** 2)
    sat = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
    luma = 0.2126 * r + 0.7152 * g + 0.0722 * b

    # Cream / warm floor only. White Bite has high blue (~255) so it survives.
    cream = (dist < 30) & (sat < 42) & (b < 236)
    alpha = np.where(cream, 0, 255).astype(np.uint8)

    # Tagline is black on cream — invisible on the dark login screen unless lifted.
    h = rgb.shape[0]
    lower = np.zeros(rgb.shape[:2], dtype=bool)
    lower[int(h * 0.70) :, :] = True
    tagline = lower & (luma < 55) & (sat < 28) & (alpha > 0)
    out = np.dstack((rgb, alpha))
    out[tagline, 0] = 255
    out[tagline, 1] = 255
    out[tagline, 2] = 255
    return out


def run(cmd: list[str]) -> None:
    print(">", " ".join(cmd[:8]), "...")
    subprocess.check_call(cmd)


def extract_frames() -> None:
    FRAMES.mkdir(parents=True, exist_ok=True)
    for old in FRAMES.glob("*.png"):
        old.unlink()
    run(
        [
            str(FFMPEG),
            "-y",
            "-i",
            str(SOURCE),
            "-vf",
            "scale=1920:-2:flags=lanczos",
            str(FRAMES / "f%03d.png"),
        ]
    )


def key_frames() -> None:
    KEYED.mkdir(parents=True, exist_ok=True)
    for old in KEYED.glob("*.png"):
        old.unlink()
    files = sorted(FRAMES.glob("f*.png"))
    if not files:
        raise SystemExit("No extracted frames")
    for i, path in enumerate(files, start=1):
        rgb = np.array(Image.open(path).convert("RGB"))
        rgba = key_rgba(rgb)
        Image.fromarray(rgba, "RGBA").save(KEYED / path.name, optimize=False)
        if i == 1 or i == len(files) or i % 24 == 0:
            print(f"keyed {i}/{len(files)}")
    last = Image.open(KEYED / files[-1].name)
    last.save(PREVIEW / "logo-intro-last-frame.png")
    # Dark-bg still for easy preview
    dark = Image.new("RGBA", last.size, (18, 16, 22, 255))
    Image.alpha_composite(dark, last.convert("RGBA")).convert("RGB").save(
        PREVIEW / "logo-intro-last-frame-dark.jpg", quality=92
    )


def encode() -> None:
    webm = PREVIEW / "logo-intro-alpha-preview.webm"
    webp = PREVIEW / "logo-intro-alpha-preview.webp"
    checker = PREVIEW / "logo-intro-preview-dark.mp4"
    run(
        [
            str(FFMPEG),
            "-y",
            "-framerate",
            "24",
            "-i",
            str(KEYED / "f%03d.png"),
            "-c:v",
            "libvpx-vp9",
            "-pix_fmt",
            "yuva420p",
            "-crf",
            "18",
            "-b:v",
            "0",
            "-row-mt",
            "1",
            "-deadline",
            "good",
            "-cpu-used",
            "2",
            "-auto-alt-ref",
            "0",
            "-an",
            str(webm),
        ]
    )
    # Animated WebP for Safari / iPhone preview
    try:
        run(
            [
                str(FFMPEG),
                "-y",
                "-framerate",
                "24",
                "-i",
                str(KEYED / "f%03d.png"),
                "-c:v",
                "libwebp",
                "-lossless",
                "0",
                "-q:v",
                "78",
                "-loop",
                "0",
                "-an",
                str(webp),
            ]
        )
    except subprocess.CalledProcessError:
        print("webp encode skipped", file=sys.stderr)
    run(
        [
            str(FFMPEG),
            "-y",
            "-framerate",
            "24",
            "-i",
            str(KEYED / "f%03d.png"),
            "-f",
            "lavfi",
            "-i",
            "color=c=0x121016:s=1920x1080:r=24:d=4",
            "-filter_complex",
            "[1][0]overlay=format=auto",
            "-c:v",
            "libx264",
            "-crf",
            "18",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            "-an",
            "-t",
            "4",
            str(checker),
        ]
    )


def write_html() -> None:
    html = PREVIEW / "index.html"
    html.write_text(
        """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>BiteMate logo intro preview</title>
    <style>
      body { margin: 0; background: #121016; color: #f4efe6; font-family: Georgia, serif; }
      main { max-width: 960px; margin: 0 auto; padding: 24px 16px 64px; }
      h1 { font-weight: 500; font-size: 1.4rem; }
      p { opacity: 0.8; line-height: 1.5; }
      video, img { width: 100%; height: auto; background: transparent; }
      .panel { margin: 28px 0; padding: 16px; border: 1px solid rgba(255,255,255,.12); border-radius: 16px; }
    </style>
  </head>
  <body>
    <main>
      <h1>Logo intro preview (transparent)</h1>
      <p>Same 4K sequence. Cream studio background removed. Full BiteMate + tagline kept.</p>
      <div class="panel">
        <p>WebM alpha (Chrome / Edge / Firefox / Android)</p>
        <video src="logo-intro-alpha-preview.webm" autoplay loop muted playsinline></video>
      </div>
      <div class="panel">
        <p>Dark composite MP4 (easy to play anywhere)</p>
        <video src="logo-intro-preview-dark.mp4" autoplay loop muted playsinline controls></video>
      </div>
      <div class="panel">
        <p>Last frame on dark</p>
        <img src="logo-intro-last-frame-dark.jpg" alt="Last frame" />
      </div>
    </main>
  </body>
</html>
""",
        encoding="utf-8",
    )


if __name__ == "__main__":
    PREVIEW.mkdir(parents=True, exist_ok=True)
    extract_frames()
    key_frames()
    encode()
    write_html()
    print("Preview ready in", PREVIEW)
