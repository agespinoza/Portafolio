# Excel analysis workbooks

Every Daily Data Lab day has two downloadable workbooks, built from the same snapshot the page uses:

- `day-NNN-<slug>-analysis.xlsx`: formulas, Excel tables, native charts, pipeline, checks, and a data dictionary. It has no macros.
- `day-NNN-<slug>-analysis.xlsm`: the same workbook plus the `DataLab` VBA module and buttons on the README sheet.

They are written to `public/downloads/`, which Vite copies to `../lab/downloads/`. `src/downloads.json` lists them for the download card on each day page (`src/StudyDownloads.jsx`).

## Commands (run from `daily-data-lab/`)

```sh
npm run excel:setup          # once: creates .venv-excel with XlsxWriter and openpyxl
npm run excel                # builds every day (or: npm run excel -- d006 d007)
npm run excel:verify         # opens each .xlsx in Excel for Mac, recalculates, reports checks and formula errors
npm run build                # copies the workbooks into ../lab/downloads/
```

## Files

| File | What it does |
| --- | --- |
| `build.py` | Builds both formats for each day module and writes `src/downloads.json`. |
| `book.py` | Shared frame: README, Analysis, Charts, Data sheets as Excel tables, Pipeline with `tblChecks`, Dictionary, Config, print setup. |
| `vba.py` | Writes `vbaProject.bin` from plain-text modules ([MS-OVBA] compression and `dir` stream, [MS-CFB] compound file). Python libraries can attach a VBA project but cannot create one. |
| `DataLab.bas` | The macros: `DL_RefreshAndCheck`, `DL_ProfileTable`, `DL_BuildPivot`, `DL_ExportTablesToCSV`, `DL_ResetView`, `DL_GoHome`, and the `DL_WILSON` worksheet function. Windows and Mac, no external references. |
| `days/dNNN.py` | One module per day: `META` (title, question, sources, caveats) and `build(book)` (tables, analysis, charts, pipeline steps, checks). |
| `verify.py` | Opens the `.xlsx` files in Excel via AppleScript, recalculates, and saves a calculated copy in `raw/excel-test/`. Then it reports every check and every formula error. |

## Rules for a new day

1. Copy the closest `days/dNNN.py`, add it to `DAYS` in `build.py`, and run `npm run excel -- dNNN`.
2. Put every row the page uses in the data tables. Do not cut to a top N.
3. Make the Analysis sheet live. Use formulas over the tables (`SUMIFS`, `COUNTIFS`, `INDEX`/`MATCH`, `AGGREGATE`, array formulas) and drop-downs for the main filters. Do not paste values computed in Python.
4. Add pipeline steps that match the real scripts, plus checks that recompute the page's key numbers and published totals.
5. Run `npm run excel:verify`. Every check must pass, and the report must show no formula errors.
6. Charts cannot use structured references, so use `Table.col_range()` or the Analysis ranges.

## Known limits

- Excel for Mac's PDF export draws scatter-chart markers in the wrong place. The workbooks themselves are correct; check scatter charts in Excel, not in an exported PDF.
- Files downloaded from the internet may have macros blocked. The README sheet explains how to unblock them.
