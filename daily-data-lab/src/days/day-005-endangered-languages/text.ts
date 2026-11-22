import { localeFor } from "../../../../assets/i18n.js";
import { makeTr } from "../tr.js";
import { MESSAGES } from "./messages";

type Values = Record<string, string | number>;
const translate = makeTr("languages", MESSAGES) as (language: string, key: string, fallback: string, values?: Values) => string;

/** Day 005 strings: English fallback written at each call, translations in messages.ts. */
export const tr = (language: string, key: string, fallback: string, values?: Values): string =>
  translate(language, key, fallback, values);

const locale = (language: string): string => localeFor(language);
export const num = (v: number, language: string) => v.toLocaleString(locale(language));
export const pct = (v: number, language: string, digits = 0) =>
  v.toLocaleString(locale(language), { style: "percent", maximumFractionDigits: digits, minimumFractionDigits: digits });
export const fmtDate = (iso: string, language: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(locale(language), { dateStyle: "medium" });

/** Country names in the visitor's language from ISO 3166 alpha-2 codes (Intl.DisplayNames, no extra data). */
const regionNames = new Map<string, Intl.DisplayNames>();
export function countryName(code: string, language: string): string {
  const loc = locale(language);
  if (!regionNames.has(loc)) regionNames.set(loc, new Intl.DisplayNames([loc], { type: "region" }));
  try { return regionNames.get(loc)!.of(code) ?? code; } catch { return code; }
}
