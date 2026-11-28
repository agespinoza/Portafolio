#!/bin/sh
# Day 011 · downloads the raw files into raw/day-011-spices/ (not versioned). Run from daily-data-lab/.
# Every source is public and needs no key. Checked on 2026-11-28.
set -e
R=raw/day-011-spices; mkdir -p $R
UA="daily-data-lab/1.0 (public-data research script)"
B=https://bulks-faostat.fao.org/production
# FAOSTAT (FAO, CC BY 4.0): Crops and livestock products (QCL), Trade: crops and livestock (TCL), Detailed trade matrix (TM).
for f in Production_Crops_Livestock Trade_CropsLivestock Trade_DetailedTradeMatrix; do
  [ -s "$R/$f.zip" ] || curl -sL -A "$UA" -o "$R/$f.zip" "$B/${f}_E_All_Data_(Normalized).zip"
done
# World Bank WDI (CC BY 4.0): country metadata (region, income) and total population.
curl -sL -A "$UA" -o $R/wb_countries.json "https://api.worldbank.org/v2/country?format=json&per_page=400"
curl -sL -A "$UA" -o $R/wb_pop.json "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=20000&date=1961:2025"
# UN Statistics Division: M49 standard (country codes → ISO3), parsed by scripts/day-011/m49.py.
curl -sL -A "$UA" -o $R/m49.html "https://unstats.un.org/unsd/methodology/m49/overview/"
for f in $R/*.zip; do d="${f%.zip}"; [ -d "$d" ] || unzip -q -o "$f" -d "$d"; done
