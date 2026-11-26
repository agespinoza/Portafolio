// Day 009 · builds data/day-009-longevity/day-009.json from UN WPP 2024, WHO GHO and World Bank WDI with DuckDB.
// Run from daily-data-lab/:  npm run data:longevity   (raw files: scripts/day-009/fetch.sh)
// Stops if the world figures differ from the published ones: WPP 2024 world e0 73.2 (2023) and 73.3 (2024);
// WHO GHO global HALE 62.8 and life expectancy 73.3 (2023).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { DuckDBInstance } from "@duckdb/node-api";

const RAW = "raw/day-009-longevity";
const YEAR = 2023; // last estimate year in WPP 2024 and last year in WHO GHO
const db = await DuckDBInstance.create(":memory:");
const con = await db.connect();
const rows = async (q) => (await con.runAndReadAll(q)).getRowObjectsJson();
const n = (v, d = 2) => (v == null ? null : Math.round(Number(v) * 10 ** d) / 10 ** d);
const fail = (msg) => { throw new Error(msg); };

// ---- UN WPP 2024 (thousands of people; e0 in years) ----
await con.run(`CREATE TABLE wpp AS SELECT ISO3_code iso3, ISO2_code iso2, LocTypeName loctype, "Location" AS name, Time::INT y,
  LEx::DOUBLE e0, LExMale::DOUBLE e0m, LExFemale::DOUBLE e0f, TPopulation1July::DOUBLE pop
  FROM read_csv('${RAW}/WPP2024_Demographic_Indicators_Medium.csv.gz', quote='"', all_varchar=true)
  WHERE Variant = 'Medium' AND Time::INT BETWEEN 1950 AND 2024 AND (ISO3_code <> '' OR Location = 'World')`);
await con.run(`CREATE TABLE c100 AS SELECT ISO3_code iso3, "Location" AS name, Time::INT y, PopTotal::DOUBLE p100
  FROM read_csv('${RAW}/WPP2024_PopulationByAge5GroupSex_Medium.csv.gz', quote='"', all_varchar=true)
  WHERE AgeGrp = '100+' AND Time::INT IN (2000, ${YEAR}) AND (ISO3_code <> '' OR Location = 'World')`);

const [w] = await rows(`SELECT
  max(e0) FILTER (y = ${YEAR}) e0, max(e0m) FILTER (y = ${YEAR}) e0m, max(e0f) FILTER (y = ${YEAR}) e0f,
  max(e0) FILTER (y = 2024) e0_24, max(e0) FILTER (y = 1950) e0_50, max(e0) FILTER (y = 2019) e0_19, max(e0) FILTER (y = 2021) e0_21,
  max(pop) FILTER (y = ${YEAR}) pop FROM wpp WHERE name = 'World'`);
if (Math.abs(w.e0 - 73.2) > 0.05 || Math.abs(w.e0_24 - 73.3) > 0.05) fail(`WPP world e0 ${w.e0} (2023), ${w.e0_24} (2024)`);
const [wc] = await rows(`SELECT max(p100) FILTER (y = ${YEAR}) p100, max(p100) FILTER (y = 2000) p100_00 FROM c100 WHERE name = 'World'`);
console.log(`✓ WPP 2024 world e0 ${YEAR} = ${n(w.e0)} (published 73.2), 2024 = ${n(w.e0_24)} (73.3) · 100+ = ${Math.round(wc.p100 * 1000).toLocaleString("en-US")}`);

// ---- WHO GHO: HALE and life expectancy at birth, both sexes, with uncertainty ----
const gho = (file, code) => `SELECT v ->> 'SpatialDimType' t, v ->> 'SpatialDim' iso3, (v ->> 'TimeDim')::INT y, v ->> 'Dim1' sex,
  (v ->> 'NumericValue')::DOUBLE val, (v ->> 'Low')::DOUBLE lo, (v ->> 'High')::DOUBLE hi
  FROM (SELECT unnest(from_json(content::JSON -> 'value', '["JSON"]')) v FROM read_text('${RAW}/${file}'))
  WHERE v ->> 'IndicatorCode' = '${code}'`;
