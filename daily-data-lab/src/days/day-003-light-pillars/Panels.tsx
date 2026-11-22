import { useMemo, useState } from "react";
import { type Obs, type RegionId, REGIONS, PH, PHENOMENA, summary, uniqueEvents, wilson, isPillar, toCSV, toGeoJSON, download, CAPTURED_AT } from "./data";
import { primary } from "./WorldMap";
import { tr, num, fmt1, pct, fmtDate } from "./text";

/* ---------- selected record ---------- */
export function RecordCard({ o, onClose, language }: { o: Obs; onClose: () => void; language: string }) {
  const w = o.wx;
  const missing = <span className="lp-missing" title={tr(language, "missingTitle", "Not available: left empty, never set to zero")}>—</span>;
  const val = (v: number | null | undefined, unit: string, digits = 1) =>
    v == null ? missing : <>{digits ? fmt1(v, language) : Math.round(v)}{unit}</>;
  const flags = qualityFlags(o);
  return (
    <article className="lp-record" aria-label={tr(language, "recordAria", "Selected record {id}", { id: o.id })}>
      <button type="button" className="lp-record__close" onClick={onClose} aria-label={tr(language, "close", "Close")}>×</button>
      <a href={o.url} target="_blank" rel="noopener" className="lp-record__img">
        <img src={o.thumb} alt={o.title} loading="lazy" referrerPolicy="no-referrer" />
      </a>
      <p className="lp-credit">
        {tr(language, "photoBy", "Photo: {who}", { who: o.artist ?? tr(language, "unknownAuthor", "unknown author") })} ·{" "}
        {o.licenseUrl ? <a href={o.licenseUrl} target="_blank" rel="noopener">{o.license}</a> : o.license ?? "—"} ·{" "}
        <a href={o.url} target="_blank" rel="noopener">Wikimedia Commons</a>
      </p>
      <h3>{o.phenomena.map((p) => tr(language, PH[p].key, PH[p].label)).join(" + ")}</h3>
      <p className="lp-record__where">
        {[o.country, o.lat != null ? `${fmt1(o.lat, language)}°, ${fmt1(o.lon!, language)}°` : null].filter(Boolean).join(" · ") || tr(language, "noLocation", "No location recorded")}
        <br />{fmtDate(o.date, language)}{o.time ? ` · ${o.time}` : ""}{o.tz ? ` (${o.tz})` : ""}
      </p>
      <dl className="lp-kv">
        <div><dt>{tr(language, "evidence", "Evidence")}</dt><dd><span className={`lp-ev lp-ev--${o.evidence}`}>{o.evidence}</span> {tr(language, `ev${o.evidence}`, EV_TEXT[o.evidence])}</dd></div>
        <div><dt>{tr(language, "sunEl", "Sun elevation*")}</dt><dd>{val(o.sunElevation, "°")}</dd></div>
        <div><dt>{tr(language, "temp", "Temperature†")}</dt><dd>{val(w?.t, " °C")}</dd></div>
        <div><dt>{tr(language, "humidity", "Humidity†")}</dt><dd>{val(w?.rh, "%", 0)}</dd></div>
        <div><dt>{tr(language, "wind", "Wind†")}</dt><dd>{val(w?.ws, " km/h")}{w?.wd != null ? ` · ${Math.round(w.wd)}°` : ""}</dd></div>
        <div><dt>{tr(language, "clouds", "Cloud low/mid/high†")}</dt><dd>{w ? `${w.ccl ?? "—"} / ${w.ccm ?? "—"} / ${w.cch ?? "—"}%` : missing}</dd></div>
        <div><dt>{tr(language, "visibilityKv", "Visibility")}</dt><dd>{missing}</dd></div>
      </dl>
      {flags.length > 0 && <p className="lp-flag" role="note">⚠ {flags.map((f) => tr(language, f.key, f.text)).join(" ")}</p>}
      <p className="lp-foot">
        * {tr(language, "sunFoot", "computed from capture time and place.")}{" "}
        † {w ? (w.basis === "hour" ? tr(language, "wxHour", "ERA5 reanalysis for that hour, ~30 km grid.") : tr(language, "wxDay", "ERA5 daily mean (no capture time).")) : tr(language, "wxNone", "No weather: the photo has no location.")}
      </p>
    </article>
  );
}

