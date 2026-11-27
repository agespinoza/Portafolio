// Day 010 · builds data/day-010-dark-skies/day-010.json (and Parquet copies of each table in raw/) with DuckDB from:
//   Falchi et al. (2016) Table 2 (scripts/day-010/falchi_table.py), Globe at Night 2011–2025 (NOIRLab), certified
//   International Dark Sky Places from Wikidata, World Bank WDI population and regions, and the point samples of the
//   World Atlas 2015 raster (scripts/day-010/raster.py).
// Run from daily-data-lab/:  npm run data:darksky   (raw files: scripts/day-010/fetch.sh)
// Stops unless the world row of Table 2 matches the paper's text (83.2% of people under light-polluted skies, 35.9%
// without the Milky Way, 22.5% of land polluted) and the population-weighted country rows reproduce it.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { DuckDBInstance } from "@duckdb/node-api";

const RAW = "raw/day-010-dark-skies";
const OUT = "data/day-010-dark-skies";
const POP_YEAR = 2015; // the atlas year (VIIRS 2014, calibrated 2015)
const db = await DuckDBInstance.create(":memory:");
const con = await db.connect();
const rows = async (q) => (await con.runAndReadAll(q)).getRowObjectsJson();
const n = (v, d = 2) => (v == null ? null : Math.round(Number(v) * 10 ** d) / 10 ** d);
const fail = (msg) => { throw new Error(msg); };
const NAMES = JSON.parse(readFileSync("scripts/day-010/names.json", "utf8"));
delete NAMES._comment;

// ---- name → ISO3 lookup: World Bank names first, then the manual list ----
await con.run(`CREATE TABLE wbc AS
  WITH c AS (SELECT unnest(from_json(content::JSON -> 1, '["JSON"]')) r FROM read_text('${RAW}/wb_countries.json'))
  SELECT r ->> 'id' iso3, r ->> 'iso2Code' iso2, r ->> 'name' AS name, trim(r -> 'region' ->> 'value') region, trim(r -> 'incomeLevel' ->> 'value') income
  FROM c WHERE r -> 'region' ->> 'value' <> 'Aggregates'`);
await con.run(`CREATE TABLE names AS SELECT DISTINCT k, iso3 FROM (SELECT lower(name) k, iso3 FROM wbc UNION ALL
  SELECT lower(k), v FROM (VALUES ${Object.entries(NAMES).map(([k, v]) => `('${k.replace(/'/g, "''")}', ${v ? `'${v}'` : "NULL"})`).join(",")}) t(k, v))`);
await con.run(`CREATE TABLE pop AS SELECT iso3, max(val) FILTER (y = ${POP_YEAR}) p15, arg_max(val, y) plast, max(y) ylast FROM (
  SELECT r ->> 'countryiso3code' iso3, (r ->> 'date')::INT y, (r ->> 'value')::DOUBLE val
  FROM (SELECT unnest(from_json(content::JSON -> 1, '["JSON"]')) r FROM read_text('${RAW}/wb_pop.json'))
  WHERE r ->> 'value' IS NOT NULL) GROUP BY iso3`);
const [wpop] = await rows(`SELECT max(val) FILTER (y = ${POP_YEAR}) p15 FROM (
  SELECT (r ->> 'date')::INT y, (r ->> 'value')::DOUBLE val FROM (SELECT unnest(from_json(content::JSON -> 1, '["JSON"]')) r FROM read_text('${RAW}/wb_pop.json'))
  WHERE r ->> 'countryiso3code' = 'WLD')`);

// ---- dim_country + fact_falchi_country ----
await con.run(`CREATE TABLE falchi AS SELECT regexp_replace(name, '\\*$', '') AS name, name LIKE '%*' territory, * EXCLUDE (name)
  FROM read_csv('${RAW}/falchi_table2.csv', header=true)`);
