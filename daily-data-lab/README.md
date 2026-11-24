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
