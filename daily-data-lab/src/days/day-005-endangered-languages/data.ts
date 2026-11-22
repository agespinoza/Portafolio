// Day 005 data: Glottolog 5.4 languages with their Agglomerated Endangerment Status (AES) and Most Extensive
// Description (MED), plus Grambank/WALS coverage. Built with DuckDB (scripts/day-005/build.sql + snapshot.mjs)
// and bundled as snapshot.json, so the page needs no network.
import SNAPSHOT from "./snapshot.json";

/** AES codes as in Glottolog: 1 not endangered … 6 extinct; 0 = not assessed. */
export type Aes = 0 | 1 | 2 | 3 | 4 | 5 | 6;
/** MED codes as in Glottolog: 0 long grammar … 4 wordlist or less; −1 = no description linked. */
export type Med = -1 | 0 | 1 | 2 | 3 | 4;

export interface Language {
  code: string;
  name: string;
  family: number; // index into FAMILIES, −1 = isolate
  macro: number; // index into MACROAREAS, −1 = none
  lat: number | null;
  lon: number | null;
  iso: string;
  countries: string[];
  aes: Aes;
  med: Med;
  medYear: number | null;
  firstYear: number | null;
  grambank: boolean;
  wals: boolean;
}

type Row = [string, string, number, number, number | null, number | null, string, string, number, number, number | null, number | null, number, number];
interface Snapshot {
  capturedAt: string;
  glottoscope: { aes: number[]; med: number[]; cldfAes: number[]; cldfMed: number[] };
  macroareas: string[];
  families: [string, string][];
  languages: Row[];
  grambank: { languages: number; baseEndangered: number; values: number; onlyEndangered: number; majorityEndangered: number; top: [string, string, string, number, number][] };
}
const S = SNAPSHOT as unknown as Snapshot;

export const CAPTURED_AT = S.capturedAt.slice(0, 10);
export const GLOTTOSCOPE = S.glottoscope;
export const MACROAREAS = S.macroareas;
export const FAMILIES = S.families.map(([id, name]) => ({ id, name }));
export const GRAMBANK = S.grambank;
export const LANGUAGES: Language[] = S.languages.map((r) => ({
  code: r[0], name: r[1], family: r[2], macro: r[3], lat: r[4], lon: r[5], iso: r[6],
  countries: r[7] ? r[7].split(";") : [], aes: r[8] as Aes, med: r[9] as Med, medYear: r[10], firstYear: r[11],
  grambank: r[12] === 1, wals: r[13] === 1,
}));
export const BY_CODE = new Map(LANGUAGES.map((l) => [l.code, l]));

export const AES_LEVELS: Aes[] = [1, 2, 3, 4, 5, 6];
export const MED_LEVELS: Med[] = [0, 1, 2, 3, 4];
export const AES_LABEL: Record<Aes, [key: string, en: string]> = {
  0: ["aes0", "Not assessed"], 1: ["aes1", "Not endangered"], 2: ["aes2", "Threatened"], 3: ["aes3", "Shifting"],
  4: ["aes4", "Moribund"], 5: ["aes5", "Nearly extinct"], 6: ["aes6", "Extinct"],
};
export const MED_LABEL: Record<Med, [key: string, en: string]> = {
  [-1]: ["medNone", "Nothing linked"], 0: ["med0", "Long grammar"], 1: ["med1", "Grammar"], 2: ["med2", "Grammar sketch"],
  3: ["med3", "Phonology or texts"], 4: ["med4", "Wordlist or less"],
};
export const aesColor = (a: Aes) => (a === 0 ? "var(--ink-3)" : `var(--el-a${a})`);
export const medColor = (m: Med) => (m < 0 ? "var(--ink-3)" : `var(--el-m${m})`);

/** Endangered = AES 2–5 (threatened … nearly extinct): still spoken, but at risk. */
export const isEndangered = (l: Language) => l.aes >= 2 && l.aes <= 5;
export const isLiving = (l: Language) => l.aes >= 1 && l.aes <= 5;
/** No grammar sketch or better: phonology/texts, a wordlist, or nothing at all. */
export const isPoorlyDocumented = (l: Language) => l.med >= 3 || l.med < 0;
/** The page's core question: shifting or worse (AES 3–5) and no grammar sketch. */
export const isPriority = (l: Language) => l.aes >= 3 && l.aes <= 5 && isPoorlyDocumented(l);

export interface Totals { languages: number; living: number; endangered: number; extinct: number; priority: number; unassessed: number }
export function totals(list: Language[]): Totals {
  const t: Totals = { languages: list.length, living: 0, endangered: 0, extinct: 0, priority: 0, unassessed: 0 };
  for (const l of list) {
    if (isLiving(l)) t.living++;
    if (isEndangered(l)) t.endangered++;
    if (l.aes === 6) t.extinct++;
    if (l.aes === 0) t.unassessed++;
    if (isPriority(l)) t.priority++;
  }
  return t;
}

/** AES × MED counts: rows AES 1–6, columns MED 0–4 (the one language with no MED is counted as "wordlist or less"). */
export function crossTab(list: Language[]): number[][] {
  const m = AES_LEVELS.map(() => [0, 0, 0, 0, 0]);
  for (const l of list) if (l.aes > 0) m[l.aes - 1][l.med < 0 ? 4 : l.med]++;
  return m;
}

export interface FamilyStat { idx: number; name: string; languages: number; living: number; endangered: number; extinct: number; priority: number }
export function familyStats(list: Language[]): FamilyStat[] {
  const map = new Map<number, FamilyStat>();
  for (const l of list) {
    let f = map.get(l.family);
    if (!f) { f = { idx: l.family, name: l.family < 0 ? "" : FAMILIES[l.family].name, languages: 0, living: 0, endangered: 0, extinct: 0, priority: 0 }; map.set(l.family, f); }
    f.languages++;
    if (isLiving(l)) f.living++;
    if (isEndangered(l)) f.endangered++;
    if (l.aes === 6) f.extinct++;
    if (isPriority(l)) f.priority++;
  }
  return [...map.values()].sort((a, b) => b.languages - a.languages);
}
/** Families counted in the "over 50%" KPI: genealogical families (not isolates) with at least 5 living, assessed languages. */
export const MIN_FAMILY = 5;
export const familiesOver50 = (fams: FamilyStat[]) => fams.filter((f) => f.idx >= 0 && f.living >= MIN_FAMILY && f.endangered / f.living > 0.5);

export interface CountryStat { code: string; languages: number; living: number; endangered: number; priority: number }
export function countryStats(list: Language[]): CountryStat[] {
  const map = new Map<string, CountryStat>();
  for (const l of list) for (const c of l.countries) {
    let s = map.get(c);
    if (!s) { s = { code: c, languages: 0, living: 0, endangered: 0, priority: 0 }; map.set(c, s); }
    s.languages++;
    if (isLiving(l)) s.living++;
    if (isEndangered(l)) s.endangered++;
    if (isPriority(l)) s.priority++;
  }
  return [...map.values()];
}

/** Wilson 95% interval for a proportion k/n. */
export function wilson(k: number, n: number): [number, number] {
  if (!n) return [0, 0];
  const z = 1.96, p = k / n, d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d, h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

export const glottologUrl = (code: string) => `https://glottolog.org/resource/languoid/id/${code}`;
