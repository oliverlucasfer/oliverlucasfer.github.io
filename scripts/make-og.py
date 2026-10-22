from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
OUT = Path(__file__).resolve().parent.parent / "media" / "og-cover.png"
BG = "#0D1117"
GRID = "#161B22"
BORDER = "#30363D"
TEXT = "#E6EDF3"
MUTED = "#8B949E"
ACCENT = "#58A6FF"
STRONG = "#1F6FEB"
OK = "#3FB950"

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# grade sutil
for x in range(0, W, 40):
    draw.line([(x, 0), (x, H)], fill=GRID, width=1)
for y in range(0, H, 40):
    draw.line([(0, y), (W, y)], fill=GRID, width=1)

bold_candidates = [
    r"C:\Windows\Fonts\segoeuib.ttf",
    r"C:\Windows\Fonts\arialbd.ttf",
]
mono_candidates = [
    r"C:\Windows\Fonts\consola.ttf",
    r"C:\Windows\Fonts\cour.ttf",
]

def load(paths, size):
    for candidate in paths:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()

name_font = load(bold_candidates, 78)
label_font = load(mono_candidates, 15)
terminal_font = load(mono_candidates, 17)

# marca
draw.rectangle((72, 150, 112, 154), fill=STRONG)
draw.text((72, 196), "Lucas", font=name_font, fill=TEXT)
draw.text((72, 278), "Oliveira", font=name_font, fill=ACCENT)
draw.text((74, 392), "FULL STACK DEVELOPER", font=label_font, fill=MUTED)

# terminal
tx, ty, tw, th = 690, 176, 438, 278
draw.rounded_rectangle((tx, ty, tx + tw, ty + th), radius=8, fill="#010409", outline=BORDER, width=1)
draw.rounded_rectangle((tx, ty, tx + tw, ty + 34), radius=8, fill="#161B22", outline=BORDER, width=1)
draw.rectangle((tx, ty + 24, tx + tw, ty + 34), fill="#161B22")
for i, color in enumerate(["#484F58", "#484F58", "#484F58"]):
    cx = tx + 16 + i * 14
    draw.ellipse((cx, ty + 13, cx + 8, ty + 21), fill=color)
draw.text((tx + 66, ty + 10), "lucas@portfolio: ~", font=label_font, fill=MUTED)

lines = [
    ("$ node build.mjs", TEXT),
    ("OK  dist/", OK),
    ("$ git push origin master", TEXT),
    ("OK  deploy", OK),
]
for i, (line, color) in enumerate(lines):
    draw.text((tx + 18, ty + 58 + i * 46), line, font=terminal_font, fill=color)

draw.text((tx + 18, ty + 244), ">_", font=terminal_font, fill=ACCENT)

OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, "PNG", optimize=True)
print(OUT, img.size, OUT.stat().st_size)
