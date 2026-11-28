// Day 011 · builds data/day-011-spices/day-011.json (and Parquet copies of each table in raw/) with DuckDB from:
//   FAOSTAT Crops and livestock products (QCL), Trade: crops and livestock (TCL) and the Detailed trade matrix (TM),
//   filtered to eight spice items by scripts/day-011/extract.sql; the UN M49 standard (country codes → ISO3,
//   scripts/day-011/m49.py); World Bank WDI country metadata (region, capital coordinates) and population; and the
//   cited historical layer in scripts/day-011/history.json.
// Run from daily-data-lab/:  npm run data:spices   (raw files: scripts/day-011/fetch.sh)
// Stops unless, for every spice and the latest year, the sum of the countries matches FAOSTAT's own World aggregate
// (what the FAOSTAT web query returns for "World") within 0.5% for production, exports and imports.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { DuckDBInstance } from "@duckdb/node-api";

const RAW = "raw/day-011-spices";
const OUT = "data/day-011-spices";
const FLOW_YEARS = [2000, 2010]; // plus the latest year
const db = await DuckDBInstance.create(":memory:");
const con = await db.connect();
const rows = async (q) => (await con.runAndReadAll(q)).getRowObjectsJson();
const fail = (msg) => { throw new Error(msg); };
const r = (v, d = 0) => (v == null ? null : Math.round(Number(v) * 10 ** d) / 10 ** d);

// ---- dim_spice: the eight FAOSTAT spice items (code, CPC) ----
const SPICES = [
  { id: "pepper", code: 687, cpc: "01651", name: "Pepper (Piper spp.), raw", short: "Black pepper" },
  { id: "chillies", code: 689, cpc: "01652", name: "Chillies and peppers, dry (Capsicum spp., Pimenta spp.), raw", short: "Dry chillies" },
  { id: "ginger", code: 720, cpc: "01657", name: "Ginger, raw", short: "Ginger" },
  { id: "seeds", code: 711, cpc: "01654", name: "Anise, badian, coriander, cumin, caraway, fennel and juniper berries, raw", short: "Seed spices" },
  { id: "nutmeg", code: 702, cpc: "01653", name: "Nutmeg, mace, cardamoms, raw", short: "Nutmeg & cardamom" },
  { id: "cinnamon", code: 693, cpc: "01655", name: "Cinnamon and cinnamon-tree flowers, raw", short: "Cinnamon" },
  { id: "cloves", code: 698, cpc: "01656", name: "Cloves (whole stems), raw", short: "Cloves" },
  { id: "vanilla", code: 692, cpc: "01658", name: "Vanilla, raw", short: "Vanilla" },
];
await con.run(`CREATE TABLE dim_spice AS SELECT * FROM (VALUES ${SPICES.map((s) => `('${s.id}', ${s.code}, '${s.cpc}', '${s.name.replace(/'/g, "''")}', '${s.short}')`).join(",")}) t(spiceId, itemCode, cpc, name, short)`);

// ---- areas: FAOSTAT area code → ISO3. Countries have codes below 5000; 351 "China" is the sum of mainland, Hong
// Kong, Macao and Taiwan and is dropped to avoid double counting; 261–269 are "excluding intra-trade" aggregates.
// Former states keep their own pseudo-codes so early years add up.
const EXTRA = { 214: ["TWN", "TW", "East Asia & Pacific", 25.03, 121.56], 15: ["BLX", "", "Europe & Central Asia", 50.85, 4.35],
  51: ["CSK", "", "Europe & Central Asia", 50.08, 14.42], 62: ["ETP", "", "Sub-Saharan Africa", 9.03, 38.74], 139: ["MID", "", "East Asia & Pacific", 28.21, -177.38],
  186: ["SCG", "", "Europe & Central Asia", 44.82, 20.46], 206: ["SUD", "", "Sub-Saharan Africa", 15.5, 32.56], 228: ["SUN", "", "Europe & Central Asia", 55.76, 37.62],
  248: ["YUG", "", "Europe & Central Asia", 44.82, 20.46] };
