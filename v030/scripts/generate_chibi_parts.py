#!/usr/bin/env python3
"""Generate replaceable, transparent placeholder layers for the SARiNA chibi prototype.

The art is intentionally simple and original. Each part is drawn on the same 512x512
coordinate system with the same origin and is exported as a transparent PNG. The game
runtime consumes the PNG files directly; Pillow is needed only to regenerate placeholders.
"""

from __future__ import annotations

from pathlib import Path
from typing import Callable

from PIL import Image, ImageDraw
import json

CANVAS = 512
SCALE = 3
OUT = Path(__file__).resolve().parents[1] / "public/assets/chibi/sarina/parts"

INK = "#2A2228"
HAIR = "#392F38"
HAIR_DARK = "#28232B"
HAIR_HI = "#75616D"
SKIN = "#FFE0C9"
SKIN_SHADE = "#F1B99A"
BLUSH = "#F6A9A7"
EYE = "#5A3E3C"
EYE_HI = "#A57954"
JACKET = "#191A22"
JACKET_HI = "#30313D"
SEAM = "#B8BCC8"
MINT = "#69E09A"
MINT_DARK = "#2B9A6B"
WHITE = "#F8F4EE"
SWEAT = "#9FE6F7"


def scale_point(point: tuple[float, float]) -> tuple[int, int]:
    return round(point[0] * SCALE), round(point[1] * SCALE)


class Layer:
    def __init__(self, image: Image.Image):
        self.image = image
        self.draw = ImageDraw.Draw(image)

    def ellipse(self, box, fill=None, outline=None, width=1):
        scaled = tuple(round(value * SCALE) for value in box)
        self.draw.ellipse(scaled, fill=fill, outline=outline, width=max(1, round(width * SCALE)))

    def rectangle(self, box, fill=None, outline=None, width=1):
        scaled = tuple(round(value * SCALE) for value in box)
        self.draw.rectangle(scaled, fill=fill, outline=outline, width=max(1, round(width * SCALE)))

    def polygon(self, points, fill=None, outline=None, width=1):
        scaled = [scale_point(point) for point in points]
        self.draw.polygon(scaled, fill=fill)
        if outline:
            self.draw.line(scaled + [scaled[0]], fill=outline, width=max(1, round(width * SCALE)), joint="curve")

    def line(self, points, fill, width=2):
        scaled = [scale_point(point) for point in points]
        self.draw.line(scaled, fill=fill, width=max(1, round(width * SCALE)), joint="curve")

    def cubic(self, p0, p1, p2, p3, fill, width=3):
        points = []
        steps = 28
        for index in range(steps + 1):
            t = index / steps
            one = 1 - t
            x = one**3 * p0[0] + 3 * one**2 * t * p1[0] + 3 * one * t**2 * p2[0] + t**3 * p3[0]
            y = one**3 * p0[1] + 3 * one**2 * t * p1[1] + 3 * one * t**2 * p2[1] + t**3 * p3[1]
            points.append((x, y))
        self.line(points, fill, width)


def chain(segments, steps=28):
    result = []
    for p0, p1, p2, p3 in segments:
        for index in range(steps + 1):
            if result and index == 0:
                continue
            t = index / steps
            one = 1 - t
            x = one**3 * p0[0] + 3 * one**2 * t * p1[0] + 3 * one * t**2 * p2[0] + t**3 * p3[0]
            y = one**3 * p0[1] + 3 * one**2 * t * p1[1] + 3 * one * t**2 * p2[1] + t**3 * p3[1]
            result.append((x, y))
    return result


def shape(layer: Layer, segments, fill, outline=INK, width=5):
    points = chain(segments)
    layer.polygon(points, fill=fill, outline=outline, width=width)


