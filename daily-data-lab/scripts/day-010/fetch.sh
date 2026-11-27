#!/bin/sh
# Day 010 · downloads the raw files into raw/day-010-dark-skies/ (not versioned). Run from daily-data-lab/.
# Every source is public and needs no key. Checked on 2026-11-27.
set -e
R=raw/day-010-dark-skies; mkdir -p $R/gan $R/falchi
UA="daily-data-lab/1.0 (public-data research script)"

# Falchi et al. (2016), Science Advances 2(6):e1600377 (CC BY-NC 4.0). Table 2 (population and area under each sky
# brightness level, every country) is in the open full-text XML served by Europe PMC.
curl -sL -A "$UA" -o $R/falchi2016.xml "https://www.ebi.ac.uk/europepmc/webservices/rest/PMC4928945/fullTextXML"

# Globe at Night (NOIRLab, CC BY 4.0): one CSV per campaign year, from https://globeatnight.org/maps-data/
for p in 673:2011 672:2012 671:2013 670:2014 669:2015 668:2016 667:2017 666:2018 665:2019 679:2020 663:2021 662:2022 661:2023 926:2024 1190:2025; do
  curl -sL -A "$UA" -o $R/gan/GaN${p##*:}.csv "https://globeatnight.org/documents/${p%%:*}/GaN${p##*:}.csv"
done

# Certified International Dark Sky Places from Wikidata (CC0): parks, reserves, sanctuaries and communities, as
# heritage designation (P1435) or instance of (P31), with coordinates, country, certification date and area.
# darksky.org itself blocks automated requests, so its own list is not downloaded.
Q='SELECT ?item ?itemLabel ?type ?coord ?country ?countryLabel ?start ?area ?enwiki WHERE {
  VALUES ?type { wd:Q52216504 wd:Q72114283 wd:Q72114299 wd:Q72114249 }
  { ?item wdt:P1435 ?type } UNION { ?item wdt:P31 ?type }
  OPTIONAL { ?item wdt:P625 ?coord } OPTIONAL { ?item wdt:P17 ?country }
  OPTIONAL { ?item p:P1435 ?st . ?st ps:P1435 ?type . ?st pq:P580 ?start }
  OPTIONAL { ?item p:P2046/psn:P2046/wikibase:quantityAmount ?area }
  OPTIONAL { ?enwiki schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }'
curl -s -G -A "$UA" -H "Accept: application/sparql-results+json" --data-urlencode "query=$Q" \
  -o $R/wikidata_places.json https://query.wikidata.org/sparql

# World Bank WDI (CC BY 4.0): countries (region, income) and total population.
curl -s -o $R/wb_countries.json "https://api.worldbank.org/v2/country?format=json&per_page=400"
curl -s -o $R/wb_pop.json "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=20000&date=2015:2024"

# Falchi et al. (2016) World Atlas 2015 GeoTIFF (GFZ Data Services, doi:10.5880/GFZ.1.4.2016.001, CC BY-NC 4.0):
# 653 MB zip, 2.9 GB float32 GeoTIFF of artificial zenith brightness in mcd/m². Only downsampled images are published.
[ -f $R/falchi/World_Atlas_2015.tif ] || {
  curl -sL -A "$UA" -o $R/falchi/World_Atlas_2015.zip "https://datapub.gfz.de/download/10.5880.GFZ.1.4.2016.001/World_Atlas_2015.zip"
  (cd $R/falchi && unzip -o -q World_Atlas_2015.zip World_Atlas_2015.tif README.txt)
}
echo "✓ raw files in $R. Next: npm run data:darksky"
