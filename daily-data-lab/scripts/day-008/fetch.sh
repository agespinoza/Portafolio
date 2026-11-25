#!/bin/sh
# Day 008 raw downloads (run from daily-data-lab/). Writes to raw/day-008-seed-banks/ (not versioned).
# 1) Svalbard Global Seed Vault, Seed Portal (NordGen): the public "Export" button of
#    https://seedvault.nordgen.org/Search, one aggregate table per search type.
# 2) FAO WIEWS, SDG 2.5.1.a ex situ holdings: the JSON behind the public pages
#    https://www.fao.org/wiews/data/ex-situ/overview/en and /maps/en (FAO terms: https://www.fao.org/contact-us/terms/en/).
set -e
R=raw/day-008-seed-banks; mkdir -p "$R"
SP=https://seedvault.nordgen.org/Search/ExportExcel
Q='SearchAction=Deposits&SearchText=&ContinentId=&CountryOfCollectionId=&InstituteId=&GenusId=&SpecieId=&TaxonId=&DepositEventId='
for c in SeedDepositEvents DepositorInstitutes ContinentOfOrigin CountryOfOrigin DepositorDateAndCrop DepositorGenus Genus Species; do
  curl -sS -m 600 -o "$R/sgsv-$c.xlsx" "$SP?SearchTitleCode=$c&$Q"; sleep 2
  python3 -I scripts/day-008/xlsx2csv.py "$R/sgsv-$c.xlsx" > "$R/sgsv-$c.csv"
done
W=https://fao-wiews-573885866442.europe-west1.run.app
curl -sS -m 120 "$W/api/trend" -o "$R/wiews-trend.json"
curl -sS -m 120 -X POST "$W/api/ex-situ/dashboard" -H 'Content-Type: application/json' \
  -d '{"filters":{"year":2024,"crops":[],"genus":[],"cwr":["Included","Not Included"],"selectedRegionsParam":["World"]}}' -o "$R/wiews-dashboard-2024.json"
curl -sS -m 120 -X POST "$W/api/ex-situ/maps" -H 'Content-Type: application/json' \
  -d '{"lang":"en","field":"accessions","filters":{"year":2024,"threshold":0,"region":[]}}' -o "$R/wiews-institutes-2024.json"
# UNSD M49 table (ISO3 → continent, ISO2): the same file Day 006 builds in scripts/day-006/fetch.sh.
cp raw/day-006-food-waste/m49.csv "$R/m49.csv"
# NordGen, Seed Vault Annual Progress Report 2025 (Table 5: deposits, withdrawals and holdings by year).
curl -sSL -m 120 -o "$R/nordgen-apr-2025.pdf" https://www.nordgen.org/media/02aixrvi/seedvault-annualprogressreport2025.pdf
