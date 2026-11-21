import { localeFor } from "../../../../assets/i18n.js";
import { makeTr } from "../tr.js";
import { MESSAGES } from "./messages";

type Values = Record<string, string | number>;
const translate = makeTr("abraham", MESSAGES) as (language: string, key: string, fallback: string, values?: Values) => string;

/** Day 004 strings: English fallback written at each call, translations in messages.ts. */
export const tr = (language: string, key: string, fallback: string, values?: Values): string =>
  translate(language, key, fallback, values);

const locale = (language: string): string => localeFor(language);
export const num = (v: number, language: string) => v.toLocaleString(locale(language));
export const fmt1 = (v: number, language: string) => v.toLocaleString(locale(language), { maximumFractionDigits: 1, minimumFractionDigits: 1 });
export const fmt2 = (v: number, language: string) => v.toLocaleString(locale(language), { maximumFractionDigits: 2, minimumFractionDigits: 2 });
export const fmt0 = (v: number, language: string) => Math.round(v).toLocaleString(locale(language));
export const signed = (v: number, language: string) => `${v > 0 ? "+" : v < 0 ? "−" : "±"}${fmt2(Math.abs(v), language)}`;
export const pct = (v: number, language: string) => v.toLocaleString(locale(language), { style: "percent", maximumFractionDigits: 0 });
export const compact = (v: number, language: string) => v.toLocaleString(locale(language), { notation: "compact", maximumFractionDigits: 2 });
export const fmtDate = (iso: string, language: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(locale(language), { dateStyle: "medium" });