def draw_body(c: Layer):
    # Neck and collar sit below the face; the head layer covers their top edge.
    c.polygon([(229, 280), (283, 280), (289, 338), (222, 338)], SKIN, INK, 5)
    # Small jacket silhouette and a skirt keep the full-body chibi readable at card size.
    shape(c, [
        ((184, 320), (199, 306), (221, 302), (239, 304)),
        ((239, 304), (255, 314), (269, 314), (283, 304)),
        ((283, 304), (308, 305), (326, 315), (339, 336)),
        ((339, 336), (345, 381), (333, 421), (331, 451)),
        ((331, 451), (291, 466), (216, 466), (177, 451)),
        ((177, 451), (175, 405), (170, 353), (184, 320)),
    ], JACKET, INK, 6)
    # Bright inner shirt and mint tie/zipper accent.
    shape(c, [
        ((226, 313), (235, 310), (245, 313), (255, 330)),
        ((255, 330), (267, 313), (277, 310), (286, 315)),
        ((286, 315), (279, 348), (269, 364), (255, 372)),
        ((255, 372), (240, 362), (231, 344), (226, 313)),
    ], WHITE, INK, 3)
    c.polygon([(249, 322), (262, 322), (260, 368), (253, 368)], MINT, MINT_DARK, 2)
    # Jacket lapels, seams and a tiny green badge.
    c.polygon([(194, 321), (228, 313), (250, 359), (224, 384), (204, 355)], JACKET_HI, INK, 4)
    c.polygon([(316, 323), (284, 313), (262, 359), (286, 384), (307, 354)], JACKET_HI, INK, 4)
    c.line([(203, 335), (222, 360), (240, 371)], SEAM, 2)
    c.line([(307, 335), (288, 360), (271, 371)], SEAM, 2)
    c.ellipse((300, 341, 314, 355), fill=MINT, outline=WHITE, width=2)
    c.ellipse((244, 389, 266, 411), fill=JACKET_HI, outline=SEAM, width=2)
    c.ellipse((250, 395, 260, 405), fill=MINT)
    # Pleated black skirt.
    shape(c, [
        ((187, 427), (213, 437), (297, 437), (323, 427)),
        ((323, 427), (330, 448), (338, 470), (342, 483)),
        ((342, 483), (294, 497), (220, 497), (168, 483)),
        ((168, 483), (175, 463), (181, 444), (187, 427)),
    ], JACKET, INK, 5)
    for x in (198, 225, 255, 285, 312):
        c.line([(255, 443), (x, 482)], JACKET_HI, 3)
    # Short legs and rounded boots share the fixed bottom anchor.
    c.polygon([(215, 486), (243, 486), (240, 507), (219, 507)], SKIN, INK, 3)
    c.polygon([(269, 486), (297, 486), (293, 507), (272, 507)], SKIN, INK, 3)
    c.ellipse((208, 494, 246, 512), fill=JACKET, outline=INK, width=3)
    c.ellipse((266, 494, 304, 512), fill=JACKET, outline=INK, width=3)
    c.line([(215, 501), (238, 501)], SEAM, 2)
    c.line([(273, 501), (296, 501)], SEAM, 2)


def draw_arm_left(c: Layer):
    shape(c, [
        ((197, 328), (183, 320), (165, 326), (157, 341)),
        ((157, 341), (146, 361), (139, 389), (148, 406)),
        ((148, 406), (157, 416), (177, 413), (185, 401)),
        ((185, 401), (197, 380), (209, 350), (212, 339)),
        ((212, 339), (208, 333), (203, 330), (197, 328)),
    ], JACKET_HI, INK, 5)
    c.line([(158, 365), (177, 373), (190, 368)], SEAM, 3)
    c.ellipse((149, 396, 177, 421), fill=SKIN, outline=INK, width=4)
    c.line([(158, 405), (170, 408)], SKIN_SHADE, 2)


def draw_arm_right(c: Layer):
    shape(c, [
        ((314, 328), (329, 320), (347, 326), (355, 341)),
        ((355, 341), (366, 361), (373, 389), (364, 406)),
        ((364, 406), (355, 416), (335, 413), (327, 401)),
        ((327, 401), (315, 380), (303, 350), (300, 339)),
        ((300, 339), (304, 333), (308, 330), (314, 328)),
    ], JACKET_HI, INK, 5)
    c.line([(354, 365), (335, 373), (322, 368)], SEAM, 3)
    c.ellipse((335, 396, 363, 421), fill=SKIN, outline=INK, width=4)
    c.line([(342, 405), (354, 408)], SKIN_SHADE, 2)


