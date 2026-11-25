// Day 008 · Seed banks: builds data/day-008-seed-banks/day-008.json with DuckDB from the raw files that
// scripts/day-008/fetch.sh downloads (Svalbard Seed Portal exports, FAO WIEWS SDG 2.5.1.a, UNSD M49) and the
// NordGen Annual Progress Report 2025 Table 5 (transcribed in scripts/day-008/nordgen-table5.csv).
// Run from daily-data-lab/:  npm run data:seeds
// Stops if the Seed Portal totals do not reconcile with the published NordGen and seedvault.no figures.
import { mkdirSync, writeFileSync } from "node:fs";
import { DuckDBInstance } from "@duckdb/node-api";

const RAW = "raw/day-008-seed-banks";
const db = await DuckDBInstance.create(":memory:");
const con = await db.connect();
const rows = async (q) => (await con.runAndReadAll(q)).getRowObjectsJson();
const N = (v) => (v == null ? null : Number(v));

// International (CGIAR and others) and regional genebanks. They hold collections on behalf of the world or a region,
// so FAO WIEWS reports them apart from the host country; the page does the same. NGA057 is IITA's Seed Portal code
// (WIEWS: NGA039); SYR002 is ICARDA's former Aleppo genebank, whose Svalbard duplicates rebuilt ICARDA in Lebanon and Morocco.
const INTL = {
  MEX002: ["CIMMYT", "MEX002"], PHL001: ["IRRI", "PHL001"], IND002: ["ICRISAT", "IND002"], SYR002: ["ICARDA", "LBN002"], LBN002: ["ICARDA", "LBN002"],
  TWN001: ["World Vegetable Center", "TWN001"], COL003: ["CIAT", "COL003"], NGA057: ["IITA", "NGA039"], CIV033: ["AfricaRice", "CIV033"],
  PER001: ["CIP", "PER001"], ETH013: ["ILRI", "ETH013"], KEN023: ["ICRAF", "KEN023"], ARE003: ["ICBA", "ARE003"],
  SWE054: ["NordGen", "SWE054"], ZMB030: ["SADC SPGRC", "ZMB030"], CRI001: ["CATIE", null],
};
const REGIONAL = new Set(["SWE054", "ZMB030", "CRI001"]);
const intlValues = Object.entries(INTL).map(([k, [name, w]]) => `('${k}', '${name}', ${w ? `'${w}'` : "NULL"}, ${REGIONAL.has(k)})`).join(",");

await con.run(`
CREATE TABLE m49 AS SELECT "ISO-alpha3 Code" iso3, "ISO-alpha2 Code" iso2, "Region Name" continent, "Sub-region Name" subregion, "Country or Area" m49_name
  FROM read_csv('${RAW}/m49.csv', all_varchar = true) WHERE "ISO-alpha3 Code" <> ''
  UNION ALL SELECT 'TWN', 'TW', 'Asia', 'Eastern Asia', 'Taiwan';  -- not in the M49 table
CREATE TABLE intl AS SELECT * FROM (VALUES ${intlValues}) t(code, center, wiews_code, regional);

-- Seed Portal: depositors (current holdings), deposit events, depositor × date × genus, depositor × genus, genera, origin.
CREATE TABLE dep_raw AS SELECT * FROM read_csv('${RAW}/sgsv-DepositorInstitutes.csv', header = true);
CREATE TABLE ev AS SELECT "Institute code" code, (DATE '1899-12-30' + "Date of deposit"::INT) d, "Species" species,
  "Accessions in" acc_in, "Accessions out" acc_out, "Seed boxes" boxes FROM read_csv('${RAW}/sgsv-SeedDepositEvents.csv', header = true);
CREATE TABLE ddc AS SELECT "Institute code" code, (DATE '1899-12-30' + "Date of deposit"::INT) AS d, "Genus name" genus, Accessions acc
  FROM read_csv('${RAW}/sgsv-DepositorDateAndCrop.csv', header = true, all_varchar = false);
CREATE TABLE dg AS SELECT "Institute code" code, "Genus name" genus, Accessions acc FROM read_csv('${RAW}/sgsv-DepositorGenus.csv', header = true);
CREATE TABLE genus AS SELECT Genus genus, coalesce(nullif("Vernacular name", ''), Genus) common, Accessions acc, Species species
  FROM read_csv('${RAW}/sgsv-Genus.csv', header = true, all_varchar = false, types = {'Vernacular name': 'VARCHAR'});
CREATE TABLE origin AS SELECT "Continent name" continent, Accessions acc, Depositors depositors, Species species FROM read_csv('${RAW}/sgsv-ContinentOfOrigin.csv', header = true);

CREATE TABLE dep AS
SELECT d."Institute code" code, d."Depositor name" AS name, d.Country country_name, left(d."Institute code", 3) iso3, m.iso2,
  i.center, i.wiews_code, coalesce(i.regional, false) regional, i.code IS NOT NULL is_intl,
  CASE WHEN i.code IS NOT NULL THEN 'International' ELSE m.continent END continent,
  d.Accessions samples, d.Species species, d.Taxa taxa,
  (SELECT min(year(e.d)) FROM ev e WHERE e.code = d."Institute code" AND e.acc_in > 0) first_year,
  (SELECT count(*) FROM ev e WHERE e.code = d."Institute code") events
FROM dep_raw d LEFT JOIN intl i ON i.code = d."Institute code" LEFT JOIN m49 m ON m.iso3 = left(d."Institute code", 3);
`);

