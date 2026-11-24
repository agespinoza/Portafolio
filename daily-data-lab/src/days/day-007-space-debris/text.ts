import { localeFor } from "../../../../assets/i18n.js";
import { makeTr } from "../tr.js";
import { MESSAGES } from "./messages";

type Values = Record<string, string | number>;
const translate = makeTr("spaceDebris", MESSAGES) as (language: string, key: string, fallback: string, values?: Values) => string;

/** Day 007 strings: English fallback written at each call, translations in messages.ts. */
export const tr = (language: string, key: string, fallback: string, values?: Values): string =>
  translate(language, key, fallback, values);

const locale = (language: string): string => localeFor(language);
export const num = (v: number, language: string, digits = 0) =>
  v.toLocaleString(locale(language), { maximumFractionDigits: digits, minimumFractionDigits: digits });
export const pct = (v: number, language: string, digits = 0) =>
  v.toLocaleString(locale(language), { style: "percent", maximumFractionDigits: digits, minimumFractionDigits: digits });
export const fmtDate = (iso: string, language: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(locale(language), { dateStyle: "medium" });
/** Compact counts (1.5 M, 230 M) in the visitor's locale. */
export const compact = (v: number, language: string) =>
  v.toLocaleString(locale(language), { notation: "compact", maximumFractionDigits: 2 });