def draw_hair_back(c: Layer):
    # Tied-back dark hair and side locks, visible around the face silhouette.
    c.ellipse((157, 51, 355, 280), fill=HAIR_DARK, outline=INK, width=5)
    shape(c, [
        ((293, 92), (326, 39), (386, 48), (380, 104)),
        ((380, 104), (379, 137), (359, 158), (336, 170)),
        ((336, 170), (326, 151), (315, 126), (293, 92)),
    ], HAIR, INK, 5)
    shape(c, [
        ((175, 128), (146, 155), (136, 206), (151, 259)),
        ((151, 259), (158, 284), (169, 300), (180, 305)),
        ((180, 305), (183, 265), (177, 216), (191, 178)),
        ((191, 178), (183, 157), (177, 141), (175, 128)),
    ], HAIR, INK, 4)
    shape(c, [
        ((340, 130), (370, 157), (378, 207), (360, 257)),
        ((360, 257), (354, 278), (345, 295), (334, 300)),
        ((334, 300), (331, 261), (336, 219), (325, 178)),
        ((325, 178), (333, 157), (338, 141), (340, 130)),
    ], HAIR, INK, 4)
    c.cubic((183, 91), (213, 53), (280, 51), (322, 91), HAIR_HI, 3)
    c.cubic((354, 71), (369, 76), (372, 96), (363, 118), HAIR_HI, 3)
    c.cubic((157, 202), (158, 236), (166, 261), (176, 279), HAIR_HI, 3)
    c.cubic((365, 201), (363, 232), (352, 261), (342, 279), HAIR_HI, 3)


def draw_head_base(c: Layer):
    # Ears and face are deliberately oversized for a lively, readable chibi silhouette.
    c.ellipse((151, 164, 191, 221), fill=SKIN, outline=INK, width=4)
    c.ellipse((321, 164, 361, 221), fill=SKIN, outline=INK, width=4)
    c.ellipse((162, 87, 350, 297), fill=SKIN, outline=INK, width=5)
    c.ellipse((178, 225, 221, 245), fill=BLUSH)
    c.ellipse((291, 225, 334, 245), fill=BLUSH)
    c.ellipse((251, 213, 258, 220), fill=SKIN_SHADE)


def draw_hair_front(c: Layer):
    shape(c, [
        ((166, 171), (157, 128), (166, 91), (195, 74)),
        ((195, 74), (212, 63), (228, 70), (238, 99)),
        ((238, 99), (248, 74), (264, 62), (279, 81)),
        ((279, 81), (290, 96), (285, 111), (292, 132)),
        ((292, 132), (305, 101), (321, 86), (333, 103)),
        ((333, 103), (351, 124), (346, 151), (337, 173)),
        ((337, 173), (319, 154), (314, 142), (303, 152)),
        ((303, 152), (291, 166), (284, 150), (278, 138)),
        ((278, 138), (267, 161), (250, 159), (242, 143)),
        ((242, 143), (229, 167), (211, 161), (203, 145)),
        ((203, 145), (190, 165), (178, 169), (166, 171)),
    ], HAIR, INK, 4)
    c.cubic((184, 105), (204, 83), (214, 85), (225, 119), HAIR_HI, 2)
    c.cubic((255, 85), (267, 84), (275, 104), (276, 126), HAIR_HI, 2)
    # SARiNA's recognizable member color is a simple mint-green hair clip.
    c.polygon([(326, 110), (346, 117), (340, 133), (320, 127)], MINT, MINT_DARK, 3)
    c.line([(326, 113), (340, 129)], WHITE, 2)


def draw_eye_left_open(c: Layer):
    c.ellipse((204, 178, 243, 216), fill=WHITE, outline=INK, width=3)
    c.ellipse((212, 183, 238, 215), fill=EYE, outline=INK, width=2)
    c.ellipse((218, 191, 236, 215), fill=EYE_HI)
    c.ellipse((216, 185, 225, 195), fill=WHITE)
    c.ellipse((230, 200, 234, 205), fill=WHITE)
    c.cubic((203, 190), (210, 174), (229, 171), (244, 187), INK, 4)


def draw_eye_right_open(c: Layer):
    c.ellipse((269, 178, 308, 216), fill=WHITE, outline=INK, width=3)
    c.ellipse((274, 183, 300, 215), fill=EYE, outline=INK, width=2)
    c.ellipse((276, 191, 294, 215), fill=EYE_HI)
    c.ellipse((277, 185, 286, 195), fill=WHITE)
    c.ellipse((291, 200, 295, 205), fill=WHITE)
    c.cubic((268, 187), (281, 171), (300, 174), (309, 190), INK, 4)


def draw_eye_left_closed(c: Layer):
    c.cubic((204, 199), (215, 211), (232, 211), (243, 197), INK, 5)
    c.cubic((210, 205), (220, 210), (231, 208), (237, 203), HAIR_HI, 1)


def draw_eye_right_closed(c: Layer):
    c.cubic((269, 197), (280, 211), (297, 211), (308, 199), INK, 5)
    c.cubic((275, 203), (285, 208), (296, 210), (302, 205), HAIR_HI, 1)


def draw_brow_normal(c: Layer):
    c.cubic((205, 167), (216, 160), (232, 160), (242, 165), INK, 4)
    c.cubic((270, 165), (281, 160), (297, 160), (307, 167), INK, 4)


