import StudyFacts from "../StudyFacts.jsx";
import { useState } from "react";
import { type Country, COUNTRIES, HIGHLIGHT, confColor, isMeasured } from "./data";
import { tr, num, countryName } from "./text";

export { KpiCard } from "../day-005-endangered-languages/Panels";

export const confName = (c: string, language: string) => tr(language, `conf${c.replace(" ", "")}`, c === "Eurostat" ? "Eurostat (unrated)" : c);
/** Short English labels for the World Bank regions (the official names are too long for chart axes). */
const REGION_SHORT: Record<string, string> = {
  "Middle East, North Africa, Afghanistan & Pakistan": "MENA, Afghanistan & Pakistan",
  "Latin America & Caribbean": "Latin America & Caribbean",
};
export const regionName = (r: string, language: string) => tr(language, `region_${r.replace(/[^A-Za-z]/g, "")}`, REGION_SHORT[r] ?? r);
export const incomeName = (r: string, language: string) => tr(language, `income_${r.replace(/[^A-Za-z]/g, "")}`, r);
export const cName = (c: Country, language: string) => countryName(c.iso2, c.name, language);

/* ---------- sortable country table ---------- */
type Key = "name" | "pop" | "householdKgCap" | "foodServiceKgCap" | "retailKgCap" | "totalT" | "confidence" | "pou" | "tempC";
export function DataTable({ rows, language }: { rows: Country[]; language: string }) {
  const [sort, setSort] = useState<{ key: Key; desc: boolean }>({ key: "totalT", desc: true });
  const [limit, setLimit] = useState(25);
  const COLS: [Key, string, string, boolean][] = [
    ["name", "colCountry", "Country", false], ["pop", "colPop", "Population (M)", true], ["householdKgCap", "colHh", "Household kg/cap", true],
    ["foodServiceKgCap", "colFs", "Food service kg/cap", true], ["retailKgCap", "colRt", "Retail kg/cap", true], ["totalT", "colTotal", "Total (kt)", true],
    ["confidence", "colConf", "Confidence", false], ["pou", "colPou", "Undernourished %", true], ["tempC", "colTemp", "Mean temp °C", true],
  ];
  const val = (c: Country, k: Key): string | number => (k === "name" ? cName(c, language) : k === "confidence" ? ["High", "Medium", "Eurostat", "Low", "Very low"].indexOf(c.confidence) : (c[k] ?? -Infinity) as number);
  const sorted = [...rows].sort((a, b) => {
    const x = val(a, sort.key), y = val(b, sort.key);
    const d = typeof x === "string" ? x.localeCompare(y as string, language) : (x as number) - (y as number);
    return sort.desc ? -d : d;
  });
  // Mexico and the USA always stay visible, even beyond the current page.
  const shown = [...sorted.slice(0, limit), ...sorted.slice(limit).filter((c) => HIGHLIGHT.has(c.iso3))];
  const click = (k: Key, numeric: boolean) => setSort((s) => (s.key === k ? { key: k, desc: !s.desc } : { key: k, desc: numeric }));
  return (
    <div>
      <div className="lp-table-wrap">
        <table className="lp-table fw-table">
          <thead><tr>
            {COLS.map(([k, key, en, numeric]) => (
              <th key={k} scope="col" className={numeric ? "num" : ""} aria-sort={sort.key === k ? (sort.desc ? "descending" : "ascending") : "none"}>
                <button type="button" className="fw-sort" onClick={() => click(k, numeric)}>{tr(language, key, en)}{sort.key === k ? (sort.desc ? " ↓" : " ↑") : ""}</button>
              </th>
            ))}
          </tr></thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.iso3} className={HIGHLIGHT.has(c.iso3) ? "on fw-tr--hl" : ""}>
                <th scope="row">{cName(c, language)}</th>
                <td className="num">{num(c.pop / 1e6, language, 1)}</td>
                <td className="num">{num(c.householdKgCap, language)}</td>
                <td className="num">{c.foodServiceKgCap == null ? "—" : num(c.foodServiceKgCap, language)}</td>
                <td className="num">{c.retailKgCap == null ? "—" : num(c.retailKgCap, language)}</td>
                <td className="num">{num(c.totalT / 1e3, language)}</td>
                <td><i className="fw-sw" style={{ background: confColor(c.confidence) }} />{confName(c.confidence, language)}</td>
                <td className="num">{c.pou == null ? "—" : c.pouFloor ? "<2.5" : num(c.pou, language, 1)}</td>
                <td className="num">{c.tempC == null ? "—" : num(c.tempC, language, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length > limit && (
        <button type="button" className="gw-reset el-more" onClick={() => setLimit((n) => n + 25)}>
          {tr(language, "showMore", "Show more ({n} left)", { n: num(sorted.length - limit, language) })}
        </button>
      )}
      <p className="lp-small">{tr(language, "tableNote", "Click a column to sort. Food service and retail for EU countries are Eurostat-reported values. \"<2.5\" is FAO's reporting floor for undernourishment. Mexico and the United States stay visible.")}</p>
    </div>
  );
}

/* ---------- Family mode: three plain-language facts, recomputed for the selected region ---------- */
export function FoodFacts({ list, mealsPerDay, incomeKg, language }: { list: Country[]; mealsPerDay: number; incomeKg: { hi: number; lmi: number }; language: string }) {
  const mex = COUNTRIES.find((c) => c.iso3 === "MEX"), usa = COUNTRIES.find((c) => c.iso3 === "USA");
  const top = [...list].filter(isMeasured).sort((a, b) => b.householdKgCap - a.householdKgCap)[0];
  const kgWeek = (kg: number) => num(kg / 52, language, 1);
  const facts = [
    mex && usa
      ? { title: tr(language, "f1Head", "Mexico vs the United States"), text: tr(language, "f1", "A person in Mexico throws away about {mex} kg of food at home each year ({mexW} kg a week); in the United States, about {usa} kg ({usaW} kg a week). Mexico's figure is measured with medium confidence, the USA's with high.", {
          mex: num(mex.householdKgCap, language), usa: num(usa.householdKgCap, language), mexW: kgWeek(mex.householdKgCap), usaW: kgWeek(usa.householdKgCap) }) }
      : top ? { title: tr(language, "f1bHead", "Most wasted at home"), text: tr(language, "f1b", "Among measured countries here, {name} wastes the most at home: about {kg} kg per person each year, {w} kg a week.", {
          name: cName(top, language), kg: num(top.householdKgCap, language), w: kgWeek(top.householdKgCap) }) } : null,
    { title: tr(language, "f2Head", "Meals in the bin"), text: tr(language, "f2", "Even if only a quarter of household food waste is edible, homes here throw away about {m} million meals every day.", { m: num(mealsPerDay / 1e6, language) }) },
    { title: tr(language, "f3Head", "Not just a rich-country habit"), text: tr(language, "f3", "Homes in high-income countries waste about {hi} kg per person a year; homes in lower-middle-income countries, about {lmi} kg. Wasting food at home happens everywhere.", { hi: num(incomeKg.hi, language), lmi: num(incomeKg.lmi, language) }) },
  ].filter((f): f is { title: string; text: string } => !!f);
  return <StudyFacts facts={facts} language={language} />;
}
