// Day 007 · builds data/day-007-space-debris/day-007.json from raw/day-007-space-debris/object.parquet (build.sql)
// and CelesTrak's owner list (sources.html). Run from daily-data-lab/:  npm run data:debris
// The page recomputes every chart from `cube` when filtered; the named aggregates are the unfiltered DuckDB results,
// and this script stops if the cube does not add up to them.
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { DuckDBInstance } from "@duckdb/node-api";

const RAW = "raw/day-007-space-debris";
const db = await DuckDBInstance.create(":memory:");
const con = await db.connect();
const rows = async (q) => (await con.runAndReadAll(q)).getRowObjectsJson();
const N = (v) => Number(v);
await con.run(`CREATE VIEW o AS SELECT * FROM '${RAW}/object.parquet'`);

// Snapshot date = CelesTrak's Last-Modified header for satcat.csv (saved with the download).
const headers = readFileSync(`${RAW}/satcat.headers`, "utf8");
const lastMod = new Date(/last-modified:\s*(.+)/i.exec(headers)[1].trim());
const asOf = lastMod.toISOString().slice(0, 10);
const yearAgo = new Date(lastMod.getTime() - 365 * 864e5).toISOString().slice(0, 10);

// ESA Space Debris Office, ESA's Annual Space Environment Report, issue 10.1 (8 September 2026), §2.4:
// MASTER reference population at 1 February 2026. Copied from the report text; not derived from SATCAT.
const esa = {
  report: "ESA's Annual Space Environment Report, GEN-DB-LOG-00288-OPS-SD, issue 10.1, 8 September 2026",
  epoch: "2026-02-01", gt10cm: 68450, activeInGt10cm: 11300, cm1to10: 1.5e6, mm1to1cm: 230e6,
};

// Owner names from CelesTrak's SATCAT sources page.
const html = readFileSync(`${RAW}/sources.html`, "utf8");
const ownerNames = {};
for (const m of html.matchAll(/<tr[^>]*><td>([^<]+)<\/td><td>(.*?)<\/td><\/tr>/g)) {
  const name = m[2].replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();
  if (name) ownerNames[m[1].trim()] = name;
}
// Four codes used in SATCAT are missing from that page; they are ISO 3166-1 alpha-3 country codes.
const ISO3 = { SVK: "Slovakia", KWT: "Kuwait", JOR: "Jordan", UGA: "Uganda" };
for (const [c, n] of Object.entries(ISO3)) ownerNames[c] ??= n;

const CLS = ["active", "inactive", "rocket", "debris", "unknown"];
const CAUSES = ["asat", "collision", "propulsion", "battery", "selfDestruct", "unknown", "afterList", "none"];
const RCS = ["small", "medium", "large", "none"];
const ORBITS = (await rows(`SELECT orbit FROM o GROUP BY 1 ORDER BY count(*) FILTER (WHERE in_orbit) DESC, count(*) DESC`)).map((r) => r.orbit);
const OWNERS = (await rows(`SELECT owner FROM o GROUP BY 1 ORDER BY count(*) FILTER (WHERE in_orbit) DESC, count(*) DESC, 1`)).map((r) => r.owner);
const missing = OWNERS.filter((o) => !ownerNames[o]);
if (missing.length) console.warn(`! no CelesTrak name for: ${missing.join(", ")}`);

// Cube: [orbit, owner, cls, entryYear, decayYear (0 = in orbit), altBin (50 km, LEO in orbit; -1 otherwise), reenteredLast365 (0/1), n]
const cube = (await rows(`
  SELECT orbit, owner, cls, year(cat_date) ey, coalesce(year(decay), 0) dy,
    CASE WHEN in_orbit AND orbit = 'LEO' THEN floor(mean_alt_km / 50)::INT ELSE -1 END bin,
    (decay > DATE '${yearAgo}')::INT recent, count(*) n
  FROM o GROUP BY ALL ORDER BY ALL`))
  .map((r) => [ORBITS.indexOf(r.orbit), OWNERS.indexOf(r.owner), CLS.indexOf(r.cls), N(r.ey), N(r.dy), N(r.bin), N(r.recent), N(r.n)]);

// Unfiltered aggregates straight from DuckDB.
const [k] = await rows(`SELECT count(*) FILTER (WHERE in_orbit) tracked, count(*) FILTER (WHERE in_orbit AND cls = 'active') active,
  count(*) FILTER (WHERE decay > DATE '${yearAgo}') reentries, count(*) FILTER (WHERE decay > DATE '${yearAgo}' AND cls IN ('active','inactive','rocket')) reentriesIntact,
  count(*) catalogued FROM o`);