await con.run(`CREATE TABLE hale AS ${gho("who_hale.json", "WHOSIS_000002")}`);
await con.run(`CREATE TABLE wle AS ${gho("who_le.json", "WHOSIS_000001")}`);
const [g] = await rows(`SELECT h.val hale, h.lo hlo, h.hi hhi, l.val le FROM hale h JOIN wle l USING (t, y, sex)
  WHERE t = 'GLOBAL' AND y = ${YEAR} AND sex = 'SEX_BTSX'`);
if (Math.abs(g.hale - 62.8) > 0.05 || Math.abs(g.le - 73.3) > 0.05) fail(`WHO global HALE ${g.hale}, LE ${g.le}`);
console.log(`✓ WHO GHO global ${YEAR}: HALE ${g.hale} (${g.hlo}–${g.hhi}), LE ${g.le}, gap ${n(g.le - g.hale, 1)}`);

// ---- World Bank WDI: region; GDP per capita PPP and health spending, ${YEAR} or the latest earlier year ----
await con.run(`CREATE TABLE wb AS
  WITH c AS (SELECT unnest(from_json(content::JSON -> 1, '["JSON"]')) r FROM read_text('${RAW}/wb_countries.json'))
  SELECT r ->> 'id' iso3, trim(r -> 'region' ->> 'value') region, trim(r -> 'incomeLevel' ->> 'value') income FROM c
  WHERE r -> 'region' ->> 'value' <> 'Aggregates'`);
const wdi = (code) => `SELECT iso3, arg_max(val, y) val, max(y) y FROM (
  SELECT r ->> 'countryiso3code' iso3, (r ->> 'date')::INT y, (r ->> 'value')::DOUBLE val
  FROM (SELECT unnest(from_json(content::JSON -> 1, '["JSON"]')) r FROM read_text('${RAW}/wb_${code}.json'))
  WHERE r ->> 'value' IS NOT NULL AND (r ->> 'date')::INT <= ${YEAR}) GROUP BY iso3`;
await con.run(`CREATE TABLE gdp AS ${wdi("NY.GDP.PCAP.PP.KD")}`);
await con.run(`CREATE TABLE hexp AS ${wdi("SH.XPD.CHEX.GD.ZS")}`);

// ---- One row per country or area in WPP 2024 (every one, no top-N cut) ----
const countries = (await rows(`
  SELECT p.iso3, p.iso2, p.name, coalesce(wb.region, 'Not classified') region, wb.income,
    p.pop, p.e0, p.e0m, p.e0f, c.p100, c0.p100 p100_00,
    h.val hale, h.lo hale_lo, h.hi hale_hi, l.val wle, hm.val hale_m, hf.val hale_f,
    gdp.val gdp, gdp.y gdp_y, hexp.val hexp, hexp.y hexp_y
  FROM wpp p
  LEFT JOIN wb USING (iso3)
  LEFT JOIN c100 c ON c.iso3 = p.iso3 AND c.y = ${YEAR}
  LEFT JOIN c100 c0 ON c0.iso3 = p.iso3 AND c0.y = 2000
  LEFT JOIN hale h ON h.t = 'COUNTRY' AND h.iso3 = p.iso3 AND h.y = ${YEAR} AND h.sex = 'SEX_BTSX'
  LEFT JOIN hale hm ON hm.t = 'COUNTRY' AND hm.iso3 = p.iso3 AND hm.y = ${YEAR} AND hm.sex = 'SEX_MLE'
  LEFT JOIN hale hf ON hf.t = 'COUNTRY' AND hf.iso3 = p.iso3 AND hf.y = ${YEAR} AND hf.sex = 'SEX_FMLE'
  LEFT JOIN wle l ON l.t = 'COUNTRY' AND l.iso3 = p.iso3 AND l.y = ${YEAR} AND l.sex = 'SEX_BTSX'
  LEFT JOIN gdp USING (iso3) LEFT JOIN hexp USING (iso3)
  WHERE p.y = ${YEAR} AND p.loctype = 'Country/Area'
  ORDER BY p.pop DESC`)).map((r) => ({
  iso3: r.iso3, iso2: r.iso2, name: r.name, region: r.region, income: r.income ?? null,
  pop: Math.round(Number(r.pop) * 1000),
  e0: n(r.e0), e0Male: n(r.e0m), e0Female: n(r.e0f),
  hale: n(r.hale, 1), haleLo: n(r.hale_lo, 1), haleHi: n(r.hale_hi, 1), haleMale: n(r.hale_m, 1), haleFemale: n(r.hale_f, 1),
  whoE0: n(r.wle, 1), gap: r.hale == null || r.wle == null ? null : n(Number(r.wle) - Number(r.hale), 1),
  centenarians: r.p100 == null ? null : Math.round(Number(r.p100) * 1000),
  centenarians2000: r.p100_00 == null ? null : Math.round(Number(r.p100_00) * 1000),
  centenariansPer100k: r.p100 == null ? null : n((Number(r.p100) / Number(r.pop)) * 1e5, 2),
  gdpPc: r.gdp == null ? null : Math.round(Number(r.gdp)), gdpYear: r.gdp_y == null ? null : Number(r.gdp_y),
  healthExpPct: n(r.hexp, 2), healthExpYear: r.hexp_y == null ? null : Number(r.hexp_y),
}));

