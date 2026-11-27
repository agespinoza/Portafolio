# Daily Data Lab

One small, interactive data visualization a day, each on a different everyday topic, built with React and public data. The built site is published with the portfolio at [`/lab`](../lab/).

| Day | Topic | Visualization | Data |
| --- | --- | --- | --- |
| 001 | Mobility | [When is the best time to cross from Mexicali?](https://agespinoza.github.io/Portafolio/lab/#/day/1) | U.S. Customs and Border Protection, [Border Wait Times](https://bwt.cbp.gov/) |
| 002 | Nature | [Where do New Zealand's glowworms shine?](https://agespinoza.github.io/Portafolio/lab/index.html#/day/2) | [GBIF.org](https://www.gbif.org/species/1564326) occurrences and [Open-Meteo](https://open-meteo.com/) weather |
| 003 | Atmosphere | [Where and when do light pillars appear?](https://agespinoza.github.io/Portafolio/lab/index.html#/day/3) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Halo_phenomena) photos, [ERA5](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels) weather via [Open-Meteo](https://open-meteo.com/), and [Natural Earth](https://www.naturalearthdata.com/) |
| 004 | Climate | [How fast are winters warming at Abraham Lake?](https://agespinoza.github.io/Portafolio/lab/index.html#/day/4) | [HydroSHEDS · HydroLAKES](https://www.hydrosheds.org/products/hydrolakes) (CC-BY 4.0) and ERA5 air temperature via [Open-Meteo](https://open-meteo.com/) |
| 005 | Languages | [Which languages are endangered and barely documented?](https://agespinoza.github.io/Portafolio/lab/index.html#/day/5) | [Glottolog 5.4](https://doi.org/10.5281/zenodo.24101243), [Grambank 1.0.3](https://doi.org/10.5281/zenodo.7844558), and [WALS Online](https://wals.info/) CLDF (all CC-BY 4.0) |
| 006 | Food | [Where is the world's food wasted, and by whom?](https://agespinoza.github.io/Portafolio/lab/index.html#/day/6) | [UNEP Food Waste Index Report 2024](https://digitallibrary.un.org/record/4042857), [FAOSTAT](https://www.fao.org/faostat/en/#data/FS) (CC-BY 4.0), [World Bank WDI](https://datatopics.worldbank.org/world-development-indicators/) and CCKP (CC-BY 4.0) |
| 007 | Space | [How much of Earth orbit is junk, and who left it there?](https://agespinoza.github.io/Portafolio/lab/index.html#/day/7) | [CelesTrak SATCAT](https://celestrak.org/satcat/satcat-format.php) and the [ESA Space Environment Report 2026](https://www.esa.int/Space_Safety/Space_Debris/ESA_Space_Environment_Report_2026) |
| 008 | Agriculture | [How much crop diversity is safeguarded, and how much is backed up in Svalbard?](https://agespinoza.github.io/Portafolio/lab/index.html#/day/8) | [Svalbard Global Seed Vault Seed Portal](https://seedvault.nordgen.org/) (NordGen), [NordGen Annual Progress Report 2025](https://www.nordgen.org/our-work/svalbard-global-seed-vault/annual-progress-reports/) and [FAO WIEWS, SDG 2.5.1.a](https://www.fao.org/wiews/data/ex-situ/overview/en) |
| 009 | Health | [Where do people live longest and healthiest, and do blue zones survive age validation?](https://agespinoza.github.io/Portafolio/lab/index.html#/day/9) | [UN World Population Prospects 2024](https://population.un.org/wpp/), [WHO Global Health Observatory](https://www.who.int/data/gho) and [World Bank WDI](https://datatopics.worldbank.org/world-development-indicators/) |
| 010 | Astronomy | [How many people have lost the night sky, how fast are the stars fading, and where are dark skies protected?](https://agespinoza.github.io/Portafolio/lab/index.html#/day/10) | [Falchi et al. 2016](https://doi.org/10.1126/sciadv.1600377) and the [World Atlas 2015](https://doi.org/10.5880/GFZ.1.4.2016.001) (CC BY-NC 4.0), [Globe at Night](https://globeatnight.org/maps-data/) (NOIRLab, CC BY 4.0), [Wikidata](https://www.wikidata.org/) (CC0) and [World Bank WDI](https://datatopics.worldbank.org/world-development-indicators/) |

## Data downloads

Each day page has a **Data in Excel** button (in the header and at the end of the study). It builds an .xlsx in the visitor's browser from the data the page uses: one sheet per table with every row, typed columns, filters and frozen headers, plus a first sheet in the visitor's language with the study, links and sources. The tables come from [`src/exports.ts`](src/exports.ts) and the file is written by [`src/xlsx.ts`](src/xlsx.ts), a small writer with no library. Nothing is stored in the repository, so the download always matches the page and costs nothing to keep as the lab grows.

## Research articles

Each day also has a research article at `#/day/N/article` (linked from the day header), in all seven languages. It has an abstract, keywords, numbered sections (introduction, data and methods, results with a figure, discussion, limitations, conclusion), data and code availability, a citation with BibTeX, and the day's DOI-checked references. The text lives in [`src/articles/`](src/articles/) and the page prints cleanly to PDF.

## Day 001: When is the best time to cross from Mexicali?

The page shows northbound wait times at the Calexico West and Calexico East ports of entry:

- **Right now:** the current delay and the number of open lanes from CBP's live feed. The page refreshes it every five minutes.
- **Heatmap:** CBP's historical average wait for each weekday and hour of the selected month.
- **Today vs. a typical day:** the hourly waits so far today, compared with the typical average and range for the same weekday.
- **Busiest months:** the average daytime wait (6 am–10 pm) for each month of the year.

You can switch between crossings, lanes (standard, SENTRI, Ready Lane, and pedestrian), and months. All times are Pacific Time. If the live API is unreachable, the page uses a saved snapshot in [`src/days/day-001-border/snapshot.json`](src/days/day-001-border/snapshot.json).

## Day 002: Where do New Zealand's glowworms shine?

The page maps every georeferenced public record of the Waitomo glowworm (*Arachnocampa luminosa*) and compares it with the weather outside the Waitomo Caves:

- **Night-sky map:** records grouped into clusters of about 25 km, drawn as glowing points on a map of New Zealand, with the Waitomo Caves marked.
- **Records by region:** a ranked list. Click a region to highlight it on the map.
- **Seasons outside:** monthly average highs and lows, the coldest and hottest days, humidity, and rain at Waitomo (2021–2025), aligned with glowworm records by month. Click a month to filter the map.
- **Records by year:** how citizen science (iNaturalist) changed the record after 2016.
- **Right now:** live temperature and humidity outside the caves.

You can filter by island, period, and month. Full GBIF records are large (about 2 MB per page), so the map uses the saved snapshot in [`src/days/day-002-glowworms/snapshot.json`](src/days/day-002-glowworms/snapshot.json), and the page checks GBIF's live record count. The climate averages load live from Open-Meteo and fall back to the snapshot. The coastline comes from Natural Earth and is saved in `nz-outline.json`.

## Day 003: Where and when do light pillars appear?

This day is a small observatory of ice-crystal optics from 2000 to 2026. It is the first day written in TypeScript (`.tsx`).

- **Catalog:** 931 dated photographs of light pillars, sun pillars, moon pillars, parhelia (sun dogs), 22° halos, and circumzenithal arcs from Wikimedia Commons categories. Each record keeps its author, license, and link, plus an evidence level (A: camera position and time; B: a place only; C: a date only). Missing values stay empty; they are never set to zero.
- **World map:** an Equal Earth projection with the 197 located photos. Click a point to see the photo, its credit, and the ERA5 weather at that hour.
- **Timeline:** photos by year and by month for each hemisphere, plus the share of photos that are pillars with 95% Wilson intervals. Comparing shares corrects for who photographs the sky, and when.
- **Weather panel:** ERA5 temperature, humidity, wind, cloud, and the computed Sun elevation for each phenomenon, with physical limits drawn as reference lines and an ice-saturation curve on the scatter.
- **3-D simulator:** a hand-drawn canvas scene of hexagonal plate crystals, with a rendered observer's view. You can change the light source, crystal tilt and its distribution, observer position, crystal layer, and visibility. The model is single specular reflection with Fresnel reflectance and Beer–Lambert extinction, and it is labeled as an illustration.
- **Comparator, research questions, downloads:** compare 2–4 regions; read eight research questions, each tagged by where its answer comes from; and download the filtered catalog as CSV, GeoJSON, or JSON.

The catalog is a saved snapshot in [`src/days/day-003-light-pillars/catalog.json`](src/days/day-003-light-pillars/catalog.json). Refreshing it takes a few minutes, because Commons rate-limits requests and Open-Meteo is queried once per located photo.

## Day 004: How fast are winters warming at Abraham Lake?

Abraham Lake, a reservoir in Alberta, is famous for methane bubbles frozen into its winter ice. The page puts it in a global context: every lake in HydroLAKES (1,427,688 lakes of at least 0.1 km²) and the winter warming trend of the 300 largest lakes. Mode: FULL (Saturday), with a world map and on-demand API calls.

- **Data pipeline (DuckDB, `scripts/day-004/`):** `dim_lake.sql` reads the HydroLAKES pour-point shapefile with the spatial extension into `dim_lake.parquet` (lake_id = Hylak_id, name, country, lat, lon, area_km2, depth_m, is_reservoir = Lake_type 2). `winter.sql` computes winter means and `regr_slope` trends in °C per decade. `snapshot.mjs` bundles the result into `src/days/day-004-abraham-lake/snapshot.json`.
- **Weather:** ERA5 daily mean air temperature from Open-Meteo (`models=era5`). Abraham uses every winter since 1951. The 300 largest lakes use 1991–2025, because Open-Meteo counts a request as one call per two weeks of data and the free tier allows 10,000 calls a day; `fetch-winters.mjs` keeps a daily ledger and resumes where it stopped, so the backfill takes about 8 days; its progress is versioned in `data/day-004-abraham-lake/` and `update-trends.mjs` refreshes the trends without needing `raw/`. Any other lake is fetched in the browser on demand and cached in `localStorage`.
- **Downloads** go to `daily-data-lab/raw/` (not versioned): `HydroLAKES_points_v10_shp.zip` from `data.hydrosheds.org`.

### Sprint 1

- [x] HydroLAKES points to `/raw`, `dim_lake.parquet` with DuckDB spatial, Abraham Lake verified (Hylak_id 7243, reservoir, 52.12 km², 34 m)
- [x] LakeTEMP ice days and water temperature, joined by Hylak_id: moved to Sprint 2 (see below).
- [x] Open-Meteo ERA5 winter means and `regr_slope` trends: Abraham since 1951 done; 300 largest lakes 1991–2025 in progress (30 of 300 on 2026-11-21; the `Abraham Lake winter backfill` GitHub Action runs `npm run fetch:abraham` every day at 07:41 UTC and commits the progress in `data/day-004-abraham-lake/`)
- [x] Dashboard: 4 KPI cards, winter trend chart, monthly chart, lake profile, family mode with 3 facts, Abraham by default
- [x] Footer attribution to HydroSHEDS and "Weather data by Open-Meteo.com"

### Sprint 2 · LakeTEMP

- [x] LakeTEMP v1.1 aggregated statistics (Korver et al. 2024, CC-BY 4.0) joined by Hylak_id with `scripts/day-004/laketemp.sql`. Figshare blocks scripted downloads (HTTP 403), so the zip is downloaded in a browser; only `LakeTEMP_aggregated_v1.csv` is read (the 6.3 GB primary file is not needed) and the download is deleted afterwards. To rebuild, link the CSV to `raw/day-004-abraham-lake/LakeTEMP_aggregated_v1.csv`, then run `node scripts/day-004/run-sql.mjs scripts/day-004/laketemp.sql && node scripts/day-004/snapshot.mjs`.
- [x] Quality filter from the LakeTEMP tech doc: trendline statistics, no intermittency, at least 46 readings; anything else is marked as low quality.
- [x] Ice days and water temperature KPI cards, ice season in the lake profile, monthly lake surface temperature with 95% intervals next to the air (`LswtMonthlyChart`), ice days by latitude across 1.2 M lakes, a map colored by ice days, and an ice fact in family mode.
- Finding: Abraham freezes 142 days a year, against a median of 188 for lakes at its latitude and 155 for those at a similar elevation.

## Day 005: Which languages are endangered and barely documented?

All 7,685 spoken first languages in Glottolog 5.4, set against two Glottolog measures: the Agglomerated Endangerment Status (AES, six levels from "not endangered" to "extinct") and the Most Extensive Description (MED, from "long grammar" to "wordlist or less"). The core question is which languages are both endangered and poorly documented: 881 are shifting or worse and have no grammar sketch.

- **Data pipeline (DuckDB, `scripts/day-005/`):** `build.sql` reads the CLDF `languages.csv` and `values.csv` into `dim_language.parquet` {glottocode, name, family, macroarea, lat, lon, iso639_3, countries}, `fact_status.parquet` {glottocode, aes, med, med_year, first_year}, `fact_features.parquet` {glottocode, feature_id, value, carriers, only_endangered} from Grambank, and `fact_coverage.parquet` (Grambank / WALS). `snapshot.mjs` writes `data/day-005-endangered-languages/summary.json` {global, byMacroarea, byCountry} and the bundled `snapshot.json`, and stops if the AES counts disagree with [GlottoScope](https://glottolog.org/langdoc/status). `preview.mjs` draws the two preview images.
- **Check:** AES counts match GlottoScope exactly (7,850 languages once sign languages are added back). MED counts differ from that page (e.g. 1,896 vs 1,490 "wordlist or less"); the page uses the citable CLDF release and says so.
- **Finding:** no Grambank feature value is carried *only* by endangered languages (`only_endangered` is false everywhere), and 385 of 398 values are carried mostly by endangered or extinct languages, which is close to the 64% base rate.
- **Downloads** go to `daily-data-lab/raw/day-005-endangered-languages/` (not versioned): `glottolog-cldf-v5.4.zip` from Zenodo, and Grambank v1.0.3 / WALS v2020.6 CLDF tables from their GitHub releases.

### Sprint 1

- [x] Glottolog CLDF → DuckDB → parquet + summary.json, checked against GlottoScope (#17)
- [x] Grambank + WALS coverage and feature table (#18)
- [x] Dashboard: 4 KPIs, AES/MED map, stacked bars by macroarea, AES × MED heatmap with click filter, family treemap, country ranking, language profile with Glottolog link, family mode, attribution (#19)
- [x] Research blocks with DOI-checked references, cross-day insight, previews (#20)

## Day 006: Where is the world's food wasted, and by whom?

UNEP's Food Waste Index Report 2024 estimates (year 2022) for all 228 countries and territories in UNEP's Annex 3 (no ranking cut-off), split into households, food service, and retail, and set against undernourishment (FAOSTAT), income group and region (World Bank), and mean temperature (CCKP). Mexico and the United States are highlighted throughout. Two filters (region and country) recompute KPIs, rankings, scatter fits, and facts; the rankings list every country in view and scroll to the selected one.

- **Data pipeline (DuckDB, `scripts/day-006/`):** `fetch.sh` downloads the raw files; `annex3.py` parses the report's Annex 3 (household estimates for 228 countries) and stops unless it sums to 630.96 Mt; `build.sql` joins Annex 3, the UN SDG series AG_FOOD_WST(_PC) for food service and retail, FAOSTAT undernourishment 2021–2023, World Bank population/region/income, and CCKP CRU TS 4.08 temperature into `country.parquet`; `snapshot.mjs` writes `data/day-006-food-waste/day-006.json` {kpis, countries[228], bySector, byIncome, byRegion, confidence, foodLossIndex} and stops if the world totals differ from UNEP's 1,052 / 631 / 290 / 131 Mt; `preview.mjs` draws the two preview images.
- **Check:** world totals match UNEP exactly (1,052.0 Mt; household 79.1 kg/cap and 631.0 Mt; food service 289.8 Mt; retail 131.2 Mt). The 228 countries sum to 1,051.5 Mt (−0.04%): the SDG database has Eurostat rows instead of FWI 2024 rows for 27 European countries, so their food service and retail use the Eurostat 2020 values UNEP used.
- **Finding:** household waste correlates with temperature at r = 0.25 across the 226 countries with a temperature but only r = 0.20 across the 66 with measured (high or medium confidence) estimates; extrapolated values inflate regional patterns.
- **Downloads** go to `daily-data-lab/raw/day-006-food-waste/` (not versioned). wedocs.unep.org blocks scripts, so the report PDF comes from the UN Digital Library.

### Sprint 1

- [x] UNEP / FAOSTAT / World Bank / CCKP → DuckDB → day-006.json, checked against UNEP totals (#21)
- [x] Dashboard: 5 KPIs, top-20 bars, sector and confidence donuts, income and region bars, temperature and hunger scatters, Food Loss Index lines, sortable table, family mode, attribution (#22)
- [x] Research blocks with DOI-checked references, translations, cross-day insight, previews (#23)

### Follow-up ideas

- Food-service and retail confidence per country from the UNEP Appendix tables.
- FAO Food Loss Index by country, to compare loss (farm to retail) with waste (retail to home).
- Refrigerator ownership and food prices as covariates for the temperature pattern.

## Day 007: How much of Earth orbit is junk, and who left it there?

Every Earth-orbiting object in CelesTrak's satellite catalogue (71,010 since 1957; 35,283 still in orbit on 2026-11-23), split into active satellites, dead satellites, rocket bodies, debris, and unidentified objects, by ESA orbit class, mean altitude, year, and owner. All 106 owners with objects in orbit are listed (no top-N cut). Two filters (orbit class and owner) recompute every KPI, chart, fact, and the owner ranking. Mode: SIMPLE (Tuesday), one bundled JSON, no API calls in the browser.

- **Data pipeline (DuckDB, `scripts/day-007/`):** `build.sql` reads `raw/day-007-space-debris/satcat.csv` (downloaded once, as CelesTrak's usage policy asks) into `object.parquet`, with ESA orbit classes (Space Environment Report 2026, Table 1.2), active = `OPS_STATUS_CODE` in (+, P, B, S, X), mean altitude = (apogee + perigee) / 2, and a catalogue-entry date estimated from catalogue numbers (SATCAT has none). `snapshot.mjs` writes `data/day-007-space-debris/day-007.json` {kpis, byType, byOrbit, byAltitudeBin, byYearLaunched, byYearDecayed, activeVsDebrisByYear, byOwner, topFragmentationParents, cube} and stops if the filter cube does not reproduce the SQL totals; owner names come from CelesTrak's `sources.php`. `preview.mjs` draws the two preview images. Rebuild with `npm run data:debris`.
- **Check against ESA:** 35,283 objects in orbit vs about 40,000 tracked by surveillance networks (ESA 2025 report, data to end of 2024); 17,473 active vs ≈11,300 active payloads in ESA's MASTER population at 1 February 2026. The gap is mostly ten months of launches (ESA: over 4,000 payloads in 2025) plus different definitions of "active". 1,022 intact re-entries in the last 12 months (2.8 a day) vs ESA's "more than three a day" for 2025.
- **ESA size classes:** the brief's 54,000 / 1.2 M / 140 M are older figures. The 2026 report (§2.4, MASTER at 1 February 2026) gives 68,450 objects > 10 cm, 1.5 million from 1 to 10 cm, and 230 million from 1 mm to 1 cm; the page uses those.
- **Finding:** half of what is tracked is junk (50.5%). Active satellites peak at 450–500 km (10,007, mostly constellation shells) and junk at 750–850 km, where ESA dates the Fengyun-1C (2007) and Iridium–Cosmos (2009) break-ups. The catalogue-number proxy places Fengyun-1C debris in 2007 and Kosmos 1408 debris in 2021, matching ESA's event dates.
- **3-D shell view:** the Three.js engine of the portfolio's Satellite Operations Console (Earth lit from the real Sun direction, atmosphere, starfield, orbit controls), with one dot per object; the hand-drawn canvas globe remains as the fallback without WebGL, with one dot per object in orbit at its real mean altitude and inclination, from a `shells` table in the JSON {orbit, owner, kind, altitude in 10 km steps, inclination in 1° steps}. SATCAT has no node or position along the orbit, so dots are spread around their shell with a fixed pseudo-random seed; the view shows density by height and tilt, not live positions. It follows the orbit and owner filters, has kind toggles, a stretched low-orbit close-up and a true-scale view out to GEO, drag and arrow-key rotation, a slow spin (off with reduced motion), and a hover readout per shell that matches the altitude bar chart.
- **Downloads** go to `daily-data-lab/raw/day-007-space-debris/` (not versioned): `satcat.csv` (+ its HTTP headers, used for the snapshot date), `sources.html`, ESA's report PDF, and NASA's HOOSF 16e PDF with its text in `nasa/hoosf16.txt` (extracted with pypdf).

### Sprint 1

- [x] CelesTrak SATCAT → DuckDB → day-007.json, cube checked against SQL totals (#24)
- [x] Dashboard: 5 KPIs, type and orbit donuts, LEO altitude profile, population with ESA-dated events, additions and re-entries per year, all owners stacked and in a sortable table, every debris cloud (all 3,118 launches with catalogued debris, scrollable), ESA size classes on a log scale, family mode, attribution (#25)
- [x] Research blocks with DOI-checked references, translations, cross-day insight, previews (#26)
- [x] 3-D shell view of every object in orbit (altitude × inclination), with filters, kind toggles, two scales, and a shell readout (#27)

### Sprint 2

- [x] Break-up causes: `hoosf.py` parses Table 2.1 of NASA's History of On-orbit Satellite Fragmentations, 16th ed. (268 break-ups to 1 May 2022, stops unless all 268 parse) into `breakups.csv`; each debris piece takes its launch's main cause, the 2022 and 2024 CZ-6A stages follow ESA's propulsion class, later pieces are "after NASA's list". Finding: 37% of debris in orbit comes from propulsion or battery explosions, 18% from anti-satellite tests, 6% from accidental collisions (#28)
- [x] Radar size: SATCAT RCS in the historical NORAD classes (< 0.1, 0.1–1, > 1 m², per Vierinen et al. 2026); 84% of sized debris is small, and 59% of objects in orbit have no RCS because none is published for payloads launched after April 2017 (#29)
- [x] Live positions on the 3-D globe: CelesTrak GP data (active satellites plus the Fengyun-1C, Cosmos 2251 and Iridium 33 debris groups, about 19,600 objects; CORS `*`) propagated with SGP4 (satellite.js 6.0.2: version 7 ships a WASM build with top-level await that the IIFE bundle cannot load), loaded only on request, cached in the browser for 2 hours as CelesTrak's usage policy asks, recomputed every 30 s, with Natural Earth coastlines from Day 003 and a fallback to the shell view (#30)

### Follow-up ideas

- Causes for break-ups after May 2022, when NASA's list ends (ESA DISCOS needs a DISCOSweb account).
- Mass and cross-section by orbit, to weigh junk by collision risk instead of count.
- Altitude profile over time: how constellation shells moved active satellites below the debris belt.

## Day 008: How much crop diversity is safeguarded, and how much is backed up in Svalbard?

Every seed sample in the Svalbard Global Seed Vault (1,417,961 from 135 genebanks and 6,587 species on 2026-11-25) by depositor, opening date, crop genus and continent of origin, set against the 5,987,633 accessions that 901 genebanks in 118 countries and 17 international and regional centres report to FAO for SDG indicator 2.5.1.a (2024). One global filter (continent of the depositing genebank, with international centres as their own group, as in WIEWS) plus a country filter recompute the KPIs, charts, Pareto curve, facts and table. All 128 countries in either source are listed (no top-N cut); the depositor and crop charts show the 20 largest. Mode: SIMPLE (Wednesday), one bundled JSON, no API calls in the browser.

- **Data pipeline (DuckDB, `scripts/day-008/`):** `fetch.sh` downloads the Seed Portal's public "Export" tables (depositors, deposit events, depositor × date × crop, depositor × genus, genera, species, continents and countries of origin; `xlsx2csv.py` turns each into CSV), the WIEWS JSON behind the public overview and maps pages (2024 by country and centre, 1995–2024 trend), the UN M49 table and NordGen's Annual Progress Report 2025, whose Table 5 is transcribed in `nordgen-table5.csv`. `snapshot.mjs` writes `data/day-008-seed-banks/day-008.json` {kpis, svalbardCumulativeByYear, depositEvents, svalbardByDepositorTop20, svalbardByCropTop20, svalbardByContinent, cropPareto, newDepositorsByYear, wiewsByCountry, wiewsTrend, countries, …}. `preview.mjs` draws the preview images. Rebuild with `npm run data:seeds`.
- **Checks:** the build stops unless every Seed Portal table sums to the same total, that total equals NordGen's end-2025 holdings (1,378,238) plus the 2026 deposits (39,723), the depositor (135) and species (6,587) counts match seedvault.no, and the WIEWS country and centre rows add up to the WIEWS total. seedvault.no shows 1,417,799 samples, 162 fewer than the Portal: the size of one deposit made on 13 October 2026.
- **Crop names:** the Seed Portal gives one name per genus; when one species holds at least 90% of a genus's samples, the genus takes that crop's name (Pennisetum "Kikuyu Grass" → pearl millet, 98% *P. glaucum*).
- **Finding:** five depositors hold 48% of the vault and 13 international centres 55%; 5 of 1,246 genera hold half of the samples. Of 118 countries reporting to WIEWS, 74 have a national depositor, with a median of 9% Svalbard samples per national accession. Mexico's national genebanks (94,724 accessions) have deposited nothing, while CIMMYT, near Mexico City, has 190,453 samples there.
- **Brief deviations:** the brief asked for Recharts, `public/data/` and the top 100 WIEWS countries. The lab draws hand-built SVG (CLAUDE.md), keeps data in `data/day-NNN-*/`, and lists every country.
- **Downloads** go to `daily-data-lab/raw/day-008-seed-banks/` (not versioned).

### Sprint 1

- [x] Seed Portal exports and FAO WIEWS → DuckDB → day-008.json, reconciled with NordGen and seedvault.no (#31)
- [x] Dashboard: 5 KPIs, holdings line, every opening, top 20 depositors and crops, origin donut, every country with its Svalbard backup, international centres, WIEWS trend, crop Pareto, new depositors per year, sortable country table, family mode, attribution (#32)
- [x] Research blocks with DOI-checked references, translations, research article, Excel export, previews, cross-day insight (#33)

### Follow-up ideas

- Match Svalbard and WIEWS accession by accession (DOIs or accession numbers) to count distinct accessions backed up.
- Seed-storage behaviour by genus, to compare only collections that can be stored as dry seed.
- Crops by country of origin for each depositor (one Seed Portal export per depositor).

## Day 009: Where do people live longest and healthiest, and do blue zones survive age validation?

Life expectancy (UN WPP 2024) and healthy life expectancy (WHO GHO, with 95% uncertainty intervals) for every one of the 237 countries and areas in 2023, the years lived in less than full health, people aged 100+, the female advantage, the record female life expectancy since 1950 and the Preston curve, next to what the blue-zone studies measured and the debate over whether their ages are real. One global filter (World Bank region) plus a country filter recompute the KPIs, rankings, scatter highlights, facts and table. Mode: SIMPLE (Thursday), one bundled JSON, no API calls in the browser.

- **Data pipeline (DuckDB, `scripts/day-009/`):** `fetch.sh` downloads the WPP 2024 CSVs (demographic indicators; population by five-year age group for the 100+ group), the WHO GHO OData indicators WHOSIS_000002 (HALE) and WHOSIS_000001 (life expectancy), and the World Bank API (countries, NY.GDP.PCAP.PP.KD, SH.XPD.CHEX.GD.ZS). `blue-zones.json` transcribes the blue-zone measures from the cited papers only. `snapshot.mjs` writes `data/day-009-longevity/day-009.json` {kpis, countries[], regions[], e0Trend{world, JPN, ITA, CRI, GRC, MEX, USA}, recordFemaleE0[], blueZones[]}; `preview.mjs` draws the preview images. Rebuild with `npm run data:longevity`.
- **Checks:** the build stops unless WPP world life expectancy is 73.2 in 2023 and 73.3 in 2024 (published values) and WHO's global HALE and life expectancy for 2023 are 62.8 and 73.3, and unless all 185 WHO countries join to WPP. The population-weighted HALE of the 185 countries is 63.14 (WHO weights with its own populations). Years in less than full health use WHO's own life expectancy, because UN and WHO estimates differ by 1.4 years on average (9.8 in Guyana).
- **Finding:** 10.5 of 73.3 years are lived in less than full health worldwide, from 7.0 (Somalia) to 13.9 (United States). Singapore leads HALE (72.9, 69.3–76.1) but all nine following countries overlap its interval. GDP per person explains 69% of HALE across 179 countries (9.4 healthy years per tenfold income; United States −5.1, Japan +4.4, Costa Rica +1.7); health spending as % of GDP explains 5%. Record female life expectancy rose 2.5 months a year since 1950 (Norway 73.3 → Hong Kong 88.1).
- **Blue zones:** Okinawa, Barbagia–Ogliastra (Sardinia), Nicoya and Ikaria with the survival measures of Poulain, Herm & Pes (2013, Table 2) and each zone's own index; Loma Linda flagged as non-demographic (a religious cohort). The debate is shown from both abstracts: Newman (2024, bioRxiv preprint) vs Austad & Pes (2025, *The Gerontologist*). The page states that national averages cannot test it.
- **Brief deviations:** the brief asked for Recharts, `public/data/`, the top 100 countries by population and top-20 charts. The lab draws hand-built SVG (CLAUDE.md), keeps data in `data/day-NNN-*/`, and lists every country (rankings scroll). "e0 vs HALE" is a stacked bar (healthy + less-healthy years = WHO life expectancy) instead of grouped bars, and the HALE ranking shows WHO's uncertainty intervals. Day 006's `ScatterCard` gained optional `xTicks`, `xFmt` and `yDomain` props, and its `LineChartCard` now keeps end labels apart.
- **Downloads** go to `daily-data-lab/raw/day-009-longevity/` (not versioned).

### Sprint 1

- [x] UN WPP 2024, WHO GHO and World Bank → DuckDB → day-009.json, checked against the published world figures (#34)
- [x] Dashboard: 5 KPIs, HALE with uncertainty, healthy vs less-healthy years, female − male gap, e0 since 1950 with the record line, centenarians, regions, Preston curve, health spending, blue zones with the debate, sortable table, family mode, attribution (#35)
- [x] Research blocks with DOI-checked references, translations, research article, Excel export, previews, cross-day insight (#36)

### Follow-up ideas

- Sub-national life tables for the blue-zone areas (Istat, Japan's MHLW, INEC Costa Rica, ELSTAT) to compare each zone with its own country today.
- HALE by sex and its 2000–2023 trend: did healthy years grow as fast as total years?
- Test Newman's predictors on age-validated supercentenarian records only.

## Day 010: How many people have lost the night sky, how fast are the stars fading, and where are dark skies protected?

The share of people and land under each of Falchi's six sky-brightness levels in every country and territory, the 2015 World Atlas as a map with certified International Dark Sky Places, fifteen years of Globe at Night naked-eye star counts with a trend that corrects for where volunteers report from, satellites vs eyes, a star-loss simulator, certifications over time, and a close-up of Arizona–Sonora. Region, country, place-type, layer and map-view filters. Mode: FULL (Friday).

- **Data pipeline (`scripts/day-010/`):** `fetch.sh` downloads Falchi et al. (2016) as open XML (Europe PMC), the Globe at Night CSVs 2011–2025, a Wikidata SPARQL query for certified places, World Bank countries and population, and the 653 MB World Atlas 2015 zip (GFZ). `falchi_table.py` extracts Table 2; `raster.py` (Python with rasterio, numpy and Pillow, run from a separate environment, `npm run raster:darksky`) averages the 2.9 GB GeoTIFF to 1′ and 0.1°, reprojects the world image to the page's Equal Earth map, writes two palette PNGs (`sky-world.png` 191 KB, `sky-azson.png` 69 KB) and samples the atlas at every place and report. `snapshot.mjs` (DuckDB) writes Parquet tables to `raw/` (`fact_falchi_country`, `fact_gan_obs`, `dim_darksky_place`, `dim_country`) and `data/day-010-dark-skies/day-010.json`; `preview.mjs` draws the preview images. Rebuild with `npm run data:darksky`.
- **Checks:** the build stops unless Table 2's world row matches the paper's text (83.2% under light-polluted skies, 35.9% without the Milky Way, 22.5% of land); weighting 196 country rows by World Bank 2015 population gives 82.9% and 35.9%. Raster check points: Phoenix 8.76, Tucson 3.88, Hermosillo 4.04, Kitt Peak 0.015 mcd/m². Table 2 prints "2" for the world's land above 3000 μcd/m² (larger than the 1.2 above 688): left empty as a misprint.
- **Finding:** yearly mean limiting magnitude fell only from 3.54 (2011) to 3.15 (2022) because observers moved to darker sites (median atlas brightness 1.39 → 0.78 mcd/m²). Within 1° cell × constellation groups the slope is −0.040 mag/yr (95% CI −0.049 to −0.030, 3,188 groups), about 7.4% brighter skies a year (5.5–9.2%), consistent with Kyba et al. (2023, 7–10%) and far above satellites (2.2%). 73 of 130 certified places with coordinates sit above 14 μcd/m²; all 34 places in the Arizona–Sonora window are in the US.
- **Licences:** Falchi et al. (2016) and the World Atlas are CC BY-NC 4.0 (the zip's 2016 README predates GFZ's change to CC BY-NC 4.0 after the embargo): used non-commercially with attribution to both, only downsampled images are published, and the GeoTIFF stays in `raw/` (gitignored). Globe at Night CC BY 4.0, Wikidata CC0, World Bank CC BY 4.0. Comments in the Globe at Night CSVs (which include some e-mail addresses) are never read into the outputs.
- **Brief deviations:** the brief asked for Recharts, MapLibre, DuckDB-WASM, gdal2tiles web tiles and DarkSky's own place pages. The lab draws hand-built SVG (CLAUDE.md) and has no map library, so the atlas is two small PNG layers under Day 003's Equal Earth map instead of a tile pyramid; the data are aggregated at build time (150 KB JSON), so DuckDB runs in Node, not in the browser. darksky.org blocks automated requests and its terms could not be read, so Alicia chose Wikidata (135 of 259 places, few after 2021); DarkSky's totals (259 places, 25 countries, 196,000 km², 2025 Impact Report) are quoted, not recomputed, and the report link could not be machine-checked.
- **Downloads** go to `daily-data-lab/raw/day-010-dark-skies/` (not versioned).

### Sprint 1

- [x] Falchi Table 2, Globe at Night, Wikidata places and World Bank → DuckDB → Parquet + day-010.json, checked against the paper (#37)
- [x] Dashboard: 8 KPIs, sky map with places and reports, people/land by brightness, star loss, simulator, satellites vs eyes, certifications, types, protected ≠ dark, Arizona–Sonora, ranking, profiles, family facts, attribution (#38)
- [x] Research blocks with DOI-checked references, translations, research article, Excel export, previews, cross-day insight (#39)

### Sprint 2

- [x] World Atlas 2015 GeoTIFF → rasterio → downsampled Equal Earth and Arizona–Sonora layers, point samples (#40)

### Follow-up ideas

- DarkSky International's full list (with permission or an official export), to map the 124 places missing from Wikidata.
- VIIRS radiance change per country since 2015 next to the atlas.
- Sky Quality Meter networks and Kyba et al.'s full model for a proper trend estimate.

## Languages and publication calendar

The portfolio and Daily Data Lab can be switched manually between English, Spanish, Japanese, Italian, French, Brazilian Portuguese, and Simplified Chinese. English is the default; the selected language is shared through the `lang` URL parameter. The contribution-style calendar shows published days from the last 12 months and links each marked date to its visualization. Publication metadata is maintained once in [`../assets/daily-data-lab-days.js`](../assets/daily-data-lab-days.js) and used by both the portfolio and this app.

## Run locally

Use Node.js 18 or later.

```sh
npm install
npm run dev        # development server at http://localhost:5173
npm run build      # builds into ../lab for GitHub Pages
npm run snapshot   # refreshes the saved CBP data (Day 001)
npm run snapshot:glowworms   # refreshes GBIF records, climate, and the NZ outline (Day 002)
npm run snapshot:pillars     # rebuilds the Commons catalog, ERA5 weather, and world outline (Day 003)
npm run data:abraham         # HydroLAKES → dim_lake.parquet → snapshot (Day 004; needs the zip in raw/)
npm run fetch:abraham        # continues the Open-Meteo winter backfill within today's budget (Day 004)
npm run data:languages       # Glottolog/Grambank/WALS CLDF → parquet → snapshot and previews (Day 005; needs raw/)
npm run data:foodwaste       # UNEP/FAOSTAT/World Bank/CCKP → parquet → day-006.json and previews (Day 006; needs raw/)
npm run data:debris          # NASA HOOSF + CelesTrak SATCAT → parquet → day-007.json and previews (Day 007; needs raw/)
npm run typecheck            # checks the TypeScript days (the build runs it too)
```

New days can be written in TypeScript (`.tsx`); `tsconfig.json` allows the older `.jsx` days to keep working.

## Add a new day

1. Create a folder in `src/days/` with the visualization component.
2. Add the date, title, summary, topic, tags, and source to [`../assets/daily-data-lab-days.js`](../assets/daily-data-lab-days.js), then map its slug to the component in [`src/days/index.js`](src/days/index.js).
3. Add the day's public interface text to the five-language dictionaries in [`../assets/i18n.js`](../assets/i18n.js).
4. Run `npm run build` and commit both `daily-data-lab/` and `lab/`.


### Sharing a study

The build generates a share page in `lab/studies/` for each entry in the shared day registry. It serves the study’s title, description and preview image as Open Graph metadata, then opens the interactive study in the selected language. To give a new study its own social card, save a 1200 × 630 PNG beside its preview SVG with the suffix `-social.png`.
