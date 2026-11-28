// Day 011 data: the world spice trade. Built with DuckDB (scripts/day-011/snapshot.mjs) from FAOSTAT production (QCL),
// trade (TCL) and the Detailed trade matrix (TM) for eight spice items, UN M49 codes, World Bank WDI metadata and
// population, and a cited historical layer (scripts/day-011/history.json). One JSON bundled with the page: no network
// calls in the browser.
import SNAPSHOT from "../../../data/day-011-spices/day-011.json";

export type SpiceId = "pepper" | "chillies" | "ginger" | "seeds" | "nutmeg" | "cinnamon" | "cloves" | "vanilla";
export interface Spice { id: SpiceId; code: number; cpc: string; name: string; short: string }
export interface Country { iso3: string; iso2: string; name: string; region: string; lat: number | null; lon: number | null; pop: number | null; popYear: number | null; former: boolean }
type Yearly = (number | null)[];
export interface WorldSeries { prod: Yearly; area: Yearly; exportT: Yearly; exportUsd: Yearly; importT: Yearly; importUsd: Yearly; hhi: Yearly; top3: Yearly; producers: Yearly }
/** [export t, export USD, import t, import USD] */
export type TradeRow = [number | null, number | null, number | null, number | null];
/** [importer (reporter), exporter (partner), tonnes, USD] */
export type Flow = [string, string, number | null, number | null];
export interface Summary {
  worldTonnes: number; areaHa: number; exportUsd: number; exportT: number; importUsd: number; importT: number; usdPerKg: number;
  hhi: number; top3: number; producers: number; exportHhi: number; exporters: number;
  topProducer: string; topProducerShare: number; topExporter: string; topImporter: string; topImporterShare: number; growth1961: number; gapPct: number; officialPct: number;
}
export interface HistoryEvent {
  id: string; start: number; end: number; when: string; spice: SpiceId; ref: string; basis: string;
  places: [number, number, string][]; route: [number, number][]; text: string;
}
interface Snapshot {
  capturedAt: string; first: number; latest: number; flowYears: number[];
  spices: Spice[]; countries: Country[];
  world: Record<SpiceId, WorldSeries>;
  prod: Record<SpiceId, Record<string, Yearly>>;
  area: Record<SpiceId, Record<string, number>>;
  trade: Record<SpiceId, Record<string, Record<string, TradeRow>>>;
  flows: Record<SpiceId, Record<string, Flow[]>>;
  summary: Record<SpiceId, Summary>;
  prodFlag: Record<SpiceId, Record<string, string>>;
  checks: { spiceId: SpiceId; worldT: number; sumT: number; worldX: number; worldM: number; gapPct: number; worldXusd: number; worldMusd: number }[];
  flowCover: { spiceId: SpiceId; year: number; n: number; reporters: number; sharePct: number }[];
  mexVanilla: [number, string, number | null, number | null][];
  history: { events: HistoryEvent[] };
}
const S = SNAPSHOT as unknown as Snapshot;

export const CAPTURED_AT = S.capturedAt.slice(0, 10);
export const FIRST = S.first;
export const LATEST = S.latest;
export const FLOW_YEARS = S.flowYears;
export const SPICES = S.spices;
export const SPICE_IDS = SPICES.map((s) => s.id);
export const COUNTRIES = S.countries;
export const WORLD = S.world;
export const PROD = S.prod;
export const AREA = S.area;
export const TRADE = S.trade;
export const FLOWS = S.flows;
export const SUMMARY = S.summary;
/** FAOSTAT flag of the latest production figure when it is not official: E estimated, I imputed, X external. */
export const PROD_FLAG = S.prodFlag;
export const CHECKS = S.checks;
export const FLOW_COVER = S.flowCover;
export const MEX_VANILLA = S.mexVanilla;
export const EVENTS = S.history.events;
export const YEARS = Array.from({ length: LATEST - FIRST + 1 }, (_, i) => FIRST + i);
export const yi = (y: number) => y - FIRST;
export const BY_ISO = new Map(COUNTRIES.map((c) => [c.iso3, c]));
export const SPICE = Object.fromEntries(SPICES.map((s) => [s.id, s])) as Record<SpiceId, Spice>;
/** Mexico (vanilla's homeland) and black pepper stay highlighted, as the brief asks. */
export const HIGHLIGHT = new Set(["MEX"]);
export const COLOR: Record<SpiceId, string> = Object.fromEntries(SPICE_IDS.map((id) => [id, `var(--sp-${id})`])) as Record<SpiceId, string>;
/** HHI bands of the US merger guidelines (2010): below 1,500 unconcentrated, above 2,500 highly concentrated. */
export const hhiBand = (h: number) => (h < 1500 ? "low" : h <= 2500 ? "moderate" : "high");

