// Refreshes only the 300-lake winter trends inside snapshot.json from data/day-004-abraham-lake/winters,
// using DuckDB regr_slope. Needs nothing from raw/, so the daily GitHub Action can run it.
// Usage: node scripts/day-004/update-trends.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { DuckDBInstance } from "@duckdb/node-api";

const SNAP = "src/days/day-004-abraham-lake/snapshot.json";
const snap = JSON.parse(readFileSync(SNAP, "utf8"));
const con = await (await DuckDBInstance.create(":memory:")).connect();
const rows = async (q) => (await con.runAndReadAll(q)).getRowObjectsJson();

await con.run(`CREATE TABLE winters AS
  SELECT r.lake_id, CAST(w.key AS INTEGER) AS winter, CAST(w.value.mean AS DOUBLE) AS mean_c
  FROM (
    SELECT lake_id, unnest(map_entries(CAST(winters AS MAP(VARCHAR, STRUCT(mean DOUBLE, days INTEGER))))) AS w
    FROM read_json('data/day-004-abraham-lake/winters/*.json', columns = {lake_id: 'INTEGER', winters: 'JSON'})
  ) r
  WHERE w.value.days >= 89 AND w.value.mean IS NOT NULL`);
const trends = await rows(`SELECT lake_id, min(winter) f, max(winter) l, count(*) n, round(avg(mean_c), 2) m,
  round(regr_slope(mean_c, winter) * 10, 3) s, round(regr_intercept(mean_c, winter), 3) i, round(regr_r2(mean_c, winter), 3) r2,
  round(sqrt((1 - regr_r2(mean_c, winter)) * var_samp(mean_c) / (var_samp(winter) * (count(*) - 2))) * 10, 3) se
  FROM winters GROUP BY 1 HAVING count(*) >= 10`);
const series = await rows(`SELECT lake_id, list([winter, round(mean_c, 2)] ORDER BY winter) AS s FROM winters GROUP BY 1`);

const n = (v) => (v == null ? null : Number(v));
const ABRAHAM = "7243"; // keeps its full 1951–2025 series from the original snapshot
snap.trends = { [ABRAHAM]: snap.trends[ABRAHAM] };
snap.series = { [ABRAHAM]: snap.series[ABRAHAM] };
trends.forEach((t) => { snap.trends[t.lake_id] = [n(t.f), n(t.l), n(t.n), n(t.m), n(t.s), n(t.i), n(t.r2), n(t.se)]; });
series.forEach((r) => { snap.series[r.lake_id] = r.s.map(([w, m]) => [n(w), n(m)]); });
snap.trendsUpdatedAt = new Date().toISOString();
writeFileSync(SNAP, JSON.stringify(snap));
console.log(`✓ trends for ${trends.length} of ${snap.top300.length} large lakes`);
