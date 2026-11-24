"""Builds the downloadable analysis workbooks for every Daily Data Lab day.

Run from daily-data-lab/:  npm run excel   (uses the Python environment in .venv-excel; see scripts/excel/README.md)
Writes public/downloads/day-NNN-<slug>-analysis.xlsx and .xlsm; Vite copies them to ../lab/downloads/.
"""
import importlib
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "days"))
from book import Book  # noqa: E402

OUT = os.path.join(HERE, "..", "..", "public", "downloads")
DAYS = ["d001", "d002", "d003", "d004", "d005", "d006", "d007"]


MANIFEST = os.path.join(HERE, "..", "..", "src", "downloads.json")


def write_manifest():
    """src/downloads.json: which workbooks exist for each day, with sizes, for the page's download card."""
    import json
    out = {}
    for name in DAYS:
        mod = importlib.import_module(name)
        m = mod.META
        files = {}
        for ext in ("xlsx", "xlsm"):
            fn = f"day-{m.day:03d}-{m.slug}-analysis.{ext}"
            path = os.path.join(OUT, fn)
            if os.path.exists(path):
                files[ext] = {"file": f"downloads/{fn}", "bytes": os.path.getsize(path)}
        if files:
            out[m.slug] = files
    with open(MANIFEST, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=2)
        fh.write("\n")
    print(f"✓ src/downloads.json · {len(out)} days")


def main(only=None):
    os.makedirs(OUT, exist_ok=True)
    for name in DAYS:
        if only and name not in only:
            continue
        mod = importlib.import_module(name)
        for macros in (False, True):
            t0 = time.time()
            import copy
            b = Book(OUT, copy.deepcopy(mod.META), macros)
            mod.build(b)
            path = b.close()
            print(f"✓ {os.path.relpath(path, os.path.join(HERE, '..', '..'))}  {os.path.getsize(path) / 1024:,.0f} KB  {time.time() - t0:.1f}s")
    write_manifest()


if __name__ == "__main__":
    main(sys.argv[1:])
