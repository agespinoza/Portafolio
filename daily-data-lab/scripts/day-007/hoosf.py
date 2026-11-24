# Day 007 · parses Table 2.1 ("History of satellite breakups by launch date") of NASA's History of On-orbit Satellite
# Fragmentations, 16th edition (NASA/TP-20220019160, data to 1 May 2022) into raw/day-007-space-debris/breakups.csv.
# Run from daily-data-lab/:  python3 -I scripts/day-007/hoosf.py
# The PDF text is extracted with pypdf (installed outside this project) into raw/day-007-space-debris/nasa/hoosf16.txt.
# Some names wrap onto the line above (kept empty here; the designator is the key) and some event dates are ranges.
# NASA counts 268 unique breakups; the script stops if the table does not parse to exactly that many rows.
import csv, re, sys
RAW = "raw/day-007-space-debris"
lines = open(f"{RAW}/nasa/hoosf16.txt", encoding="utf-8").read().split("\n")
start = next(i for i, l in enumerate(lines) if l.startswith("TABLE 2.1 HISTORY OF SATELLITE BREAKUPS BY LAUNCH DATE"))
end = next(i for i, l in enumerate(lines) if l.startswith("TABLE 2.2 HISTORY OF SATELLITE BREAKUPS BY EVENT DATE"))
CAUSES = r"COLLISION, ACCIDENTAL|COLLISION, DELIBERATE|PROPULSION|BATTERY|DELIBERATE|UNKNOWN|AERODYNAMICS|ACCIDENTAL|ELECTRICAL|ANOMALOUS|SMALL IMPACTOR"
row = re.compile(
    r"^(?P<name>.*?) ?(?P<intl>\d{4}-\d{3}[A-Z]{1,3}) (?P<ssn>\d+) (?P<launch>\d{1,2}-[A-Za-z]{3}-\d{2}) (?P<event>.+?) "
    r"(?P<cat>\d+) (?P<left>\d+) (?P<apo>[\d.]+) (?P<per>[\d.]+) (?P<inc>[\d.]+) (?P<cause>" + CAUSES + r")\b ?(?P<info>.*)$")
rows, miss = [], []
for l in lines[start:end]:
    l = l.strip()
    if not re.search(r"\d{4}-\d{3}[A-Z]", l): continue
    m = row.match(l)
    (rows if m else miss).append(m.groupdict() if m else l)
if miss: print("! unparsed:", *miss[:10], sep="\n  ")
if len(rows) != 268: sys.exit(f"Table 2.1 parsed {len(rows)} breakups, expected 268")
with open(f"{RAW}/breakups.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["name", "intl", "launch_key", "event", "debris_catalogued", "cause", "info"])
    for r in rows: w.writerow([r["name"], r["intl"], r["intl"][:8], r["event"], int(r["cat"]), r["cause"].title(), r["info"].strip()])
print(f"✓ NASA HOOSF 16e Table 2.1: {len(rows)} breakups → {RAW}/breakups.csv")