// Areas the World Bank lists without capital coordinates: approximate coordinates of the main town (map nodes only).
const COORDS = { REU: [-20.88, 55.45], GLP: [16.24, -61.53], MTQ: [14.6, -61.07], GUF: [4.94, -52.33], COK: [-21.21, -159.78], NIU: [-19.06, -169.92], PSE: [31.9, 35.2] };
await con.run(`CREATE TABLE m49 AS SELECT * FROM read_csv('${RAW}/m49.csv', all_varchar=true)`);
await con.run(`CREATE TABLE wbc AS
  WITH c AS (SELECT unnest(from_json(content::JSON -> 1, '["JSON"]')) r FROM read_text('${RAW}/wb_countries.json'))
  SELECT r ->> 'id' iso3, r ->> 'iso2Code' iso2, r ->> 'name' AS name, trim(r -> 'region' ->> 'value') region,
    try_cast(r ->> 'latitude' AS DOUBLE) lat, try_cast(r ->> 'longitude' AS DOUBLE) lon
  FROM c WHERE r -> 'region' ->> 'value' <> 'Aggregates'`);
await con.run(`CREATE TABLE wbpop AS SELECT iso3, arg_max(val, y) pop, max(y) popYear FROM (
  SELECT r ->> 'countryiso3code' iso3, (r ->> 'date')::INT y, (r ->> 'value')::DOUBLE val
  FROM (SELECT unnest(from_json(content::JSON -> 1, '["JSON"]')) r FROM read_text('${RAW}/wb_pop.json'))
  WHERE r ->> 'value' IS NOT NULL) GROUP BY iso3`);
await con.run(`CREATE TABLE fao_area AS SELECT area, min(m49) m49, min(name) AS name FROM (
  SELECT area, m49, name FROM '${RAW}/qcl.parquet' UNION SELECT area, m49, name FROM '${RAW}/tcl.parquet'
  UNION SELECT rep, repM49, repName FROM '${RAW}/tm.parquet' UNION SELECT par, parM49, parName FROM '${RAW}/tm.parquet')
  WHERE area < 5000 AND area NOT IN (351, 261, 265, 266, 268, 269) GROUP BY area`);
await con.run(`CREATE TABLE extra AS SELECT * FROM (VALUES ${Object.entries(EXTRA).map(([a, [i3, i2, reg, la, lo]]) => `(${a}, '${i3}', '${i2}', '${reg}', ${la}, ${lo})`).join(",")}) t(area, iso3, iso2, region, lat, lon)`);
await con.run(`CREATE TABLE area_iso AS SELECT f.area, coalesce(e.iso3, m.iso3) iso3, f.name FROM fao_area f
  LEFT JOIN m49 m ON m.m49 = f.m49 LEFT JOIN extra e ON e.area = f.area`);
const unmatched = await rows(`SELECT * FROM area_iso WHERE iso3 IS NULL`);
if (unmatched.length) fail(`FAOSTAT areas without ISO3: ${unmatched.map((u) => u.name)}`);
const dupIso = await rows(`SELECT iso3, list(name) AS nm FROM area_iso GROUP BY iso3 HAVING count(*) > 1`);
if (dupIso.length) fail(`two FAOSTAT areas share an ISO3: ${JSON.stringify(dupIso)}`);

await con.run(`CREATE TABLE dim_country AS SELECT a.iso3, coalesce(w.iso2, e.iso2, '') iso2, a.name,
    coalesce(w.region, e.region, 'Not classified') region, coalesce(w.lat, e.lat) lat, coalesce(w.lon, e.lon) lon, p.pop, p.popYear,
    e.iso3 IS NOT NULL AND a.iso3 <> 'TWN' former
  FROM area_iso a LEFT JOIN wbc w USING (iso3) LEFT JOIN extra e ON e.area = a.area LEFT JOIN wbpop p USING (iso3)`);