const withHale = countries.filter((c) => c.hale != null);
if (withHale.length !== 185) fail(`expected 185 WHO countries with HALE, got ${withHale.length}`);
const unmatched = (await rows(`SELECT iso3 FROM hale WHERE t = 'COUNTRY' AND y = ${YEAR} AND sex = 'SEX_BTSX' AND iso3 NOT IN (SELECT iso3 FROM wpp WHERE loctype = 'Country/Area')`)).map((r) => r.iso3);
if (unmatched.length) fail(`WHO countries missing from WPP: ${unmatched}`);
// Population-weighted HALE of the 185 countries vs WHO's own global figure (WHO weights by its own population estimates).
const popW = withHale.reduce((a, c) => a + c.pop, 0);
const haleW = withHale.reduce((a, c) => a + c.hale * c.pop, 0) / popW;
if (Math.abs(haleW - g.hale) > 0.5) fail(`pop-weighted HALE ${haleW} vs WHO ${g.hale}`);
console.log(`✓ ${withHale.length} countries with HALE; population-weighted ${n(haleW, 2)} vs WHO global ${g.hale}`);

// ---- Life expectancy trends, 1950–2023, and the record (best-practice) female e0 each year ----
const TREND = ["JPN", "ITA", "CRI", "GRC", "MEX", "USA"];
const trendRows = await rows(`SELECT coalesce(nullif(iso3, ''), 'WLD') k, y, e0 FROM wpp
  WHERE y <= ${YEAR} AND (name = 'World' OR iso3 IN (${TREND.map((k) => `'${k}'`).join(",")})) ORDER BY k, y`);
const e0Trend = { years: [], world: [], ...Object.fromEntries(TREND.map((k) => [k, []])) };
for (const r of trendRows) {
  const key = r.k === "WLD" ? "world" : r.k;
  if (key === "world") e0Trend.years.push(Number(r.y));
  e0Trend[key].push(n(r.e0, 2));
}
// Oeppen & Vaupel (2002) "best practice": the highest female e0 of any national population each year. Here: any
// country or area of WPP with at least one million people that year, so city-states and micro-states do not lead.
const record = (await rows(`SELECT y, arg_max(iso3, e0f) iso3, max(e0f) e0f FROM wpp
  WHERE loctype = 'Country/Area' AND pop >= 1000 AND y <= ${YEAR} GROUP BY y ORDER BY y`)).map((r) => ({ year: Number(r.y), iso3: r.iso3, e0Female: n(r.e0f, 2) }));
