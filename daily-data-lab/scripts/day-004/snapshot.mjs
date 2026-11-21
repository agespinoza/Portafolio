// Builds src/days/day-004-abraham-lake/snapshot.json from the DuckDB tables. Run after dim_lake.sql
// and fetch-winters.mjs:  node scripts/day-004/snapshot.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { DuckDBInstance } from "@duckdb/node-api";

const db = await DuckDBInstance.create(":memory:");
const con = await db.connect();
const run = async (file) => {
  const st = await con.extractStatements(readFileSync(file, "utf8"));
  for (let i = 0; i < st.count; i++) await (await st.prepare(i)).run();
};
const rows = async (q) => (await con.runAndReadAll(q)).getRowObjectsJson();
const DIM = "'raw/day-004-abraham-lake/dim_lake.parquet'";
await run("scripts/day-004/winter.sql");

const n = (v) => (v == null ? null : Number(v));
const [abraham] = await rows(`SELECT * FROM ${DIM} WHERE lake_id = 7243`);
const [universe] = await rows(`SELECT count(*) total, count(name) named, count(*) FILTER (is_reservoir) reservoirs,
  count(*) FILTER (area_km2 >= 10) ge10, count(*) FILTER (area_km2 >= 100) ge100,
  count(*) FILTER (area_km2 > 52.12) larger_than_abraham, count(*) FILTER (depth_m > 34) deeper_than_abraham,
  round(sum(area_km2)) total_area_km2 FROM ${DIM}`);
const areaBins = await rows(`SELECT floor(log10(area_km2))::INT AS b, count(*) AS n FROM ${DIM} GROUP BY 1 ORDER BY 1`);
const continents = await rows(`SELECT continent, count(*) n, count(*) FILTER (is_reservoir) reservoirs FROM ${DIM} GROUP BY 1 ORDER BY n DESC`);

// Lakes offered in the picker: every named lake, every lake ≥ 100 km², and the 300 largest.
const picker = await rows(`SELECT lake_id, name, country, lat, lon, area_km2, depth_m, is_reservoir, elevation_m, volume_mcm
  FROM ${DIM} WHERE name IS NOT NULL OR area_km2 >= 100 ORDER BY area_km2 DESC`);
const trends = await rows(`SELECT * FROM winter_trend`);
const series = await rows(`SELECT lake_id, list([winter, round(mean_c, 2)] ORDER BY winter) AS s FROM winters GROUP BY 1`);
const months = await rows(`SELECT * FROM abraham_months`);
const [ab1991] = await rows(`SELECT * FROM abraham_trend_1991`);
const top300 = JSON.parse(readFileSync("data/day-004-abraham-lake/top300.json", "utf8")).map((l) => l.lake_id);

const out = {
  source: "HydroLAKES v1.0 (hydrosheds.org, CC-BY 4.0); ERA5 daily air temperature via Open-Meteo.com (CC-BY 4.0)",
  capturedAt: new Date().toISOString(),
  universe: Object.fromEntries(Object.entries(universe).map(([k, v]) => [k, n(v)])),
  areaBins: areaBins.map((r) => [n(r.b), n(r.n)]),
  continents: continents.map((r) => [r.continent, n(r.n), n(r.reservoirs)]),
  columns: ["id", "name", "country", "lat", "lon", "area_km2", "depth_m", "reservoir", "elevation_m", "volume_mcm"],
  lakes: picker.map((r) => [n(r.lake_id), r.name, r.country, n(r.lat), n(r.lon), n(r.area_km2), n(r.depth_m), r.is_reservoir ? 1 : 0, n(r.elevation_m), n(r.volume_mcm)]),
  top300,
  trendColumns: ["first_winter", "last_winter", "winters", "winter_mean_c", "slope_c_per_decade", "intercept", "r2", "slope_se"],
  trends: Object.fromEntries(trends.map((t) => [t.lake_id, [n(t.first_winter), n(t.last_winter), n(t.winters), n(t.winter_mean_c), n(t.slope_c_per_decade), n(t.intercept), n(t.r2), n(t.slope_se)]])),
  series: Object.fromEntries(series.map((r) => [r.lake_id, r.s.map(([w, m]) => [n(w), n(m)])])),
  abraham: { ...abraham, monthsAir: months.map((m) => [n(m.month), n(m.mean_c), n(m.min_c), n(m.max_c), n(m.pct_below_zero)]), trend1991: { slope: n(ab1991.slope_c_per_decade), se: n(ab1991.slope_se) } },
};
writeFileSync("src/days/day-004-abraham-lake/snapshot.json", JSON.stringify(out));
const done = Object.keys(out.trends).length - 1;
console.log(`✓ snapshot.json · ${out.lakes.length} lakes in picker · trends for Abraham + ${done} of 300 large lakes`);