export const EV_TEXT = {
  A: "camera position and capture time",
  B: "a place, but no time or only the subject's position",
  C: "date only, no location",
};

/** Physical-consistency checks on the capture time. They flag doubtful clocks, not doubtful photos. */
export interface Flag { key: string; text: string; hard: boolean }
export function qualityFlags(o: Obs): Flag[] {
  const out: Flag[] = [];
  const s = o.sunElevation;
  if (s == null) return out;
  if (o.phenomena.includes("cza") && s >= 32.2) out.push({ key: "flagCza", text: "A circumzenithal arc cannot form with the Sun above 32.2°; the capture time is probably wrong.", hard: true });
  if (o.phenomena.includes("parhelion") && s > 60.75) out.push({ key: "flagParhelion", text: "Plate-crystal parhelia cannot form with the Sun above 60.75°; the capture time is probably wrong.", hard: true });
  if ((o.phenomena.includes("parhelion") || o.phenomena.includes("cza")) && s < -6)
    out.push({ key: "flagNight", text: "Taken with the Sun more than 6° below the horizon: either a lunar display (moon dog) or a wrong clock.", hard: false });
  if (o.phenomena.includes("sun_pillar") && s < -6) out.push({ key: "flagSunPillar", text: "Taken with the Sun more than 6° below the horizon: a sun pillar is unlikely, so the clock or the label may be off.", hard: false });
  return out;
}