// ---- fact_production, fact_trade (countries) and the FAOSTAT World aggregate ----
const prodSql = (where) => `SELECT s.spiceId, q.year,
    max(q.value) FILTER (q.el = 5510) tonnes, max(q.value) FILTER (q.el = 5312) areaHa
  FROM '${RAW}/qcl.parquet' q JOIN dim_spice s ON s.itemCode = q.item WHERE ${where} GROUP BY ALL`;
await con.run(`CREATE TABLE fact_production AS SELECT a.iso3, p.* FROM (${prodSql("q.area IN (SELECT area FROM area_iso)").replace("SELECT s.spiceId", "SELECT q.area, s.spiceId")}) p JOIN area_iso a USING (area)`);
await con.run(`ALTER TABLE fact_production DROP COLUMN area`);
await con.run(`DELETE FROM fact_production WHERE coalesce(tonnes, 0) = 0 AND coalesce(areaHa, 0) = 0`);
await con.run(`CREATE TABLE world_production AS ${prodSql("q.area = 5000")}`);
const tradeSql = (where) => `SELECT q.area, s.spiceId, q.year,
    max(q.value) FILTER (q.el = 5910) exportT, max(q.value) FILTER (q.el = 5922) * 1000 exportUsd,
    max(q.value) FILTER (q.el = 5610) importT, max(q.value) FILTER (q.el = 5622) * 1000 importUsd
  FROM '${RAW}/tcl.parquet' q JOIN dim_spice s ON s.itemCode = q.item WHERE ${where} GROUP BY ALL`;
await con.run(`CREATE TABLE fact_trade AS SELECT a.iso3, t.* EXCLUDE (area) FROM (${tradeSql("q.area IN (SELECT area FROM area_iso)")}) t JOIN area_iso a USING (area)`);
await con.run(`DELETE FROM fact_trade WHERE coalesce(exportT, 0) = 0 AND coalesce(exportUsd, 0) = 0 AND coalesce(importT, 0) = 0 AND coalesce(importUsd, 0) = 0`);
await con.run(`CREATE TABLE world_trade AS SELECT * EXCLUDE (area) FROM (${tradeSql("q.area = 5000")})`);

const [{ latest }] = await rows(`SELECT least((SELECT max(year) FROM world_production WHERE tonnes > 0), (SELECT max(year) FROM world_trade WHERE exportT > 0)) AS latest`);
const LATEST = Number(latest);
const [{ fy: first }] = await rows(`SELECT min(year) fy FROM world_production`);
const FIRST = Number(first);

// Check 1: the countries add up to FAOSTAT's World row for the latest year.
const check = await rows(`SELECT s.spiceId,
    w.tonnes worldT, (SELECT sum(tonnes) FROM fact_production p WHERE p.spiceId = s.spiceId AND p.year = ${LATEST}) sumT,
    t.exportT worldX, (SELECT sum(exportT) FROM fact_trade f WHERE f.spiceId = s.spiceId AND f.year = ${LATEST}) sumX,
    t.importT worldM, (SELECT sum(importT) FROM fact_trade f WHERE f.spiceId = s.spiceId AND f.year = ${LATEST}) sumM,
    t.exportUsd worldXusd, t.importUsd worldMusd
  FROM dim_spice s JOIN world_production w ON w.spiceId = s.spiceId AND w.year = ${LATEST}
  JOIN world_trade t ON t.spiceId = s.spiceId AND t.year = ${LATEST} ORDER BY w.tonnes DESC`);
