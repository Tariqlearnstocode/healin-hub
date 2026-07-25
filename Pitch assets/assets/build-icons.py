"""Generate The Healin Hub favicon set from the simplified brand mark.

Design space is 240x240 (same as assets/mark.svg):
  plum disc -> teal rim -> white geometric H.
The full globe mark loses its crossbar and hairlines below ~32px, so small
sizes use this reduced mark instead. Keep this in sync with icon.svg.
"""
from PIL import Image, ImageDraw

PLUM = (74, 26, 61, 255)    # --plum-700 #4A1A3D
TEAL = (46, 140, 155, 255)  # --teal-500 #2E8C9B
WHITE = (255, 255, 255, 255)

DISC_R = 120
RING_R, RING_W = 112, 15
BARS = [
    (78, 64, 100, 176),   # left stem
    (140, 64, 162, 176),  # right stem
    (78, 109, 162, 131),  # crossbar
]

SS = 8


def render(size, square=False):
    n = size * SS
    k = n / 240.0
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    box = lambda x0, y0, x1, y1: [x0 * k, y0 * k, x1 * k, y1 * k]

    if square:
        d.rectangle([0, 0, n, n], fill=PLUM)
    else:
        d.ellipse(box(0, 0, 240, 240), fill=PLUM)
    d.ellipse(
        box(120 - RING_R, 120 - RING_R, 120 + RING_R, 120 + RING_R),
        outline=TEAL,
        width=round(RING_W * k),
    )
    for b in BARS:
        d.rectangle(box(*b), fill=WHITE)
    return img.resize((size, size), Image.LANCZOS)


def write_set(app_dir, pitch_dir):
    # Pillow drops any requested ICO size larger than the base image, and
    # downscales the rest itself — so hand it the biggest render as the base
    # and append our own supersampled 16/32 so the small sizes stay crisp.
    base = render(48)
    extra = [render(16), render(32)]
    for target in (f"{app_dir}/favicon.ico", f"{pitch_dir}/favicon.ico"):
        base.save(target, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)],
                  append_images=extra)
    render(180, square=True).save(f"{app_dir}/apple-icon.png")
    render(180, square=True).save(f"{pitch_dir}/apple-touch-icon.png")


if __name__ == "__main__":
    import sys
    write_set(sys.argv[1], sys.argv[2])
    print("wrote favicon.ico (16/32/48) + apple touch icons")
