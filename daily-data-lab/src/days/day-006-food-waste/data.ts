// Day 006 data: UNEP Food Waste Index Report 2024 (year 2022) for all 228 countries in Annex 3, joined with
// FAOSTAT undernourishment, World Bank region / income group / population, and CCKP mean temperature.
// Built with DuckDB (scripts/day-006/build.sql + snapshot.mjs) into one JSON bundled with the page: no network.
import SNAPSHOT from "../../../data/day-006-food-waste/day-006.json";

export type Confidence = "High" | "Medium" | "Low" | "Very low" | "Eurostat";
export interface Country {
  iso3: string; iso2: string; name: string; region: string; incomeGroup: string; pop: number;
  householdKgCap: number; foodServiceKgCap: number | null; retailKgCap: number | null; totalT: number;
  confidence: Confidence; eurostatFill: boolean; pou: number | null; pouFloor: boolean; hungryM: number | null; tempC: number | null;
}
export interface Group {
  key: string; countries: number; pop: number; householdT: number; foodServiceT: number; retailT: number; totalT: number;
  householdKgCap: number; hungryM: number | null; mealsPerDay: number;
}
interface Snapshot {
  capturedAt: string;
  assumptions: { edibleShare: number; mealKg: number; consumerFoodT: number; pouYears: string; tempPeriod: string };
  kpis: { totalMt: number; householdMt: number; foodServiceMt: number; retailMt: number; householdKgCap: number; totalKgCap: number; pctWasted: number; mealsPerDay: number; hungryPeopleM: number; reconstructionGap: number };
  bySector: { key: "household" | "foodService" | "retail"; t: number; kgCap: number }[];
  byIncome: Group[]; byRegion: Group[];
  confidence: { key: Confidence; countries: number; householdT: number }[];
  foodLossIndex: { year: number; product: string; index: number; lossPct: number | null }[];
  countries: Country[];
}
const S = SNAPSHOT as unknown as Snapshot;

export const CAPTURED_AT = S.capturedAt.slice(0, 10);
export const ASSUMPTIONS = S.assumptions;
export const KPIS = S.kpis;
export const BY_SECTOR = S.bySector;
export const BY_INCOME = S.byIncome;
export const BY_REGION = S.byRegion;
export const CONFIDENCE_ALL = S.confidence;
export const FLI = S.foodLossIndex;
export const COUNTRIES = S.countries;

/** Mexico and the United States are highlighted everywhere (the lab's home crossing, Day 001). */
export const HIGHLIGHT = new Set(["MEX", "USA"]);
export const REGIONS = BY_REGION.map((r) => r.key).filter((k) => k !== "Not classified");
export const INCOMES = ["Low income", "Lower middle income", "Upper middle income", "High income"];
export const CONFIDENCES: Confidence[] = ["High", "Medium", "Eurostat", "Low", "Very low"];
/** Measured = UNEP rates the household estimate high or medium confidence (low / very low are extrapolated). */
export const isMeasured = (c: Country) => c.confidence === "High" || c.confidence === "Medium";
export const confColor = (c: Confidence) => `var(--fw-c-${CONFIDENCES.indexOf(c)})`;
export const SECTOR_COLOR = { household: "var(--fw-s0)", foodService: "var(--fw-s1)", retail: "var(--fw-s2)" } as const;

export const mealsPerDay = (householdT: number) => (householdT * 1000 * ASSUMPTIONS.edibleShare) / ASSUMPTIONS.mealKg / 365;

/** Pearson r with a Fisher-z 95% interval. */
export function pearson(xs: number[], ys: number[]): { r: number; lo: number; hi: number; n: number } {
  const n = xs.length;
  if (n < 4) return { r: NaN, lo: NaN, hi: NaN, n };
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  const r = sxy / Math.sqrt(sxx * syy);
  const z = Math.atanh(r), se = 1 / Math.sqrt(n - 3);
  return { r, lo: Math.tanh(z - 1.96 * se), hi: Math.tanh(z + 1.96 * se), n };
}

/** Ordinary least squares line y = a + b·x. */
export function ols(xs: number[], ys: number[]): { a: number; b: number } {
  const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
  const b = sxx ? sxy / sxx : 0;
  return { a: my - b * mx, b };
}