for (const c of check) {
  for (const [a, b, k] of [[c.worldT, c.sumT, "production"], [c.worldX, c.sumX, "exports"], [c.worldM, c.sumM, "imports"]]) {
    const gap = Math.abs(Number(a) - Number(b)) / Number(a);
    if (gap > 0.005) fail(`${c.spiceId} ${k} ${LATEST}: World ${a} vs countries ${b} (${(gap * 100).toFixed(2)}%)`);
  }
  c.gapPct = r((100 * (Number(c.worldX) - Number(c.worldM))) / Number(c.worldM), 1);
  console.log(`✓ ${c.spiceId.padEnd(9)} ${LATEST}: ${r(c.worldT).toLocaleString("en")} t produced (= World row) · exports ${r(c.worldX).toLocaleString("en")} t vs imports ${r(c.worldM).toLocaleString("en")} t (${c.gapPct > 0 ? "+" : ""}${c.gapPct}%)`);
}
// Check 2: world exports and imports of the same goods should be close; the gap is reporting asymmetry (BACI's
// reconciliation problem: CIF imports, FOB exports, re-exports, non-reporters). Stop above 35% in tonnes.
const bad = check.filter((c) => Math.abs(c.gapPct) > 35);
if (bad.length) fail(`export/import gap above 35%: ${bad.map((b) => `${b.spiceId} ${b.gapPct}%`)}`);

// ---- concentration: HHI and top-3 share of production, every year; same for exports in the latest year ----
await con.run(`CREATE TABLE conc AS WITH s AS (
    SELECT spiceId, year, iso3, tonnes / sum(tonnes) OVER (PARTITION BY spiceId, year) sh,
      row_number() OVER (PARTITION BY spiceId, year ORDER BY tonnes DESC) rk
    FROM fact_production WHERE tonnes > 0)
  SELECT spiceId, year, sum(sh * sh) * 10000 hhi, sum(sh) FILTER (rk <= 3) top3, count(*) producers FROM s GROUP BY ALL`);
const [xc] = [await rows(`WITH s AS (SELECT spiceId, iso3, exportT / sum(exportT) OVER (PARTITION BY spiceId) sh FROM fact_trade WHERE year = ${LATEST} AND exportT > 0)
  SELECT spiceId, sum(sh * sh) * 10000 hhi, count(*) FILTER (sh >= 0.0001) exporters FROM s GROUP BY 1`)];

// ---- fact_flows: Detailed trade matrix, importer-reported flows (reporter = importer, partner = exporter) ----
const flowYears = [...FLOW_YEARS, LATEST];
await con.run(`CREATE TABLE fact_flows AS SELECT ri.iso3 reporterIso3, pi.iso3 partnerIso3, s.spiceId, t.year,
    max(t.value) FILTER (t.el = 5610) tonnes, max(t.value) FILTER (t.el = 5622) * 1000 usd
  FROM '${RAW}/tm.parquet' t JOIN dim_spice s ON s.itemCode = t.item
  JOIN area_iso ri ON ri.area = t.rep JOIN area_iso pi ON pi.area = t.par
  WHERE t.el IN (5610, 5622) AND t.year IN (${flowYears}) AND ri.iso3 <> pi.iso3 GROUP BY ALL`);
await con.run(`DELETE FROM fact_flows WHERE coalesce(usd, 0) = 0 AND coalesce(tonnes, 0) = 0`);
const flowCover = await rows(`SELECT f.spiceId, f.year, sum(f.usd) flowUsd, count(*) n, any_value(w.importUsd) worldUsd,
    count(DISTINCT reporterIso3) reporters
  FROM fact_flows f JOIN world_trade w USING (spiceId, year) GROUP BY ALL ORDER BY 1, 2`);
const top50 = await rows(`SELECT * FROM (SELECT *, row_number() OVER (PARTITION BY spiceId, year ORDER BY usd DESC NULLS LAST) rk FROM fact_flows) WHERE rk <= 50 ORDER BY spiceId, year, rk`);
const mexVanilla = await rows(`SELECT year, reporterIso3, tonnes, usd FROM fact_flows WHERE spiceId = 'vanilla' AND partnerIso3 = 'MEX' ORDER BY year, usd DESC`);

