import { useState } from "react";
import { type BlueZone, type Country, COUNTRIES, HIGHLIGHT, SMALL_POP, YEAR } from "./data";
import { tr, num, yrs, usd, countryName } from "./text";

export { KpiCard } from "../day-005-endangered-languages/Panels";

export const cName = (c: Country, language: string) => countryName(c.iso2, c.name, language);
const REGION_EN: Record<string, string> = {
  "East Asia & Pacific": "East Asia & Pacific", "Europe & Central Asia": "Europe & Central Asia", "Latin America & Caribbean": "Latin America & Caribbean",
  "Middle East, North Africa, Afghanistan & Pakistan": "Middle East, North Africa, Afghanistan & Pakistan", "North America": "North America",
  "South Asia": "South Asia", "Sub-Saharan Africa": "Sub-Saharan Africa", "Not classified": "Territories not classified by the World Bank",
};
export const regionKey = (r: string) => `reg_${r.replace(/[^A-Za-z]/g, "")}`;
export const regionName = (r: string, language: string) => tr(language, regionKey(r), REGION_EN[r] ?? r);

/* ---------- sortable country table ---------- */
type Key = "name" | "region" | "e0" | "e0Male" | "e0Female" | "hale" | "gap" | "centenariansPer100k" | "gdpPc" | "healthExpPct";
export function DataTable({ rows, focus, language }: { rows: Country[]; focus?: string; language: string }) {
  const [sort, setSort] = useState<{ key: Key; desc: boolean }>({ key: "hale", desc: true });
  const [limit, setLimit] = useState(25);
  const COLS: [Key, string, string, boolean][] = [
    ["name", "colCountry", "Country or area", false], ["region", "colRegion", "Region", false],
    ["e0", "colE0", "Life expectancy", true], ["e0Female", "colE0F", "Women", true], ["e0Male", "colE0M", "Men", true],
    ["hale", "colHale", "HALE (95% UI)", true], ["gap", "colGap", "Years in less than full health", true],
    ["centenariansPer100k", "colCent", "100+ per 100k", true], ["gdpPc", "colGdp", "GDP per person (PPP)", true], ["healthExpPct", "colHexp", "Health spending, % GDP", true],
  ];
  const val = (c: Country, k: Key): string | number =>
    k === "name" ? cName(c, language) : k === "region" ? regionName(c.region, language) : ((c[k] as number | null) ?? -Infinity);
  const sorted = [...rows].sort((a, b) => {
    const x = val(a, sort.key), y = val(b, sort.key);
    const d = typeof x === "string" ? x.localeCompare(y as string, language) : (x as number) - (y as number);
    return sort.desc ? -d : d;
  });
  const on = (iso3: string) => HIGHLIGHT.has(iso3) || iso3 === focus;
  const shown = [...sorted.slice(0, limit), ...sorted.slice(limit).filter((c) => on(c.iso3))];
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
              <tr key={c.iso3} className={on(c.iso3) ? "on fw-tr--hl" : ""}>
                <th scope="row">{cName(c, language)}</th>
                <td>{regionName(c.region, language)}</td>
                <td className="num">{yrs(c.e0, language)}</td>
                <td className="num">{yrs(c.e0Female, language)}</td>
                <td className="num">{yrs(c.e0Male, language)}</td>
                <td className="num">{c.hale == null ? "—" : `${yrs(c.hale, language)} (${yrs(c.haleLo, language)}–${yrs(c.haleHi, language)})`}</td>
                <td className="num">{yrs(c.gap, language)}</td>
                <td className={`num${c.pop < SMALL_POP ? " lg-faded" : ""}`}>{c.centenariansPer100k == null ? "—" : num(c.centenariansPer100k, language, 1)}</td>
                <td className="num">{c.gdpPc == null ? "—" : usd(c.gdpPc, language)}</td>
                <td className="num">{c.healthExpPct == null ? "—" : num(c.healthExpPct, language, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length > limit && (
        <button type="button" className="gw-reset el-more" onClick={() => setLimit((k) => k + 25)}>
          {tr(language, "showMore", "Show more ({n} left)", { n: num(sorted.length - limit, language) })}
        </button>
      )}
      <p className="lp-small">{tr(language, "tableNote", "Click a column to sort. Life expectancy by sex is UN WPP 2024 ({y}); HALE, its interval and the years in less than full health are WHO ({y}), which models only its {n} member states with enough data, so territories show “—”. Grey centenarian rates belong to places with fewer than one million people. Highlighted: Japan, Italy, Costa Rica and Greece (blue-zone countries), Mexico, the United States and the country you pick.", { y: YEAR, n: COUNTRIES.filter((c) => c.hale != null).length })}</p>
    </div>
  );
}

