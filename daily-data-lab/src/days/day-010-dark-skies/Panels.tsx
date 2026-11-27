// Day 010 panels: the star-loss simulator, the country ranking table and the country/place profile card.
import { useMemo, useState } from "react";
import { type Country, type Place, type PlaceType, BANDS, COUNTRIES, HIGHLIGHT, NATURAL, POP_YEAR, PUBLISHED, TYPE_COLOR, aboveNatural, bandOf, bands, people, starsAfter } from "./data";
import { tr, num, pc, big, countryName, peopleCount } from "./text";
import { regionName } from "../day-009-longevity/Panels";

export { KpiCard } from "../day-005-endangered-languages/Panels";
export { regionName };
/** Gaza Strip and West Bank share one ISO code (PSE), so they keep the paper's names next to the country name. */
export const cName = (c: Country, language: string) => (c.iso3 === "PSE" ? `${countryName(c.iso2, c.name, language)} (${c.name})` : countryName(c.iso2, c.name, language));
const BY_ISO = new Map(COUNTRIES.map((c) => [c.iso3, c]));
export const typeLabel = (t: PlaceType, language: string) => tr(language, `type_${t}`, { park: "Park", reserve: "Reserve", sanctuary: "Sanctuary", community: "Community" }[t]);
export const bandLabel = (i: number, language: string) => tr(language, `band${i}`, BANDS[i].label);

/* ---------- star-loss simulator ---------- */
// 250 stars with fixed positions and brightness; the brightest N(t) stay visible.
const FIELD = (() => {
  let s = 1009;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 250 }, () => ({ x: rnd() * 600, y: rnd() * 300, m: rnd() ** 2.2 })).sort((a, b) => a.m - b.m);
})();
export interface Rate { id: string; label: string; value: number }
export function StarSimulator({ rates, language }: { rates: Rate[]; language: string }) {
  const [years, setYears] = useState(18);
  const [rateId, setRateId] = useState(rates.find((r) => r.id === "kyba")?.id ?? rates[0].id);
  const rate = rates.find((r) => r.id === rateId)!;
  const visible = Math.round(starsAfter(years, rate.value / 100));
  const factor = (1 + rate.value / 100) ** years;
  const glow = Math.min(0.85, Math.log10(factor) * 0.45);
  return (
    <div className="ds-sim">
      <div className="ds-sim__sky" role="img" aria-label={tr(language, "simAria", "A sky with {n} of 250 stars visible after {t} years", { n: visible, t: years })}>
        <svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="ds-sky-glow" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f2a65a" stopOpacity={0} />
              <stop offset="100%" stopColor="#f2a65a" stopOpacity={glow} />
            </linearGradient>
          </defs>
          <rect width="600" height="300" fill="#040914" />
          {FIELD.map((st, i) => (
            <circle key={i} cx={st.x} cy={st.y} r={0.6 + (1 - st.m) * 1.6} fill="#fff" opacity={i < visible ? 0.35 + (1 - st.m) * 0.65 : 0} className="ds-star" />
          ))}
          <rect width="600" height="300" fill="url(#ds-sky-glow)" />
          <path d="M0 300 L0 268 L60 252 L120 262 L190 240 L260 258 L330 236 L400 254 L470 244 L540 262 L600 250 L600 300 Z" fill="#02050d" />
        </svg>
        <p className="ds-sim__count"><strong>{num(visible, language)}</strong> / 250</p>
      </div>
      <div className="ds-sim__controls">
        <label className="ds-slider">
          <span className="mono">{tr(language, "simYears", "Years from now: {t}", { t: years })}</span>
          <input type="range" min={0} max={30} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))} />
        </label>
        <div className="seg">
          <span className="mono">{tr(language, "simRate", "Brightening per year")}</span>
          <div className="seg__opts" role="radiogroup" aria-label={tr(language, "simRate", "Brightening per year")}>
            {rates.map((r) => <button key={r.id} type="button" role="radio" aria-checked={r.id === rateId} className={r.id === rateId ? "on" : ""} onClick={() => setRateId(r.id)}>{r.label}</button>)}
          </div>
        </div>
        <p className="readout" aria-live="polite">{tr(language, "simReadout", "At {r}% a year the sky is {f}× brighter after {t} years: about {n} of 250 stars remain.", { r: num(rate.value, language, 1), f: num(factor, language, 1), t: years, n: visible })}</p>
        <p className="lp-small">{tr(language, "simNote", "Illustrative model calibrated on the example in Kyba et al. (2023): a sky four times brighter shows about 100 stars instead of 250. Visible stars fall as brightness^−{k}. Real counts depend on how dark the site was to begin with.", { k: num(Math.log(2.5) / Math.log(4), language, 2) })}</p>
      </div>
    </div>
  );
}