// ---- Parquet copies of every table ----
for (const t of ["dim_spice", "dim_country", "fact_production", "fact_trade", "fact_flows", "world_production", "world_trade", "conc"])
  await con.run(`COPY ${t} TO '${RAW}/${t}.parquet'`);

// ---- JSON for the page ----
const years = Array.from({ length: LATEST - FIRST + 1 }, (_, i) => FIRST + i);
const yi = (y) => y - FIRST;
const series = () => years.map(() => null);
const countries = await rows(`SELECT * FROM dim_country WHERE iso3 IN (SELECT iso3 FROM fact_production UNION SELECT iso3 FROM fact_trade
  UNION SELECT reporterIso3 FROM fact_flows UNION SELECT partnerIso3 FROM fact_flows) ORDER BY iso3`);
const world = {}, prod = {}, area = {}, trade = {}, hhi = {}, flows = {};
for (const s of SPICES) {
  world[s.id] = { prod: series(), area: series(), exportT: series(), exportUsd: series(), importT: series(), importUsd: series(), hhi: series(), top3: series(), producers: series() };
  prod[s.id] = {}; area[s.id] = {}; trade[s.id] = {}; flows[s.id] = {};
}
for (const w of await rows(`SELECT * FROM world_production WHERE year <= ${LATEST}`)) { world[w.spiceId].prod[yi(w.year)] = r(w.tonnes); world[w.spiceId].area[yi(w.year)] = r(w.areaHa); }
for (const w of await rows(`SELECT * FROM world_trade WHERE year <= ${LATEST}`)) for (const k of ["exportT", "exportUsd", "importT", "importUsd"]) world[w.spiceId][k][yi(w.year)] = r(w[k]);
for (const c of await rows(`SELECT * FROM conc WHERE year <= ${LATEST}`)) { const W = world[c.spiceId]; W.hhi[yi(c.year)] = r(c.hhi); W.top3[yi(c.year)] = r(Number(c.top3) * 100, 1); W.producers[yi(c.year)] = Number(c.producers); }
for (const p of await rows(`SELECT * FROM fact_production WHERE year <= ${LATEST} ORDER BY year`)) {
  (prod[p.spiceId][p.iso3] ??= series())[yi(p.year)] = r(p.tonnes);
  if (Number(p.year) === LATEST && p.areaHa != null) area[p.spiceId][p.iso3] = r(p.areaHa);
}
for (const t of await rows(`SELECT * FROM fact_trade WHERE year IN (${[1961, ...flowYears]}) ORDER BY year`)) {
  ((trade[t.spiceId][t.year] ??= {}))[t.iso3] = [r(t.exportT, 1), r(t.exportUsd), r(t.importT, 1), r(t.importUsd)];
}
for (const f of top50) (flows[f.spiceId][f.year] ??= []).push([f.reporterIso3, f.partnerIso3, r(f.tonnes, 1), r(f.usd)]);
const exportsSummary = Object.fromEntries(xc.map((x) => [x.spiceId, { hhi: r(x.hhi), exporters: Number(x.exporters) }]));

