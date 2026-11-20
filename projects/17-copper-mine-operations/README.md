# Copper Mine Operations Console

Cerro Alto is a fictional open-pit porphyry copper mine, followed from the first drillhole to copper in concentrate. One reproducible pipeline drills the deposit, checks the assays, builds a geostatistical resource model, optimises the pit, schedules it, and simulates a year of haul-fleet, plant and grade-control data. A browser console then shows the results. Every number is fictional, and the console says so wherever a real report would carry a competent person's sign-off.

## Career context

In 2017 I worked on mining operations and business intelligence systems in Arizona (and I went back this march 2026 until today), using T-SQL, MDX and JavaScript. This project rebuilds that domain from first principles: the geology, mine-planning and metallurgy decisions behind the dashboards, and the data-science methods that make them trustworthy.

## What it shows

| Panel | What it answers |
| --- | --- |
| Geology & block model | Plan and section views of 35,200 blocks coloured by grade, geological domain or resource class, with drillholes, composites, topography and the pit shell for the selected copper price. |
| Variography | How far grade stays alike: experimental horizontal and downhole variograms with the fitted nugget + spherical model for each domain. |
| Model validation | Swath plots of composites against the kriged model and the true grade, and leave-one-hole-out cross-validation (bias, RMSE, correlation, slope). |
| Mineral resource | Measured, Indicated and Inferred tonnes and grade at any cut-off inside a pit shell, plus grade–tonnage curves of the model against the true deposit. |
| Pit optimisation | Eleven nested pit shells solved exactly, with ore, waste, strip ratio and best- and worst-case NPV for each. |
| Production | Twelve months of plan against actual (material moved, ore, mill feed, copper) and the life-of-mine plan. |
| Haul fleet | ASARCO time model per truck (availability, use of availability, utilisation, MTBF, MTTR), cycle time as the pit deepens, a truck with a developing final-drive failure, and the 10/10/20 payload policy by shovel. |
| Concentrator | A ridge-regression flotation recovery model tested on three months it never saw, compared with the planning assumption, with standardised effects and a what-if calculator. |
| Reconciliation | Monthly F1 (grade control / resource model), F2 (mill / grade control) and F3 factors for tonnes, grade and metal. |
| Assay QA/QC | CRM control charts with Westgard-style rules, blanks, field duplicates (HARD) and the batches that failed and were re-assayed. |

The copper-price control moves through the nested shells and updates the pit outline, the cut-off and the pit metrics. The cut-off slider recomputes the resource statement in the browser.

## Results (fictional)

| Item | Value |
| --- | --- |
| Measured + Indicated resource, 0.18 % Cu cut-off | 59.7 Mt at 0.46 % Cu (273 kt copper) |
| Final pit (revenue factor 1.0, US$ 4.10/lb) | 55.3 Mt of ore at 0.47 % Cu, strip ratio 0.85 |
| Life of mine | 7.7 years at 7.2 Mt/y mill feed |
| Copper in concentrate, Nov 2025 – Oct 2026 | 49.3 kt, 6.6 % above plan |
| Recovery model, test period | 0.69 percentage points MAE, against 2.98 for the planning assumption |
| Assay QA/QC | 248 batches, 5 failed and re-assayed, 98 % of duplicates within 10 % HARD |

## Methods

**Deposit and drilling.** The true grade field combines a NE-trending porphyry centre, a breccia body and Gaussian random fields at three scales (deposit, bench and veinlet). Weathering produced a leached cap and a supergene enrichment blanket above hypogene ore. 88 drillholes in four campaigns (exploration grid, step-outs and two infill programmes, some angled) were sampled every 3 m, with ASCu/TCu ratios logged.

**Resource estimation.** Assays are composited to bench height and broken at domain contacts. They are then top-cut at the 99th percentile per domain. Contact surfaces are interpolated from the logged intercepts. Variograms are fitted in order: the nugget from the downhole variogram, then the sill and horizontal range, then the vertical range. Blocks are estimated by ordinary block kriging (2 × 2 × 2 discretisation, up to 16 composites and 4 per hole, two search passes) inside hard domain boundaries. Classification uses the slope of regression, the number of drillholes and the average sample distance. Resources are reported inside a pit shell at 1.3 × the base price.

