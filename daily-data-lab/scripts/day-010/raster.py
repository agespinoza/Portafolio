"""Day 010 · Falchi et al. (2016) World Atlas 2015 → small web images and point samples.

Input: raw/day-010-dark-skies/falchi/World_Atlas_2015.tif (GFZ Data Services, doi:10.5880/GFZ.1.4.2016.001,
CC BY-NC 4.0; 43,200 × 17,406 float32 cells of 30″, artificial zenith sky brightness in mcd/m², 60°S–85°N).
The GeoTIFF stays in raw/ (gitignored); only downsampled derivatives are published, with attribution, for
non-commercial use.

Outputs
  src/days/day-010-dark-skies/sky-world.png   Equal Earth (same projection and scale as the page's SVG map), ~0.15°
  src/days/day-010-dark-skies/sky-azson.png   Arizona–Sonora, 118°W–106°W × 26°N–38°N, 1′ cells, plate carrée
  raw/day-010-dark-skies/samples_places.csv   brightness at each Wikidata dark-sky place
  raw/day-010-dark-skies/samples_gan.csv      brightness at each Globe at Night observation (1′ cell)
  raw/day-010-dark-skies/raster_stats.json    image geometry and checks

Run from daily-data-lab/ with a Python that has rasterio, numpy and Pillow (not a project dependency):
  python -I scripts/day-010/raster.py
"""
import csv
import glob
import json
import math
import os
import sys

import numpy as np
import rasterio
from PIL import Image
from rasterio.enums import Resampling

RAW = "raw/day-010-dark-skies"
OUT = "src/days/day-010-dark-skies"
TIF = f"{RAW}/falchi/World_Atlas_2015.tif"
CACHE = f"{RAW}/falchi_1arcmin.npy"
# Thresholds of the paper's Table 2, converted from μcd/m² to mcd/m².
LEVELS = [0.00174, 0.014, 0.087, 0.688, 3.0]

# ---------- Equal Earth, identical to src/days/day-003-light-pillars/WorldMap.tsx (R = 150) ----------
A1, A2, A3, A4, M, R = 1.340264, -0.081106, 0.000893, 0.003796, math.sqrt(3) / 2, 150


def ee_forward(lon, lat):
    l, p = np.radians(lon), np.radians(lat)
    t = np.arcsin(M * np.sin(p))
    t2 = t * t
    t6 = t2 ** 3
    x = l * np.cos(t) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)))
    y = t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2))
    return x * R, -y * R


def ee_inverse(x, y):
    """Screen coordinates (SVG units, y down) → lon, lat in degrees; NaN outside the globe."""
    x, y = x / R, -y / R
    t = y.copy() / A1
    for _ in range(12):  # Newton on y = t(A1 + A2 t² + t⁶(A3 + A4 t²))
        t2 = t * t
        t6 = t2 ** 3
        fy = t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2)) - y
        dy = A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)
        t = t - fy / dy
    t2 = t * t
    t6 = t2 ** 3
    lat = np.degrees(np.arcsin(np.clip(np.sin(t) / M, -1, 1)))
    lon = np.degrees(M * x * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)) / np.cos(t))
    lon[np.abs(lon) > 180] = np.nan
    return lon, lat


# ---------- colour: log brightness on a night palette, sea transparent ----------
STOPS = [  # (log10 mcd/m², r, g, b, alpha)
    (-3.3, 10, 16, 38, 0),     # natural sky: transparent over the dark land fill
    (-2.76, 22, 38, 84, 150),  # 1.74 μcd/m²: just measurable
    (-1.85, 32, 92, 150, 210),  # 14 μcd/m²: light-polluted
    (-1.06, 38, 160, 150, 235),  # 87 μcd/m²: natural sky lost
    (-0.16, 236, 196, 76, 250),  # 688 μcd/m²: Milky Way gone
    (0.48, 240, 110, 70, 255),  # 3 mcd/m²: no dark adaptation
    (1.2, 255, 246, 236, 255),
]


def colourize(b):
    v = np.log10(np.maximum(np.nan_to_num(b, nan=1e-4), 1e-4))
    xs = np.array([s[0] for s in STOPS])
    out = np.zeros(b.shape + (4,), dtype=np.uint8)
    for k in range(4):
        out[..., k] = np.interp(v, xs, [s[k + 1] for s in STOPS]).astype(np.uint8)
    out[~np.isfinite(b)] = 0
    return out