const dupes = (await rows(`SELECT k FROM names GROUP BY k HAVING count(*) > 1`)).map((r) => r.k);
if (dupes.length) fail(`names with two ISO codes: ${dupes}`);
const unmatched = (await rows(`SELECT f.name FROM falchi f LEFT JOIN names n ON n.k = lower(f.name) WHERE n.k IS NULL`)).map((r) => r.name);
if (unmatched.length) fail(`Falchi names without an ISO code: ${unmatched}`);
await con.run(`CREATE TABLE fact_falchi_country AS SELECT n.iso3, f.name, f.territory,
    f.pop_gt14 pctPopPolluted, f.pop_gt688 pctPopNoMilkyWay, f.area_gt14 pctAreaPolluted, f.pop_gt3000 pctPopVeryBright,
    f.* EXCLUDE (name, territory)
  FROM falchi f JOIN names n ON n.k = lower(f.name)`);
await con.run(`CREATE TABLE dim_country AS SELECT f.iso3, coalesce(w.iso2, '') iso2, f.name, coalesce(w.region, 'Not classified') region, w.income,
    p.p15 pop2015, p.plast popLatest, p.ylast popYear
  FROM (SELECT iso3, first(name) AS name FROM fact_falchi_country WHERE iso3 IS NOT NULL GROUP BY iso3) f
  LEFT JOIN wbc w USING (iso3) LEFT JOIN pop p USING (iso3)`);

// Checks against the paper's text.
const [world] = await rows(`SELECT * FROM falchi WHERE name = 'World'`);
const want = { pop_gt14: 83.2, pop_gt688: 35.9, area_gt14: 22.5 };
for (const [k, v] of Object.entries(want)) if (world[k] !== v) fail(`World ${k} = ${world[k]}, paper ${v}`);
// Gaza Strip and West Bank share one code (PSE): weight each by its own share of PSE's population is unknown, so the
// check uses the countries with one row per code.
const [rec] = await rows(`SELECT sum(f.pop_gt14 * c.pop2015) / sum(c.pop2015) gt14, sum(f.pop_gt688 * c.pop2015) / sum(c.pop2015) gt688,
    sum(c.pop2015) pop, count(*) k
  FROM fact_falchi_country f JOIN dim_country c USING (iso3)
  WHERE c.pop2015 IS NOT NULL AND f.iso3 IN (SELECT iso3 FROM fact_falchi_country GROUP BY iso3 HAVING count(*) = 1)`);
if (Math.abs(rec.gt14 - want.pop_gt14) > 1.5 || Math.abs(rec.gt688 - want.pop_gt688) > 1.5) fail(`population-weighted countries ${rec.gt14} / ${rec.gt688}`);
console.log(`✓ Falchi Table 2: world ${world.pop_gt14}% polluted, ${world.pop_gt688}% no Milky Way, ${world.area_gt14}% of land · reconstructed from ${rec.k} countries with WB ${POP_YEAR} population: ${n(rec.gt14, 1)}% / ${n(rec.gt688, 1)}%`);

// ---- fact_gan_obs: Globe at Night, naked-eye (GAN) reports ----
// Kept: limiting magnitude 1–7 (0 = no chart matched, negative = missing), sky clear or ¼ cloudy, real coordinates.
await con.run(`CREATE TABLE gan_raw AS SELECT *, regexp_extract(filename, 'GaN(\\d+)', 1)::INT AS year
  FROM read_csv('${RAW}/gan/GaN*.csv', all_varchar=true, filename=true, union_by_name=true, ignore_errors=true, strict_mode=false)`);
await con.run(`CREATE TABLE gan_s AS SELECT * FROM read_csv('${RAW}/samples_gan.csv', header=true, columns={'id': 'VARCHAR', 'brightness': 'DOUBLE'})`);
await con.run(`CREATE TABLE fact_gan_obs AS SELECT g.ID id, g.year, g.Latitude::DOUBLE lat, g.Longitude::DOUBLE lon, g.LimitingMag::INT limitingMag,
    g.CloudCover cloud, g.Constellation constellation, split_part(g.Country, ' - ', 1) countryName, nullif(split_part(g.Country, ' - ', 2), '') subdivision,
    n.iso3 country, s.brightness atlas
  FROM gan_raw g LEFT JOIN names n ON n.k = lower(split_part(g.Country, ' - ', 1)) LEFT JOIN gan_s s ON s.id = g.ID
  WHERE g.ObsType = 'GAN' AND g.year BETWEEN 2011 AND 2025
    AND try_cast(g.LimitingMag AS INT) BETWEEN 1 AND 7 AND g.CloudCover IN ('clear', '1/4 of sky')
    AND try_cast(g.Latitude AS DOUBLE) BETWEEN -90 AND 90 AND try_cast(g.Longitude AS DOUBLE) BETWEEN -180 AND 180
    AND NOT (g.Latitude::DOUBLE = 0 AND g.Longitude::DOUBLE = 0)`);