/* ---------- E: comparator ---------- */
export function Comparator({ rows, language, months }: { rows: Obs[]; language: string; months: string[] }) {
  const [picked, setPicked] = useState<RegionId[]>(["europe_north", "north_america", "europe_central"]);
  const toggle = (id: RegionId) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 4 ? p : [...p, id]));
  const stats = useMemo(() => picked.map((id) => {
    const r = rows.filter((o) => o.region === id);
    const k = r.filter(isPillar).length;
    const t = summary(r.map((o) => o.wx?.t)), rh = summary(r.map((o) => o.wx?.rh)), ws = summary(r.map((o) => o.wx?.ws));
    const m = Array.from({ length: 12 }, (_, i) => r.filter((o) => o.month === i + 1).length);
    const countries = Object.entries(r.reduce<Record<string, number>>((acc, o) => { if (o.country) acc[o.country] = (acc[o.country] || 0) + 1; return acc; }, {}))
      .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);
    const years = r.map((o) => o.year);
    return {
      id, n: r.length, ev: uniqueEvents(r), k, ci: wilson(k, r.length), t, rh, ws, m, countries,
      hourly: r.filter((o) => o.wx?.basis === "hour").length, mix: PHENOMENA.map((p) => ({ p: p.id, n: r.filter((o) => o.phenomena.includes(p.id)).length })),
      span: years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—",
    };
  }), [rows, picked]);
  const name = (id: RegionId) => { const r = REGIONS.find((x) => x.id === id)!; return tr(language, r.key, r.label); };
  const iqr = (s: ReturnType<typeof summary>, unit: string) => (s.n ? `${fmt1(s.med, language)}${unit} (${fmt1(s.q1, language)} – ${fmt1(s.q3, language)})` : "—");
  return (
    <>
      <div className="lp-chips" role="group" aria-label={tr(language, "pickRegions", "Pick 2 to 4 regions")}>
        {REGIONS.map((r) => (
          <button key={r.id} type="button" aria-pressed={picked.includes(r.id)} className={picked.includes(r.id) ? "on" : ""} onClick={() => toggle(r.id)}>
            {tr(language, r.key, r.label)}
          </button>
        ))}
      </div>
      {picked.length < 2
        ? <p className="muted pad">{tr(language, "pickTwo", "Pick at least two regions to compare.")}</p>
        : (
          <div className="lp-table-wrap" tabIndex={0} role="region" aria-labelledby="lp-cmp-title">
            <table className="lp-table lp-compare">
              <thead><tr><th scope="col">{tr(language, "metric", "Metric")}</th>{stats.map((s) => <th key={s.id} scope="col">{name(s.id)}</th>)}</tr></thead>
              <tbody>
                <tr><th scope="row">{tr(language, "cmpPhotos", "Located photos · events")}</th>{stats.map((s) => <td key={s.id}><strong>{num(s.n, language)}</strong> · {num(s.ev, language)}{s.n < 15 && <span className="lp-low"> {tr(language, "lowN", "low n")}</span>}</td>)}</tr>
                <tr><th scope="row">{tr(language, "cmpMix", "Phenomena mix")}</th>{stats.map((s) => <td key={s.id}><MixBar mix={s.mix} /></td>)}</tr>
                <tr><th scope="row">{tr(language, "cmpShare", "Pillar share (95% CI)")}</th>{stats.map((s) => <td key={s.id}>{s.n ? `${pct(s.k / s.n, language)} (${pct(s.ci[0], language)}–${pct(s.ci[1], language)})` : "—"}</td>)}</tr>
                <tr><th scope="row">{tr(language, "cmpTemp", "ERA5 temperature, median (IQR)")}</th>{stats.map((s) => <td key={s.id}>{iqr(s.t, " °C")}</td>)}</tr>
                <tr><th scope="row">{tr(language, "cmpRh", "Relative humidity, median (IQR)")}</th>{stats.map((s) => <td key={s.id}>{iqr(s.rh, "%")}</td>)}</tr>
                <tr><th scope="row">{tr(language, "cmpWind", "Wind, median (IQR)")}</th>{stats.map((s) => <td key={s.id}>{iqr(s.ws, " km/h")}</td>)}</tr>
                <tr><th scope="row">{tr(language, "cmpMonths", "Photos by month")}</th>{stats.map((s) => <td key={s.id}><Spark m={s.m} months={months} /></td>)}</tr>
                <tr><th scope="row">{tr(language, "cmpCoverage", "Hourly weather · years")}</th>{stats.map((s) => <td key={s.id}>{s.n ? pct(s.hourly / s.n, language) : "—"} · {s.span}</td>)}</tr>
                <tr><th scope="row">{tr(language, "cmpCountries", "Top countries")}</th>{stats.map((s) => <td key={s.id}>{s.countries.join(", ") || "—"}</td>)}</tr>
              </tbody>
            </table>
          </div>
        )}
    </>
  );
}

function MixBar({ mix }: { mix: { p: keyof typeof PH; n: number }[] }) {
  const total = mix.reduce((s, m) => s + m.n, 0);
  if (!total) return <>—</>;
  return (
    <span className="lp-mix" title={mix.filter((m) => m.n).map((m) => `${PH[m.p].label}: ${m.n}`).join(", ")}>
      {mix.filter((m) => m.n).map((m) => <i key={m.p} style={{ width: `${(m.n / total) * 100}%`, background: PH[m.p].color }} />)}
    </span>
  );
}

function Spark({ m, months }: { m: number[]; months: string[] }) {
  const max = Math.max(1, ...m);
  return (
    <svg viewBox="0 0 120 26" className="lp-spark" role="img" aria-label={m.map((v, i) => `${months[i]} ${v}`).join(", ")}>
      {m.map((v, i) => <rect key={i} x={i * 10 + 1} y={24 - (v / max) * 22} width={8} height={Math.max(v ? 1 : 0, (v / max) * 22)} rx={1.5} />)}
    </svg>
  );
}

