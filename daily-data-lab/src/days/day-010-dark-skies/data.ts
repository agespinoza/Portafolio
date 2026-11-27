// Day 010 data: light pollution and dark skies. Built with DuckDB (scripts/day-010/snapshot.mjs) from Falchi et al. (2016)
// Table 2, Globe at Night 2011–2025, Wikidata's certified International Dark Sky Places and World Bank population, plus
// point samples and two small images of the World Atlas 2015 raster (scripts/day-010/raster.py). One JSON bundled with
// the page: no network calls in the browser.
import SNAPSHOT from "../../../data/day-010-dark-skies/day-010.json";
import SKY_WORLD from "./sky-world.png";
import SKY_AZSON from "./sky-azson.png";

/** Six brightness bands of Falchi et al. (2016), artificial zenith brightness in μcd/m². Index 0–5. */
export const BANDS = [
  { key: "b0", label: "Pristine (≤1.7)", short: "≤1.7", color: "var(--ds-b0)" },
  { key: "b1", label: "Degraded near the horizon (1.7–14)", short: "1.7–14", color: "var(--ds-b1)" },
  { key: "b2", label: "Polluted to the zenith (14–87)", short: "14–87", color: "var(--ds-b2)" },
  { key: "b3", label: "Natural sky lost (87–688)", short: "87–688", color: "var(--ds-b3)" },
  { key: "b4", label: "Milky Way hidden (688–3000)", short: "688–3000", color: "var(--ds-b4)" },
  { key: "b5", label: "No night vision (>3000)", short: ">3000", color: "var(--ds-b5)" },
] as const;
/** Thresholds in mcd/m² (the raster's unit). */
export const LEVELS = [0.00174, 0.014, 0.087, 0.688, 3.0];
export const NATURAL = 0.174; // natural sky background used by the atlas, mcd/m²

export interface Country {
  iso3: string; iso2: string | null; name: string; territory: boolean; region: string; pop2015: number | null;
  /** Cumulative % of people / of area under ≤1.7, >1.7, >14, >87, >688, >3000 μcd/m² (Falchi et al. 2016, Table 2). */
  pop: number[]; area: number[];
  places: number; gan: { obs: number; medLM: number } | null;
}
export type PlaceType = "park" | "reserve" | "sanctuary" | "community";
export interface Place {
  id: string; name: string; type: PlaceType; otherTypes: PlaceType[]; country: string | null; countryName: string | null;
  lat: number | null; lon: number | null; yearCertified: number | null; areaKm2: number | null;
  /** Artificial zenith brightness at the place's Wikidata coordinate, mcd/m² (atlas, 1′ cell). */
  atlas: number | null; sourceUrl: string; wikipedia: string | null;
}
export interface YearStat { year: number; n: number; med: number; p25: number; p75: number; mean: number; atlasMed: number | null }
export interface Trend { slope: number; lo: number; hi: number; groups: number; obs: number; y0: number; y1: number; impliedPct: number; impliedLo: number; impliedHi: number }
interface Snapshot {
  capturedAt: string; popYear: number;
  world: { pop: number[]; area: (number | null)[]; population: number; reconstructed: { gt14: number; gt688: number; countries: number } };
  eu: { pop: number[] };
  countries: Country[]; places: Place[];
  gan: {
    funnel: { total: number; gan: number; lm0: number; lmMissing: number; cloudy: number; zero: number; kept: number; withAtlas: number };
    years: Record<"world" | "northAmerica" | "europe" | "latam" | "usa" | "mexico" | "arizona", YearStat[]>;
    lm0: { year: number; share: number }[];
    trends: Record<"world" | "northAmerica" | "europe" | "usa" | "arizona", { all: Trend; kyba: Trend }>;
    calibration: { a: number; b: number; r2: number; n: number };
    /** [lon, lat, observations, median limiting magnitude] per 1° cell (≥ 3 observations). */
    cells: [number, number, number, number][];
    /** [lon, lat, observations, median limiting magnitude, of them in Mexico] per 0.1° cell in Arizona–Sonora. */
    azCells: [number, number, number, number, number][];
    azson: { az: number; azMed: number; son: number; sonMed: number; mex: number };
  };
  raster: {
    world: { width: number; height: number; x: number; y: number; w: number; h: number };
    azson: { width: number; height: number; west: number; south: number; east: number; north: number };
    checks: Record<string, number>;
  };
}
const S = SNAPSHOT as unknown as Snapshot;

