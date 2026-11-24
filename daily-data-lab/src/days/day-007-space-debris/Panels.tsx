import StudyFacts from "../StudyFacts.jsx";
import { useState } from "react";
import { type Cls, CLASSES, CLS_COLOR, OWNERS } from "./data";
import { tr, num, pct } from "./text";

export { KpiCard } from "../day-005-endangered-languages/Panels";

const CLS_EN: Record<Cls, string> = { active: "Active satellites", inactive: "Dead satellites", rocket: "Rocket bodies", debris: "Debris fragments", unknown: "Unidentified" };
export const clsName = (c: Cls, language: string) => tr(language, `cls_${c}`, CLS_EN[c]);

/** ESA's orbit classes (Space Environment Report 2026, Table 1.2), with a plain-language name. */
const ORBIT_EN: Record<string, string> = {
  LEO: "Low Earth orbit", MEO: "Medium Earth orbit", NSO: "Navigation orbits", GEO: "Geostationary", IGO: "Inclined geosynchronous",
  EGO: "Extended geostationary", GTO: "GEO transfer", LMO: "LEO–MEO crossing", MGO: "MEO–GEO crossing", HEO: "Highly eccentric",
  GHO: "GEO–super-GEO crossing", HAO: "Beyond GEO", UFO: "No orbit data",
};
export const orbitName = (o: string, language: string) => tr(language, `orbit_${o}`, ORBIT_EN[o] ?? o);
/** Owner names come from CelesTrak (English); countries and agencies keep their official English names. */
export const ownerName = (code: string) => OWNERS.find((o) => o.code === code)?.name ?? code;

/* ---------- sortable owner table: every owner, no cut-off ---------- */
export interface OwnerStat { code: string; counts: number[]; total: number }
type Key = "name" | "total" | Cls | "junkShare";
export function OwnerTable({ rows, focus, onSelect, language }: { rows: OwnerStat[]; focus: string; onSelect: (code: string) => void; language: string }) {
  const [sort, setSort] = useState<{ key: Key; desc: boolean }>({ key: "total", desc: true });
  const val = (r: OwnerStat, k: Key): string | number =>
    k === "name" ? ownerName(r.code) : k === "total" ? r.total : k === "junkShare" ? (r.total ? 1 - r.counts[0] / r.total : 0) : r.counts[CLASSES.indexOf(k)];
  const sorted = [...rows].sort((a, b) => {
    const x = val(a, sort.key), y = val(b, sort.key);
    const d = typeof x === "string" ? x.localeCompare(y as string, language) : (x as number) - (y as number);
    return (sort.desc ? -d : d) || b.total - a.total;
  });
  const click = (k: Key) => setSort((s) => (s.key === k ? { key: k, desc: !s.desc } : { key: k, desc: k !== "name" }));
  const COLS: [Key, string][] = [
    ["name", tr(language, "colOwner", "Owner")], ["total", tr(language, "colTotal", "In orbit")],
    ...CLASSES.map((c) => [c, clsName(c, language)] as [Key, string]), ["junkShare", tr(language, "colJunk", "Junk share")],
  ];
  return (
    <div>
      <div className="lp-table-wrap el-table-scroll">
        <table className="lp-table fw-table">
          <thead><tr>
            {COLS.map(([k, label]) => (
              <th key={k} scope="col" className={k === "name" ? "" : "num"} aria-sort={sort.key === k ? (sort.desc ? "descending" : "ascending") : "none"}>
                <button type="button" className="fw-sort" onClick={() => click(k)}>
                  {k !== "name" && k !== "total" && k !== "junkShare" && <i className="fw-sw" style={{ background: CLS_COLOR[k] }} />}
                  {label}{sort.key === k ? (sort.desc ? " ↓" : " ↑") : ""}
                </button>
              </th>
            ))}
          </tr></thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.code} className={r.code === focus ? "on fw-tr--hl" : ""}>
                <th scope="row"><button type="button" className="el-link" aria-pressed={r.code === focus} onClick={() => onSelect(r.code === focus ? "" : r.code)}>{ownerName(r.code)}</button> <span className="el-n">{r.code}</span></th>
                <td className="num">{num(r.total, language)}</td>
                {r.counts.map((v, i) => <td key={i} className="num">{v ? num(v, language) : "—"}</td>)}
                <td className="num">{r.total ? pct(1 - r.counts[0] / r.total, language) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="lp-small">{tr(language, "tableNote", "Click a column to sort and an owner to filter the page. Owners are CelesTrak's: a country, an international agency, or a company. Debris counts under the owner of the object it came from. CIS covers the former Soviet Union and Russia.")}</p>
    </div>
  );
}

/* ---------- Family mode: three plain-language facts, recomputed for the filter ---------- */
export function DebrisFacts({ tracked, junk, debris, recentIntact, topParent, language }: {
  tracked: number; junk: number; debris: number; recentIntact: number; topParent: { name: string; year: number; inOrbit: number } | null; language: string;
}) {
  const facts = [
    { title: tr(language, "f1Head", "Half of it is junk"), text: tracked
      ? tr(language, "f1", "Of the {n} objects we can follow in orbit here, about {k} in every 10 no longer work or never did: dead satellites, spent rocket stages, and broken pieces.", { n: num(tracked, language), k: Math.round((junk / tracked) * 10) })
      : tr(language, "f1None", "Nothing from this selection is still in orbit.") },
    recentIntact < 365
      ? { title: tr(language, "f2bHead", "Things fall back down"), text: tr(language, "f2b", "In the last 12 months, {n} whole satellites or rocket stages from this selection fell back and burned up in the air. Most burn up completely; a few pieces can reach the ground.", { n: num(recentIntact, language) }) }
      : { title: tr(language, "f2Head", "Things fall down every day"), text: tr(language, "f2","In the last 12 months, about {d} whole satellites or rocket stages fell back and burned up in the air every day, on average. Most burn up completely; a few pieces can reach the ground.", { d: num(recentIntact / 365, language, 1) }) },
    topParent
      ? { title: tr(language, "f3Head", "One break-up, thousands of pieces"), text: tr(language, "f3", "{name} broke apart around {year}. {n} of its pieces that we can track are still up there, each one fast enough to wreck a working satellite.", { name: topParent.name, year: topParent.year, n: num(topParent.inOrbit, language) }) }
      : { title: tr(language, "f3bHead", "Pieces you can't see"), text: tr(language, "f3b", "Radar and telescopes mostly track pieces bigger than about 10 cm. This selection has {d} tracked debris pieces, but ESA estimates more than a million smaller pieces (1 to 10 cm) circle the Earth.", { d: num(debris, language) }) },
  ];
  return <StudyFacts facts={facts} language={language} />;
}
