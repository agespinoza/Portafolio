// Day 008 data: the Svalbard Global Seed Vault (Seed Portal exports, NordGen Annual Progress Report 2025) and the
// world's genebanks (FAO WIEWS, SDG indicator 2.5.1.a, 2024). Built with DuckDB (scripts/day-008/snapshot.mjs)
// into one JSON bundled with the page: no network calls in the browser.
import SNAPSHOT from "../../../data/day-008-seed-banks/day-008.json";

export const CONTINENTS = ["Africa", "Americas", "Asia", "Europe", "Oceania", "International"] as const;
export type Continent = (typeof CONTINENTS)[number];

export interface Depositor {
  code: string; name: string; country: string; iso3: string; iso2: string | null; continent: Continent;
  /** International (CGIAR and others) or regional centre, as WIEWS reports them apart from the host country. */
  center: string | null; regional: boolean; samples: number; species: number; taxa: number; firstYear: number; events: number;
}
export interface DepositEvent { date: string; code: string; samples: number; withdrawn: number; boxes: number; species: number }
export interface Genus {
  genus: string; common: string; samples: number; species: number;
  /** Seed Portal's own name, the genus's most-sampled species and its share (absent for continent subsets). */
  portalName?: string; topSpecies?: string | null; topSpeciesShare?: number | null;
}
export interface Country {
  iso3: string; iso2: string; name: string; continent: Exclude<Continent, "International">; subregion: string | null;
  /** FAO WIEWS 2024 national holdings; null when the country does not report to WIEWS. */
  accessions: number | null; genebanks: number | null; genera: number | null; species: number | null;
  /** Samples deposited in Svalbard by the country's national institutes (international centres excluded). */
  svalbardSamples: number; svalbardDepositors: number; firstDeposit: number | null;
}
export interface Centre { center: string; regional: boolean; codes: string[]; svalbardSamples: number; wiewsName: string | null; wiewsAccessions: number | null }
export interface TrendRow { year: number; World: number; Africa: number; Americas: number; Asia: number; Europe: number; Oceania: number; International: number }
interface Snapshot {
  capturedAt: string;
  reconciliation: { portalSamples: number; websiteSamples: number; reportEnd2025Holdings: number; deposits2026: number; reportAccumulated: number; reportWithdrawn: number; wiewsTotal2024Dashboard: number; wiewsTotal2024Trend: number };
  kpis: { svalbardSamples: number; depositors: number; species: number; genera: number; globalExSituAccessions: number; globalYear: number; wiewsGenebanks: number; wiewsCountries: number; countriesBackedUp: number; depositorCountries: number; wiewsCountriesBackedUp: number };
  svalbardCumulativeByYear: { year: number; deposited: number; accumulated: number | null; withdrawn: number | null; holdings: number; source: string }[];
  depositEvents: DepositEvent[];
  depositors: Depositor[];
  genera: Genus[];
  cropsByContinent: { continent: Continent; genus: string; samples: number }[];
  svalbardByContinent: { continent: string; samples: number; depositors: number; species: number }[];
  centres: Centre[];
  wiewsCentres: { name: string; kind: string; instcode: string | null; accessions: number; genebanks: number; genera: number; species: number }[];
  wiewsTrend: TrendRow[];
  countries: Country[];
}
const S = SNAPSHOT as unknown as Snapshot;

export const CAPTURED_AT = S.capturedAt.slice(0, 10);
export const REC = S.reconciliation;
export const KPIS = S.kpis;
export const CUMULATIVE = S.svalbardCumulativeByYear;
export const EVENTS = S.depositEvents;
export const DEPOSITORS = S.depositors;
export const GENERA = S.genera;
export const CROPS_BY_CONTINENT = S.cropsByContinent;
export const ORIGIN = S.svalbardByContinent;
export const CENTRES = S.centres;
export const WIEWS_CENTRES = S.wiewsCentres;
export const TREND = S.wiewsTrend;
export const COUNTRIES = S.countries;

const DEP = new Map(DEPOSITORS.map((d) => [d.code, d]));
export const depositor = (code: string) => DEP.get(code);
const COMMON = new Map(GENERA.map((g) => [g.genus, g.common]));
export const commonName = (genus: string) => COMMON.get(genus) ?? genus;

/** Mexico and the United States are highlighted everywhere (the lab's home crossing, Day 001). */
export const HIGHLIGHT = new Set(["MEX", "USA"]);
export type Scope = Continent | "all";
export const inScope = (scope: Scope, continent: string) => scope === "all" || continent === scope;

/** Genera ranked by samples for a scope (depositor continent). */
export function cropsFor(scope: Scope): Genus[] {
  if (scope === "all") return GENERA;
  return CROPS_BY_CONTINENT.filter((c) => c.continent === scope)
    .map((c) => ({ genus: c.genus, common: commonName(c.genus), samples: c.samples, species: 0 }))
    .sort((a, b) => b.samples - a.samples);
}

/** How many of the top genera hold a given share of samples. */
export function generaFor(share: number, crops: Genus[]): number {
  const total = crops.reduce((a, g) => a + g.samples, 0);
  let acc = 0;
  for (let i = 0; i < crops.length; i++) { acc += crops[i].samples; if (acc >= share * total) return i + 1; }
  return crops.length;
}

/** Herfindahl–Hirschman index (0–10,000) of shares. */
export const hhi = (values: number[]) => {
  const t = values.reduce((a, b) => a + b, 0) || 1;
  return values.reduce((a, v) => a + ((100 * v) / t) ** 2, 0);
};

/** Share of a country's WIEWS holdings that has a Svalbard duplicate, capped at 1 for the chart (counts are not matched one to one). */
export const backupShare = (c: Country) => (c.accessions ? c.svalbardSamples / c.accessions : null);

export const median = (xs: number[]) => {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b), m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