// summary: KPIs per spice (latest year), for the UI and the article
const summary = {};
for (const s of SPICES) {
  const W = world[s.id], L = yi(LATEST);
  const ranks = Object.entries(prod[s.id]).map(([iso3, v]) => [iso3, v[L] ?? 0]).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]);
  const imp = Object.entries(trade[s.id][LATEST] ?? {}).map(([iso3, v]) => [iso3, v[3] ?? 0]).sort((a, b) => b[1] - a[1]);
  const exp = Object.entries(trade[s.id][LATEST] ?? {}).map(([iso3, v]) => [iso3, v[1] ?? 0]).sort((a, b) => b[1] - a[1]);
  const base = W.prod.slice(0, 3).filter((v) => v != null);
  summary[s.id] = {
    worldTonnes: W.prod[L], areaHa: W.area[L], exportUsd: W.exportUsd[L], exportT: W.exportT[L], importUsd: W.importUsd[L], importT: W.importT[L],
    usdPerKg: r(W.exportUsd[L] / (W.exportT[L] * 1000), 2), hhi: W.hhi[L], top3: W.top3[L], producers: W.producers[L],
    exportHhi: exportsSummary[s.id].hhi, exporters: exportsSummary[s.id].exporters,
    topProducer: ranks[0]?.[0] ?? null, topProducerShare: ranks[0] ? r((100 * ranks[0][1]) / W.prod[L], 1) : null,
    topExporter: exp[0]?.[0] ?? null, topImporter: imp[0]?.[0] ?? null, topImporterShare: imp[0] ? r((100 * imp[0][1]) / W.importUsd[L], 1) : null,
    growth1961: base.length ? r(W.prod[L] / (base.reduce((a, b) => a + b, 0) / base.length), 2) : null,
    gapPct: check.find((c) => c.spiceId === s.id).gapPct,
  };
}

// FAOSTAT flags for the latest production figure: A official, E estimated, I imputed by FAO, X external source.
const flagRows = await rows(`SELECT s.spiceId, a.iso3, q.flag, q.value FROM '${RAW}/qcl.parquet' q JOIN dim_spice s ON s.itemCode = q.item
  JOIN area_iso a ON a.area = q.area WHERE q.el = 5510 AND q.year = ${LATEST} AND q.value > 0`);
const prodFlag = Object.fromEntries(SPICES.map((s) => [s.id, {}]));
for (const f of flagRows) if (f.flag !== "A") prodFlag[f.spiceId][f.iso3] = f.flag;
for (const s of SPICES) {
  const all = flagRows.filter((f) => f.spiceId === s.id), tot = all.reduce((a, f) => a + Number(f.value), 0);
  summary[s.id].officialPct = r((100 * all.filter((f) => f.flag === "A").reduce((a, f) => a + Number(f.value), 0)) / tot, 1);
}
const history = JSON.parse(readFileSync("scripts/day-011/history.json", "utf8"));
mkdirSync(OUT, { recursive: true });
const out = {
  capturedAt: new Date().toISOString(), first: FIRST, latest: LATEST, flowYears,
  spices: SPICES, countries: countries.map((c) => ({ iso3: c.iso3, iso2: c.iso2, name: c.name, region: c.region, lat: r(c.lat ?? COORDS[c.iso3]?.[0], 2), lon: r(c.lon ?? COORDS[c.iso3]?.[1], 2), pop: r(c.pop), popYear: c.popYear, former: c.former })),
  world, prod, area, trade, flows, summary, prodFlag,
  checks: check.map((c) => ({ spiceId: c.spiceId, worldT: r(c.worldT), sumT: r(c.sumT), worldX: r(c.worldX), worldM: r(c.worldM), gapPct: c.gapPct, worldXusd: r(c.worldXusd), worldMusd: r(c.worldMusd) })),
  flowCover: flowCover.map((f) => ({ spiceId: f.spiceId, year: Number(f.year), n: Number(f.n), reporters: Number(f.reporters), sharePct: r((100 * Number(f.flowUsd)) / Number(f.worldUsd), 1) })),
  mexVanilla: mexVanilla.map((m) => [Number(m.year), m.reporterIso3, r(m.tonnes, 1), r(m.usd)]),
  history,
};
writeFileSync(`${OUT}/day-011.json`, JSON.stringify(out));
console.log(`✓ ${OUT}/day-011.json · ${(JSON.stringify(out).length / 1024).toFixed(0)} KB · ${countries.length} countries · ${FIRST}–${LATEST} · flows ${flowYears}`);
console.table(flowCover.filter((f) => Number(f.year) === LATEST).map((f) => ({ spice: f.spiceId, flows: Number(f.n), reporters: Number(f.reporters), coverPct: r((100 * Number(f.flowUsd)) / Number(f.worldUsd), 1) })));