await con.run(`ALTER TABLE fact_gan_obs ADD COLUMN region VARCHAR`);
await con.run(`UPDATE fact_gan_obs SET region = w.region FROM wbc w WHERE w.iso3 = fact_gan_obs.country`);
const [funnel] = await rows(`SELECT count(*) total, count(*) FILTER (ObsType = 'GAN') gan,
    count(*) FILTER (ObsType = 'GAN' AND LimitingMag = '0') lm0, count(*) FILTER (ObsType = 'GAN' AND try_cast(LimitingMag AS INT) < 0) lmMissing,
    count(*) FILTER (ObsType = 'GAN' AND CloudCover NOT IN ('clear', '1/4 of sky')) cloudy,
    count(*) FILTER (ObsType = 'GAN' AND try_cast(Latitude AS DOUBLE) = 0 AND try_cast(Longitude AS DOUBLE) = 0) zero
  FROM gan_raw WHERE year BETWEEN 2011 AND 2025`);
const [kept] = await rows(`SELECT count(*) n, count(atlas) withAtlas FROM fact_gan_obs`);
console.log(`✓ Globe at Night: ${funnel.total} rows, ${funnel.gan} naked-eye, ${kept.n} kept (${kept.withAtlas} inside the atlas)`);

// Yearly distribution, overall and for the regions the page compares.
const SUBSETS = {
  world: "TRUE", northAmerica: "region = 'North America'", europe: "region = 'Europe & Central Asia'",
  latam: "region = 'Latin America & Caribbean'", usa: "country = 'USA'", mexico: "country = 'MEX'", arizona: "subdivision = 'Arizona'",
};
const yearStats = {};
for (const [key, where] of Object.entries(SUBSETS)) {
  yearStats[key] = (await rows(`SELECT year, count(*) n, quantile_cont(limitingMag, 0.5) med, quantile_cont(limitingMag, 0.25) p25,
      quantile_cont(limitingMag, 0.75) p75, avg(limitingMag) mean, median(atlas) atlasMed
    FROM fact_gan_obs WHERE ${where} GROUP BY year ORDER BY year`)).map((r) => ({ year: Number(r.year), n: Number(r.n), med: n(r.med, 2), p25: n(r.p25, 2), p75: n(r.p75, 2), mean: n(r.mean, 3), atlasMed: n(r.atlasMed, 4) }));
}
const lm0 = (await rows(`SELECT year, count(*) FILTER (LimitingMag = '0') z, count(*) FILTER (try_cast(LimitingMag AS INT) BETWEEN 0 AND 7) v
  FROM gan_raw WHERE ObsType = 'GAN' AND year BETWEEN 2011 AND 2025 AND CloudCover IN ('clear', '1/4 of sky') GROUP BY year ORDER BY year`)).map((r) => ({ year: Number(r.year), share: n(Number(r.z) / Number(r.v), 4) }));

