// Day 003 data model: the Wikimedia Commons catalog snapshot, derived fields, and statistics.
import CATALOG from "./catalog.json";
import LAND from "./world-land.json";

export type Phenomenon = "light_pillar" | "sun_pillar" | "moon_pillar" | "parhelion" | "halo22" | "cza";
export type Family = "reflection" | "refraction";
export type RegionId = "europe_north" | "europe_central" | "europe_south" | "north_america" | "asia" | "polar" | "oceania" | "other";
export type Evidence = "A" | "B" | "C";

export interface Weather {
  basis: "hour" | "daymean";
  t: number | null; rh: number | null; td: number | null; ws: number | null; wd: number | null;
  cc: number | null; ccl: number | null; ccm: number | null; cch: number | null; p: number | null;
}

export interface RawRow {
  id: string; title: string; artist: string | null;
  license: string | null; licenseUrl: string | null; description: string | null;
  phenomena: string[];
  date: string; time: string | null;
  lat: number | null; lon: number | null; locType: "camera" | "object" | null;
  country: string | null; iso: string | null; offshore: boolean | null;
  region: string | null; hemisphere: "N" | "S" | null;
  tz?: string; utcOffset?: number; gridElevation?: number; wx?: Weather | null;
}

export interface Obs extends Omit<RawRow, "phenomena" | "region"> {
  url: string; thumb: string;
  phenomena: Phenomenon[];
  region: RegionId | null;
  year: number; month: number;
  families: Family[];
  evidence: Evidence;
  sunElevation: number | null; // degrees, from capture time + place (computed, not observed)
  event: string; // de-duplication key: same author, same day, within ~25 km
}

export const PHENOMENA: { id: Phenomenon; family: Family; key: string; label: string; color: string }[] = [
  { id: "light_pillar", family: "reflection", key: "phLight", label: "Light pillar", color: "#f2a65a" },
  { id: "sun_pillar", family: "reflection", key: "phSun", label: "Sun pillar", color: "#f4d35e" },
  { id: "moon_pillar", family: "reflection", key: "phMoon", label: "Moon pillar", color: "#d9e4f5" },
  { id: "parhelion", family: "refraction", key: "phParhelion", label: "Parhelion (sun dog)", color: "#7fd3e3" },
  { id: "halo22", family: "refraction", key: "phHalo", label: "22° halo", color: "#8aa8ff" },
  { id: "cza", family: "refraction", key: "phCza", label: "Circumzenithal arc", color: "#c18cff" },
];
export const PH = Object.fromEntries(PHENOMENA.map((p) => [p.id, p])) as Record<Phenomenon, (typeof PHENOMENA)[number]>;

export const REGIONS: { id: RegionId; key: string; label: string }[] = [
  { id: "europe_north", key: "rgEuropeNorth", label: "Northern Europe" },
  { id: "europe_central", key: "rgEuropeCentral", label: "Western & Central Europe" },
  { id: "europe_south", key: "rgEuropeSouth", label: "Southern Europe" },
  { id: "north_america", key: "rgNorthAmerica", label: "North America" },
  { id: "asia", key: "rgAsia", label: "Northern & East Asia" },
  { id: "polar", key: "rgPolar", label: "Polar regions (beyond 66.6°)" },
  { id: "oceania", key: "rgOceania", label: "Oceania" },
  { id: "other", key: "rgOther", label: "Other regions" },
];

export const CAPTURED_AT: string = CATALOG.capturedAt;
export const WINDOW = CATALOG.window as [string, string];
export const EXCLUDED = CATALOG.excluded as { noDate: number; outOfRange: number; total: number };
export const LAND_RINGS = (LAND as { rings: number[][][] }).rings;

/** NOAA solar position (accurate to well under a degree; enough to classify day/twilight/night). */
export function solarElevation(dateIso: string, time: string, utcOffset: number, lat: number, lon: number): number {
  const [y, m, d] = dateIso.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const utc = Date.UTC(y, m - 1, d, hh, mm) - utcOffset * 3600 * 1000;
  const jd = utc / 86400000 + 2440587.5;
  const T = (jd - 2451545) / 36525;
  const rad = Math.PI / 180;
  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C = Math.sin(M * rad) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * M * rad) * (0.019993 - 0.000101 * T) + Math.sin(3 * M * rad) * 0.000289;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * T) * rad);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos((125.04 - 1934.136 * T) * rad);
  const decl = Math.asin(Math.sin(eps * rad) * Math.sin(lambda * rad));
  const yv = Math.tan((eps / 2) * rad) ** 2;
  const eqTime = 4 / rad * (yv * Math.sin(2 * L0 * rad) - 2 * e * Math.sin(M * rad) + 4 * e * yv * Math.sin(M * rad) * Math.cos(2 * L0 * rad)
    - 0.5 * yv * yv * Math.sin(4 * L0 * rad) - 1.25 * e * e * Math.sin(2 * M * rad));
  const minutes = ((utc / 60000) % 1440 + 1440) % 1440;
  const tst = (minutes + eqTime + 4 * lon + 1440) % 1440;
  const ha = (tst / 4 < 0 ? tst / 4 + 180 : tst / 4 - 180) * rad;
  const cosZ = Math.sin(lat * rad) * Math.sin(decl) + Math.cos(lat * rad) * Math.cos(decl) * Math.cos(ha);
  return 90 - Math.acos(Math.max(-1, Math.min(1, cosZ))) / rad;
}