// ---- Reconciliation checks (fail loudly) ----
const [tot] = await rows(`SELECT (SELECT sum(samples) FROM dep) dep, (SELECT sum(acc_in) FROM ev) ev, (SELECT sum(acc) FROM ddc) ddc,
  (SELECT sum(acc) FROM dg) dg, (SELECT sum(acc) FROM genus) genus, (SELECT count(*) FROM dep) n_dep,
  (SELECT count(*) FROM read_csv('${RAW}/sgsv-Species.csv', header = true)) n_species, (SELECT count(*) FROM genus) n_genus,
  (SELECT count(*) FROM dep WHERE continent IS NULL) no_continent,
  (SELECT sum(acc_in) FROM ev WHERE year(d) = 2026) dep2026`);
const portal = N(tot.dep);
for (const k of ["ev", "ddc", "dg", "genus"]) if (N(tot[k]) !== portal) throw new Error(`Seed Portal ${k} total ${tot[k]} ≠ depositors ${portal}`);
if (N(tot.no_continent)) throw new Error(`${tot.no_continent} depositors without a continent`);
const table5 = await rows(`SELECT * FROM read_csv('scripts/day-008/nordgen-table5.csv', header = true) ORDER BY year`);
const end2025 = N(table5.at(-1).holdings);
// NordGen APR 2025: 1,378,238 samples at the end of 2025. Seed Portal today = that + the 2026 deposits.
if (end2025 + N(tot.dep2026) !== portal) throw new Error(`Portal ${portal} ≠ NordGen end-2025 ${end2025} + 2026 deposits ${tot.dep2026}`);
// seedvault.no home page counter on 2026-11-25: 1,417,799 samples, 135 depositors, 6,587 species.
const WEBSITE = { samples: 1417799, depositors: 135, species: 6587 };
if (N(tot.n_dep) !== WEBSITE.depositors || N(tot.n_species) !== WEBSITE.species) throw new Error("Depositor or species count differs from seedvault.no");
if (Math.abs(portal - WEBSITE.samples) > 500) throw new Error(`Portal ${portal} vs seedvault.no ${WEBSITE.samples}`);
console.log(`✓ Seed Portal ${portal.toLocaleString("en")} samples = NordGen end-2025 ${end2025.toLocaleString("en")} + 2026 deposits ${N(tot.dep2026).toLocaleString("en")}; seedvault.no shows ${WEBSITE.samples.toLocaleString("en")} (${portal - WEBSITE.samples} fewer)`);
console.log(`✓ ${tot.n_dep} depositors, ${tot.n_species} species, ${tot.n_genus} genera`);

// ---- FAO WIEWS SDG 2.5.1.a (2024) ----
const dash = JSON.parse(await (await import("node:fs/promises")).readFile(`${RAW}/wiews-dashboard-2024.json`, "utf8"));
const trendRaw = JSON.parse(await (await import("node:fs/promises")).readFile(`${RAW}/wiews-trend.json`, "utf8")).data;
const wiewsTotal = dash.regions.find((r) => r.Regions === "TOTAL");
const wiewsCountries = [];
for (const g of dash.countries) for (const c of g.countries) {
  const m = /country=([A-Z]{3})/.exec(c.url ?? "");
  if (m) wiewsCountries.push({ iso3: m[1], name: c.Regions, accessions: c.Accessions, genebanks: c["Gene Bank"], genera: c.Genera, species: c.Species });
}
const wiewsIntl = dash.subregions.filter((g) => g.region === "International" || g.region === "Regional")
  .flatMap((g) => g.subregions.map((s) => ({ name: s.subregion, kind: g.region, instcode: /instcode=([A-Z0-9]+)/.exec(s.url ?? "")?.[1] ?? null, accessions: s.Accessions, genebanks: s["Gene Bank"], genera: s.Genera, species: s.Species })));