// ---- Trend that controls for where people observe: within 1° cell × constellation groups ----
// slope = Σ(x − x̄g)(y − ȳg) / Σ(x − x̄g)², x = year, y = limiting magnitude. 95% CI by resampling groups (1,000 draws).
async function trend(where, y0, y1) {
  const g = await rows(`WITH o AS (SELECT floor(lat)::INT || ':' || floor(lon)::INT || ':' || constellation grp, year x, limitingMag y
      FROM fact_gan_obs WHERE ${where} AND year BETWEEN ${y0} AND ${y1}),
    m AS (SELECT grp, avg(x) mx, avg(y) my, count(DISTINCT x) yrs FROM o GROUP BY grp)
    SELECT o.grp, sum((x - mx) * (y - my)) sxy, sum((x - mx) ^ 2) sxx, count(*) k FROM o JOIN m USING (grp) WHERE yrs >= 2 GROUP BY o.grp`);
  const sxy = g.map((r) => Number(r.sxy)), sxx = g.map((r) => Number(r.sxx));
  const slope = sxy.reduce((a, b) => a + b, 0) / sxx.reduce((a, b) => a + b, 0);
  let seed = 20261127; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const draws = [];
  for (let b = 0; b < 1000; b++) {
    let a = 0, c = 0;
    for (let i = 0; i < g.length; i++) { const j = Math.floor(rnd() * g.length); a += sxy[j]; c += sxx[j]; }
    draws.push(a / c);
  }
  draws.sort((a, b) => a - b);
  return { slope: n(slope, 4), lo: n(draws[25], 4), hi: n(draws[974], 4), groups: g.length, obs: g.reduce((a, r) => a + Number(r.k), 0), y0, y1 };
}
// Calibration: limiting magnitude against log10 total zenith brightness (atlas artificial + 0.174 mcd/m² natural).
const [cal] = await rows(`SELECT regr_slope(limitingMag, log10(atlas + 0.174)) b, regr_intercept(limitingMag, log10(atlas + 0.174)) a,
    regr_r2(limitingMag, log10(atlas + 0.174)) r2, count(*) k FROM fact_gan_obs WHERE atlas IS NOT NULL`);
const trends = {};
for (const key of ["world", "northAmerica", "europe", "usa", "arizona"]) {
  trends[key] = { all: await trend(SUBSETS[key], 2011, 2025), kyba: await trend(SUBSETS[key], 2011, 2022) };
}
// Brightening implied by a magnitude trend s through the calibration slope b (both per year): 10^(s / b) − 1.
const implied = (s) => n((10 ** (s / cal.b) - 1) * 100, 1);
for (const t of Object.values(trends)) for (const v of Object.values(t)) { v.impliedPct = implied(v.slope); v.impliedLo = implied(v.hi); v.impliedHi = implied(v.lo); }
console.log(`✓ calibration LM = ${n(cal.a, 2)} ${n(cal.b, 2)}·log10(B), R² ${n(cal.r2, 3)}, n ${cal.k}`);
for (const [k, t] of Object.entries(trends)) console.log(`  ${k}: ${t.all.slope} mag/yr [${t.all.lo}, ${t.all.hi}] → ${t.all.impliedPct}%/yr · 2011–22: ${t.kyba.slope} → ${t.kyba.impliedPct}%/yr (${t.kyba.groups} groups)`);

// Observations on the map: 1° cells worldwide and 0.1° cells in Arizona–Sonora (median limiting magnitude).
const cells = (await rows(`SELECT floor(lat) + 0.5 la, floor(lon) + 0.5 lo, count(*) k, median(limitingMag) m FROM fact_gan_obs GROUP BY 1, 2 HAVING count(*) >= 3`))
  .map((r) => [n(r.lo, 1), n(r.la, 1), Number(r.k), n(r.m, 1)]);
const azCells = (await rows(`SELECT floor(lat * 10) / 10 + 0.05 la, floor(lon * 10) / 10 + 0.05 lo, count(*) k, median(limitingMag) m,
    count(*) FILTER (country = 'MEX') mx
  FROM fact_gan_obs WHERE lon BETWEEN -118 AND -106 AND lat BETWEEN 26 AND 38 GROUP BY 1, 2`)).map((r) => [n(r.lo, 2), n(r.la, 2), Number(r.k), n(r.m, 1), Number(r.mx)]);
const [azson] = await rows(`SELECT count(*) FILTER (subdivision = 'Arizona') az, median(limitingMag) FILTER (subdivision = 'Arizona') azMed,
    count(*) FILTER (country = 'MEX' AND lat BETWEEN 26 AND 33 AND lon BETWEEN -116 AND -108) son, median(limitingMag) FILTER (country = 'MEX' AND lat BETWEEN 26 AND 33 AND lon BETWEEN -116 AND -108) sonMed,
    count(*) FILTER (country = 'MEX') mex FROM fact_gan_obs`);

// Per-country observation summary (for the ranking table).
const ganByCountry = Object.fromEntries((await rows(`SELECT country, count(*) k, median(limitingMag) m FROM fact_gan_obs WHERE country IS NOT NULL GROUP BY 1`))
  .map((r) => [r.country, { obs: Number(r.k), medLM: n(r.m, 1) }]));

