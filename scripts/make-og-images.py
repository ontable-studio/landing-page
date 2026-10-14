"""Makes the 1200x630 social preview images in public/og/.

Run by hand when the project covers or the logo change (it is not part of the build):

    python -I scripts/make-og-images.py .

Needs Pillow. Reads the project covers from public/images/projects/<slug>/01-title.webp
and the white OnTable wordmark from .resources/ (kept out of git); without the wordmark
it falls back to the app icon.
"""
import sys
from pathlib import Path

from PIL import Image

WIDTH, HEIGHT = 1200, 630
BRAND_ORANGE = (245, 97, 31)  # --color-orange-500, #f5611f

root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
out_dir = root / "public" / "og"
out_dir.mkdir(parents=True, exist_ok=True)


def save(image: Image.Image, name: str) -> None:
    path = out_dir / f"{name}.jpg"
    image.convert("RGB").save(path, "JPEG", quality=85, optimize=True, progressive=True)
    print(f"{path.relative_to(root)}  {path.stat().st_size // 1024} KB")


def cover(path: Path) -> Image.Image:
    """Scales a cover up to the card width and crops it to the card height around the middle."""
    with Image.open(path) as source:
        scale = WIDTH / source.width
        scaled = source.convert("RGB").resize(
            (WIDTH, round(source.height * scale)), Image.LANCZOS
        )
    top = max(0, (scaled.height - HEIGHT) // 2)
    return scaled.crop((0, top, WIDTH, top + HEIGHT))


def default_card() -> Image.Image:
    card = Image.new("RGB", (WIDTH, HEIGHT), BRAND_ORANGE)
    wordmark_path = root / ".resources" / "new logo" / "ontable logo transparent.png"
    mark_path = wordmark_path if wordmark_path.exists() else root / "public" / "web-app-manifest-512x512.png"
    with Image.open(mark_path) as mark:
        mark = mark.convert("RGBA")
        target_width = 760 if mark_path == wordmark_path else 360
        mark = mark.resize((target_width, round(mark.height * target_width / mark.width)), Image.LANCZOS)
    card.paste(mark, ((WIDTH - mark.width) // 2, (HEIGHT - mark.height) // 2), mark)
    return card


save(default_card(), "default")
for folder in sorted((root / "public" / "images" / "projects").iterdir()):
    source = folder / "01-title.webp"
    if source.exists():
        save(cover(source), folder.name)
