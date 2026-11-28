// Day 011 panels: treemap of producers, exporter/importer ranking, spice and country profiles, and the cited timeline.
import { useMemo, useState } from "react";
import { type SpiceId, type TradeRank, BY_ISO, COLOR, EVENTS, LATEST, PROD_FLAG, SPICE, SPICES, SUMMARY, WORLD, YEARS, hhiBand, prodOf, producers, squarify, tradeOf, traders, usdPerKg, yi } from "./data";
import { cName } from "./FlowMap";
import { CITES } from "./Research";
import { tr, num, pc, usd, tonnes, big } from "./text";
import { regionName } from "../day-009-longevity/Panels";

export { KpiCard } from "../day-005-endangered-languages/Panels";
export { regionName };
export const spiceName = (s: SpiceId, language: string) => tr(language, `sp_${s}`, SPICE[s].short);
export const hhiLabel = (h: number, language: string) => tr(language, `hhi_${hhiBand(h)}`, { low: "unconcentrated", moderate: "moderately concentrated", high: "highly concentrated" }[hhiBand(h)]);

/* ---------- treemap: production by country within a spice ---------- */
export function Treemap({ spice, year = LATEST, focus, onPick, language }: { spice: SpiceId; year?: number; focus?: string | null; onPick: (iso3: string) => void; language: string }) {
  const [hover, setHover] = useState("");
  const W = 560, H = 320, TOP = 14;
  const items = useMemo(() => {
    const p = producers(spice, year);
    const top = p.slice(0, TOP).map((x) => ({ id: x.iso3, value: x.t, share: x.share, n: 1 }));
    const rest = p.slice(TOP);
    if (rest.length) top.push({ id: "other", value: rest.reduce((a, b) => a + b.t, 0), share: rest.reduce((a, b) => a + b.share, 0), n: rest.length });
    return squarify(top, W, H);
  }, [spice, year]);
  return (
    <figure className="chart fw-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={tr(language, "treeAria", "Production by country, {s}, {y}", { s: spiceName(spice, language), y: year })}>
        {items.map((c, i) => {
          const other = c.id === "other";
          const name = other ? tr(language, "otherN", "{n} others", { n: c.n }) : cName(c.id, language);
          const flag = !other && year === LATEST ? PROD_FLAG[spice][c.id] : undefined;
          const text = tr(language, "treeReadout", "{c}: {t} · {p} of world production ({y})", { c: name, t: tonnes(c.value, language), p: pc(c.share, language), y: year })
            + (flag ? ` · ${flag === "I" ? tr(language, "flagI", "FAO imputed") : flag === "E" ? tr(language, "flagE", "FAO estimate") : tr(language, "flagX", "external source")}` : "");
          const fit = c.w > 46 && c.h > 26;
          return (
            <g key={c.id} tabIndex={0} role={other ? "img" : "button"} aria-label={text} className={`sp-cell${c.id === focus ? " sp-cell--on" : ""}${c.id === "MEX" ? " sp-cell--hl" : ""}`}
              onClick={() => !other && onPick(c.id)} onKeyDown={(e) => { if (!other && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onPick(c.id); } }}
              onMouseEnter={() => setHover(text)} onMouseLeave={() => setHover("")} onFocus={() => setHover(text)} onBlur={() => setHover("")}>
              <rect x={c.x + 1} y={c.y + 1} width={Math.max(0, c.w - 2)} height={Math.max(0, c.h - 2)} rx={3}
                style={{ fill: COLOR[spice], opacity: other ? 0.28 : Math.max(0.35, 1 - i * 0.045) }} />
              {fit && <text x={c.x + 7} y={c.y + 17} className="sp-cell__name">{name.length * 6.4 > c.w - 10 ? `${name.slice(0, Math.max(3, Math.floor((c.w - 14) / 6.4)))}…` : name}</text>}
              {fit && c.h > 42 && <text x={c.x + 7} y={c.y + 33} className="sp-cell__val">{pc(c.share, language)}</text>}
            </g>
          );
        })}
      </svg>
      <p className="readout" aria-live="polite">{hover || tr(language, "treeHint", "Area is proportional to tonnes. Hover a tile; click to open the country.")}</p>
    </figure>
  );
}

