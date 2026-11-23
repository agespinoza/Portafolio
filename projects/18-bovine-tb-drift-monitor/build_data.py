"""Builds data/snapshot.json from public sources. Run from the repository root:

    python3 projects/18-bovine-tb-drift-monitor/build_data.py

Standard library only. The three sources are downloaded when they are not already in the folder given
with ``--cache DIR`` (default: a temporary folder), so the build can also run offline from saved copies:

    python3 projects/18-bovine-tb-drift-monitor/build_data.py --cache /tmp/btb

Sources (see the README for licences and caveats):
  * Defra / APHA, Tuberculosis in cattle in Great Britain: herd prevalence by month and region (ODS).
  * DAFM via the Central Statistics Office, DAQ01 Bovine Tuberculosis: herds restricted per quarter (JSON-stat).
  * USDA Economic Research Service, monthly cattle trade in head (CSV): US imports from Mexico.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import tempfile
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "data", "snapshot.json")

UK_API = "https://www.gov.uk/api/content/government/statistical-data-sets/tuberculosis-tb-in-cattle-in-great-britain"
IE_URL = "https://ws.cso.ie/public/api.restful/PxStat.Data.Cube_API.ReadDataset/DAQ01/JSON-stat/2.0/en"
ERS_URL = "https://www.ers.usda.gov/media/29545/cattle-monthly-us-trade-head.csv"

FIRST = (2010, 4)                      # Ireland's DAQ01 starts in 2010Q4
UK_COLUMNS = {                         # column header in the UK sheet -> key used by the console
    "England": "uk_england", "High Risk Area of England": "uk_hra", "Edge area of England": "uk_edge",
    "Low Risk Area of England": "uk_lra", "Wales": "uk_wales", "Scotland": "uk_scotland",
}
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


def fetch(url: str, path: str) -> str:
    if not os.path.exists(path):
        print(f"downloading {url}")
        request = urllib.request.Request(url, headers={"User-Agent": "portfolio-data-build/1.0"})
        with urllib.request.urlopen(request, timeout=120) as response, open(path, "wb") as out:
            out.write(response.read())
    return path


def uk_ods_url() -> str:
    request = urllib.request.Request(UK_API, headers={"User-Agent": "portfolio-data-build/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        content = json.load(response)
    for attachment in content["details"]["attachments"]:
        if "Headline_Statistics_by_Measure" in attachment["url"] and attachment["url"].endswith(".ods"):
            return attachment["url"]
    raise SystemExit("Could not find the UK headline statistics file on the gov.uk page.")


def ods_sheet(path: str, name: str) -> list[list[str]]:
    ns = {"t": "urn:oasis:names:tc:opendocument:xmlns:table:1.0", "o": "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
          "x": "urn:oasis:names:tc:opendocument:xmlns:text:1.0"}
    t, o = "{%s}" % ns["t"], "{%s}" % ns["o"]
    root = ET.fromstring(zipfile.ZipFile(path).read("content.xml"))
    for table in root.iter(t + "table"):
        if table.get(t + "name") != name:
            continue
        rows = []
        for row in table.iter(t + "table-row"):
            repeat = int(row.get(t + "number-rows-repeated", "1"))
            cells = []
            for cell in row:
                if cell.tag not in (t + "table-cell", t + "covered-table-cell"):
                    continue
                value = cell.get(o + "value")
                if value is None:
                    value = "".join("".join(p.itertext()) for p in cell.findall("x:p", ns))
                cells.extend([value] * min(int(cell.get(t + "number-columns-repeated", "1")), 30))
            rows.extend([cells] * (repeat if repeat <= 50 else 1))
        return rows
    raise SystemExit(f"Sheet {name} not found in {path}")


def quarters(last: tuple[int, int]) -> list[tuple[int, int]]:
    out, (y, q) = [], FIRST
    while (y, q) <= last:
        out.append((y, q))
        y, q = (y + 1, 1) if q == 4 else (y, q + 1)
    return out


def label(q: tuple[int, int]) -> str:
    return f"{q[0]}Q{q[1]}"


def uk_prevalence(path: str, grid: list[tuple[int, int]]) -> dict[str, list[float | None]]:
    """Share of registered herds not officially TB-free at the end of each quarter (March, June, September, December)."""
    rows = ods_sheet(path, "Herd_Prevalence")
    start = next(i for i, r in enumerate(rows) if r and r[0].startswith("Monthly Statistics")) + 1
    header = rows[start]
    columns = {UK_COLUMNS[name]: header.index(name) for name in UK_COLUMNS}
    monthly: dict[tuple[int, int], list[str]] = {}
    for r in rows[start + 1:]:
        match = re.match(r"^([A-Za-z]+) (\d{4})$", r[0]) if r and r[0] else None
        if match and match.group(1) in MONTHS:
            monthly[(int(match.group(2)), MONTHS.index(match.group(1)) + 1)] = r
    out = {}
    for key, column in columns.items():
        out[key] = []
        for year, quarter in grid:
            row = monthly.get((year, quarter * 3))
            out[key].append(round(float(row[column]), 6) if row and row[column] != "" else None)
    return out


def ireland(path: str, grid: list[tuple[int, int]]) -> tuple[list[float | None], tuple[int, int]]:
    """Herds restricted at the end of the quarter over herds in the state."""
    data = json.load(open(path))

    def labels(dimension: str) -> list[str]:
        category = data["dimension"][dimension]["category"]
        index = category["index"]
        keys = list(index) if isinstance(index, list) else sorted(index, key=index.get)
        return [category["label"][k] for k in keys]

    stats, times, regions = labels("STATISTIC"), labels("TLIST(Q1)"), labels("C03321V04008")
    values = data["value"]

    def get(stat: str, quarter: str, region: str = "State"):
        return values[(stats.index(stat) * len(times) + times.index(quarter)) * len(regions) + regions.index(region)]

    out = []
    for q in grid:
        if label(q) not in times:
            out.append(None)
            continue
        herds, restricted = get("Herds in County", label(q)), get("Herds Restricted by end of Quarter", label(q))
        out.append(round(restricted / herds, 6) if herds and restricted is not None else None)
    last = max((y, int(t[-1])) for t in times for y in [int(t[:4])])
    return out, last


def flow(path: str, grid: list[tuple[int, int]]) -> tuple[list[int], tuple[int, int]]:
    """Head of cattle imported by the US from Mexico per quarter; a month without a row counts as zero."""
    month: dict[tuple[int, int], int] = {}
    for r in csv.DictReader(open(path)):
        if r["GEOGRAPHY_DESC"] == "Mexico" and r["TRADE_FLOW"] == "Imports" and r["COMMODITY_DESC"] == "Cattle, total":
            month[(int(r["YEAR_ID"]), int(r["TIMEPERIOD_ID"]))] = int(float(r["AMOUNT"]))
    return [sum(month.get((y, (q - 1) * 3 + m), 0) for m in (1, 2, 3)) for y, q in grid], max(month)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cache", default=os.path.join(tempfile.gettempdir(), "btb-sources"))
    args = parser.parse_args()
    os.makedirs(args.cache, exist_ok=True)

    uk_path = os.path.join(args.cache, "uk.ods")
    if not os.path.exists(uk_path):
        fetch(uk_ods_url(), uk_path)
    ie_path = fetch(IE_URL, os.path.join(args.cache, "ie_q.json"))
    ers_path = fetch(ERS_URL, os.path.join(args.cache, "ers.csv"))

    _, (last_year, last_month) = flow(ers_path, [FIRST])
    complete = last_month // 3
    last_complete = (last_year, complete) if complete >= 1 else (last_year - 1, 4)
    grid = quarters(last_complete)

    uk = uk_prevalence(uk_path, grid)
    ie, ie_last = ireland(ie_path, grid)
    head, _ = flow(ers_path, grid)
    # Quarters after the last month with UK data stay null; trim the grid to the UK's last quarter.
    while grid and uk["uk_england"][len(grid) - 1] is None:
        grid.pop()
    n = len(grid)
    regions = {key: values[:n] for key, values in uk.items()}
    regions["ie"] = ie[:n]

    snapshot = {
        "built": date.today().isoformat(),
        "quarters": [label(q) for q in grid],
        "regions": regions,
        "flowHead": head[:n],
        "ieLast": label(ie_last),
        "senasica": {
            "asOf": "2024-12-30", "pageDate": "2026-08-01",
            "url": "https://www.gob.mx/senasica/documentos/situacion-actual-de-tuberculosis-bovina",
            "territoryShare": {"eradication": 9.15, "lowPrevalenceII": 35.76, "lowPrevalenceI": 28.97, "control": 26.12},
        },
    }
    with open(OUT, "w") as out:
        json.dump(snapshot, out, separators=(",", ":"))
    print(f"wrote {OUT}: {n} quarters ({snapshot['quarters'][0]} to {snapshot['quarters'][-1]}), Ireland to {label(ie_last)}")


if __name__ == "__main__":
    main()