const kpis = {
  tracked: N(k.tracked), active: N(k.active), pctJunk: 1 - N(k.active) / N(k.tracked),
  est1cmPlus: esa.gt10cm + esa.cm1to10, reentriesLastYear: N(k.reentries), reentriesIntactLastYear: N(k.reentriesIntact), catalogued: N(k.catalogued),
};
const byType = (await rows(`SELECT cls k, count(*) n FROM o WHERE in_orbit GROUP BY 1 ORDER BY 2 DESC, 1`)).map((r) => ({ key: r.k, n: N(r.n) }));
const byOrbit = (await rows(`SELECT orbit k, count(*) n FROM o WHERE in_orbit GROUP BY 1 ORDER BY 2 DESC`)).map((r) => ({ key: r.k, n: N(r.n) }));
const byAltitudeBin = (await rows(`SELECT floor(mean_alt_km / 50)::INT * 50 km, cls, count(*) n FROM o WHERE in_orbit AND orbit = 'LEO' GROUP BY ALL ORDER BY ALL`))
  .map((r) => ({ km: N(r.km), cls: r.cls, n: N(r.n) }));
const byYearLaunched = (await rows(`SELECT year(launch) y, cls, count(*) n FROM o GROUP BY ALL ORDER BY ALL`)).map((r) => ({ year: N(r.y), cls: r.cls, n: N(r.n) }));
const byYearDecayed = (await rows(`SELECT year(decay) y, cls, count(*) n FROM o WHERE decay IS NOT NULL GROUP BY ALL ORDER BY ALL`)).map((r) => ({ year: N(r.y), cls: r.cls, n: N(r.n) }));
const lastYear = Number(asOf.slice(0, 4));
const activeVsDebrisByYear = (await rows(`
  SELECT y.y, o.cls, count(*) n FROM range(1957, ${lastYear + 1}) y(y)
  JOIN o ON year(o.cat_date) <= y.y AND (o.decay IS NULL OR year(o.decay) > y.y)
  GROUP BY ALL ORDER BY ALL`)).map((r) => ({ year: N(r.y), cls: r.cls, n: N(r.n) }));
// Every owner, no cut-off (the brief's byOwnerTop50 is kept as a name; the page lists all of them).
const byOwner = (await rows(`SELECT owner,
    count(*) FILTER (WHERE in_orbit AND cls = 'active') active, count(*) FILTER (WHERE in_orbit AND cls = 'inactive') inactive,
    count(*) FILTER (WHERE in_orbit AND cls = 'rocket') rocketBody, count(*) FILTER (WHERE in_orbit AND cls = 'debris') debris,
    count(*) FILTER (WHERE in_orbit AND cls = 'unknown') unk, count(*) catalogued
  FROM o GROUP BY 1 ORDER BY active + inactive + rocketBody + debris + unk DESC, catalogued DESC, owner`))
  .map((r) => ({ owner: r.owner, name: ownerNames[r.owner] ?? r.owner, active: N(r.active), inactive: N(r.inactive), rocketBody: N(r.rocketBody), debris: N(r.debris), unknown: N(r.unk), catalogued: N(r.catalogued) }));
// Debris catalogued per launch (international designator YYYY-NNN). Parent = the launch's payload or rocket body named
// in the debris pieces ("FENGYUN 1C DEB" → FENGYUN 1C). Event year ≈ the year most of its debris entered the catalogue.
// Every launch with catalogued debris (no cut-off), largest first. Stored compactly in the JSON as
// [launch, parent, owner index, orbit index, pieces, in orbit, cause index, event year, launched] (see fragmentationParents).
const topFragmentationParents = (await rows(`
  SELECT d.launch_key, mode(regexp_replace(d.name, '\\s+DEB$', '')) parent, any_value(d.cause) cause, any_value(d.owner) AS "owner", mode(d.orbit) AS "orbit",
    count(*) pieces, count(*) FILTER (WHERE d.in_orbit) inOrbit, mode(year(d.cat_date)) eventYear, min(d.launch)::VARCHAR launched
  FROM o d WHERE d.cls = 'debris' GROUP BY 1 ORDER BY pieces DESC, inOrbit DESC, d.launch_key`))
  .map((r) => ({ launch: r.launch_key, parent: r.parent, owner: r.owner, orbit: r.orbit, pieces: N(r.pieces), inOrbit: N(r.inOrbit), cause: r.cause, eventYear: N(r.eventYear), launched: r.launched }));

const fragmentationParents = topFragmentationParents.map((p) => [p.launch, p.parent, OWNERS.indexOf(p.owner), ORBITS.indexOf(p.orbit), p.pieces, p.inOrbit, CAUSES.indexOf(p.cause), p.eventYear, p.launched]);
if (fragmentationParents.some((r) => r[2] < 0 || r[3] < 0 || r[6] < 0)) throw new Error("fragmentation parent with unknown owner, orbit or cause");

// Shells for the 3-D view: objects in orbit by mean altitude (10 km steps below 2,000 km, 100 km above, rounded down) and inclination (1°).
// SATCAT has no node or phase, so the page spreads each object around its shell; only altitude and inclination are real.
// [orbit, owner, cls, meanAltKm, inclinationDeg, n]; objects without orbit data are left out.
const shells = (await rows(`
  SELECT orbit, owner, cls,
    (CASE WHEN mean_alt_km < 2000 THEN floor(mean_alt_km / 10) * 10 ELSE floor(mean_alt_km / 100) * 100 END)::INT alt,
    round(incl)::INT inc, count(*) n
  FROM o WHERE in_orbit AND orbit <> 'UFO' GROUP BY ALL ORDER BY ALL`))
  .map((r) => [ORBITS.indexOf(r.orbit), OWNERS.indexOf(r.owner), CLS.indexOf(r.cls), N(r.alt), N(r.inc), N(r.n)]);

