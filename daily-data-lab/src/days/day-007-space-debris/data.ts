// Day 007 data: the full CelesTrak SATCAT (every Earth-orbiting object ever catalogued, decayed or not), aggregated with
// DuckDB (scripts/day-007/build.sql + snapshot.mjs) into one JSON bundled with the page: no network in the browser.
// The page filters by orbit class and owner, so every chart is recomputed here from a small cube.
import SNAPSHOT from "../../../data/day-007-space-debris/day-007.json";

export type Cls = "active" | "inactive" | "rocket" | "debris" | "unknown";
export interface Owner { code: string; name: string }
export interface OwnerRow { owner: string; name: string; active: number; inactive: number; rocketBody: number; debris: number; unknown: number; catalogued: number }
export interface Parent { launch: string; parent: string; owner: string; orbit: string; pieces: number; inOrbit: number; eventYear: number; launched: string }
interface Snapshot {
  capturedAt: string; asOf: string; yearAgo: string;
  esa: { report: string; epoch: string; gt10cm: number; activeInGt10cm: number; cm1to10: number; mm1to1cm: number };
  classes: Cls[]; orbits: string[]; owners: Owner[];
  kpis: { tracked: number; active: number; pctJunk: number; est1cmPlus: number; reentriesLastYear: number; reentriesIntactLastYear: number; catalogued: number };
  byOwner: OwnerRow[];
  topFragmentationParents: Parent[];
  /** [orbit, owner, cls, entryYear, decayYear (0 = in orbit), altBin (50 km, LEO in orbit; -1), reenteredLast365, n] */
  cube: [number, number, number, number, number, number, number, number][];
}
const S = SNAPSHOT as unknown as Snapshot;

export const AS_OF = S.asOf;
export const YEAR_AGO = S.yearAgo;
export const ESA = S.esa;
export const KPIS = S.kpis;
export const CLASSES = S.classes;
export const ORBITS = S.orbits;
export const OWNERS = S.owners;
export const PARENTS = S.topFragmentationParents;
export const FIRST_YEAR = 1957;
export const LAST_YEAR = Number(S.asOf.slice(0, 4));
export const CLS_COLOR: Record<Cls, string> = {
  active: "var(--sd-active)", inactive: "var(--sd-inactive)", rocket: "var(--sd-rocket)", debris: "var(--sd-debris)", unknown: "var(--sd-unknown)",
};
/** The four kinds of junk: everything in orbit that no longer works or never did. */
export const JUNK: Cls[] = ["inactive", "rocket", "debris", "unknown"];

export interface Filter { orbit: string; owner: string }
const orbitIdx = (o: string) => (o === "all" ? -1 : ORBITS.indexOf(o));
const ownerIdx = (o: string) => (o === "" ? -1 : OWNERS.findIndex((x) => x.code === o));

/** Every aggregate the page shows, for one orbit class and/or owner. */
export function aggregate(f: Filter) {
  const oi = orbitIdx(f.orbit), wi = ownerIdx(f.owner);
  const zeros = () => CLASSES.map(() => 0);
  const span = LAST_YEAR - FIRST_YEAR + 1;
  const inOrbit = zeros();
  const added = Array.from({ length: span }, zeros); // entered the catalogue that year
  const decayed = Array.from({ length: span }, zeros);
  const pop = Array.from({ length: span }, zeros); // in orbit at the end of each year (filled below)
  const alt = Array.from({ length: 40 }, zeros); // 0–2,000 km mean altitude in 50 km bins
  const byOrbit = ORBITS.map(() => 0);
  const byOwner = new Map<number, number[]>();
  let recent = 0, recentIntact = 0, catalogued = 0;
  for (const [o, w, c, ey, dy, bin, rec, n] of S.cube) {
    if (dy === 0 && (wi < 0 || w === wi)) byOrbit[o] += n; // the orbit donut ignores the orbit filter
    if (oi >= 0 && o !== oi) continue;
    if (dy === 0) {
      const row = byOwner.get(w) ?? zeros();
      row[c] += n;
      byOwner.set(w, row);
    }
    if (wi >= 0 && w !== wi) continue;
    catalogued += n;
    added[ey - FIRST_YEAR][c] += n;
    if (dy === 0) inOrbit[c] += n;
    else decayed[dy - FIRST_YEAR][c] += n;
    if (bin >= 0 && bin < 40) alt[bin][c] += n;
    if (rec) { recent += n; if (c <= 2) recentIntact += n; }
    // In orbit at the end of year y if it entered the catalogue by y and had not decayed by y (same rule as snapshot.mjs).
    for (let y = ey; y <= (dy === 0 ? LAST_YEAR : dy - 1); y++) pop[y - FIRST_YEAR][c] += n;
  }
  const tracked = inOrbit.reduce((a, b) => a + b, 0);
  return { inOrbit, tracked, active: inOrbit[0], junk: tracked - inOrbit[0], added, decayed, pop, alt, byOrbit, byOwner, recent, recentIntact, catalogued };
}
export type Agg = ReturnType<typeof aggregate>;

/** Wilson 95% interval for a proportion. */
export function wilson(k: number, n: number): [number, number] {
  if (!n) return [0, 0];
  const z = 1.96, p = k / n, d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d, h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}
