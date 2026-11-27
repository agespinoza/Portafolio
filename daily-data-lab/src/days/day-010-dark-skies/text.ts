import { localeFor } from "../../../../assets/i18n.js";
import { makeTr } from "../tr.js";
import { MESSAGES } from "./messages";

type Values = Record<string, string | number>;
const translate = makeTr("darksky", MESSAGES) as (language: string, key: string, fallback: string, values?: Values) => string;

/** Day 010 strings: English fallback written at each call, translations in messages.ts. */
export const tr = (language: string, key: string, fallback: string, values?: Values): string =>
  translate(language, key, fallback, values);

const locale = (language: string): string => localeFor(language);
export const num = (v: number, language: string, digits = 0) =>
  v.toLocaleString(locale(language), { maximumFractionDigits: digits, minimumFractionDigits: digits });
/** A percentage given as 0–100. */
export const pc = (v: number | null, language: string, digits = 1) => (v == null ? "—" : `${num(v, language, digits)}%`);
/** Large counts in words, in the visitor's language: 6.2 billion, 6.2 mil millones, 61.9億 (Intl long compact notation;
 *  the short form gives "6191 M" in es-MX). */
export const big = (v: number | null, language: string) =>
  v == null ? "—" : v.toLocaleString(locale(language), { notation: "compact", compactDisplay: v >= 1e6 ? "long" : "short", maximumFractionDigits: v >= 1e9 ? 1 : 0 });
/** A count of people with its noun, grammatical in each language: "6.2 billion people", "6.2 mil millones de personas",
 *  "82 millions de personnes", "61.9億人". */
const PEOPLE: Record<string, [string, string]> = { es: ["personas", "de personas"], pt: ["pessoas", "de pessoas"], fr: ["personnes", "de personnes"], it: ["persone", "di persone"] };
export function peopleCount(v: number | null, language: string): string {
  if (v == null) return "—";
  const n = big(v, language), lang = language.slice(0, 2);
  if (lang === "ja" || lang === "zh") return `${n}人`;
  const words = PEOPLE[lang];
  return words ? `${n} ${v >= 1e6 ? words[1] : words[0]}` : `${n} ${v === 1 ? "person" : "people"}`;
}
export const fmtDate = (iso: string, language: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(locale(language), { dateStyle: "medium" });
export const signed = (v: number, language: string, digits = 1) => `${v > 0 ? "+" : v < 0 ? "−" : "±"}${num(Math.abs(v), language, digits)}`;

/** Country names in the visitor's language from ISO 3166 alpha-2; falls back to the paper's name. */
const regionNames = new Map<string, Intl.DisplayNames>();
export function countryName(iso2: string | null | undefined, fallback: string, language: string): string {
  if (!iso2) return fallback;
  const loc = locale(language);
  if (!regionNames.has(loc)) regionNames.set(loc, new Intl.DisplayNames([loc], { type: "region" }));
  try { return regionNames.get(loc)!.of(iso2) ?? fallback; } catch { return fallback; }
}