**Pit optimisation and scheduling.** Each block's value is the better of milling it or sending it to the waste dump, using domain recoveries and a mining cost that rises with depth. The ultimate pit at each revenue factor is the maximum closure of the precedence graph (1:5 pattern), solved with a maximum flow, so it is equal to Lerchs–Grossmann. Inferred blocks count as waste in the mine plan. An ore-driven scheduler mines a starter pit and two pushbacks month by month with a low-grade stockpile, and a test checks that no block is mined before the blocks above it.

**Operations.** The operating year simulates truck time records, cycle times from ramp length and the summer monsoon, a degrading truck, blasthole grade control with 15 % sampling error, mining dilution, a stockpile and daily plant data (throughput, hardness, grind size, reagents, pH, oxide ratio and recovery).

**Recovery model.** The model is a ridge regression on standardised features with engineered terms. The regularisation is chosen by expanding-window cross-validation on the first nine months, and the model is tested on the last three. It is compared with a naive average and with the fixed recoveries used in planning.

**Assay QA/QC.** Each batch of 40 samples carries two of three CRMs, one blank and one field duplicate. The simulation injects a laboratory calibration drift, two CRM sachet swaps and one contamination event, and the rules catch all of them.

**Known truth.** Because the deposit is synthetic, the pipeline also records the true grade of every block. The console uses it to show kriging's smoothing effect, which a real mine can only infer through reconciliation.

## Code

| File | Purpose |
| --- | --- |
| [`pipeline/deposit.py`](pipeline/deposit.py) | The synthetic deposit, the drilling campaigns, assays and bench compositing. |
| [`pipeline/geostats.py`](pipeline/geostats.py) | Experimental variograms, model fitting, neighbourhood search, ordinary block kriging and cross-validation. |
| [`pipeline/resource.py`](pipeline/resource.py) | Capping, variography by domain, the block model, classification and validation. |
| [`pipeline/economics.py`](pipeline/economics.py) | Economic parameters, block values and cut-off grades. |
| [`pipeline/pit.py`](pipeline/pit.py) | Maximum-closure pit optimisation (Dinic's maximum flow). |
| [`pipeline/operations.py`](pipeline/operations.py) | Phases, the scheduler, the life-of-mine plan, haul fleet, plant, grade control and F-factors. |
| [`pipeline/model.py`](pipeline/model.py) | Ridge regression, metrics and time-series cross-validation. |
| [`pipeline/qaqc.py`](pipeline/qaqc.py) | CRM, blank and duplicate quality control. |
| [`pipeline/build.py`](pipeline/build.py) | Runs everything and writes `data/`. |
| [`tests/test_pipeline.py`](tests/test_pipeline.py) | 17 automated tests, including a brute-force check of the pit optimiser and the schedule's precedence. |
| [`mine.js`](mine.js), [`mine.test.mjs`](mine.test.mjs) | Browser-side calculations and 6 tests that they match the Python results. |
| [`app.js`](app.js), [`charts.js`](charts.js), [`messages.js`](messages.js) | The console, its D3 charts and its text in Spanish, Japanese, Italian and French. |

The pipeline uses only the Python standard library, so every linear system, variogram fit and flow augmentation can be read in the source. The data files are `data/block-model.json`, `resource.json`, `operations.json` and `qaqc.json`. Three CSV files can be downloaded: drillhole collars, assays and daily plant data.

## Run it

From the repository root:

```sh
python3 -m http.server 8000                                        # then open http://localhost:8000/projects/17-copper-mine-operations/
python3 projects/17-copper-mine-operations/pipeline/build.py       # regenerate data/ (about a minute, seeded and deterministic)
python3 -m unittest discover -s projects/17-copper-mine-operations/tests
node --test projects/17-copper-mine-operations/mine.test.mjs       # Node 20 or later
```

*Fictional mine, fictional data. This is not a public resource or reserve report under JORC, NI 43-101 or S-K 1300.*