/* ---------- blue zones: the literature table and the debate ---------- */
const CITE: Record<string, string> = {
  "10.1553/populationyearbook2013s87": "Poulain, Herm & Pes 2013",
  "10.1196/annals.1396.037": "Willcox et al. 2007",
  "10.1016/j.exger.2004.06.016": "Poulain et al. 2004",
  "10.1553/populationyearbook2013s109": "Rosero-Bixby, Dow & Rehkopf 2013",
  "10.1353/dem.0.0011": "Rosero-Bixby 2008",
  "10.4061/2011/679187": "Panagiotakos et al. 2011",
  "10.1001/archinte.161.13.1645": "Fraser & Shavlik 2001",
};

function metric(z: BlueZone, language: string): string {
  const e = z.extra as Record<string, number>;
  const f = (v: number, d = 1) => num(v, language, d);
  switch (z.extra.kind) {
    case "cr": return tr(language, "bzCr", "Centenarian rate, 1900 birth cohort (aged 100 in 2000 per 10,000 aged 60 in 1960): women {f} vs {fRef} in all of Japan; men {m} vs {mRef}.", { f: f(e.f), fRef: f(e.fRef), m: f(e.m), mRef: f(e.mRef) });
    case "eli": return tr(language, "bzEli", "Extreme Longevity Index, born 1880–1900 (centenarians per 100,000 births): men {m} vs {mRef}, women {f} vs {fRef} in the rest of Sardinia.", { m: f(e.m, 0), mRef: f(e.mRef, 0), f: f(e.f, 0), fRef: f(e.fRef, 0) });
    case "drr": return tr(language, "bzDrr", "Male death-rate ratio vs the rest of Costa Rica, 1990–2011: {m} (95% CI {lo}–{hi}); a Nicoyan man of 60 can expect {e} more years than a Japanese man. No advantage for women.", { m: f(e.m, 2), lo: f(e.lo, 2), hi: f(e.hi, 2), e: f(e.e60VsJapan) });
    case "none": return tr(language, "bzNone", "No birth registers, so the Sardinian index cannot be computed: the weakest data of the four. Emigration of old people to Athens biases the survival figures down.");
    default: return tr(language, "bzCohort", "Extra life expectancy at age 30 for 34,192 California Adventists followed 1976–1988: men {m} years (95% CI {mLo}–{mHi}), women {f} ({fLo}–{fHi}), vs other white Californians.", { m: f(e.m, 2), mLo: f(e.mLo, 2), mHi: f(e.mHi, 2), f: f(e.f, 2), fLo: f(e.fLo, 2), fHi: f(e.fHi, 2) });
  }
}

export function BlueZonesTable({ zones, language }: { zones: BlueZone[]; language: string }) {
  const sv = (v: number, ref: number, sig: string) => `${num(v, language, 1)}% · ${num(ref, language, 1)}%${sig ? ` ${sig}` : ""}`;
  const byIso = new Map(COUNTRIES.map((c) => [c.iso3, c]));
  return (
    <div className="lp-table-wrap">
      <table className="lp-table fw-table lg-bz">
        <thead><tr>
          <th scope="col">{tr(language, "bzColZone", "Area")}</th>
          <th scope="col">{tr(language, "bzColTown", "Reference town (lat, lon)")}</th>
          <th scope="col" className="num">{tr(language, "bzColMen", "Men: survival 60s → 90s, zone · comparison")}</th>
          <th scope="col" className="num">{tr(language, "bzColWomen", "Women: survival 60s → 90s")}</th>
          <th scope="col">{tr(language, "bzColMetric", "Key measure in the source")}</th>
          <th scope="col">{tr(language, "bzColStatus", "Status")}</th>
          <th scope="col">{tr(language, "bzColSource", "Source")}</th>
        </tr></thead>
        <tbody>
          {zones.map((z) => {
            const c = byIso.get(z.iso3)!;
            return (
              <tr key={z.id} className={z.demographic ? "" : "lg-bz--flag"}>
                <th scope="row">{tr(language, `bz_${z.id}`, z.name)}<br /><small className="muted">{cName(c, language)} · {tr(language, "bzVs", "vs {c}", { c: tr(language, `bzRef_${z.id}`, z.comparison) })}</small></th>
                <td>{z.town}<br /><small className="muted mono">{num(z.lat, language, 2)}, {num(z.lon, language, 2)}</small></td>
                <td className="num">{z.survival ? sv(z.survival.m, z.survival.mRef, z.survival.sigM) : "—"}</td>
                <td className="num">{z.survival ? sv(z.survival.f, z.survival.fRef, z.survival.sigF) : "—"}</td>
                <td>{metric(z, language)}</td>
                <td>{z.demographic
                  ? <span className="lp-tag lp-tag--lit">{tr(language, "bzDemo", "Demographic: ages checked")}</span>
                  : <span className="lp-tag lp-tag--hyp">{tr(language, "bzNonDemo", "Non-demographic: a religious cohort")}</span>}</td>
                <td>{z.refs.map((d, i) => <span key={d}>{i ? "; " : ""}<a href={`https://doi.org/${d}`} target="_blank" rel="noopener">{CITE[d] ?? d}</a></span>)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