/* ---------- catalog table + downloads ---------- */
const PAGE = 12;
export function Catalog({ rows, selected, onSelect, language }: { rows: Obs[]; selected: string | null; onSelect: (id: string) => void; language: string }) {
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [desc, setDesc] = useState(true);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const r = q ? rows.filter((o) => `${o.title} ${o.country ?? ""} ${o.artist ?? ""} ${o.description ?? ""}`.toLowerCase().includes(q)) : rows;
    return desc ? [...r].reverse() : r;
  }, [rows, query, desc]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const stamp = CAPTURED_AT.slice(0, 10);
  return (
    <>
      <div className="lp-catalog__bar">
        <label className="lp-search">
          <span className="sr">{tr(language, "search", "Search the catalog")}</span>
          <input type="search" value={query} placeholder={tr(language, "searchPlaceholder", "Search title, country, author…")} onChange={(e) => { setQuery(e.target.value); setPage(0); }} />
        </label>
        <div className="lp-downloads" role="group" aria-label={tr(language, "downloads", "Downloads")}>
          <span className="mono">{tr(language, "downloadN", "Download {n} filtered rows", { n: num(rows.length, language) })}</span>
          <button type="button" onClick={() => download(`ice-optics-catalog-${stamp}.csv`, toCSV(rows), "text/csv;charset=utf-8")}>CSV</button>
          <button type="button" onClick={() => download(`ice-optics-catalog-${stamp}.geojson`, toGeoJSON(rows), "application/geo+json")}>GeoJSON</button>
          <button type="button" onClick={() => download(`ice-optics-catalog-${stamp}.json`, JSON.stringify(rows, null, 1), "application/json")}>JSON</button>
        </div>
      </div>
      <div className="lp-table-wrap">
        <table className="lp-table">
          <thead>
            <tr>
              <th scope="col"><button type="button" className="lp-sort" onClick={() => setDesc((d) => !d)} aria-label={tr(language, "sortDate", "Sort by date")}>{tr(language, "colDate", "Date")} {desc ? "↓" : "↑"}</button></th>
              <th scope="col">{tr(language, "colPhenomenon", "Phenomenon")}</th>
              <th scope="col">{tr(language, "colPlace", "Place")}</th>
              <th scope="col">{tr(language, "colEvidence", "Ev.")}</th>
              <th scope="col">{tr(language, "colTemp", "ERA5 °C")}</th>
              <th scope="col">{tr(language, "colSource", "Source")}</th>
            </tr>
          </thead>
          <tbody>
            {list.slice(cur * PAGE, cur * PAGE + PAGE).map((o) => (
              <tr key={o.id} className={o.id === selected ? "on" : ""}>
                <td className="mono-num">{o.date}{o.time ? <small> {o.time}</small> : null}</td>
                <td><i className="lp-swatch" style={{ background: PH[primary(o)].color }} />{o.phenomena.map((p) => tr(language, PH[p].key, PH[p].label)).join(", ")}</td>
                <td>{o.lat != null ? <button type="button" className="lp-linkbtn" onClick={() => onSelect(o.id)}>{o.country ?? `${fmt1(o.lat, language)}°, ${fmt1(o.lon!, language)}°`}</button> : <span className="lp-missing">—</span>}</td>
                <td><span className={`lp-ev lp-ev--${o.evidence}`}>{o.evidence}</span>{qualityFlags(o).length ? <span className="lp-flagdot" title={qualityFlags(o).map((f) => tr(language, f.key, f.text)).join(" ")}> ⚠</span> : null}</td>
                <td className="mono-num">{o.wx?.t != null ? fmt1(o.wx.t, language) : <span className="lp-missing">—</span>}</td>
                <td><a href={o.url} target="_blank" rel="noopener">{tr(language, "open", "Commons")} ↗</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lp-pager">
        <button type="button" disabled={cur === 0} onClick={() => setPage(cur - 1)}>←</button>
        <span className="mono">{tr(language, "pageOf", "Page {a} of {b} · {n} records", { a: cur + 1, b: pages, n: num(list.length, language) })}</span>
        <button type="button" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>→</button>
      </div>
    </>
  );
}
