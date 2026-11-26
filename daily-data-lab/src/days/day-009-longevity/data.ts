// Day 009 data: life expectancy (UN WPP 2024), healthy life expectancy (WHO GHO), income and health spending
// (World Bank WDI), and blue zones from the cited literature. Built with DuckDB (scripts/day-009/snapshot.mjs) into one
// JSON bundled with the page: no network calls in the browser.
import SNAPSHOT from "../../../data/day-009-longevity/day-009.json";

export interface Country {
  iso3: string; iso2: string; name: string; region: string; income: string | null; pop: number;
  /** UN WPP 2024, 2023 estimate. */
  e0: number; e0Male: number; e0Female: number;
  /** WHO GHO 2023: HALE with 95% uncertainty interval, by sex, and WHO's own life expectancy (same model, same year). */
  hale: number | null; haleLo: number | null; haleHi: number | null; haleMale: number | null; haleFemale: number | null;
  whoE0: number | null;
  /** WHO life expectancy − WHO HALE: expected years lived in less than full health. */
  gap: number | null;
  centenarians: number | null; centenarians2000: number | null; centenariansPer100k: number | null;
  gdpPc: number | null; gdpYear: number | null; healthExpPct: number | null; healthExpYear: number | null;
}
export interface Region { region: string; countries: number; pop: number; e0: number; hale: number | null; countriesWithHale: number }
export interface BlueZone {
  id: string; name: string; iso3: string; town: string; lat: number; lon: number; demographic: boolean; comparison: string;
  survival: { m: number; mRef: number; sigM: string; f: number; fRef: number; sigF: string } | null;
  extra: { kind: "cr" | "eli" | "drr" | "none" | "cohort"; note: string; [k: string]: number | string };
  refs: string[];
}
interface Snapshot {
  capturedAt: string; year: number;
  kpis: {
    worldE0: number; worldE0Male: number; worldE0Female: number; worldE0_1950: number; worldE0_2024: number; worldE0_2019: number; worldE0_2021: number;
    worldHale: number; worldHaleLo: number; worldHaleHi: number; worldWhoE0: number; gap: number;
    worldPop: number; centenarians: number; centenarians2000: number; centenariansPer100k: number;
    topHaleCountry: string; topHale: number; countries: number; countriesWithHale: number; haleWeighted: number;
    recordSlope: number; recordIntercept: number; recordR2: number;
  };
  countries: Country[]; regions: Region[];
  e0Trend: { years: number[]; world: number[] } & Record<string, number[]>;
  recordFemaleE0: { year: number; iso3: string; e0Female: number }[];
  blueZones: BlueZone[];
}
const S = SNAPSHOT as unknown as Snapshot;

export const CAPTURED_AT = S.capturedAt.slice(0, 10);
export const YEAR = S.year;
export const KPIS = S.kpis;
export const COUNTRIES = S.countries;
export const REGIONS = S.regions;
export const TREND = S.e0Trend;
export const RECORD = S.recordFemaleE0;
export const BLUE_ZONES = S.blueZones;
export const REGION_IDS = REGIONS.map((r) => r.region).sort((a, b) => (a === "Not classified" ? 1 : b === "Not classified" ? -1 : a.localeCompare(b)));
/** Blue-zone countries plus Mexico and the United States stay highlighted, as in earlier days. */
export const HIGHLIGHT = new Set(["JPN", "ITA", "CRI", "GRC", "MEX", "USA"]);
export const TREND_KEYS = ["JPN", "ITA", "CRI", "GRC", "MEX", "USA"] as const;
/** Fewer than this many people: centenarian rates rest on a handful of people, so they are faded and not ranked. */
export const SMALL_POP = 1_000_000;

export const inRegion = (region: string, c: Country) => region === "all" || c.region === region;

/** Population-weighted mean of a field over the countries that have it. */
export function weighted(rows: Country[], f: (c: Country) => number | null): number | null {
  let w = 0, s = 0;
  for (const c of rows) { const v = f(c); if (v != null) { w += c.pop; s += v * c.pop; } }
  return w ? s / w : null;
}

/** Ordinary least squares y = a + b·x, with r². */
export function ols(xs: number[], ys: number[]) {
  const k = xs.length;
  if (k < 3) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / k, my = ys.reduce((a, b) => a + b, 0) / k;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < k; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  const b = sxy / sxx;
  return { a: my - b * mx, b, r2: (sxy * sxy) / (sxx * syy), n: k };
}

/** Preston curve as used here: HALE on log10 GDP per capita (PPP), over every country with both values. */
export const PRESTON = (() => {
  const rows = COUNTRIES.filter((c) => c.hale != null && c.gdpPc != null);
  return ols(rows.map((c) => Math.log10(c.gdpPc!)), rows.map((c) => c.hale!))!;
})();
export const SPEND = (() => {
  const rows = COUNTRIES.filter((c) => c.hale != null && c.healthExpPct != null);
  return ols(rows.map((c) => c.healthExpPct!), rows.map((c) => c.hale!))!;
})();
/** HALE above (+) or below (−) what the country's income predicts on the Preston line. */
export const prestonResidual = (c: Country) => (c.hale == null || c.gdpPc == null ? null : c.hale - (PRESTON.a + PRESTON.b * Math.log10(c.gdpPc)));

/** World female − male e0 gap (WPP 2023), the zero line of the diverging chart. */
export const WORLD_SEX_GAP = KPIS.worldE0Female - KPIS.worldE0Male;