// ---- dim_darksky_place: Wikidata ----
const TYPE = { Q52216504: "park", Q72114283: "reserve", Q72114299: "sanctuary", Q72114249: "community" };
const PRIORITY = ["sanctuary", "reserve", "park", "community"];
const wd = JSON.parse(readFileSync(`${RAW}/wikidata_places.json`, "utf8")).results.bindings;
const samples = Object.fromEntries(readFileSync(`${RAW}/samples_places.csv`, "utf8").trim().split("\n").slice(1).map((l) => l.split(",")).map(([q, b]) => [q, b === "" ? null : Number(b)]));
const byItem = new Map();
for (const b of wd) {
  const qid = b.item.value.split("/").pop();
  const type = TYPE[b.type.value.split("/").pop()];
  const p = byItem.get(qid) ?? { qid, name: b.itemLabel.value, types: new Set(), starts: [], coord: null, countryName: null, areas: [], enwiki: null };
  p.types.add(type);
  if (b.start) p.starts.push({ type, year: Number(b.start.value.slice(0, 4)) });
  if (b.coord && !p.coord) p.coord = b.coord.value.replace(/Point\(|\)/g, "").split(" ").map(Number);
  if (b.countryLabel && !p.countryName) p.countryName = b.countryLabel.value;
  if (b.area) p.areas.push(Number(b.area.value));
  if (b.enwiki) p.enwiki = b.enwiki.value;
  byItem.set(qid, p);
}
const iso = Object.fromEntries((await rows(`SELECT k, iso3 FROM names`)).map((r) => [r.k, r.iso3]));
const places = [...byItem.values()].map((p) => {
  const types = [...p.types].sort((a, b) => PRIORITY.indexOf(a) - PRIORITY.indexOf(b));
  const year = p.starts.length ? Math.min(...p.starts.map((s) => s.year)) : null;
  return {
    id: p.qid, name: p.name, type: types[0], otherTypes: types.slice(1),
    country: p.countryName ? iso[p.countryName.toLowerCase()] ?? null : null, countryName: p.countryName,
    lat: p.coord ? n(p.coord[1], 4) : null, lon: p.coord ? n(p.coord[0], 4) : null, yearCertified: year,
    areaKm2: p.areas.length ? n(Math.max(...p.areas) / 1e6, 1) : null,
    atlas: samples[p.qid] ?? null,
    sourceUrl: `https://www.wikidata.org/wiki/${p.qid}`, wikipedia: p.enwiki,
  };
}).sort((a, b) => (a.yearCertified ?? 9999) - (b.yearCertified ?? 9999) || a.name.localeCompare(b.name));
if (places.some((p) => p.countryName && !p.country)) fail(`place countries without ISO: ${places.filter((p) => p.countryName && !p.country).map((p) => p.countryName)}`);
await con.run(`CREATE TABLE dim_darksky_place (id VARCHAR, name VARCHAR, type VARCHAR, country VARCHAR, lat DOUBLE, lon DOUBLE, yearCertified INT, areaKm2 DOUBLE, atlas DOUBLE, sourceUrl VARCHAR)`);
const app = await con.createAppender("dim_darksky_place");
for (const p of places) {
  app.appendVarchar(p.id); app.appendVarchar(p.name); app.appendVarchar(p.type);
  p.country ? app.appendVarchar(p.country) : app.appendNull(); p.lat == null ? app.appendNull() : app.appendDouble(p.lat); p.lon == null ? app.appendNull() : app.appendDouble(p.lon);
  p.yearCertified == null ? app.appendNull() : app.appendInteger(p.yearCertified); p.areaKm2 == null ? app.appendNull() : app.appendDouble(p.areaKm2);
  p.atlas == null ? app.appendNull() : app.appendDouble(p.atlas); app.appendVarchar(p.sourceUrl);
  app.endRow();
}
app.closeSync();
console.log(`✓ Wikidata: ${places.length} certified places, ${places.filter((p) => p.lat != null).length} with coordinates, ${places.filter((p) => p.yearCertified).length} with a year, ${places.filter((p) => p.areaKm2).length} with an area`);

