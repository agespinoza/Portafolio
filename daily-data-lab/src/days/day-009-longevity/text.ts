import { localeFor } from "../../../../assets/i18n.js";
import { makeTr } from "../tr.js";
import { MESSAGES } from "./messages";

type Values = Record<string, string | number>;
const translate = makeTr("longevity", MESSAGES) as (language: string, key: string, fallback: string, values?: Values) => string;

/** Day 009 strings: English fallback written at each call, translations in messages.ts. */
export const tr = (language: string, key: string, fallback: string, values?: Values): string =>
  translate(language, key, fallback, values);

const locale = (language: string): string => localeFor(language);
export const num = (v: number, language: string, digits = 0) =>
  v.toLocaleString(locale(language), { maximumFractionDigits: digits, minimumFractionDigits: digits });
export const yrs = (v: number | null, language: string) => (v == null ? "—" : num(v, language, 1));
export const pct = (v: number, language: string, digits = 0) =>
  v.toLocaleString(locale(language), { style: "percent", maximumFractionDigits: digits, minimumFractionDigits: digits });
export const fmtDate = (iso: string, language: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(locale(language), { dateStyle: "medium" });
export const signed = (v: number, language: string, digits = 1) => `${v > 0 ? "+" : v < 0 ? "−" : "±"}${num(Math.abs(v), language, digits)}`;
/** Compact money: $12.3k, $850. */
export const usd = (v: number, language: string) => (v >= 1e4 ? `$${num(v / 1e3, language, 0)}k` : v >= 1e3 ? `$${num(v / 1e3, language, 1)}k` : `$${num(v, language)}`);

/** Country names in the visitor's language from ISO 3166 alpha-2; falls back to the UN name. */
const regionNames = new Map<string, Intl.DisplayNames>();
export function countryName(iso2: string | undefined, fallback: string, language: string): string {
  if (!iso2) return fallback;
  const loc = locale(language);
  if (!regionNames.has(loc)) regionNames.set(loc, new Intl.DisplayNames([loc], { type: "region" }));
  try { return regionNames.get(loc)!.of(iso2) ?? fallback; } catch { return fallback; }
}