function kmBetween(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

function build(): Obs[] {
  const raw = CATALOG.rows as RawRow[];
  const out: Obs[] = raw.map((r) => {
    const phenomena = r.phenomena.filter((p): p is Phenomenon => p in PH);
    const families = [...new Set(phenomena.map((p) => PH[p].family))];
    const geo = r.lat != null && r.lon != null;
    const evidence: Evidence = geo && r.locType === "camera" && r.time ? "A" : geo ? "B" : "C";
    const sunElevation = geo && r.time && r.utcOffset != null ? solarElevation(r.date, r.time, r.utcOffset, r.lat!, r.lon!) : null;
    return {
      ...r, phenomena, families, evidence, sunElevation,
      url: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(r.title.replace(/ /g, "_"))}`,
      thumb: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(r.title.replace(/ /g, "_"))}?width=360`,
      region: (r.region as RegionId | null) ?? null,
      year: Number(r.date.slice(0, 4)), month: Number(r.date.slice(5, 7)),
      event: r.id,
    };
  });
  // De-duplicate bursts: one photographer, one day, within 25 km counts as one event.
  const groups = new Map<string, Obs[]>();
  for (const o of out) {
    const k = `${o.artist ?? "?"}|${o.date}`;
    const list = groups.get(k) ?? [];
    const match = list.find((x) => (x.lat == null || o.lat == null ? x.lat == null && o.lat == null
      : kmBetween({ lat: x.lat, lon: x.lon! }, { lat: o.lat, lon: o.lon! }) < 25));
    if (match) o.event = match.event;
    list.push(o);
    groups.set(k, list);
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export const OBS: Obs[] = build();
export const YEARS = Array.from({ length: Number(WINDOW[1].slice(0, 4)) - 1999 }, (_, i) => 2000 + i);

// ---------- statistics ----------
/** Wilson score interval for a proportion k/n (95%). */
export function wilson(k: number, n: number, z = 1.96): [number, number] {
  if (!n) return [0, 1];
  const p = k / n, z2 = z * z;
  const c = (p + z2 / (2 * n)) / (1 + z2 / n);
  const h = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / (1 + z2 / n);
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function summary(values: (number | null | undefined)[]) {
  const v = values.filter((x): x is number => x != null && Number.isFinite(x)).sort((a, b) => a - b);
  return { n: v.length, missing: values.length - v.length, q1: quantile(v, 0.25), med: quantile(v, 0.5), q3: quantile(v, 0.75), min: v[0], max: v[v.length - 1] };
}

export const uniqueEvents = (rows: Obs[]) => new Set(rows.map((r) => r.event)).size;
export const isPillar = (o: Obs) => o.families.includes("reflection");
export const isHalo = (o: Obs) => o.families.includes("refraction");

// ---------- exports ----------
export const CSV_COLUMNS = [
  "id", "phenomena", "family", "date", "time_local", "timezone", "utc_offset_h", "lat", "lon", "location_type", "country", "region", "hemisphere",
  "evidence_level", "sun_elevation_deg_computed", "era5_basis", "temp_c", "rel_humidity_pct", "dew_point_c", "wind_kmh", "wind_dir_deg",
  "cloud_total_pct", "cloud_low_pct", "cloud_mid_pct", "cloud_high_pct", "pressure_hpa", "visibility", "ice_crystal_evidence",
  "event_id", "title", "author", "license", "license_url", "source_url",
];

function csvCell(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function flat(o: Obs): unknown[] {
  const w = o.wx;
  return [
    o.id, o.phenomena.join(";"), o.families.join(";"), o.date, o.time, o.tz, o.utcOffset, o.lat, o.lon, o.locType, o.country, o.region, o.hemisphere,
    o.evidence, o.sunElevation == null ? null : Math.round(o.sunElevation * 10) / 10, w?.basis, w?.t, w?.rh, w?.td, w?.ws, w?.wd,
    w?.cc, w?.ccl, w?.ccm, w?.cch, w?.p, null, "photographic (optical display implies ice crystals; not sampled)",
    o.event, o.title, o.artist, o.license, o.licenseUrl, o.url,
  ];
}

export function toCSV(rows: Obs[]): string {
  return [CSV_COLUMNS.join(","), ...rows.map((r) => flat(r).map(csvCell).join(","))].join("\n");
}

export function toGeoJSON(rows: Obs[]): string {
  return JSON.stringify({
    type: "FeatureCollection",
    metadata: {
      source: CATALOG.sources, capturedAt: CAPTURED_AT, window: WINDOW,
      notes: "Empty values are missing, never zero. Weather is ERA5 reanalysis (gridded model), not a station measurement. sun_elevation is computed from capture time and place.",
    },
    features: rows.filter((r) => r.lat != null).map((r) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [r.lon, r.lat] },
      properties: Object.fromEntries(CSV_COLUMNS.map((c, i) => [c, flat(r)[i] ?? null])),
    })),
  }, null, 1);
}

export function download(name: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