// ---- Parquet copies (raw/, not versioned) ----
for (const t of ["fact_falchi_country", "fact_gan_obs", "dim_darksky_place", "dim_country"]) await con.run(`COPY ${t} TO '${RAW}/${t}.parquet' (FORMAT parquet)`);

// ---- JSON for the page ----
const countries = (await rows(`SELECT f.*, c.iso2, c.region, c.income, c.pop2015, c.popLatest, c.popYear FROM fact_falchi_country f LEFT JOIN dim_country c USING (iso3)
  WHERE f.iso3 IS NOT NULL ORDER BY f.name`)).map((r) => ({
  iso3: r.iso3, iso2: r.iso2 || null, name: r.name, territory: r.territory, region: r.region, pop2015: r.pop2015 == null ? null : Math.round(Number(r.pop2015)),
  pop: [r.pop_le1_7, r.pop_gt1_7, r.pop_gt14, r.pop_gt87, r.pop_gt688, r.pop_gt3000].map(Number),
  area: [r.area_le1_7, r.area_gt1_7, r.area_gt14, r.area_gt87, r.area_gt688, r.area_gt3000].map(Number),
  places: places.filter((p) => p.country === r.iso3).length,
  gan: ganByCountry[r.iso3] ?? null,
}));
const eu = await rows(`SELECT * FROM falchi WHERE name = 'European Union'`);
const raster = JSON.parse(readFileSync(`${RAW}/raster_stats.json`, "utf8"));
const out = {
  source: "Falchi et al. 2016 Table 2 (CC BY-NC 4.0) and World Atlas 2015 (GFZ, CC BY-NC 4.0); Globe at Night 2011–2025 (NOIRLab, CC BY 4.0); Wikidata (CC0); World Bank WDI (CC BY 4.0)",
  capturedAt: new Date().toISOString(), popYear: POP_YEAR,
  world: {
    pop: [world.pop_le1_7, world.pop_gt1_7, world.pop_gt14, world.pop_gt87, world.pop_gt688, world.pop_gt3000],
    // The paper prints "2" for the share of land above 3000 μcd/m², larger than the 1.2 above 688: a misprint, so null.
    area: [world.area_le1_7, world.area_gt1_7, world.area_gt14, world.area_gt87, world.area_gt688, null],
    population: Math.round(wpop.p15), reconstructed: { gt14: n(rec.gt14, 2), gt688: n(rec.gt688, 2), countries: Number(rec.k) },
  },
  eu: { pop: [eu[0].pop_le1_7, eu[0].pop_gt1_7, eu[0].pop_gt14, eu[0].pop_gt87, eu[0].pop_gt688, eu[0].pop_gt3000] },
  countries, places,
  gan: {
    funnel: { total: Number(funnel.total), gan: Number(funnel.gan), lm0: Number(funnel.lm0), lmMissing: Number(funnel.lmMissing), cloudy: Number(funnel.cloudy), zero: Number(funnel.zero), kept: Number(kept.n), withAtlas: Number(kept.withAtlas) },
    years: yearStats, lm0, trends, calibration: { a: n(cal.a, 3), b: n(cal.b, 3), r2: n(cal.r2, 3), n: Number(cal.k) },
    cells, azCells, azson: { az: Number(azson.az), azMed: n(azson.azMed, 1), son: Number(azson.son), sonMed: n(azson.sonMed, 1), mex: Number(azson.mex) },
  },
  raster: { world: raster.world, azson: raster.azson, checks: raster.checks },
};
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/day-010.json`, JSON.stringify(out));
console.log(`✓ ${OUT}/day-010.json · ${countries.length} countries · ${places.length} places · ${cells.length} + ${azCells.length} observation cells · ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`);
for (const k of ["MEX", "USA", "CAN"]) { const c = countries.find((x) => x.iso3 === k); console.log(`  ${k} polluted ${c.pop[2]}% · no Milky Way ${c.pop[4]}% · places ${c.places} · GaN ${c.gan?.obs}`); }
console.log(`  Arizona ${azson.az} obs (median LM ${azson.azMed}) · Sonora box ${azson.son} (median ${azson.sonMed}) · Mexico ${azson.mex}`);