export const CAPTURED_AT = S.capturedAt.slice(0, 10);
export const POP_YEAR = S.popYear;
export const WORLD = S.world;
export const EU = S.eu;
export const COUNTRIES = S.countries;
export const PLACES = S.places;
export const GAN = S.gan;
export const RASTER = S.raster;
export const IMG = { world: SKY_WORLD as string, azson: SKY_AZSON as string };
export const PLACE_TYPES: PlaceType[] = ["park", "reserve", "sanctuary", "community"];
export const TYPE_COLOR: Record<PlaceType, string> = { park: "#6fe3a0", reserve: "#8aa8ff", sanctuary: "#f4d35e", community: "#f08a7b" };
/** Mexico and the United States stay highlighted, as on earlier days. */
export const HIGHLIGHT = new Set(["MEX", "USA"]);
export const REGION_IDS = [...new Set(COUNTRIES.map((c) => c.region))].sort((a, b) => (a === "Not classified" ? 1 : b === "Not classified" ? -1 : a.localeCompare(b)));

/** Published figures quoted, not recomputed (darksky.org blocks automated requests, so its list is not downloaded). */
export const PUBLISHED = {
  darkSky: { places: 259, km2: 196000, countries: 25, asOf: 2025, url: "https://darksky.org/app/uploads/2026/09/2025-Impact-Report-1.pdf" },
  kyba2023: { world: 9.6, europe: 6.5, northAmerica: 10.4, range: [7, 10], obs: 51351, stars: [250, 100], years: 18 },
  kyba2017: { area: 2.2, radiance: 2.2 },
};

/** Exclusive bands from the cumulative columns: [≤1.7, 1.7–14, 14–87, 87–688, 688–3000, >3000]. Sums to ~100. */
export function bands(cum: (number | null)[]): number[] {
  const c = cum.map((v) => v ?? 0);
  return [c[0], c[1] - c[2], c[2] - c[3], c[3] - c[4], c[4] - c[5], c[5]].map((v) => Math.max(0, v));
}
/** People under a cumulative level, from the country's 2015 population. */
export const people = (c: Country, i: number) => (c.pop2015 == null ? null : (c.pop2015 * c.pop[i]) / 100);
/** Which of the six bands an artificial brightness (mcd/m²) falls in. */
export const bandOf = (b: number) => LEVELS.filter((l) => b > l).length;
/** Artificial brightness as a share above the natural sky. */
export const aboveNatural = (b: number) => b / NATURAL;

/** Stars a viewer can count after t years if the sky brightens by r per year. Calibrated on the example in Kyba et al.
 *  (2023): a fourfold brightening takes a site from about 250 visible stars to about 100, i.e. N ∝ B^(−k) with
 *  k = ln(2.5) / ln(4). Illustrative only: real star counts depend on the site's starting brightness. */
export const STAR_K = Math.log(2.5) / Math.log(4);
export const starsAfter = (years: number, rate: number, start = 250) => start * (1 + rate) ** (-STAR_K * years);

/** Population-weighted share of a cumulative level over a set of countries (countries without population left out). */
export function weightedPop(rows: Country[], i: number): number | null {
  let w = 0, s = 0;
  for (const c of rows) if (c.pop2015 != null) { w += c.pop2015; s += c.pop2015 * c.pop[i]; }
  return w ? s / w : null;
}

/** Certified places with a year, cumulative by type. */
export function cumulative(places: Place[]): { years: number[]; byType: Record<PlaceType, number[]>; total: number[] } {
  const ys = places.filter((p) => p.yearCertified != null).map((p) => p.yearCertified!);
  const y0 = Math.min(...ys), y1 = Math.max(...ys, 2025);
  const years = Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i);
  const byType = Object.fromEntries(PLACE_TYPES.map((t) => [t, years.map((y) => places.filter((p) => p.type === t && p.yearCertified != null && p.yearCertified <= y).length)])) as Record<PlaceType, number[]>;
  const total = years.map((_, i) => PLACE_TYPES.reduce((a, t) => a + byType[t][i], 0));
  return { years, byType, total };
}

export const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b), m = s.length >> 1;
  return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : null;
};
