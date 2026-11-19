// Data access for Day 002: live where it is cheap, bundled snapshot otherwise.
import SNAPSHOT from "./snapshot.json";
import OUTLINE from "./nz-outline.json";
import { fetchRecordCount, fetchWeatherNow, fetchClimate, climateYears, islandOf, WAITOMO, SOUTH_REGIONS } from "./data.js";

export { fetchRecordCount, fetchWeatherNow, WAITOMO };
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const NZ_RINGS = OUTLINE.rings;
export const SNAPSHOT_DATE = SNAPSHOT.capturedAt;

/** Sightings from the bundled GBIF snapshot (full records are too heavy to download in the browser). */
export const SOURCES = ["inat", "specimen", "other"];
export const SIGHTINGS = SNAPSHOT.sightings.map(([lat, lon, year, month, region, source]) => ({
  lat, lon, year, month, region, island: islandOf(lat, lon, region), source: SOURCES[source] ?? "other",
}));

/** iNaturalist observations of every species, per region, used as the effort denominator. */
export const EFFORT = SNAPSHOT.effort.regions;
export const EFFORT_ISLAND = Object.fromEntries(Object.keys(EFFORT).map((name) => [
  name, name === "Chatham Islands" ? null : SOUTH_REGIONS.has(name) ? "South" : "North",
]));

/**
 * Expected iNaturalist effort for a set of filters. Region × month and region × year counts are exact;
 * when both a month and a year range are set, the two are combined assuming month and year are
 * independent within a region: E(r, m, years) ≈ E(r, m) × E(r, years) / E(r).
 */
export function effortFor({ regions, month, yearOk }) {
  let total = 0;
  regions.forEach((name) => {
    const r = EFFORT[name];
    if (!r) return;
    const base = month ? r.month[month] || 0 : r.total;
    const inYears = Object.entries(r.year).reduce((sum, [y, n]) => sum + (yearOk(Number(y)) ? n : 0), 0);
    total += r.total ? base * (inYears / r.total) : 0;
  });
  return total;
}

/** Approximate 95% Poisson interval for a count k (Wilson–Hilferty). */
export function poissonCI(k) {
  const z = 1.96;
  const lo = k === 0 ? 0 : k * (1 - 1 / (9 * k) - z / (3 * Math.sqrt(k))) ** 3;
  const k1 = k + 1;
  const hi = k1 * (1 - 1 / (9 * k1) + z / (3 * Math.sqrt(k1))) ** 3;
  return [lo, hi];
}

/** Monthly climate at Waitomo: live from Open-Meteo's archive, falling back to the snapshot. */
export async function loadClimate() {
  const [from, to] = climateYears();
  try {
    const c = await fetchClimate(from, to);
    if (c.months.every((m) => m.high != null)) return { ...c, live: true };
    throw new Error("incomplete");
  } catch {
    return { ...SNAPSHOT.climate, live: false };
  }
}

/** Great-circle distance in kilometres. */
export function kmBetween(a, b) {
  const rad = Math.PI / 180, R = 6371;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
