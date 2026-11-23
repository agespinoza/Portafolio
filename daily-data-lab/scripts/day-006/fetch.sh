#!/bin/sh
# Day 006 · downloads the raw files into raw/day-006-food-waste/ (not versioned). Run from daily-data-lab/.
# Every source is public and needs no key. Checked on 2026-11-23.
set -e
R=raw/day-006-food-waste; mkdir -p $R/unep $R/faostat
SDG=https://unstats.un.org/sdgapi/v1/sdg/Series/DataCSV
# UN SDG Global Database, indicator 12.3.1: UNEP food waste (kg/cap, tonnes) and FAO Food Loss Index / percentage.
for s in AG_FOOD_WST_PC AG_FOOD_WST AG_FLS_INDEX AG_FLS_PCT; do
  curl -s -X POST "$SDG" -d "seriesCodes=$s" | tr -d '\000' > $R/$s.csv
done
# UNEP Food Waste Index Report 2024 (PDF; the UNEP site blocks scripts, the UN Digital Library copy does not).
curl -sL -o $R/unep/fwi2024.pdf "https://digitallibrary.un.org/record/4042857/files/1401794_EN.pdf"
# FAOSTAT Food Security Indicators (bulk, normalized).
curl -s -o $R/faostat/fs.zip "https://bulks-faostat.fao.org/production/Food_Security_Data_E_All_Data_(Normalized).zip"
(cd $R/faostat && unzip -o -q fs.zip)
# World Bank WDI: countries (region, income group) and population 2022.
curl -s -o $R/wb_countries.json "https://api.worldbank.org/v2/country?format=json&per_page=400"
curl -s -o $R/wb_pop2022.json "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=20000&date=2022"
# World Bank Climate Change Knowledge Portal: CRU TS 4.08 mean annual temperature, 1991–2020 climatology.
curl -s -o $R/cckp_tas.json "https://cckpapi.worldbank.org/cckp/v1/cru-x0.5_climatology_tas_climatology_annual_1991-2020_mean_historical_cru_ts4.08_mean/all_countries?_format=json"
# UNSD M49 table (M49 ↔ ISO3); parsed from the HTML table into m49.csv.
curl -sL -A "Mozilla/5.0" -o $R/m49.html "https://unstats.un.org/unsd/methodology/m49/overview/"
python3 -I - "$R" <<'PY'
import csv, html, re, sys
R = sys.argv[1]; s = open(f"{R}/m49.html", encoding="utf-8").read()
t = s[s.find("<table"):s.find("</table>", s.find("<table"))]
rows = [[html.unescape(re.sub("<[^>]+>", "", c)).strip() for c in re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", r, re.S)] for r in re.findall(r"<tr[^>]*>(.*?)</tr>", t, re.S)]
csv.writer(open(f"{R}/m49.csv", "w", newline="")).writerows(rows)
PY
rm $R/m49.html
echo "✓ raw files in $R. Next: extract the PDF text to $R/unep/fwi2024.txt (pypdf), then python3 -I scripts/day-006/annex3.py"
