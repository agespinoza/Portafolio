// Day 004 data: HydroLAKES lake attributes and ERA5 winter air temperatures, precomputed with DuckDB
// (scripts/day-004/*.sql) and bundled as snapshot.json. Lakes outside the precomputed set are fetched on
// demand from Open-Meteo in the browser and cached in localStorage.
import SNAPSHOT from "./snapshot.json";

export interface Lake {
  id: number;
  name: string | null;
  country: string;
  lat: number;
  lon: number;
  area: number;
  depth: number | null;
  reservoir: boolean;
  elevation: number | null;
  volume: number | null;
  /** Position by surface area among all lakes ≥ 100 km² (exact rank in the world), else null. */
  rank: number | null;
}

export interface Trend {
  first: number;
  last: number;
  winters: number;
  mean: number;
  /** °C per decade */
  slope: number;
  intercept: number;
  r2: number;
  /** standard error of the slope, °C per decade */
  se: number;
}

export type Series = [winter: number, meanC: number][];

interface Snapshot {
  capturedAt: string;
  universe: Record<string, number>;
  areaBins: [number, number][];
  continents: [string, number, number][];
  lakes: [number, string | null, string, number, number, number, number | null, number, number | null, number | null][];
  top300: number[];
  trends: Record<string, number[]>;
  series: Record<string, Series>;
  abraham: {
    monthsAir: [month: number, mean: number, min: number, max: number, pctBelowZero: number][];
    trend1991: { slope: number; se: number };
  };
}

const S = SNAPSHOT as unknown as Snapshot;
export const ABRAHAM_ID = 7243;
export const CAPTURED_AT = S.capturedAt.slice(0, 10);
export const UNIVERSE = S.universe;
export const AREA_BINS = S.areaBins;
export const ABRAHAM_MONTHS = S.abraham.monthsAir;
export const ABRAHAM_TREND_1991 = S.abraham.trend1991;
export const WINDOW = { first: 1991, last: 2025 };

const ge100 = S.lakes.filter((l) => l[5] >= 100).length;
export const LAKES: Lake[] = S.lakes.map((l, i) => ({
  id: l[0], name: l[1], country: l[2], lat: l[3], lon: l[4], area: l[5], depth: l[6],
  reservoir: l[7] === 1, elevation: l[8], volume: l[9], rank: i < ge100 ? i + 1 : null,
}));
export const LAKE_BY_ID = new Map(LAKES.map((l) => [l.id, l]));
export const TOP300 = S.top300.map((id) => LAKE_BY_ID.get(id)!).filter(Boolean);

const toTrend = (t: number[]): Trend => ({
  first: t[0], last: t[1], winters: t[2], mean: t[3], slope: t[4], intercept: t[5], r2: t[6], se: t[7],
});
export const TRENDS = new Map<number, Trend>(Object.entries(S.trends).map(([id, t]) => [Number(id), toTrend(t)]));
export const SERIES = new Map<number, Series>(Object.entries(S.series).map(([id, s]) => [Number(id), s]));

export const lakeName = (l: Lake) => l.name ?? `Lake #${l.id}`;

/** Ordinary least squares of winter mean on year, as °C per decade with its standard error. */
export function fitTrend(series: Series): Trend | null {
  const n = series.length;
  if (n < 10) return null;
  const xs = series.map((p) => p[0]), ys = series.map((p) => p[1]);
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, sxy = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxx += (xs[i] - mx) ** 2; sxy += (xs[i] - mx) * (ys[i] - my); syy += (ys[i] - my) ** 2; }
  const b = sxy / sxx, a = my - b * mx;
  const sse = syy - b * sxy;
  const se = Math.sqrt(sse / (n - 2) / sxx);
  return { first: xs[0], last: xs[n - 1], winters: n, mean: my, slope: b * 10, intercept: a, r2: syy ? (b * sxy) / syy : 0, se: se * 10 };
}

/** Restrict a series to winters in [from, to]. */
export const clip = (s: Series, from: number, to: number): Series => s.filter(([w]) => w >= from && w <= to);

/* ---------- on-demand fetch (browser) ---------- */
const CACHE_KEY = (id: number) => `ddl4:winters:${id}:v1`;

function readCache(id: number): Series | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY(id));
    return raw ? (JSON.parse(raw) as Series) : null;
  } catch { return null; }
}
function writeCache(id: number, s: Series) {
  try { window.localStorage.setItem(CACHE_KEY(id), JSON.stringify(s)); } catch { /* storage full or blocked */ }
}

/** Local winter: Dec–Feb in the north (labeled by January), Jun–Aug in the south. */
export function winterRange(w: number, lat: number): [string, string] {
  if (lat < 0) return [`${w}-06-01`, `${w}-08-31`];
  const end = new Date(Date.UTC(w, 2, 1) - 86400000).toISOString().slice(0, 10);
  return [`${w - 1}-12-01`, end];
}

/**
 * Winter means 1991–2025 for any lake, from Open-Meteo's ERA5 archive. One request per winter (~6 API calls
 * each under Open-Meteo's fair-use counting), five at a time, cached so a lake is only fetched once per browser.
 */
export async function fetchWinters(lake: Lake, onProgress?: (done: number, total: number) => void, signal?: AbortSignal): Promise<Series> {
  const cached = readCache(lake.id);
  if (cached) return cached;
  const winters = Array.from({ length: WINDOW.last - WINDOW.first + 1 }, (_, i) => WINDOW.first + i);
  const out: Series = [];
  let done = 0;
  const one = async (w: number) => {
    const [start, end] = winterRange(w, lake.lat);
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lake.lat}&longitude=${lake.lon}` +
      `&start_date=${start}&end_date=${end}&daily=temperature_2m_mean&models=era5&timezone=auto`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const vals: number[] = (json.daily?.temperature_2m_mean ?? []).filter((v: number | null) => v != null);
    if (vals.length >= 89) out.push([w, Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100]);
    onProgress?.(++done, winters.length);
  };
  for (let i = 0; i < winters.length; i += 5) await Promise.all(winters.slice(i, i + 5).map(one));
  out.sort((a, b) => a[0] - b[0]);
  writeCache(lake.id, out);
  return out;
}

/** Approximate continent from coordinates, for the map filter (HydroLAKES continent is not in the picker list). */
export type Region = "all" | "namerica" | "samerica" | "europe" | "africa" | "asia" | "oceania";
export function regionOf(l: Lake): Exclude<Region, "all"> {
  const { lat, lon } = l;
  if (lon < -25) return lat > 13 ? "namerica" : "samerica";
  if (lat < -10 && lon > 110) return "oceania";
  if (lon < 60 && lat > 35) return "europe";
  if (lon < 52 && lat <= 35) return "africa";
  return "asia";
}