const sumC = wiewsCountries.reduce((a, c) => a + c.accessions, 0), sumI = wiewsIntl.reduce((a, c) => a + c.accessions, 0);
if (sumC + sumI !== wiewsTotal.Accessions) throw new Error(`WIEWS countries ${sumC} + centres ${sumI} ≠ total ${wiewsTotal.Accessions}`);
console.log(`✓ WIEWS 2024: ${wiewsCountries.length} countries ${sumC.toLocaleString("en")} + ${wiewsIntl.length} international/regional ${sumI.toLocaleString("en")} = ${wiewsTotal.Accessions.toLocaleString("en")} accessions, ${wiewsTotal["Gene Bank"]} genebanks`);
writeFileSync(`${RAW}/wiews-countries-2024.json`, JSON.stringify(wiewsCountries));
await con.run(`CREATE TABLE wc AS SELECT * FROM read_json('${RAW}/wiews-countries-2024.json')`);

// Continental trend: M49 continents plus international and regional centres.
const TREND_KEYS = { World: "World", Africa: "Africa", Americas: "Americas", Asia: "Asia", "Europe (M49)": "Europe", "Oceania (M49)": "Oceania", "International Centers (FAO)": "intl", "Regional Centres (FAO)": "regional" };
const byYear = new Map();
for (const r of trendRaw) {
  const k = TREND_KEYS[r.region_country];
  if (!k) continue;
  const y = byYear.get(r.year) ?? { year: r.year };
  y[k] = r.accessions;
  byYear.set(r.year, y);
}
const wiewsTrend = [...byYear.values()].sort((a, b) => a.year - b.year).map((y) => ({
  year: y.year, World: y.World, Africa: y.Africa, Americas: y.Americas, Asia: y.Asia, Europe: y.Europe, Oceania: y.Oceania, International: (y.intl ?? 0) + (y.regional ?? 0),
}));
const last = wiewsTrend.at(-1);
const parts = ["Africa", "Americas", "Asia", "Europe", "Oceania", "International"].reduce((a, k) => a + last[k], 0);
console.log(`✓ WIEWS trend ${wiewsTrend[0].year}–${last.year}: world ${last.World.toLocaleString("en")}, continents + centres ${parts.toLocaleString("en")}`);

// ---- Tables for the page ----
const depositors = (await rows(`SELECT * FROM dep ORDER BY samples DESC`)).map((r) => ({
  code: r.code, name: r.name, country: r.country_name, iso3: r.iso3, iso2: r.iso2 ?? null, continent: r.continent,
  center: r.center ?? null, regional: r.regional, samples: N(r.samples), species: N(r.species), taxa: N(r.taxa),
  firstYear: N(r.first_year), events: N(r.events),
}));
// Deposit events: every opening × depositor, with net samples still held (in) and samples withdrawn (out).
const depositEvents = (await rows(`SELECT strftime(d, '%Y-%m-%d') d, code, acc_in, acc_out, boxes, species FROM ev ORDER BY d, code`))
  .map((r) => ({ date: r.d, code: r.code, samples: N(r.acc_in), withdrawn: N(r.acc_out), boxes: N(r.boxes), species: N(r.species) }));
// Crops (genera) by depositor continent, so the continent filter can recompute rankings and the Pareto curve.
const cropsByContinent = (await rows(`SELECT dep.continent, dg.genus, sum(dg.acc) acc FROM dg JOIN dep USING (code) GROUP BY 1, 2 ORDER BY 1, 3 DESC`))
  .map((r) => ({ continent: r.continent, genus: r.genus, samples: N(r.acc) }));