/* ---------- ranking: exporters or importers ---------- */
type Key = "name" | "region" | "usd" | "t" | "share" | "usdPerKg" | "kgPerPerson" | "prod";
export function RankingTable({ spice, year, side, focus, onPick, language }: { spice: SpiceId; year: number; side: "export" | "import"; focus?: string | null; onPick: (iso3: string) => void; language: string }) {
  const [sort, setSort] = useState<{ key: Key; desc: boolean }>({ key: "usd", desc: true });
  const [limit, setLimit] = useState(20);
  const rows = useMemo(() => traders(spice, side, year), [spice, side, year]);
  const val = (r: TradeRank, k: Key): string | number => {
    switch (k) {
      case "name": return cName(r.iso3, language);
      case "region": return regionName(BY_ISO.get(r.iso3)?.region ?? "", language);
      case "prod": return prodOf(spice, r.iso3, year) ?? -1;
      default: return (r[k] as number | null) ?? -1;
    }
  };
  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const x = val(a, sort.key), y = val(b, sort.key);
    const d = typeof x === "string" ? x.localeCompare(y as string, language) : (x as number) - (y as number);
    return (sort.desc ? -d : d) || b.usd - a.usd;
  }), [rows, sort, language]);
  const on = (iso3: string) => iso3 === "MEX" || iso3 === focus;
  const shown = [...sorted.slice(0, limit), ...sorted.slice(limit).filter((r) => on(r.iso3))];
  const COLS: [Key, string, string, boolean][] = [
    ["name", "colCountry", "Country", false], ["region", "colRegion", "Region", false],
    ["usd", side === "export" ? "colExportUsd" : "colImportUsd", side === "export" ? "Exports, US$" : "Imports, US$", true],
    ["t", "colTonnes", "Tonnes", true], ["share", "colShare", "Share of world value", true], ["usdPerKg", "colUnit", "US$ per kg", true],
    side === "import" ? ["kgPerPerson", "colPerPerson", "g per person", true] : ["prod", "colProd", "Production, t", true],
  ];
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
            {shown.map((r) => (
              <tr key={r.iso3} className={on(r.iso3) ? "on fw-tr--hl" : ""}>
                <td className="num">{sorted.indexOf(r) + 1}</td>
                <th scope="row"><button type="button" className="ds-link" onClick={() => onPick(r.iso3)}>{cName(r.iso3, language)}</button></th>
                <td>{regionName(BY_ISO.get(r.iso3)?.region ?? "", language)}</td>
                <td className="num">{usd(r.usd, language)}</td>
                <td className="num">{num(r.t, language)}</td>
                <td className="num">{pc(r.share, language)}</td>
                <td className="num">{r.usdPerKg == null ? "—" : num(r.usdPerKg, language, 2)}</td>
                <td className="num">{side === "import" ? (r.kgPerPerson == null ? "—" : num(r.kgPerPerson * 1000, language)) : (prodOf(spice, r.iso3, year) == null ? "—" : num(prodOf(spice, r.iso3, year)!, language))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length > limit && (
        <button type="button" className="gw-reset el-more" onClick={() => setLimit((k) => k + 40)}>
          {tr(language, "showMore", "Show more ({n} left)", { n: num(sorted.length - limit, language) })}
        </button>
      )}
      <p className="lp-small">{tr(language, "tableNote", "Country reports to FAOSTAT (trade: crops and livestock). Values are current US dollars; exports are valued FOB and imports CIF, so they do not match exactly. Re-exporters (countries that buy, clean, grind or pack spices and sell them on) can export more than they grow. Mexico and the country you pick are highlighted.")}</p>
    </div>
  );
}

/* ---------- profiles ---------- */
function Spark({ values, color, label }: { values: (number | null)[]; color: string; label: string }) {
  const W = 260, H = 54, max = Math.max(1, ...values.map((v) => v ?? 0));
  const pts = values.map((v, i) => (v == null ? null : `${((i / (values.length - 1)) * W).toFixed(1)},${(H - 2 - ((v / max) * (H - 6))).toFixed(1)}`)).filter(Boolean);
  return <svg className="sp-spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}><polyline points={pts.join(" ")} style={{ stroke: color }} /></svg>;
}

export function CountryProfile({ iso3, spice, onClose, onSpice, language }: { iso3: string; spice: SpiceId; onClose: () => void; onSpice: (s: SpiceId) => void; language: string }) {
  const c = BY_ISO.get(iso3);
  const series = YEARS.map((y) => prodOf(spice, iso3, y));
  const rank = producers(spice).findIndex((p) => p.iso3 === iso3);
  const p = prodOf(spice, iso3), tr0 = tradeOf(spice, iso3);
  return (
    <div className="ds-profile sp-profile">
      <div className="ds-profile__head">
        <span className="mono">{tr(language, "profileCountry", "Country profile")} · {LATEST}</span>
        <button type="button" className="ds-close" onClick={onClose} aria-label={tr(language, "close", "Close")}>×</button>
      </div>
      <h3>{cName(iso3, language)}</h3>
      <p className="muted">{c ? regionName(c.region, language) : ""}{c?.pop ? ` · ${tr(language, "popOf", "{n} people ({y})", { n: big(c.pop, language), y: c.popYear ?? "" })}` : ""}</p>
      <ul className="ds-facts">
        <li>{p ? tr(language, "cpProd", "{s}: {t} produced, #{r} in the world ({p}).", { s: spiceName(spice, language), t: tonnes(p, language), r: rank + 1, p: pc((100 * p) / SUMMARY[spice].worldTonnes, language) }) : tr(language, "cpNoProd", "{s}: no production reported.", { s: spiceName(spice, language) })}</li>
        <li>{tr(language, "cpTrade", "Exports {x} ({xt}); imports {m} ({mt}).", { x: usd(tr0?.[1] ?? null, language), xt: tonnes(tr0?.[0] ?? null, language), m: usd(tr0?.[3] ?? null, language), mt: tonnes(tr0?.[2] ?? null, language) })}</li>
      </ul>
      {series.some((v) => v) && <><span className="mono">{tr(language, "cpSpark", "Production {a}–{b}", { a: YEARS[0], b: LATEST })}</span><Spark values={series} color={COLOR[spice]} label={tr(language, "cpSpark", "Production {a}–{b}", { a: YEARS[0], b: LATEST })} /></>}
      <table className="lp-table sp-mini-table">
        <thead><tr><th scope="col">{tr(language, "colSpice", "Spice")}</th><th scope="col" className="num">{tr(language, "colProdShort", "Grown, t")}</th><th scope="col" className="num">{tr(language, "colNet", "Net trade, US$")}</th></tr></thead>
        <tbody>
          {SPICES.map((s) => {
            const t = tradeOf(s.id, iso3), net = t ? (t[1] ?? 0) - (t[3] ?? 0) : null, pr = prodOf(s.id, iso3);
            return (
              <tr key={s.id} className={s.id === spice ? "on" : ""}>
                <th scope="row"><button type="button" className="ds-link" onClick={() => onSpice(s.id)}><i className="sp-dot" style={{ background: COLOR[s.id] }} />{spiceName(s.id, language)}</button></th>
                <td className="num">{pr ? big(pr, language) : "—"}</td>
                <td className="num">{net == null ? "—" : `${net >= 0 ? "+" : "−"}${usd(Math.abs(net), language)}`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function SpiceProfile({ spice, onPick, onEvent, language }: { spice: SpiceId; onPick: (iso3: string) => void; onEvent: (id: string) => void; language: string }) {
  const S = SUMMARY[spice], top = producers(spice).slice(0, 5), imp = traders(spice, "import").slice(0, 3);
  const events = EVENTS.filter((e) => e.spice === spice);
  return (
    <div className="ds-profile sp-profile">
      <span className="mono">{tr(language, "profileSpice", "Spice profile")} · FAOSTAT {SPICE[spice].code} · CPC {SPICE[spice].cpc}</span>
      <h3><i className="sp-dot sp-dot--big" style={{ background: COLOR[spice] }} />{spiceName(spice, language)}</h3>
      <p className="muted">{tr(language, `item_${spice}`, SPICE[spice].name)}</p>
      <span className="mono">{tr(language, "spTop5", "Top producers, {y}", { y: LATEST })}</span>
      <ul className="sp-bars">
        {top.map((p) => (
          <li key={p.iso3}><button type="button" className="ds-link" onClick={() => onPick(p.iso3)}>{cName(p.iso3, language)}</button>
            <span className="sp-bars__bar"><i style={{ width: `${p.share}%`, background: COLOR[spice] }} /></span><b>{pc(p.share, language)}</b></li>
        ))}
      </ul>
      <ul className="ds-facts">
        <li>{tr(language, "spHhi", "HHI {h}: {band}; the top three grow {t}.", { h: num(S.hhi, language), band: hhiLabel(S.hhi, language), t: pc(S.top3, language) })}</li>
        <li>{tr(language, "spPrice", "Export unit value {p} US$/kg; exports worth {v}.", { p: num(S.usdPerKg, language, 2), v: usd(S.exportUsd, language) })}</li>
        <li>{tr(language, "spImp", "Largest buyers: {list}.", { list: imp.map((x) => `${cName(x.iso3, language)} ${pc(x.share, language, 0)}`).join(", ") })}</li>
      </ul>
      {events.length > 0 && <div className="ds-links">{tr(language, "spHistory", "In history:")} {events.map((e, i) => <span key={e.id}>{i ? " · " : ""}<button type="button" className="ds-link" onClick={() => onEvent(e.id)}>{e.when}</button></span>)}</div>}
    </div>
  );
}

/* ---------- timeline of cited historical events ---------- */
export function Timeline({ selected, onSelect, language }: { selected: string | null; onSelect: (id: string) => void; language: string }) {
  const W = 760, H = 74, L = 20, R = 20, y0 = 1300, y1 = 1900;
  const sx = (y: number) => L + ((y - y0) / (y1 - y0)) * (W - L - R);
  return (
    <div className="sp-timeline">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={tr(language, "timeAria", "Cited spice-trade events, 1300–1900")}>
        <line x1={L} x2={W - R} y1={40} y2={40} className="grid" />
        {[1300, 1400, 1500, 1600, 1700, 1800, 1900].map((y) => <text key={y} x={sx(y)} y={66} textAnchor="middle" className="axis">{y}</text>)}
        {EVENTS.map((e, i) => (
          <g key={e.id} className={`sp-tick${selected === e.id ? " sp-tick--on" : ""}`} tabIndex={0} role="button" aria-label={`${e.when}: ${tr(language, `h_${e.id}`, e.text)}`}
            onClick={() => onSelect(e.id)} onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onSelect(e.id); } }}>
            {e.end > e.start ? <rect x={sx(e.start)} y={36 - (i % 3) * 9} width={Math.max(4, sx(e.end) - sx(e.start))} height={6} rx={3} style={{ fill: COLOR[e.spice] }} />
              : <circle cx={sx(e.start)} cy={39 - (i % 3) * 9} r={5} style={{ fill: COLOR[e.spice] }} />}
          </g>
        ))}
      </svg>
      <ol className="sp-events">
        {EVENTS.map((e) => {
          const c = CITES[e.ref];
          return (
            <li key={e.id} className={selected === e.id ? "on" : ""}>
              <button type="button" className="sp-events__when" onClick={() => onSelect(e.id)} aria-pressed={selected === e.id}>
                <i className="sp-dot" style={{ background: COLOR[e.spice] }} />{e.when}
              </button>
              <p>{tr(language, `h_${e.id}`, e.text)} <span className="sp-cite">— {c ? <a href={c.doi ? `https://doi.org/${c.doi}` : c.url} target="_blank" rel="noopener">{c.short}</a> : e.ref} <small>({tr(language, `basis_${e.id}`, e.basis)})</small></span></p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** World export unit value, every spice, latest year, for the price bar chart. */
export const priceRows = (language: string, focus: SpiceId) => SPICES.map((s) => ({ s: s.id, v: usdPerKg(s.id) ?? 0 })).sort((a, b) => b.v - a.v)
  .map(({ s, v }) => ({ id: s, label: spiceName(s, language), segments: [v], highlight: s === focus,
    readout: tr(language, "priceReadout", "{s}: {v} US$ per kg exported in {y} (world export value ÷ export tonnes)", { s: spiceName(s, language), v: num(v, language, 2), y: LATEST }) }));
/** HHI of production, every spice, latest year, with 1961 in the readout. */
export const hhiRows = (language: string, focus: SpiceId) => SPICES.map((s) => s.id).sort((a, b) => SUMMARY[b].hhi - SUMMARY[a].hhi).map((s) => ({
  id: s, label: spiceName(s, language), segments: [SUMMARY[s].hhi], highlight: s === focus,
  readout: tr(language, "hhiReadout", "{s}: HHI {h} in {y} ({band}), {h0} in {y0}; the top three producers grow {t}.", {
    s: spiceName(s, language), h: num(SUMMARY[s].hhi, language), y: LATEST, band: hhiLabel(SUMMARY[s].hhi, language), h0: num(WORLD[s].hhi[0] ?? 0, language), y0: YEARS[0], t: pc(SUMMARY[s].top3, language) }),
}));
export { yi };
