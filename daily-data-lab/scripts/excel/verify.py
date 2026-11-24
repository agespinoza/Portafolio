"""Opens each built workbook in Microsoft Excel (macOS), recalculates it, saves a calculated copy and reports:
every quality check (PASS/FAIL), every formula error cell, and the Analysis sheet's first values.

Run from daily-data-lab/:  .venv-excel/bin/python scripts/excel/verify.py [day-006 ...]
Needs Excel for Mac. Calculated copies go to raw/excel-test/ (not versioned).
"""
import glob
import os
import subprocess
import sys

import openpyxl

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TMP = os.path.join(ROOT, "raw", "excel-test")
ERRORS = ("#N/A", "#VALUE!", "#REF!", "#DIV/0!", "#NUM!", "#NAME?", "#NULL!", "#SPILL!", "#CALC!")


def excel_calc(src: str, dst: str):
    script = f'''tell application "Microsoft Excel"
    open (POSIX file "{src}")
    delay 2
    calculate full
    save workbook as active workbook filename "{dst}" file format Excel XML file format
    close active workbook saving no
end tell'''
    subprocess.run(["osascript", "-e", script], check=True, capture_output=True, timeout=300)


def report(path: str, allow_na_sheets=("Analysis",)) -> bool:
    wb = openpyxl.load_workbook(path, data_only=True)
    ok = True
    ws = wb["Pipeline"]
    rows = list(ws.iter_rows(values_only=True))
    hdr = next(i for i, r in enumerate(rows) if r[1] == "ID" and r[2] == "Check")
    for r in rows[hdr + 1:]:
        if r[1] is None or not isinstance(r[1], int):
            break
        flag = "✓" if r[6] == "PASS" else "✗"
        ok &= r[6] == "PASS"
        print(f"   {flag} {r[2]}: expected {r[3]}, actual {r[4] if not isinstance(r[4], float) else round(r[4], 4)}")
    errs = {}
    for s in wb.worksheets:
        for row in s.iter_rows():
            for c in row:
                if isinstance(c.value, str) and c.value in ERRORS:
                    if c.value == "#N/A" and s.title in allow_na_sheets:
                        continue
                    errs.setdefault(s.title, []).append(f"{c.coordinate}={c.value}")
    for s, e in errs.items():
        ok = False
        print(f"   ✗ {s}: {len(e)} error cells, e.g. {', '.join(e[:8])}")
    if not errs:
        print("   ✓ no formula errors")
    return ok


def main(filters):
    os.makedirs(TMP, exist_ok=True)
    files = sorted(glob.glob(os.path.join(ROOT, "public", "downloads", "*-analysis.xlsx")))
    all_ok = True
    for f in files:
        if filters and not any(x in f for x in filters):
            continue
        name = os.path.basename(f)
        src = os.path.join(TMP, name)
        with open(f, "rb") as a, open(src, "wb") as b:
            b.write(a.read())
        dst = os.path.join(TMP, "calc-" + name)
        if os.path.exists(dst):
            os.remove(dst)
        print(f"• {name}")
        excel_calc(src, dst)
        all_ok &= report(dst)
    print("ALL OK" if all_ok else "PROBLEMS FOUND")
    return all_ok


if __name__ == "__main__":
    sys.exit(0 if main(sys.argv[1:]) else 1)
