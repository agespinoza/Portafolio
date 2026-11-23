# Day 006 · parses Annex 3 (Table of household estimates) from the UNEP Food Waste Index Report 2024 PDF text
# into raw/day-006-food-waste/unep_annex3_household.csv. Run from daily-data-lab/ after fetch.sh:
#   python3 -I scripts/day-006/annex3.py
# The PDF text is extracted with pypdf (installed outside this project). The parsed household total must equal
# UNEP's published world household figure, 630.96 Mt, or the script stops.
import csv, re, sys
RAW = "raw/day-006-food-waste"
lines = open(f"{RAW}/unep/fwi2024.txt", encoding="utf-8").read().split("\n")
start = next(i for i, l in enumerate(lines) if l.startswith("Annex 3: Table of household estimates"))
text = " ".join(l.strip() for l in lines[start:start + 400] if not l.startswith("=====") and "UNEP" not in l)
pat = re.compile(r"(\d{1,3}) ([A-Z][^0-9]*?) (\d{1,3}) ((?:\d{1,3} )*\d{1,3}) (High confidence|Medium confidence|Low confidence|Very low confidence|Eurostat)")
rows = [(int(m[1]), m[2].strip(), int(m[3]), int(m[4].replace(" ", "")), m[5]) for m in pat.finditer(text)]
total = sum(r[3] for r in rows) / 1e6
if abs(total - 630.96) > 0.01: sys.exit(f"Annex 3 household total {total:.2f} Mt ≠ 630.96 Mt")
with open(f"{RAW}/unep_annex3_household.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["m49", "country", "hh_kg", "hh_t", "confidence"]); w.writerows(rows)
print(f"✓ Annex 3: {len(rows)} countries, household {total:.2f} Mt")
