#!/bin/sh
# Day 009 · downloads the raw files into raw/day-009-longevity/ (not versioned). Run from daily-data-lab/.
# Every source is public and needs no key. Checked on 2026-11-26.
set -e
R=raw/day-009-longevity; mkdir -p $R
# UN DESA, World Population Prospects 2024 (CC BY 3.0 IGO): demographic indicators (e0 by sex, population) and
# population by five-year age group (for the open-ended 100+ group), medium variant; estimates run to 2023.
WPP="https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/CSV_FILES"
curl -sL -o $R/WPP2024_Demographic_Indicators_Medium.csv.gz "$WPP/WPP2024_Demographic_Indicators_Medium.csv.gz"
curl -sL -o $R/WPP2024_PopulationByAge5GroupSex_Medium.csv.gz "$WPP/WPP2024_PopulationByAge5GroupSex_Medium.csv.gz"
# WHO Global Health Observatory OData API: healthy life expectancy at birth (WHOSIS_000002) and life expectancy at
# birth (WHOSIS_000001), with uncertainty intervals, 2000–2023.
curl -s -o $R/who_hale.json "https://ghoapi.azureedge.net/api/WHOSIS_000002"
curl -s -o $R/who_le.json "https://ghoapi.azureedge.net/api/WHOSIS_000001"
# World Bank WDI (CC BY 4.0): countries (region), GDP per capita PPP (constant 2021 international $) and current
# health expenditure (% of GDP).
curl -s -o $R/wb_countries.json "https://api.worldbank.org/v2/country?format=json&per_page=400"
for i in NY.GDP.PCAP.PP.KD SH.XPD.CHEX.GD.ZS; do
  curl -s -o $R/wb_$i.json "https://api.worldbank.org/v2/country/all/indicator/$i?format=json&per_page=20000&date=2015:2024"
done
echo "✓ raw files in $R. Next: node scripts/day-009/snapshot.mjs"