export const prodOf = (s: SpiceId, iso3: string, year = LATEST) => PROD[s][iso3]?.[yi(year)] ?? null;
export const tradeOf = (s: SpiceId, iso3: string, year = LATEST): TradeRow | null => TRADE[s][year]?.[iso3] ?? null;

/** Producers of a spice in a year, largest first, with their share of the world total. */
export function producers(s: SpiceId, year = LATEST): { iso3: string; t: number; share: number }[] {
  const world = WORLD[s].prod[yi(year)] ?? 0;
  return Object.entries(PROD[s]).map(([iso3, v]) => ({ iso3, t: v[yi(year)] ?? 0 })).filter((x) => x.t > 0)
    .sort((a, b) => b.t - a.t).map((x) => ({ ...x, share: world ? (100 * x.t) / world : 0 }));
}
export interface TradeRank { iso3: string; t: number; usd: number; share: number; usdPerKg: number | null; kgPerPerson: number | null }
/** Exporters or importers of a spice in a year, ranked by value. */
export function traders(s: SpiceId, side: "export" | "import", year = LATEST): TradeRank[] {
  const rows = TRADE[s][year] ?? {};
  const [ti, ui] = side === "export" ? [0, 1] : [2, 3];
  const total = Object.values(rows).reduce((a, r) => a + (r[ui] ?? 0), 0);
  return Object.entries(rows).map(([iso3, r]) => {
    const t = r[ti] ?? 0, usd = r[ui] ?? 0, pop = BY_ISO.get(iso3)?.pop ?? null;
    return { iso3, t, usd, share: total ? (100 * usd) / total : 0, usdPerKg: t > 0 ? usd / (t * 1000) : null, kgPerPerson: pop && side === "import" ? (t * 1000) / pop : null };
  }).filter((x) => x.usd > 0 || x.t > 0).sort((a, b) => b.usd - a.usd);
}
/** World export unit value (USD per kg) of a spice in a year. */
export const usdPerKg = (s: SpiceId, year = LATEST) => {
  const v = WORLD[s].exportUsd[yi(year)], t = WORLD[s].exportT[yi(year)];
  return v != null && t ? v / (t * 1000) : null;
};
/** Mean of the first three years (1961–63), the base for "growth since 1961". */
export const base1961 = (s: SpiceId) => {
  const v = WORLD[s].prod.slice(0, 3).filter((x): x is number => x != null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};
/** Squarified treemap (Bruls, Huizing & van Wijk 2000) of values into a w × h box. */
export function squarify<T extends { value: number }>(items: T[], w: number, h: number): (T & { x: number; y: number; w: number; h: number })[] {
  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  const scaled = items.filter((i) => i.value > 0).map((i) => ({ item: i, a: (i.value / total) * w * h }));
  const out: (T & { x: number; y: number; w: number; h: number })[] = [];
  let x = 0, y = 0, W = w, H = h, row: typeof scaled = [];
  const worst = (r: typeof scaled, side: number) => {
    const s = r.reduce((a, b) => a + b.a, 0), mx = Math.max(...r.map((q) => q.a)), mn = Math.min(...r.map((q) => q.a));
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  const layout = (r: typeof scaled) => {
    const s = r.reduce((a, b) => a + b.a, 0);
    if (W >= H) { const cw = s / H; let cy = y; for (const q of r) { const ch = q.a / cw; out.push({ ...q.item, x, y: cy, w: cw, h: ch }); cy += ch; } x += cw; W -= cw; }
    else { const ch = s / W; let cx = x; for (const q of r) { const cw = q.a / ch; out.push({ ...q.item, x: cx, y, w: cw, h: ch }); cx += cw; } y += ch; H -= ch; }
  };
  for (const q of scaled) {
    const side = Math.min(W, H);
    if (!row.length || worst([...row, q], side) <= worst(row, side)) row.push(q);
    else { layout(row); row = [q]; }
  }
  if (row.length) layout(row);
  return out;
}
