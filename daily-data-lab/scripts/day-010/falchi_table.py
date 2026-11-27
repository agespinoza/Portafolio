"""Day 010 · Falchi et al. (2016) Table 2 → raw/day-010-dark-skies/falchi_table2.csv (standard library only).

Table 2 of "The new world atlas of artificial night sky brightness" (Science Advances 2(6):e1600377, CC BY-NC 4.0)
gives, for every country, the percentage of population and of area under artificial zenith sky brightness
≤1.7, >1.7, >14, >87, >688 and >3000 μcd/m². The columns are cumulative (">14" includes ">87" and so on).
Run from daily-data-lab/:  python3 -I scripts/day-010/falchi_table.py
"""
import csv
import html
import re
import sys

RAW = "raw/day-010-dark-skies"
COLS = ["le1_7", "gt1_7", "gt14", "gt87", "gt688", "gt3000"]


def cell(text: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", text)).strip()


def main() -> None:
    xml = open(f"{RAW}/falchi2016.xml", encoding="utf-8").read()
    table = re.search(r'<table-wrap id="T2".*?</table-wrap>', xml, re.S)
    if not table:
        sys.exit("Table 2 not found in the Europe PMC XML")
    rows = []
    for tr in re.findall(r"<tr>(.*?)</tr>", table.group(0), re.S):
        cells = [cell(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)]
        if len(cells) != 13:
            continue  # header rows use <th>
        name, values = cells[0], cells[1:]
        # The paper prints a few values with a stray character (e.g. "2" for 0.2 in World area >3000); keep text
        # parsing strict and report anything that is not a plain number.
        nums = []
        for v in values:
            v = v.replace("−", "-").replace(",", ".")
            if not re.fullmatch(r"-?\d+(\.\d+)?", v):
                sys.exit(f"unexpected value {v!r} for {name}")
            nums.append(float(v))
        rows.append([name] + nums)
    with open(f"{RAW}/falchi_table2.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["name"] + [f"pop_{c}" for c in COLS] + [f"area_{c}" for c in COLS])
        w.writerows(rows)
    print(f"✓ {len(rows)} rows → {RAW}/falchi_table2.csv")


if __name__ == "__main__":
    main()