def save_png(rgba, path):
    img = Image.fromarray(rgba).quantize(colors=96, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    img.save(path, optimize=True)
    return os.path.getsize(path)


def main():
    if not os.path.exists(TIF):
        sys.exit(f"{TIF} missing: run scripts/day-010/fetch.sh")
    with rasterio.open(TIF) as d:
        tr = d.transform
        top, res = tr.f, tr.e  # 85.054…, −0.008333…
        if os.path.exists(CACHE):
            a = np.load(CACHE)
        else:
            # Average of 2 × 2 native cells (1′ ≈ 1.85 km): fine enough for point samples and the regional zoom.
            a = d.read(1, out_shape=(d.height // 2, d.width // 2), resampling=Resampling.average, masked=True).filled(np.nan).astype(np.float32)
            np.save(CACHE, a)
    rows, cols = a.shape
    cell = 360.0 / cols  # degrees per cache cell (1′)
    lat_top = top
    print(f"✓ cache {cols}×{rows}, {cell * 60:.3f}′ cells, max {np.nanmax(a):.1f} mcd/m²")

    def sample(lon, lat):
        c = np.floor((np.asarray(lon) + 180) / cell).astype(int)
        r = np.floor((lat_top - np.asarray(lat)) / cell).astype(int)
        ok = (c >= 0) & (c < cols) & (r >= 0) & (r < rows)
        v = np.full(c.shape, np.nan, dtype=np.float64)
        v[ok] = a[r[ok], c[ok]]
        return v

    # ---- check: brightness at a few reference points (artificial, mcd/m²) ----
    checks = {"Phoenix": (-112.07, 33.45), "Tucson": (-110.97, 32.22), "Hermosillo": (-110.96, 29.07), "Kitt Peak": (-111.60, 31.96), "Sahara (Chad)": (19.0, 18.0)}
    check_vals = {k: float(sample(np.array([v[0]]), np.array([v[1]]))[0]) for k, v in checks.items()}
    if not check_vals["Phoenix"] > 3 > check_vals["Kitt Peak"] or not check_vals["Sahara (Chad)"] < 0.00174:
        sys.exit(f"reference points look wrong: {check_vals}")
    print("✓ reference points", {k: round(v, 4) for k, v in check_vals.items()})

    # ---- world image in Equal Earth: 6 × 6 block mean (0.1°) then inverse-projected per output pixel ----
    k = 6
    w6 = np.nanmean(a[: rows // k * k, : cols // k * k].reshape(rows // k, k, cols // k, k), axis=(1, 3))
    W = float(ee_forward(np.array([180.0]), np.array([0.0]))[0][0])
    y_top = float(ee_forward(np.array([0.0]), np.array([85.0]))[1][0])
    y_bot = float(ee_forward(np.array([0.0]), np.array([-60.0]))[1][0])
    px = 2000
    scale = px / (2 * W)
    py = int(round((y_bot - y_top) * scale))
    xs = -W + (np.arange(px) + 0.5) / scale
    ys = y_top + (np.arange(py) + 0.5) / scale
    X, Y = np.meshgrid(xs, ys)
    lon, lat = ee_inverse(X, Y)
    c6 = np.floor((lon + 180) / (cell * k))
    r6 = np.floor((lat_top - lat) / (cell * k))
    ok = np.isfinite(lon) & (r6 >= 0) & (r6 < w6.shape[0]) & (c6 >= 0) & (c6 < w6.shape[1])
    img = np.full(X.shape, np.nan, dtype=np.float32)
    img[ok] = w6[r6[ok].astype(int), c6[ok].astype(int)]
    world_bytes = save_png(colourize(img), f"{OUT}/sky-world.png")
    print(f"✓ sky-world.png {px}×{py}, {world_bytes / 1024:.0f} KB")

    # ---- Arizona–Sonora at 1′ ----
    box = (-118.0, 26.0, -106.0, 38.0)
    c0, c1 = int((box[0] + 180) / cell), int((box[2] + 180) / cell)
    r0, r1 = int((lat_top - box[3]) / cell), int((lat_top - box[1]) / cell)
    zoom = a[r0:r1, c0:c1]
    zoom_bytes = save_png(colourize(zoom), f"{OUT}/sky-azson.png")
    print(f"✓ sky-azson.png {zoom.shape[1]}×{zoom.shape[0]}, {zoom_bytes / 1024:.0f} KB")

    # ---- samples at dark-sky places (Wikidata) ----
    wd = json.load(open(f"{RAW}/wikidata_places.json"))["results"]["bindings"]
    seen, pts = set(), []
    for b in wd:
        q = b["item"]["value"].rsplit("/", 1)[1]
        if q in seen or "coord" not in b:
            continue
        seen.add(q)
        lon_s, lat_s = b["coord"]["value"].replace("Point(", "").replace(")", "").split()
        pts.append((q, float(lon_s), float(lat_s)))
    v = sample(np.array([p[1] for p in pts]), np.array([p[2] for p in pts]))
    with open(f"{RAW}/samples_places.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["qid", "brightness"])
        for p, x in zip(pts, v):
            w.writerow([p[0], "" if not np.isfinite(x) else f"{x:.6f}"])
    print(f"✓ samples_places.csv {len(pts)} places")

    # ---- samples at every Globe at Night observation ----
    n = 0
    with open(f"{RAW}/samples_gan.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["id", "brightness"])
        for path in sorted(glob.glob(f"{RAW}/gan/GaN*.csv")):
            ids, lons, lats = [], [], []
            with open(path, newline="", encoding="utf-8", errors="replace") as g:
                for row in csv.DictReader(g):
                    try:
                        lo, la = float(row["Longitude"]), float(row["Latitude"])
                    except (TypeError, ValueError):
                        continue
                    ids.append(row["ID"])
                    lons.append(lo)
                    lats.append(la)
            vals = sample(np.array(lons), np.array(lats))
            for i, x in zip(ids, vals):
                if np.isfinite(x):
                    w.writerow([i, f"{x:.6f}"])
                    n += 1
    print(f"✓ samples_gan.csv {n} observations")

    json.dump({
        "world": {"width": px, "height": py, "x": -W, "y": y_top, "w": 2 * W, "h": y_bot - y_top, "latTop": 85, "latBottom": -60},
        "azson": {"width": int(zoom.shape[1]), "height": int(zoom.shape[0]), "west": box[0], "south": box[1], "east": box[2], "north": box[3]},
        "checks": check_vals, "levels": LEVELS,
    }, open(f"{RAW}/raster_stats.json", "w"), indent=1)


if __name__ == "__main__":
    main()