/* ---------- country ranking table ---------- */
type Key = "name" | "region" | "noMw" | "polluted" | "veryBright" | "area" | "peopleNoMw" | "places" | "gan";
export function RankingTable({ rows, focus, onPick, language }: { rows: Country[]; focus?: string; onPick: (iso3: string) => void; language: string }) {
  const [sort, setSort] = useState<{ key: Key; desc: boolean }>({ key: "noMw", desc: true });
  const [limit, setLimit] = useState(25);
  const COLS: [Key, string, string, boolean][] = [
    ["name", "colCountry", "Country or area", false], ["region", "colRegion", "Region", false],
    ["noMw", "colNoMw", "People without the Milky Way", true], ["polluted", "colPolluted", "People under polluted skies", true],
    ["veryBright", "colVeryBright", "People with no night vision", true], ["area", "colArea", "Land under polluted skies", true],
    ["peopleNoMw", "colPeopleNoMw", "People without the Milky Way (2015)", true], ["places", "colPlaces", "Dark-sky places (Wikidata)", true],
    ["gan", "colGan", "Globe at Night reports", true],
  ];
  const val = (c: Country, k: Key): string | number => {
    switch (k) {
      case "name": return cName(c, language);
      case "region": return regionName(c.region, language);
      case "noMw": return c.pop[4]; case "polluted": return c.pop[2]; case "veryBright": return c.pop[5]; case "area": return c.area[2];
      case "peopleNoMw": return people(c, 4) ?? -Infinity; case "places": return c.places; default: return c.gan?.obs ?? 0;
    }
  };
  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const x = val(a, sort.key), y = val(b, sort.key);
    const d = typeof x === "string" ? x.localeCompare(y as string, language) : (x as number) - (y as number);
    return (sort.desc ? -d : d) || a.name.localeCompare(b.name);
  }), [rows, sort, language]);
  const on = (iso3: string) => HIGHLIGHT.has(iso3) || iso3 === focus;
  const shown = [...sorted.slice(0, limit), ...sorted.slice(limit).filter((c) => on(c.iso3))];
  const click = (k: Key, numeric: boolean) => setSort((s) => (s.key === k ? { key: k, desc: !s.desc } : { key: k, desc: numeric }));
  return (
    <div>
      <div className="lp-table-wrap">
        <table className="lp-table fw-table">
          <thead><tr>
            <th scope="col" className="num">#</th>
            {COLS.map(([k, key, en, numeric]) => (
              <th key={k} scope="col" className={numeric ? "num" : ""} aria-sort={sort.key === k ? (sort.desc ? "descending" : "ascending") : "none"}>
                <button type="button" className="fw-sort" onClick={() => click(k, numeric)}>{tr(language, key, en)}{sort.key === k ? (sort.desc ? " ↓" : " ↑") : ""}</button>
              </th>
            ))}
          </tr></thead>
          <tbody>
            {shown.map((c) => (
              <tr key={`${c.iso3}-${c.name}`} className={on(c.iso3) ? "on fw-tr--hl" : ""}>
                <td className="num">{sorted.indexOf(c) + 1}</td>
                <th scope="row"><button type="button" className="ds-link" onClick={() => onPick(c.iso3)}>{cName(c, language)}</button>{c.territory ? <small> *</small> : null}</th>
                <td>{regionName(c.region, language)}</td>
                <td className="num">{pc(c.pop[4], language)}</td>
                <td className="num">{pc(c.pop[2], language)}</td>
                <td className="num">{pc(c.pop[5], language)}</td>
                <td className="num">{pc(c.area[2], language)}</td>
                <td className="num">{big(people(c, 4), language)}</td>
                <td className="num">{c.places || "—"}</td>
                <td className="num">{c.gan ? num(c.gan.obs, language) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length > limit && (
        <button type="button" className="gw-reset el-more" onClick={() => setLimit((k) => k + 50)}>
          {tr(language, "showMore", "Show more ({n} left)", { n: num(sorted.length - limit, language) })}
        </button>
      )}
      <p className="lp-small">{tr(language, "tableNote", "Click a column to sort, or a name to open its profile. Shares are from Falchi et al. (2016), Table 2; people are those shares times the World Bank population for {y}. * = territory. Mexico, the United States and the country you pick are highlighted.", { y: POP_YEAR })}</p>
    </div>
  );
}

/* ---------- profile card: a country or a place ---------- */
function MiniBands({ cum, label, language }: { cum: number[]; label: string; language: string }) {
  const b = bands(cum);
  return (
    <div className="ds-mini">
      <span className="mono">{label}</span>
      <div className="ds-mini__bar" role="img" aria-label={`${label}: ${b.map((v, i) => `${bandLabel(i, language)} ${pc(v, language)}`).join(", ")}`}>
        {b.map((v, i) => <i key={i} style={{ width: `${v}%`, background: BANDS[i].color }} title={`${bandLabel(i, language)} · ${pc(v, language)}`} />)}
      </div>
    </div>
  );
}

export function CountryProfile({ c, onClose, language }: { c: Country; onClose: () => void; language: string }) {
  return (
    <div className="ds-profile">
      <div className="ds-profile__head">
        <p className="mono lp-eyebrow">{tr(language, "profileCountry", "Country profile")}</p>
        <button type="button" className="ds-close" onClick={onClose} aria-label={tr(language, "close", "Close")}>×</button>
      </div>
      <h3>{cName(c, language)}</h3>
      <p className="lp-small">{regionName(c.region, language)}{c.pop2015 != null ? ` · ${tr(language, "pop2015", "{p} in {y}", { p: peopleCount(c.pop2015, language), y: POP_YEAR })}` : ""}</p>
      <MiniBands cum={c.pop} label={tr(language, "miniPop", "People by sky brightness")} language={language} />
      <MiniBands cum={c.area} label={tr(language, "miniArea", "Land by sky brightness")} language={language} />
      <ul className="ds-facts">
        <li>{tr(language, "pfNoMw", "{p} cannot see the Milky Way from home{n}.", { p: pc(c.pop[4], language), n: people(c, 4) != null ? tr(language, "pfPeople", " (about {n})", { n: peopleCount(people(c, 4), language) }) : "" })}</li>
        <li>{tr(language, "pfPolluted", "{p} live under light-polluted skies; {a} of the land is polluted.", { p: pc(c.pop[2], language), a: pc(c.area[2], language) })}</li>
        <li>{tr(language, "pfPristine", "{a} of the land still has a pristine sky (≤1% above natural).", { a: pc(c.area[0], language) })}</li>
        <li>{c.places ? tr(language, "pfPlaces", "{n} certified dark-sky places listed in Wikidata.", { n: c.places }) : tr(language, "pfNoPlaces", "No certified dark-sky place listed in Wikidata.")}</li>
        <li>{c.gan ? tr(language, "pfGan", "{n} usable Globe at Night reports, 2011–2025; median limiting magnitude {m}.", { n: num(c.gan.obs, language), m: num(c.gan.medLM, language, 1) }) : tr(language, "pfNoGan", "No usable Globe at Night reports.")}</li>
      </ul>
    </div>
  );
}

export function PlaceProfile({ p, onClose, language }: { p: Place; onClose: () => void; language: string }) {
  const c = p.country ? BY_ISO.get(p.country) : undefined;
  const band = p.atlas == null ? null : bandOf(p.atlas);
  return (
    <div className="ds-profile">
      <div className="ds-profile__head">
        <p className="mono lp-eyebrow" style={{ color: TYPE_COLOR[p.type] }}>{tr(language, "profilePlace", "Dark Sky {type}", { type: typeLabel(p.type, language) })}</p>
        <button type="button" className="ds-close" onClick={onClose} aria-label={tr(language, "close", "Close")}>×</button>
      </div>
      <h3>{p.name}</h3>
      <p className="lp-small">{c ? cName(c, language) : p.countryName ?? "—"}{p.yearCertified ? ` · ${tr(language, "certified", "certified {y}", { y: p.yearCertified })}` : ""}{p.areaKm2 ? ` · ${num(p.areaKm2, language, p.areaKm2 < 10 ? 1 : 0)} km²` : ""}</p>
      {p.atlas != null && band != null && (
        <div className="ds-place-sky">
          <i style={{ background: BANDS[band].color }} />
          <p>{tr(language, "placeSkyLong", "Atlas sky at its coordinate: {b} μcd/m² of artificial light, {pct} above the natural {nat}. Band: {band}.", {
            b: num(p.atlas * 1000, language, p.atlas < 0.01 ? 1 : 0), pct: `${num(aboveNatural(p.atlas) * 100, language, aboveNatural(p.atlas) < 0.1 ? 1 : 0)}%`, nat: num(NATURAL * 1000, language), band: bandLabel(band, language) })}</p>
        </div>
      )}
      {p.otherTypes.length > 0 && <p className="lp-small">{tr(language, "alsoType", "Also listed as: {t}", { t: p.otherTypes.map((t) => typeLabel(t, language)).join(", ") })}</p>}
      <p className="lp-small">{tr(language, "pointNote", "One point per place: parks and reserves cover large areas, so the sky varies inside them. Communities are towns, so their skies are brighter by design.")}</p>
      <p className="ds-links">
        <a href={p.sourceUrl} target="_blank" rel="noopener">Wikidata {p.id}</a>
        {p.wikipedia && <> · <a href={p.wikipedia} target="_blank" rel="noopener">Wikipedia</a></>}
      </p>
    </div>
  );
}

export function MapSide({ language, typeCounts }: { language: string; typeCounts: Record<PlaceType, number> }) {
  return (
    <div className="lp-legend">
      <h3>{tr(language, "legendTitle", "How to read the map")}</h3>
      <ul>
        {(Object.keys(typeCounts) as PlaceType[]).map((t) => <li key={t}><i style={{ background: TYPE_COLOR[t] }} /><span>{typeLabel(t, language)}</span><b>{typeCounts[t]}</b></li>)}
      </ul>
      <p className="lp-legend__note">{tr(language, "legendPlaces", "Certified International Dark Sky Places listed in Wikidata ({n} with coordinates). DarkSky International reports {p} certified places in {c} countries ({y}); Wikidata misses the rest, including most recent ones.", {
        n: Object.values(typeCounts).reduce((a, b) => a + b, 0), p: PUBLISHED.darkSky.places, c: PUBLISHED.darkSky.countries, y: PUBLISHED.darkSky.asOf })}</p>
      <p className="lp-legend__note">{tr(language, "legendGan", "Squares (when shown): Globe at Night reports, coloured by median limiting magnitude, from orange (only the brightest stars) to pale blue (faint stars visible).")}</p>
    </div>
  );
}