def draw_brow_happy(c: Layer):
    c.cubic((205, 169), (215, 156), (232, 156), (243, 166), INK, 4)
    c.cubic((269, 166), (280, 156), (297, 156), (307, 169), INK, 4)


def draw_brow_troubled(c: Layer):
    c.cubic((205, 164), (217, 168), (231, 176), (243, 180), INK, 4)
    c.cubic((269, 180), (281, 176), (295, 168), (307, 164), INK, 4)


def mouth_open(c: Layer, width: int, height: int, tongue: bool = False):
    x0 = 256 - width // 2
    y0 = 231
    c.ellipse((x0, y0, x0 + width, y0 + height), fill="#532D35", outline=INK, width=3)
    if tongue:
        c.ellipse((x0 + width * 0.25, y0 + height * 0.62, x0 + width * 0.75, y0 + height * 0.98), fill="#F18A9D")


def draw_mouth_1(c: Layer):
    mouth_open(c, 17, 19)


def draw_mouth_2(c: Layer):
    mouth_open(c, 27, 27, True)


def draw_mouth_3(c: Layer):
    mouth_open(c, 21, 31, True)


def draw_mouth_smile(c: Layer):
    c.cubic((239, 239), (247, 253), (267, 253), (275, 239), INK, 4)
    c.cubic((244, 242), (252, 249), (263, 249), (271, 242), "#A64E5A", 2)


def draw_mouth_troubled(c: Layer):
    c.cubic((240, 247), (247, 236), (265, 236), (273, 247), INK, 4)
    c.cubic((242, 251), (252, 246), (263, 246), (271, 251), SKIN_SHADE, 2)


def draw_sweat(c: Layer):
    # Detached, high-contrast drop; CSS reveals it only in troubled state.
    shape(c, [
        ((367, 138), (362, 149), (352, 157), (353, 168)),
        ((353, 168), (354, 180), (365, 186), (374, 179)),
        ((374, 179), (384, 170), (376, 154), (367, 138)),
    ], SWEAT, "#496577", 3)
    c.ellipse((359, 170, 363, 175), fill=WHITE)


def draw_sparkle(c: Layer):
    # Two little hand-drawn starbursts, shown briefly on happy/tap.
    c.polygon([(377, 107), (382, 120), (396, 124), (382, 128), (377, 142), (372, 128), (359, 124), (372, 120)], MINT, WHITE, 2)
    c.polygon([(144, 202), (147, 209), (155, 212), (147, 215), (144, 223), (141, 215), (133, 212), (141, 209)], WHITE, MINT_DARK, 2)


PART_DRAWERS: dict[str, Callable[[Layer], None]] = {
    "body": draw_body,
    "arm_left": draw_arm_left,
    "arm_right": draw_arm_right,
    "hair_back": draw_hair_back,
    "head_base": draw_head_base,
    "eye_left_open": draw_eye_left_open,
    "eye_right_open": draw_eye_right_open,
    "eye_left_closed": draw_eye_left_closed,
    "eye_right_closed": draw_eye_right_closed,
    "brow_normal": draw_brow_normal,
    "brow_happy": draw_brow_happy,
    "brow_troubled": draw_brow_troubled,
    "mouth_1": draw_mouth_1,
    "mouth_2": draw_mouth_2,
    "mouth_3": draw_mouth_3,
    "mouth_smile": draw_mouth_smile,
    "mouth_troubled": draw_mouth_troubled,
    "hair_front": draw_hair_front,
    "effect_sparkle": draw_sparkle,
    "effect_sweat": draw_sweat,
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, draw_part in PART_DRAWERS.items():
        image = Image.new("RGBA", (CANVAS * SCALE, CANVAS * SCALE), (0, 0, 0, 0))
        draw_part(Layer(image))
        image = image.resize((CANVAS, CANVAS), Image.Resampling.LANCZOS)
        image.save(OUT / f"{name}.png", format="PNG", optimize=True)
    manifest = {
        "schemaVersion": 1,
        "character": "sarina",
        "canvas": {"width": CANVAS, "height": CANVAS, "format": "RGBA PNG", "transparentBackground": True},
        "anchor": {"x": 256, "y": 512, "description": "bottom-center foot anchor; do not trim transparent margins"},
        "headCenter": {"x": 256, "y": 192},
        "partsBackToFront": [f"{name}.png" for name in PART_DRAWERS],
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {len(PART_DRAWERS)} aligned transparent PNG layers in {OUT}")


if __name__ == "__main__":
    main()