// Common names: the Seed Portal gives one English name per genus, which can mislead (Pennisetum is "Kikuyu Grass", but
// 98% of its samples are pearl millet). When one species holds at least 90% of a genus's samples (Species export), the
// genus is labelled with that crop's usual English name from this list; otherwise the Seed Portal name is kept.
const CROP_NAME = { "Pennisetum glaucum": "Pearl millet", "Cicer arietinum": "Chickpea", "Eleusine coracana": "Finger millet", "Cajanus cajan": "Pigeon pea" };
await con.run(`CREATE TABLE sp AS SELECT trim(Species) species, split_part(trim(Species), ' ', 1) genus, Accessions acc FROM read_csv('${RAW}/sgsv-Species.csv', header = true)`);
const genera = (await rows(`
  WITH top AS (SELECT genus, arg_max(species, acc) top_species, max(acc) top_acc FROM sp GROUP BY 1)
  SELECT g.genus, g.common, g.acc, g.species, t.top_species, t.top_acc FROM genus g LEFT JOIN top t USING (genus) ORDER BY g.acc DESC`)).map((r) => {
  const share = r.top_acc == null ? null : N(r.top_acc) / N(r.acc);
  const common = share != null && share >= 0.9 && CROP_NAME[r.top_species] ? CROP_NAME[r.top_species] : r.common;
  return { genus: r.genus, common, portalName: r.common, samples: N(r.acc), species: N(r.species), topSpecies: r.top_species ?? null, topSpeciesShare: share == null ? null : Math.round(share * 1000) / 1000 };
});
const svalbardByContinent = (await rows(`SELECT * FROM origin ORDER BY acc DESC`)).map((r) => ({ continent: r.continent, samples: N(r.acc), depositors: N(r.depositors), species: N(r.species) }));

// Requested summary keys (world view). The page recomputes the same from the base tables for each continent filter.
const svalbardByDepositorTop20 = depositors.slice(0, 20).map(({ code, name, country, continent, samples }) => ({ code, name, country, continent, samples }));
const svalbardByCropTop20 = genera.slice(0, 20);
let acc = 0;
const cropParetoAll = genera.map((g, i) => ({ rank: i + 1, genus: g.genus, samples: g.samples, cumShare: Math.round(((acc += g.samples) / portal) * 1e5) / 1e5 }));
// Pareto: the first 100 genera (99% of samples) — the page recomputes the full curve from `genera`.
const cropPareto = cropParetoAll.slice(0, 100);
const newDepositorsByYear = Object.entries(depositors.reduce((m, d) => ((m[d.firstYear] = (m[d.firstYear] ?? 0) + 1), m), {}))
  .map(([y, n]) => ({ year: Number(y), depositors: n })).sort((a, b) => a.year - b.year);

// Cumulative holdings: NordGen Table 5 (2008–2025, published) + 2026 from the Seed Portal events.
const ev2026 = depositEvents.filter((e) => e.date.startsWith("2026"));
const svalbardCumulativeByYear = [
  ...table5.map((r) => ({ year: N(r.year), deposited: N(r.deposited), accumulated: N(r.accumulated), withdrawn: N(r.withdrawn), holdings: N(r.holdings), source: "NordGen APR 2025" })),
  { year: 2026, deposited: ev2026.reduce((a, e) => a + e.samples, 0), accumulated: null, withdrawn: null, holdings: portal, source: "Seed Portal (through 2026-10-13)" },
];

// Country table: every WIEWS country (2024) and every country with a national depositor in Svalbard.
const countries = (await rows(`
  WITH sv AS (SELECT iso3, sum(samples) samples, count(*) depositors, min(first_year) first_year FROM dep WHERE NOT is_intl GROUP BY 1)
  SELECT coalesce(wc.iso3, sv.iso3) iso3, m.iso2, coalesce(m.continent, 'Asia') continent, m.subregion, wc.name wiews_name,
    (SELECT any_value(country_name) FROM dep WHERE dep.iso3 = sv.iso3) sv_name, wc.accessions, wc.genebanks, wc.genera, wc.species,
    coalesce(sv.samples, 0) sv_samples, coalesce(sv.depositors, 0) sv_depositors, sv.first_year
  FROM wc FULL JOIN sv ON sv.iso3 = wc.iso3 LEFT JOIN m49 m ON m.iso3 = coalesce(wc.iso3, sv.iso3)
  ORDER BY wc.accessions DESC NULLS LAST, sv.samples DESC`)).map((r) => ({
  iso3: r.iso3, iso2: r.iso2 ?? null, name: r.wiews_name ?? r.sv_name, continent: r.continent, subregion: r.subregion ?? null,
  accessions: N(r.accessions), genebanks: N(r.genebanks), genera: N(r.genera), species: N(r.species),
  svalbardSamples: N(r.sv_samples), svalbardDepositors: N(r.sv_depositors), firstDeposit: N(r.first_year),
}));
const missingIso2 = countries.filter((c) => !c.iso2).map((c) => c.iso3);
if (missingIso2.length) throw new Error(`No ISO2 for ${missingIso2}`);

