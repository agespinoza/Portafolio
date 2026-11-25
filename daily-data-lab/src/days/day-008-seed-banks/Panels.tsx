import { useState } from "react";
import { type Country, HIGHLIGHT, backupShare } from "./data";
import { tr, num, pct, countryName } from "./text";

export { KpiCard } from "../day-005-endangered-languages/Panels";

export const cName = (c: Country, language: string) => countryName(c.iso2, c.name, language);
export const continentName = (k: string, language: string) => tr(language, `cont_${k.replace(/\s/g, "")}`, k === "International" ? "International centres" : k);

/* ---------- sortable country table: WIEWS holdings next to Svalbard backups ---------- */
type Key = "name" | "continent" | "accessions" | "genebanks" | "genera" | "species" | "svalbardSamples" | "svalbardDepositors" | "share" | "firstDeposit";
export function DataTable({ rows, focus, language }: { rows: Country[]; focus?: string; language: string }) {
  const [sort, setSort] = useState<{ key: Key; desc: boolean }>({ key: "accessions", desc: true });
  const [limit, setLimit] = useState(25);
  const COLS: [Key, string, string, boolean][] = [
    ["name", "colCountry", "Country", false], ["continent", "colContinent", "Continent", false], ["accessions", "colAcc", "WIEWS accessions", true],
    ["genebanks", "colBanks", "Genebanks", true], ["genera", "colGenera", "Genera", true], ["species", "colSpecies", "Species", true],
    ["svalbardSamples", "colSv", "In Svalbard", true], ["svalbardDepositors", "colSvDep", "Depositors", true],
    ["share", "colShare", "Svalbard ÷ WIEWS", true], ["firstDeposit", "colFirst", "First deposit", true],
  ];
  const val = (c: Country, k: Key): string | number =>
    k === "name" ? cName(c, language) : k === "continent" ? continentName(c.continent, language) : k === "share" ? backupShare(c) ?? -Infinity : (c[k] ?? -Infinity) as number;
  const sorted = [...rows].sort((a, b) => {
    const x = val(a, sort.key), y = val(b, sort.key);
    const d = typeof x === "string" ? x.localeCompare(y as string, language) : (x as number) - (y as number);
    return sort.desc ? -d : d;
  });
  const on = (iso3: string) => HIGHLIGHT.has(iso3) || iso3 === focus;
  const shown = [...sorted.slice(0, limit), ...sorted.slice(limit).filter((c) => on(c.iso3))];
  const click = (k: Key, numeric: boolean) => setSort((s) => (s.key === k ? { key: k, desc: !s.desc } : { key: k, desc: numeric }));
  const n = (v: number | null) => (v == null ? "—" : num(v, language));
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
            {shown.map((c) => {
              const s = backupShare(c);
              return (
                <tr key={c.iso3} className={on(c.iso3) ? "on fw-tr--hl" : ""}>
                  <th scope="row">{cName(c, language)}</th>
                  <td>{continentName(c.continent, language)}</td>
                  <td className="num">{n(c.accessions)}</td>
                  <td className="num">{n(c.genebanks)}</td>
                  <td className="num">{n(c.genera)}</td>
                  <td className="num">{n(c.species)}</td>
                  <td className="num">{num(c.svalbardSamples, language)}</td>
                  <td className="num">{num(c.svalbardDepositors, language)}</td>
                  <td className="num">{s == null ? "—" : s > 1 ? `>${pct(1, language)}` : pct(s, language, s < 0.1 && s > 0 ? 1 : 0)}</td>
                  <td className="num">{c.firstDeposit ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sorted.length > limit && (
        <button type="button" className="gw-reset el-more" onClick={() => setLimit((k) => k + 25)}>
          {tr(language, "showMore", "Show more ({n} left)", { n: num(sorted.length - limit, language) })}
        </button>
      )}
      <p className="lp-small">{tr(language, "tableNote", "Click a column to sort. “—” means the country did not report to FAO WIEWS for 2024. Svalbard counts only national depositors; international centres such as CIMMYT (Mexico) are listed apart. “>100%” means Svalbard holds more samples than WIEWS lists for the country: the two systems count differently. Mexico and the United States stay visible.")}</p>
    </div>
  );
}
