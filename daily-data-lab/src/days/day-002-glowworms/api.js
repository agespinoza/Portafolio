// Data access for Day 002: live where it is cheap, bundled snapshot otherwise.
import SNAPSHOT from "./snapshot.json";
import OUTLINE from "./nz-outline.json";
import { fetchRecordCount, fetchWeatherNow, fetchClimate, climateYears, islandOf, WAITOMO } from "./data.js";

export { fetchRecordCount, fetchWeatherNow, WAITOMO };
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const NZ_RINGS = OUTLINE.rings;
export const SNAPSHOT_DATE = SNAPSHOT.capturedAt;

/** Sightings from the bundled GBIF snapshot (full records are too heavy to download in the browser). */
export const SIGHTINGS = SNAPSHOT.sightings.map(([lat, lon, year, month, region]) => ({
  lat, lon, year, month, region, island: islandOf(lat, lon, region),
}));

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