// International centres: Svalbard holdings vs WIEWS holdings, joined on the WIEWS institute code.
const centres = Object.values(depositors.filter((d) => d.center).reduce((m, d) => {
  const c = (m[d.center] ??= { center: d.center, regional: d.regional, codes: [], svalbardSamples: 0 });
  c.codes.push(d.code); c.svalbardSamples += d.samples; return m;
}, {})).map((c) => {
  const w = wiewsIntl.find((x) => x.instcode && INTL[c.codes[0]]?.[1] === x.instcode) ?? wiewsIntl.find((x) => x.name.toUpperCase() === c.center.toUpperCase());
  return { ...c, wiewsName: w?.name ?? null, wiewsAccessions: w?.accessions ?? null };
}).sort((a, b) => b.svalbardSamples - a.svalbardSamples);

const nationalCountries = countries.filter((c) => c.svalbardDepositors > 0);
const kpis = {
  svalbardSamples: portal, depositors: depositors.length, species: N(tot.n_species), genera: genera.length,
  globalExSituAccessions: last.World, globalYear: last.year, wiewsGenebanks: wiewsTotal["Gene Bank"], wiewsCountries: wiewsCountries.length,
  countriesBackedUp: nationalCountries.length, depositorCountries: new Set(depositors.map((d) => d.country)).size,
  wiewsCountriesBackedUp: countries.filter((c) => c.accessions && c.svalbardDepositors > 0).length,
};

const out = {
  source: "Svalbard Global Seed Vault Seed Portal (NordGen) exports; NordGen Seed Vault Annual Progress Report 2025; FAO WIEWS SDG 2.5.1.a ex situ holdings 2024 and trend; UNSD M49",
  capturedAt: new Date().toISOString(),
  reconciliation: {
    portalSamples: portal, websiteSamples: WEBSITE.samples, reportEnd2025Holdings: end2025, deposits2026: N(tot.dep2026),
    reportAccumulated: N(table5.at(-1).accumulated), reportWithdrawn: table5.reduce((a, r) => a + N(r.withdrawn), 0) - 40, // 40 = virtual withdrawal in 2020 (APR note 4)
    wiewsTotal2024Dashboard: wiewsTotal.Accessions, wiewsTotal2024Trend: last.World,
  },
  kpis, svalbardCumulativeByYear, depositEvents, depositors, svalbardByDepositorTop20, svalbardByCropTop20, genera, cropsByContinent,
  svalbardByContinent, cropPareto, newDepositorsByYear, centres,
  wiewsByCountry: wiewsCountries.map((c) => ({ ...c, ...pick(countries.find((x) => x.iso3 === c.iso3)) })), wiewsCentres: wiewsIntl, wiewsTrend, countries,
};
function pick(c) { return { iso2: c.iso2, continent: c.continent }; }
const dir = "data/day-008-seed-banks";
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/day-008.json`, JSON.stringify(out));
const top5 = depositors.slice(0, 5).reduce((a, d) => a + d.samples, 0);
const intlShare = depositors.filter((d) => d.center && !d.regional).reduce((a, d) => a + d.samples, 0) / portal;
console.log(`✓ ${dir}/day-008.json · ${countries.length} countries (${kpis.countriesBackedUp} with a national depositor) · top 5 depositors ${(100 * top5 / portal).toFixed(1)}% · international centres ${(100 * intlShare).toFixed(1)}%`);
console.log(`  genera for 50% / 80% of samples: ${cropParetoAll.findIndex((g) => g.cumShare >= 0.5) + 1} / ${cropParetoAll.findIndex((g) => g.cumShare >= 0.8) + 1} of ${genera.length}`);
console.log(`  centres: ${centres.map((c) => `${c.center} ${c.svalbardSamples}/${c.wiewsAccessions}`).join(" · ")}`);
