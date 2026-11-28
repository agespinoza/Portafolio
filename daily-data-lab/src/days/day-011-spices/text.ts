import { localeFor } from "../../../../assets/i18n.js";
import { makeTr } from "../tr.js";
import { MESSAGES } from "./messages";

type Values = Record<string, string | number>;
const translate = makeTr("spices", MESSAGES) as (language: string, key: string, fallback: string, values?: Values) => string;

/** Day 011 strings: English fallback written at each call, translations in messages.ts. */
export const tr = (language: string, key: string, fallback: string, values?: Values): string =>
  translate(language, key, fallback, values);

const locale = (language: string): string => localeFor(language);
export const num = (v: number, language: string, digits = 0) =>
  v.toLocaleString(locale(language), { maximumFractionDigits: digits, minimumFractionDigits: digits });
/** A percentage given as 0–100. */
export const pc = (v: number | null, language: string, digits = 1) => (v == null ? "—" : `${num(v, language, digits)}%`);
/** Large numbers in words in the visitor's language (Intl compact notation): 5.5 million, 5.5 millones, 545.7万. */
export const big = (v: number | null, language: string) =>
  v == null ? "—" : v.toLocaleString(locale(language), { notation: "compact", compactDisplay: v >= 1e6 ? "long" : "short", maximumFractionDigits: v >= 1e9 ? 2 : 1 });
/** US dollars, compact: US$2.5 billion. */
export const usd = (v: number | null, language: string) =>
  v == null ? "—" : `US$${big(v, language)}`;
/** Tonnes: whole tonnes below a million (Intl's compact thousands differ by language), compact above: 5.5 million t. */
export const tonnes = (v: number | null, language: string) => (v == null ? "—" : v >= 1e6 ? `${big(v, language)} t` : `${num(Math.round(v), language)} t`);
export const fmtDate = (iso: string, language: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(locale(language), { dateStyle: "medium" });

/** Country names in the visitor's language from ISO 3166 alpha-2; falls back to FAOSTAT's name (former states). */
const regionNames = new Map<string, Intl.DisplayNames>();
export function countryName(iso2: string | null | undefined, fallback: string, language: string): string {
  if (!iso2) return fallback;
  const loc = locale(language);
  if (!regionNames.has(loc)) regionNames.set(loc, new Intl.DisplayNames([loc], { type: "region" }));
  try { return regionNames.get(loc)!.of(iso2) ?? fallback; } catch { return fallback; }
}