const [fit] = await rows(`SELECT regr_slope(e0f, y) b, regr_intercept(e0f, y) a, regr_r2(e0f, y) r2 FROM
  (SELECT y, max(e0f) e0f FROM wpp WHERE loctype = 'Country/Area' AND pop >= 1000 AND y <= ${YEAR} AND y NOT IN (2020, 2021, 2022) GROUP BY y)`);

// ---- Regions: population-weighted e0 and HALE ----
const regions = (await rows(`SELECT coalesce(wb.region, 'Not classified') region, count(*) n, sum(p.pop) pop,
    sum(p.e0 * p.pop) / sum(p.pop) e0,
    sum(h.val * p.pop) FILTER (h.val IS NOT NULL) / sum(p.pop) FILTER (h.val IS NOT NULL) hale,
    count(h.val) nHale
  FROM wpp p LEFT JOIN wb USING (iso3)
  LEFT JOIN hale h ON h.t = 'COUNTRY' AND h.iso3 = p.iso3 AND h.y = ${YEAR} AND h.sex = 'SEX_BTSX'
  WHERE p.y = ${YEAR} AND p.loctype = 'Country/Area' GROUP BY 1 ORDER BY e0 DESC`)).map((r) => ({
  region: r.region, countries: Number(r.n), pop: Math.round(Number(r.pop) * 1000), e0: n(r.e0), hale: n(r.hale, 1), countriesWithHale: Number(r.nHale),
}));

const blueZones = JSON.parse(readFileSync("scripts/day-009/blue-zones.json", "utf8")).zones;
const topHale = [...withHale].sort((a, b) => b.hale - a.hale)[0];
const out = {
  source: "UN DESA World Population Prospects 2024 (CC BY 3.0 IGO); WHO Global Health Observatory, WHOSIS_000001 and WHOSIS_000002; World Bank WDI NY.GDP.PCAP.PP.KD and SH.XPD.CHEX.GD.ZS (CC BY 4.0); blue zones from the cited literature",
  capturedAt: new Date().toISOString(),
  year: YEAR,
  kpis: {
    worldE0: n(w.e0), worldE0Male: n(w.e0m), worldE0Female: n(w.e0f), worldE0_1950: n(w.e0_50), worldE0_2024: n(w.e0_24), worldE0_2019: n(w.e0_19), worldE0_2021: n(w.e0_21),
    worldHale: g.hale, worldHaleLo: g.hlo, worldHaleHi: g.hhi, worldWhoE0: g.le, gap: n(g.le - g.hale, 1),
    worldPop: Math.round(w.pop * 1000), centenarians: Math.round(wc.p100 * 1000), centenarians2000: Math.round(wc.p100_00 * 1000),
    centenariansPer100k: n((wc.p100 / w.pop) * 1e5, 2),
    topHaleCountry: topHale.iso3, topHale: topHale.hale,
    countries: countries.length, countriesWithHale: withHale.length, haleWeighted: n(haleW, 2),
    recordSlope: n(fit.b, 4), recordIntercept: n(fit.a, 3), recordR2: n(fit.r2, 4),
  },
  countries, regions, e0Trend, recordFemaleE0: record, blueZones,
};
const dir = "data/day-009-longevity";
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/day-009.json`, JSON.stringify(out));
const pick = (k) => countries.find((c) => c.iso3 === k);
console.log(`✓ ${dir}/day-009.json · ${countries.length} countries · ${regions.length} regions · top HALE ${topHale.name} ${topHale.hale}`);
console.log(`  record female e0 slope ${n(fit.b * 12, 2)} months/year (R² ${n(fit.r2, 3)}), ${record[0].iso3} ${record[0].e0Female} → ${record.at(-1).iso3} ${record.at(-1).e0Female}`);
for (const k of ["JPN", "ITA", "CRI", "GRC", "MEX", "USA"]) { const c = pick(k); console.log(`  ${k} e0 ${c.e0} · HALE ${c.hale} · gap ${c.gap} · 100+/100k ${c.centenariansPer100k}`); }
