// Saves fallback data for Day 002 so the page still works if GBIF or Open-Meteo is unavailable,
// and builds the New Zealand outline used by the map. Run with: npm run snapshot:glowworms
import { writeFile } from "node:fs/promises";
import { fetchSightings, fetchClimate, fetchEffort, climateYears } from "../src/days/day-002-glowworms/data.js";

const DIR = new URL("../src/days/day-002-glowworms/", import.meta.url);

// 1. Sightings and climate
const sightings = await fetchSightings();
console.log(`GBIF: ${sightings.length} records`);
const [from, to] = climateYears();
const climate = await fetchClimate(from, to);
console.log(`Open-Meteo: monthly climate ${from}–${to}`);
const effort = await fetchEffort();
console.log(`GBIF: iNaturalist effort for ${Object.keys(effort.regions).length} regions`);

await writeFile(new URL("snapshot.json", DIR), JSON.stringify({
  source: "GBIF.org occurrence search (taxonKey 1564326) and Open-Meteo historical weather API",
  columns: ["lat", "lon", "year", "month", "region", "source (0 iNaturalist, 1 specimen, 2 other)"],
  capturedAt: new Date().toISOString(),
  sightings,
  climate,
  effort,
}));
console.log("Saved snapshot.json");

// 2. New Zealand outline from Natural Earth (world-atlas TopoJSON), main islands only
const topo = await (await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json")).json();
const { scale, translate } = topo.transform;
const arcs = topo.arcs.map((arc) => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * scale[0] + translate[0], y * scale[1] + translate[1]]; });
});
const nz = topo.objects.countries.geometries.find((g) => g.id === "554");
const polygons = nz.type === "MultiPolygon" ? nz.arcs : [nz.arcs];
const ringFrom = (ids) => ids.flatMap((i, n) => {
  const pts = i < 0 ? [...arcs[~i]].reverse() : arcs[i];
  return n ? pts.slice(1) : pts;
});
const inMainland = ([lon, lat]) => lon > 165 && lon < 179 && lat < -34 && lat > -48;
const rings = polygons
  .map((poly) => ringFrom(poly[0]))
  .filter((ring) => ring.every(inMainland) && ring.length > 8)
  .map((ring) => simplify(ring, 0.02).map(([lon, lat]) => [Math.round(lon * 100) / 100, Math.round(lat * 100) / 100]));
await writeFile(new URL("nz-outline.json", DIR), JSON.stringify({
  source: "Natural Earth 1:50m via world-atlas@2.0.2",
  rings,
}));
console.log(`Saved nz-outline.json (${rings.length} rings, ${rings.flat().length} points)`);

// Ramer–Douglas–Peucker simplification in degrees.
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let max = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = distToSegment(pts[i], a, b);
    if (d > max) { max = d; idx = i; }
  }
  if (max <= tol) return [a, b];
  return [...simplify(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplify(pts.slice(idx), tol)];
}
function distToSegment([x, y], [x1, y1], [x2, y2]) {
  const dx = x2 - x1, dy = y2 - y1, len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len)) : 0;
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}