// Debris by break-up cause (NASA HOOSF 16e Table 2.1 + ESA CZ-6A class): [orbit, owner, cause, inOrbit, catalogued].
const causeCube = (await rows(`SELECT orbit, owner, cause, count(*) FILTER (WHERE in_orbit) inorb, count(*) n FROM o WHERE cls = 'debris' GROUP BY ALL ORDER BY ALL`))
  .map((r) => [ORBITS.indexOf(r.orbit), OWNERS.indexOf(r.owner), CAUSES.indexOf(r.cause), N(r.inorb), N(r.n)]);
// Objects in orbit by radar cross-section class (historical NORAD classes): [orbit, owner, cls, rcsClass, n].
const rcsCube = (await rows(`SELECT orbit, owner, cls, rcs_class, count(*) n FROM o WHERE in_orbit GROUP BY ALL ORDER BY ALL`))
  .map((r) => [ORBITS.indexOf(r.orbit), OWNERS.indexOf(r.owner), CLS.indexOf(r.cls), RCS.indexOf(r.rcs_class), N(r.n)]);
const [bk] = await rows(`SELECT count(*) n FROM read_csv('${RAW}/breakups.csv', header = true)`);

// Checks: the cube must reproduce the DuckDB aggregates.
const sum = (f) => cube.filter(f).reduce((a, r) => a + r[7], 0);
const check = (label, a, b) => { if (a !== b) throw new Error(`${label}: cube ${a} ≠ DuckDB ${b}`); };
check("tracked", sum((r) => r[4] === 0), kpis.tracked);
check("active", sum((r) => r[4] === 0 && r[2] === 0), kpis.active);
check("reentries", sum((r) => r[6] === 1), kpis.reentriesLastYear);
check("catalogued", sum(() => true), kpis.catalogued);
check("LEO bins", sum((r) => r[5] >= 0), byAltitudeBin.reduce((a, b) => a + b.n, 0));
check("debris 2007", sum((r) => r[2] === 3 && r[3] <= 2007 && (r[4] === 0 || r[4] > 2007)), activeVsDebrisByYear.find((x) => x.year === 2007 && x.cls === "debris").n);
const ufo = byOrbit.find((x) => x.key === "UFO")?.n ?? 0;
if (causeCube.some((r) => r[2] < 0) || rcsCube.some((r) => r[3] < 0)) throw new Error("unknown cause or RCS class");
check("causes", causeCube.reduce((a, r) => a + r[3], 0), byType.find((t) => t.key === "debris").n);
check("rcs", rcsCube.reduce((a, r) => a + r[4], 0), kpis.tracked);
check("shells", shells.reduce((a, r) => a + r[5], 0), kpis.tracked - ufo);
console.log(`✓ cube (${cube.length} rows) and shells (${shells.length} rows) match DuckDB totals`);

const out = {
  source: "CelesTrak SATCAT (celestrak.org/pub/satcat.csv); ESA Space Debris Office, Annual Space Environment Report 2026 (MASTER, 1 Feb 2026)",
  capturedAt: new Date().toISOString(), asOf, yearAgo, esa,
  classes: CLS, causes: CAUSES, rcsClasses: RCS, breakups: N(bk.n), orbits: ORBITS, owners: OWNERS.map((o) => ({ code: o, name: ownerNames[o] ?? o })),
  kpis, byType, byOrbit, byAltitudeBin, byYearLaunched, byYearDecayed, activeVsDebrisByYear, byOwner, fragmentationParents, cube, shells, causeCube, rcsCube,
};
const dir = "data/day-007-space-debris";
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/day-007.json`, JSON.stringify(out));
console.log(`✓ ${dir}/day-007.json · ${(statSync(`${dir}/day-007.json`).size / 1024).toFixed(0)} KB · SATCAT as of ${asOf}`);
console.log(`  in orbit ${kpis.tracked} · active ${kpis.active} (${((1 - kpis.pctJunk) * 100).toFixed(1)}%) · re-entries since ${yearAgo}: ${kpis.reentriesLastYear} (${kpis.reentriesIntactLastYear} intact, ${(kpis.reentriesIntactLastYear / 365).toFixed(2)}/day)`);
console.log(`  ESA 2026 (MASTER 1 Feb 2026): >10 cm ${esa.gt10cm} (≈${esa.activeInGt10cm} active) · 1–10 cm ${esa.cm1to10} · 1 mm–1 cm ${esa.mm1to1cm}`);
console.log(`  owners ${OWNERS.length} · fragmentation parents ${fragmentationParents.length} · top: ${topFragmentationParents.slice(0, 3).map((p) => `${p.parent} ${p.pieces}`).join(", ")}`);
