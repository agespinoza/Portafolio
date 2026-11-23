# Bovine TB Surveillance Monitor

A screening model flags cattle herds for a confirmatory tuberculosis test. Over the years, the share of infected herds it sees goes up and down. This console replays real public statistics from Great Britain and Ireland, scales the number of herds screened by real US cattle imports from Mexico, and shows when a fixed flagging threshold goes stale, how a team can notice before confirmed results come back, and what each fix costs.

The herds, the model scores and the costs are simulated. The shares of infected herds and the cattle flow are real public data. The page says so wherever it shows a number.

## Career context

From 2015 to 2016 I was IT Manager at the Comité Estatal para el Fomento y Protección Pecuaria de Baja California (CEFPPBC). Our team managed the farm and cattle-shipment records used in bovine tuberculosis analysis for cattle sent to the United States. I scanned those records and loaded them into databases that we then used for analysis. This demo uses none of that data. It rebuilds the problem with international public statistics: cross-border cattle movement, herd surveillance, and a screening model that has to keep up as the disease picture changes.

## What it shows

| Panel | What it answers |
| --- | --- |
| Public data | The real share of infected herds for the selected region, and US cattle imports from Mexico per quarter. |
| What the flag rate reveals | What the model flags each quarter compared with the true share, and when each policy re-tunes its threshold. |
| Cumulative cost by policy | Running cost of missed herds, false alarms and re-tunes for each policy, quarter by quarter, with a table for the selected quarter. |
| Which policy costs least, on average? | Mean cost over many seeded simulated years, with the 10th–90th percentile range. |
| Public data behind the shares | Publisher, dataset, period and licence of every series used. |
| What this shows, and what it does not | Method notes and limits. |

The four policies:

- **Keep**: never change the threshold set in the first four quarters.
- **Unlabeled**: estimate the new share of infected herds from how many herds the model flags (black-box shift estimation, Lipton et al. 2018) and re-tune at once.
- **Labeled**: wait for confirmed test results, which arrive late, then re-tune.
- **Oracle**: always know the true share. This is the best any re-tuning could do with this test.

Sliders change the miss cost, the label delay, the re-tune margin and a what-if that amplifies the real change in prevalence. Another control changes the test itself partway through (more or less sensitive). That breaks the assumption behind the unlabeled estimate, so its estimate drifts away from the true share.

## Data

| Publisher | Dataset | Used for | Period | Licence |
| --- | --- | --- | --- | --- |
| Defra / APHA | [Tuberculosis in cattle in Great Britain](https://www.gov.uk/government/statistical-data-sets/tuberculosis-in-cattle-in-great-britain) | Herd prevalence for England (all, High Risk, Edge, Low Risk areas), Wales and Scotland | 2010 Q4 – 2026 Q2 | Open Government Licence |
| DAFM via CSO | [DAQ01 Bovine Tuberculosis](https://data.gov.ie/dataset/daq01-bovine-tuberculosis) | Ireland: herds restricted at quarter end over herds in the state | 2010 Q4 – 2024 Q1 | CC BY 4.0 |
| USDA ERS | [Livestock and Meat International Trade Data](https://www.ers.usda.gov/data-products/livestock-and-meat-international-trade-data) | Cattle imported by the US from Mexico, summed per quarter | 2010 Q4 – 2026 Q2 | US government data |
| SENASICA | [Situación actual de tuberculosis bovina](https://www.gob.mx/senasica/documentos/situacion-actual-de-tuberculosis-bovina) | Share of Mexico's territory by campaign phase, shown as context only | 30 Dec 2024 | gob.mx |

Caveats:

- No open monthly or herd-level bovine TB series exists for Mexico or the United States, so the share of infected herds comes from Great Britain and Ireland.
- The cattle flow only sets how many herds are screened each quarter. It is not infection data.
- Months with no cattle imports are missing from the ERS file and count as zero. US imports from Mexico drop sharply in 2025–2026. The official reason was not verified, so the console does not explain it.
- The Irish series ends in 2024 Q1.

## Run it

Serve the repository root with any static server and open `projects/18-bovine-tb-drift-monitor/index.html`, for example:

```sh
python3 -m http.server 8000
```

Rebuild the data snapshot (standard library only; add `--cache DIR` to reuse saved downloads):

```sh
python3 projects/18-bovine-tb-drift-monitor/build_data.py
```

Run the 11 engine tests (Node 20 or later):

```sh
node --test projects/18-bovine-tb-drift-monitor/engine.test.mjs
```

## Files

| File | Purpose |
| --- | --- |
| `engine.js` | Simulation and policies. No imports and no user interface, so the browser and the tests run the same code. |
| `engine.test.mjs` | Automated tests for the engine and the bundled snapshot. |
| `build_data.py` | Downloads the public sources and writes `data/snapshot.json`. |
| `app.js`, `charts.js`, `styles.css`, `index.html` | The console and its hand-built SVG charts. |
| `i18n.js`, `messages.js` | Seven languages, following the portfolio's `?lang=` convention. |
