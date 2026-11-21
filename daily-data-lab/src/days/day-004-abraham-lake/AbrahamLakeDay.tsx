import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../language.jsx";
import { monthNames } from "../locales.js";
import {
  type Lake, type Region, type Series, type Trend,
  ABRAHAM_ID, ABRAHAM_MONTHS, ABRAHAM_PEERS, AREA_BINS, CAPTURED_AT, ICE_BY_LAT, ICE_UNIVERSE, LAKES, LAKE_BY_ID, LAKETEMP,
  SERIES, TOP300, TRENDS, UNIVERSE, WINDOW,
  clip, dayToDate, fetchWinters, fitTrend, icePeers, lakeName, regionOf,
} from "./data";
import { ICE_LEGEND, IceLatitudeChart, LakeMap, LswtMonthlyChart, SLOPE_LEGEND, TrendStrip, WinterTrendChart } from "./Charts";
import { tr, num, fmt0, fmt1, signed, pct, compact, fmtDate, dayMonth } from "./text";
import { AbrahamQuality, AbrahamQuestions, AbrahamSources } from "./Research";

type LakeType = "all" | "natural" | "reservoir";
type Fetch = { status: "loading"; done: number; total: number } | { status: "ok"; series: Series } | { status: "error"; error: string };

const REGIONS: { value: Region; key: string; label: string }[] = [
  { value: "all", key: "regionAll", label: "All regions" },
  { value: "namerica", key: "regionNA", label: "North America" },
  { value: "samerica", key: "regionSA", label: "South America" },
  { value: "europe", key: "regionEU", label: "Europe" },
  { value: "africa", key: "regionAF", label: "Africa" },
  { value: "asia", key: "regionAS", label: "Asia" },
  { value: "oceania", key: "regionOC", label: "Oceania" },
];
const TYPES: { value: LakeType; key: string; label: string }[] = [
  { value: "all", key: "typeAll", label: "All" },
  { value: "natural", key: "typeNatural", label: "Natural lakes" },
  { value: "reservoir", key: "typeReservoir", label: "Reservoirs" },
];
const QUICK = ["Abraham", "Baikal", "Superior", "Titicaca", "Great Slave Lake"];
const OLYMPIC_POOL_M3 = 2500;
const ABRAHAM = LAKE_BY_ID.get(ABRAHAM_ID)!;
const ABRAHAM_FULL = SERIES.get(ABRAHAM_ID) ?? [];
const ABRAHAM_CMP = fitTrend(clip(ABRAHAM_FULL, WINDOW.first, WINDOW.last))!;
const ABRAHAM_LT = LAKETEMP.get(ABRAHAM_ID)!;
const ABRAHAM_LAT_PEERS = icePeers(ABRAHAM.lat)!;

export default function AbrahamLakeDay() {
  const language: string = useLanguage();
  const months = useMemo(() => monthNames(language) as string[], [language]);
  const [selected, setSelected] = useState(ABRAHAM_ID);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region>("all");
  const [type, setType] = useState<LakeType>("all");
  const [family, setFamily] = useState(false);
  const [span, setSpan] = useState<"full" | "window">("full");
  const [metric, setMetric] = useState<"trend" | "ice">("trend");
  const [fetched, setFetched] = useState<Record<number, Fetch>>({});

  const lake = LAKE_BY_ID.get(selected) ?? ABRAHAM;
  const isAbraham = lake.id === ABRAHAM_ID;
  const lt = LAKETEMP.get(lake.id);
  const peers = icePeers(lake.lat);
  const season = (t: typeof lt) => (t?.iceDays && t.iceStart != null && t.iceEnd != null
    ? tr(language, "iceSeasonRange", "{from} → {to}", { from: dayMonth(dayToDate(t.iceStart), language), to: dayMonth(dayToDate(t.iceEnd), language) })
    : null);

  // Lakes outside the precomputed set are fetched from Open-Meteo on demand (cached per browser).
  useEffect(() => {
    if (SERIES.has(lake.id) || fetched[lake.id]?.status === "ok") return;
    const ctrl = new AbortController();
    setFetched((f) => ({ ...f, [lake.id]: { status: "loading", done: 0, total: WINDOW.last - WINDOW.first + 1 } }));
    fetchWinters(lake, (done, total) => setFetched((f) => ({ ...f, [lake.id]: { status: "loading", done, total } })), ctrl.signal)
      .then((series) => setFetched((f) => ({ ...f, [lake.id]: { status: "ok", series } })))
      .catch((e: Error) => { if (!ctrl.signal.aborted) setFetched((f) => ({ ...f, [lake.id]: { status: "error", error: e.message } })); });
    return () => ctrl.abort();
  }, [lake.id]);

  const live = fetched[lake.id];
  const seriesAll: Series = SERIES.get(lake.id) ?? (live?.status === "ok" ? live.series : []);
  const series = isAbraham && span === "window" ? clip(seriesAll, WINDOW.first, WINDOW.last) : seriesAll;
  const trend = useMemo(() => fitTrend(series), [series]);

  // Comparison trends all use the same 1991–2025 window.
  const cmpTrends = useMemo(() => {
    const m = new Map<number, Trend>(TRENDS);
    m.set(ABRAHAM_ID, ABRAHAM_CMP);
    Object.entries(fetched).forEach(([id, f]) => { if (f.status === "ok") { const t = fitTrend(f.series); if (t) m.set(Number(id), t); } });
    return m;
  }, [fetched]);
  const keep = (l: Lake) => (region === "all" || regionOf(l) === region) &&
    (type === "all" || (type === "reservoir" ? l.reservoir : !l.reservoir));
  const cmpLakes = useMemo(() => TOP300.filter(keep), [region, type]);
  const mapLakes = useMemo(() => {
    const extra = [ABRAHAM, ...(TOP300.some((l) => l.id === lake.id) || lake.id === ABRAHAM_ID ? [] : [lake])];
    return [...cmpLakes, ...extra.filter((l) => !cmpLakes.includes(l))];
  }, [cmpLakes, lake]);
  const cmpReady = cmpLakes.map((l) => cmpTrends.get(l.id)).filter((t): t is Trend => !!t);
  const selCmp = cmpTrends.get(lake.id);
  const fasterThan = selCmp && cmpReady.length ? cmpReady.filter((t) => t.slope < selCmp.slope).length / cmpReady.length : null;
  const median = cmpReady.length ? [...cmpReady].sort((a, b) => a.slope - b.slope)[Math.floor(cmpReady.length / 2)].slope : null;
  const warming = cmpReady.filter((t) => t.slope > 0).length;
  const significant = cmpReady.filter((t) => t.slope - 1.96 * t.se > 0).length;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return LAKES.filter((l) => (l.name ?? "").toLowerCase().includes(q) || l.country.toLowerCase().includes(q) || String(l.id) === q).slice(0, 8);
  }, [query]);
  const pick = (id: number) => { setSelected(id); setQuery(""); setSpan("full"); };
  const filtersOn = region !== "all" || type !== "all" || selected !== ABRAHAM_ID || family;
  const reset = () => { setRegion("all"); setType("all"); pick(ABRAHAM_ID); setFamily(false); };

  const ci = trend ? 1.96 * trend.se : null;
  const coldest = series.length ? series.reduce((a, b) => (b[1] < a[1] ? b : a)) : null;
  const warmest = series.length ? series.reduce((a, b) => (b[1] > a[1] ? b : a)) : null;
  const freezingMonths = ABRAHAM_MONTHS.filter((m) => m[1] < 0).map((m) => m[0]);
  const below1km = AREA_BINS.find((b) => b[0] === -1)?.[1] ?? 0;

  return (
    <div className="viz al">
      {/* Controls */}
      <div className="controls" role="group" aria-label={tr(language, "controlsAria", "Choose a lake and filter the comparison")}>
        <div className="al-search">
          <label className="select">
            <span className="mono">{tr(language, "lake", "Lake")}</span>
            <input type="search" value={query} placeholder={tr(language, "searchPlaceholder", "Search {count} named or large lakes…", { count: num(LAKES.length, language) })}
              onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && results[0]) pick(results[0].id); }}
              aria-controls="al-results" aria-autocomplete="list" />
          </label>
          {results.length > 0 && (
            <ul id="al-results" className="al-results" role="listbox">
              {results.map((l) => (
                <li key={l.id}><button type="button" role="option" aria-selected={false} onClick={() => pick(l.id)}>
                  <strong>{lakeName(l)}</strong><span>{l.country} · {num(Math.round(l.area * 10) / 10, language)} km²</span>
                </button></li>
              ))}
            </ul>
          )}
          <div className="al-quick">
            {QUICK.map((name) => {
              const l = LAKES.find((x) => x.name === name);
              return l ? <button key={name} type="button" className={l.id === selected ? "on" : ""} onClick={() => pick(l.id)}>{name}</button> : null;
            })}
          </div>
        </div>
        <label className="select">
          <span className="mono">{tr(language, "region", "Compare in")}</span>
          <select value={region} onChange={(e) => setRegion(e.target.value as Region)}>
            {REGIONS.map((r) => <option key={r.value} value={r.value}>{tr(language, r.key, r.label)}</option>)}
          </select>
        </label>
        <div className="seg">
          <span className="mono">{tr(language, "type", "Type")}</span>
          <div className="seg__opts" role="radiogroup" aria-label={tr(language, "type", "Type")}>
            {TYPES.map((o) => (
              <button key={o.value} type="button" role="radio" aria-checked={type === o.value} className={type === o.value ? "on" : ""} onClick={() => setType(o.value)}>
                {tr(language, o.key, o.label)}
              </button>
            ))}
          </div>
        </div>
        <div className="seg">
          <span className="mono">{tr(language, "familyMode", "Family mode")}</span>
          <div className="seg__opts" role="radiogroup" aria-label={tr(language, "familyMode", "Family mode")}>
            <button type="button" role="radio" aria-checked={!family} className={!family ? "on" : ""} onClick={() => setFamily(false)}>{tr(language, "off", "Off")}</button>
            <button type="button" role="radio" aria-checked={family} className={family ? "on" : ""} onClick={() => setFamily(true)}>{tr(language, "on", "On")}</button>
          </div>
        </div>
        {filtersOn ? <button type="button" className="gw-reset" onClick={reset}>{tr(language, "reset", "Reset")}</button> : null}
      </div>

      {/* Key numbers */}
      <section className="stats" aria-label={tr(language, "statsAria", "Key numbers for {name}", { name: lakeName(lake) })}>
        <Stat label={tr(language, "iceDays", "Ice days per year")} pending={!lt?.ok}
          value={lt?.iceDays != null ? tr(language, "daysValue", "{n} days", { n: lt.iceDays }) : "—"}
          note={lt?.iceDays != null
            ? [lt.iceDays > 0 ? tr(language, "iceRange", "range {min}–{max}", { min: lt.iceMin ?? "?", max: lt.iceMax ?? "?" }) : tr(language, "noIce", "no ice cover"),
              season(lt), lt.ok ? null : tr(language, "lowQuality", "low-quality estimate")].filter(Boolean).join(" · ")
            : tr(language, "noLaketemp", "No LakeTEMP observations")} />
        <Stat label={tr(language, "waterTemp", "Water temperature")} pending={!lt?.ok}
          value={lt?.openMean != null ? `${fmt1(lt.openMean, language)} °C` : "—"}
          note={lt?.openMean != null
            ? tr(language, "waterNote", "open-water mean · summer max {max} °C · {n} Landsat readings", { max: fmt1(lt.yearMax ?? 0, language), n: lt.nObs })
            : tr(language, "noLaketemp", "No LakeTEMP observations")} />
        <Stat accent label={tr(language, "winterTrend", "Winter trend")}
          value={trend ? `${signed(trend.slope, language)} °C` : live?.status === "loading" ? `${live.done}/${live.total}` : "—"}
          note={trend && ci != null
            ? tr(language, "trendNote", "per decade · ±{ci} (95%) · {first}–{last}", { ci: fmt1(ci, language), first: trend.first, last: trend.last })
            : live?.status === "loading" ? tr(language, "fetching", "Downloading winters from Open-Meteo…")
              : live?.status === "error" ? tr(language, "fetchError", "Open-Meteo unavailable ({error})", { error: live.error }) : ""} />
        <Stat label={tr(language, "area", "Area")} value={`${num(Math.round(lake.area * 10) / 10, language)} km²`}
          note={[
            lake.depth != null ? tr(language, "depthNote", "{depth} m average depth", { depth: fmt0(lake.depth, language) }) : null,
            lake.reservoir ? tr(language, "reservoir", "reservoir") : tr(language, "natural", "natural lake"),
          ].filter(Boolean).join(" · ")} />
      </section>

      {/* Family mode */}
      {family && (
        <section className="al-family" aria-label={tr(language, "familyAria", "Three fun facts")}>
          {familyFacts(lake, series, language).map((f, i) => (
            <article key={i} className="al-fact">
              <span className="al-fact__n">{i + 1}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </section>
      )}

      <div className="two">
        <section className="card">
          <div className="card__head">
            <div>
              <h2>{tr(language, "trendTitle", "Winters at {name}", { name: lakeName(lake) })}</h2>
              <p className="muted">{tr(language, "trendSub", "Mean air temperature of each local winter ({season}), ERA5 via Open-Meteo", {
                season: lake.lat < 0 ? tr(language, "seasonSouth", "Jun–Aug") : tr(language, "seasonNorth", "Dec–Feb"),
              })}</p>
            </div>
            {isAbraham && (
              <div className="seg seg--small">
                <span className="mono">{tr(language, "period", "Period")}</span>
                <div className="seg__opts" role="radiogroup" aria-label={tr(language, "period", "Period")}>
                  <button type="button" role="radio" aria-checked={span === "full"} className={span === "full" ? "on" : ""} onClick={() => setSpan("full")}>1951–2025</button>
                  <button type="button" role="radio" aria-checked={span === "window"} className={span === "window" ? "on" : ""} onClick={() => setSpan("window")}>1991–2025</button>
                </div>
              </div>
            )}
          </div>
          {series.length ? <WinterTrendChart series={series} trend={trend} language={language} />
            : <p className="muted pad">{live?.status === "error"
              ? tr(language, "fetchError", "Open-Meteo unavailable ({error})", { error: live.error })
              : tr(language, "fetchingFor", "Downloading {done} of {total} winters for {name}…", {
                done: live?.status === "loading" ? live.done : 0, total: WINDOW.last - WINDOW.first + 1, name: lakeName(lake),
              })}</p>}
          {trend && coldest && warmest && (
            <p className="readout">{tr(language, "trendRead", "{slope} °C per decade (r² {r2}). Coldest winter {coldYear} ({cold} °C), mildest {warmYear} ({warm} °C): single winters swing far more than the trend.", {
              slope: signed(trend.slope, language), r2: fmt1(trend.r2 * 100, language) + "%",
              coldYear: coldest[0], cold: fmt1(coldest[1], language), warmYear: warmest[0], warm: fmt1(warmest[1], language),
            })}</p>
          )}
        </section>

        <section className="card al-sheet">
          <div className="card__head"><div>
            <h2>{tr(language, "sheetTitle", "Lake profile")}</h2>
            <p className="muted">HydroLAKES v1.0 · Hylak_id {lake.id}</p>
          </div></div>
          <dl>
            <div><dt>{tr(language, "name", "Name")}</dt><dd>{lakeName(lake)}</dd></div>
            <div><dt>{tr(language, "country", "Country")}</dt><dd>{lake.country}</dd></div>
            <div><dt>{tr(language, "kind", "Kind")}</dt><dd>{lake.reservoir ? tr(language, "reservoirCap", "Reservoir (dammed)") : tr(language, "naturalCap", "Natural lake")}</dd></div>
            <div><dt>{tr(language, "coords", "Pour point")}</dt><dd>{fmt1(lake.lat, language)}°, {fmt1(lake.lon, language)}°</dd></div>
            <div><dt>{tr(language, "area", "Area")}</dt><dd>{num(Math.round(lake.area * 100) / 100, language)} km²</dd></div>
            {lake.depth != null && <div><dt>{tr(language, "depth", "Average depth")}</dt><dd>{fmt0(lake.depth, language)} m</dd></div>}
            {lake.volume != null && <div><dt>{tr(language, "volume", "Volume")}</dt><dd>{num(Math.round(lake.volume), language)} {tr(language, "mcm", "million m³")}</dd></div>}
            {lake.elevation != null && <div><dt>{tr(language, "elevation", "Elevation")}</dt><dd>{num(lake.elevation, language)} m</dd></div>}
            {lt?.iceDays != null && <div><dt>{tr(language, "iceSeason", "Ice season")}</dt><dd>{lt.iceDays > 0
              ? tr(language, "iceSeasonRow", "{days} days a year · {season}", { days: lt.iceDays, season: season(lt) ?? "" })
              : tr(language, "noIce", "no ice cover")}{peers && lt.iceDays > 0 ? ` · ${tr(language, "vsPeers", "median at this latitude {p50}", { p50: Math.round(peers.p50) })}` : ""}</dd></div>}
            {lt && <div><dt>{tr(language, "dataQuality", "LakeTEMP quality")}</dt><dd>{lt.ok
              ? tr(language, "qualityOk", "good · {n} readings, trendline statistics", { n: lt.nObs })
              : tr(language, "qualityLow", "use with care · {n} readings or intermittent lake", { n: lt.nObs })}</dd></div>}
            <div><dt>{tr(language, "sizeRank", "Size rank")}</dt><dd>{isAbraham
              ? tr(language, "rankOf", "#{rank} of {total}", { rank: num(UNIVERSE.larger_than_abraham + 1, language), total: compact(UNIVERSE.total, language) })
              : lake.rank ? tr(language, "rankOf", "#{rank} of {total}", { rank: num(lake.rank, language), total: compact(UNIVERSE.total, language) })
                : tr(language, "rankSmall", "below the top {n}", { n: num(UNIVERSE.ge100, language) })}</dd></div>
            {selCmp && fasterThan != null && (
              <div><dt>{tr(language, "warmingRank", "Winter warming, 1991–2025")}</dt><dd>{tr(language, "fasterThan", "{slope} °C/decade · faster than {share} of the large lakes shown", {
                slope: signed(selCmp.slope, language), share: pct(fasterThan, language),
              })}</dd></div>
            )}
          </dl>
        </section>
      </div>

      {/* Map */}
      <section className="card gw-sky al-sky">
        <div className="card__head">
          <div>
            <h2>{tr(language, "mapTitle", "Winter warming at the world's largest lakes")}</h2>
            <p className="gw-sub">{tr(language, "mapSub", "The 300 largest lakes in HydroLAKES plus Abraham, colored by their 1991–2025 winter trend. {ready} of {total} trends are ready; grey dots are still downloading.", {
              ready: num(cmpReady.length, language), total: num(cmpLakes.length, language),
            })}</p>
          </div>
          <div className="card__tools">
            <div className="seg seg--small seg--dark">
              <span className="mono">{tr(language, "colorBy", "Color by")}</span>
              <div className="seg__opts" role="radiogroup" aria-label={tr(language, "colorBy", "Color by")}>
                <button type="button" role="radio" aria-checked={metric === "trend"} className={metric === "trend" ? "on" : ""} onClick={() => setMetric("trend")}>{tr(language, "metricTrend", "Winter trend")}</button>
                <button type="button" role="radio" aria-checked={metric === "ice"} className={metric === "ice" ? "on" : ""} onClick={() => setMetric("ice")}>{tr(language, "metricIce", "Ice days")}</button>
              </div>
            </div>
            <div className="legend al-legend" aria-label={metric === "trend" ? tr(language, "legendAria", "Color scale in °C per decade") : tr(language, "legendIceAria", "Color scale in ice days per year")}>
              {(metric === "trend" ? SLOPE_LEGEND : ICE_LEGEND).map((s) => <span key={s.label}><i style={{ background: s.color }} />{s.label}</span>)}
            </div>
          </div>
        </div>
        <LakeMap lakes={mapLakes} trends={cmpTrends} ice={LAKETEMP} metric={metric} selected={lake.id} onSelect={pick} language={language} />
      </section>

      <div className="two">
        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "lswtTitle", "Lake surface temperature by month")}</h2>
            <p className="muted">{lt
              ? tr(language, "lswtSub", "{name} · LakeTEMP, Landsat 8 readings 2013–2021 at the lake's center point. Shaded months are the ice season; LakeTEMP counts ice as 0 °C.", { name: lakeName(lake) })
              : tr(language, "noLaketemp", "No LakeTEMP observations")}</p>
          </div></div>
          {lt && lt.months.some((v) => v != null)
            ? <LswtMonthlyChart lt={lt} air={isAbraham ? ABRAHAM_MONTHS : undefined} names={months} language={language} />
            : <p className="muted pad">{tr(language, "noMonthly", "LakeTEMP has no monthly statistics for this lake.")}</p>}
        </section>

        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "latTitle", "How long do lakes stay frozen?")}</h2>
            <p className="muted">{tr(language, "latSub", "Ice days per year by latitude across {n} lakes with good LakeTEMP data.", { n: compact(ICE_UNIVERSE.good, language) })}</p>
          </div></div>
          <IceLatitudeChart bands={ICE_BY_LAT} language={language} points={[
            { id: ABRAHAM_ID, lat: ABRAHAM.lat, days: ABRAHAM_LT.iceDays ?? 0, label: "Abraham", kind: "abraham" as const },
            ...(!isAbraham && lt?.iceDays != null ? [{ id: lake.id, lat: lake.lat, days: lt.iceDays, label: lakeName(lake), kind: "selected" as const }] : []),
          ]} />
          {lt?.iceDays != null && peers && (
            <p className="readout">{tr(language, "latRead", "{name}: {days} ice days. Lakes at the same latitude: median {p50} (middle half {p25}–{p75}, {n} lakes).", {
              name: lakeName(lake), days: lt.iceDays, p50: Math.round(peers.p50), p25: Math.round(peers.p25), p75: Math.round(peers.p75), n: num(peers.n, language),
            })}</p>
          )}
        </section>
      </div>

      <section className="card">
        <div className="card__head"><div>
          <h2>{tr(language, "stripTitle", "How fast are winters warming?")}</h2>
          <p className="muted">{tr(language, "stripSub", "Each dot is one large lake's 1991–2025 winter trend. The line marks Abraham on the same years. Click a dot to open it.")}</p>
        </div></div>
        <TrendStrip lakes={cmpLakes} trends={cmpTrends} selected={lake.id} abrahamSlope={ABRAHAM_CMP.slope} onSelect={pick} language={language} />
        {median != null && (
          <p className="readout">{tr(language, "stripRead", "Median {median} °C/decade · {warming} of {n} lakes show warmer winters, {sig} of them clearly (95% interval above zero).", {
            median: signed(median, language), warming: num(warming, language), n: num(cmpReady.length, language), sig: num(significant, language),
          })}</p>
        )}
      </section>

      <AbrahamQuestions language={language} v={{
        slope: signed(TRENDS.get(ABRAHAM_ID)!.slope, language).replace(/^\+/, ""),
        lo: signed(TRENDS.get(ABRAHAM_ID)!.slope - 1.96 * TRENDS.get(ABRAHAM_ID)!.se, language),
        hi: signed(TRENDS.get(ABRAHAM_ID)!.slope + 1.96 * TRENDS.get(ABRAHAM_ID)!.se, language),
        r2: pct(TRENDS.get(ABRAHAM_ID)!.r2, language), abr: signed(ABRAHAM_CMP.slope, language),
        median: median != null ? signed(median, language) : "—", above: median != null && ABRAHAM_CMP.slope > median,
        days: ABRAHAM_LT.iceDays ?? 0, p50: Math.round(ABRAHAM_LAT_PEERS.p50), lakes: num(UNIVERSE.total, language),
        abrN: TRENDS.get(ABRAHAM_ID)!.winters, ready: TRENDS.size - 1, good: num(ICE_UNIVERSE.good, language), obs: ABRAHAM_LT.nObs,
      }} />

      {/* Takeaways */}
      <section className="card takeaways">
        <h2>{tr(language, "takeawaysTitle", "What the data says")}</h2>
        <ul>
          <li><strong>{tr(language, "t1Head", "Abraham's winters are warming slowly.")}</strong> {tr(language, "t1", "Since 1951 the Dec–Feb mean rose {slope} °C per decade (95% interval {lo} to {hi}), about {total} °C over {n} winters. The trend explains only {r2} of the variation: one winter can be 10 °C colder than the next.", {
            slope: signed(TRENDS.get(ABRAHAM_ID)!.slope, language),
            lo: signed(TRENDS.get(ABRAHAM_ID)!.slope - 1.96 * TRENDS.get(ABRAHAM_ID)!.se, language),
            hi: signed(TRENDS.get(ABRAHAM_ID)!.slope + 1.96 * TRENDS.get(ABRAHAM_ID)!.se, language),
            total: signed((TRENDS.get(ABRAHAM_ID)!.slope * (TRENDS.get(ABRAHAM_ID)!.winters - 1)) / 10, language),
            n: TRENDS.get(ABRAHAM_ID)!.winters, r2: pct(TRENDS.get(ABRAHAM_ID)!.r2, language),
          })}</li>
          {median != null && <li><strong>{ABRAHAM_CMP.slope < median
            ? tr(language, "t2HeadSlow", "Slower than most big lakes.")
            : tr(language, "t2HeadFast", "Faster than most big lakes.")}</strong> {tr(language, ABRAHAM_CMP.slope < median ? "t2Below" : "t2Above", ABRAHAM_CMP.slope < median
            ? "On 1991–2025, Abraham's {slope} °C/decade sits below the median of the large lakes ready so far ({median}). Short windows are noisy: its own interval spans {lo} to {hi}."
            : "On 1991–2025, Abraham's {slope} °C/decade sits above the median of the large lakes ready so far ({median}). Short windows are noisy: its own interval spans {lo} to {hi}.", {
            slope: signed(ABRAHAM_CMP.slope, language), median: signed(median, language),
            lo: signed(ABRAHAM_CMP.slope - 1.96 * ABRAHAM_CMP.se, language), hi: signed(ABRAHAM_CMP.slope + 1.96 * ABRAHAM_CMP.se, language),
          })}</li>}
          <li><strong>{tr(language, "t3IceHead", "{days} days under ice.", { days: ABRAHAM_LT.iceDays ?? 0 })}</strong> {tr(language, "t3Ice", "LakeTEMP estimates that Abraham freezes around {from} and thaws around {to} (range {min}–{max} days). The air stays below 0 °C on average from {airFrom} to {airTo}, and that is when methane rising from the lake bed gets trapped as white discs.", {
            from: dayMonth(dayToDate(ABRAHAM_LT.iceStart ?? 1), language), to: dayMonth(dayToDate(ABRAHAM_LT.iceEnd ?? 1), language),
            min: ABRAHAM_LT.iceMin ?? "?", max: ABRAHAM_LT.iceMax ?? "?",
            airFrom: months[(freezingMonths.find((m) => m >= 7) ?? 11) - 1], airTo: months[(freezingMonths.filter((m) => m < 7).pop() ?? 3) - 1],
          })}</li>
          <li><strong>{tr(language, "t5Head", "Less ice than its neighbors.")}</strong> {tr(language, "t5", "Lakes at Abraham's latitude freeze for a median {p50} days ({n} lakes), and those at a similar elevation for {p50e}. Abraham's {days} days is shorter. A deep, regulated reservoir that stores heat and warm Chinook winds are plausible reasons, but this page does not test them.", {
            p50: Math.round(ABRAHAM_LAT_PEERS.p50), n: num(ABRAHAM_LAT_PEERS.n, language), p50e: Math.round(ABRAHAM_PEERS.p50), days: ABRAHAM_LT.iceDays ?? 0,
          })}</li>
          <li><strong>{tr(language, "t4Head", "A rare size.")}</strong> {tr(language, "t4", "HydroLAKES maps {total} lakes of at least 0.1 km²; {small} of them are under 1 km² and only {named} have a name. Abraham, at 52 km², is bigger than all but {larger}.", {
            total: num(UNIVERSE.total, language), small: pct(below1km / UNIVERSE.total, language), named: num(UNIVERSE.named, language), larger: num(UNIVERSE.larger_than_abraham, language),
          })}</li>
        </ul>
      </section>

      <AbrahamQuality language={language} v={{
        slope: "", lo: "", hi: "", r2: "", abr: "", median: "", above: false, days: 0, p50: 0,
        lakes: num(UNIVERSE.total, language), abrN: TRENDS.get(ABRAHAM_ID)!.winters, ready: TRENDS.size - 1,
        good: num(ICE_UNIVERSE.good, language), obs: ABRAHAM_LT.nObs,
      }} />

      <section className="method lp-method">
        <h2>{tr(language, "methodTitle", "Method & sources")}</h2>
        <p>{tr(language, "method1", "Lake attributes come from HydroLAKES v1.0, read with DuckDB's spatial extension from the pour-point shapefile (one point per lake, at its outlet). Winter air temperature is the ERA5 reanalysis daily mean from Open-Meteo at the ERA5 grid cell nearest each pour point (about 25 km), so for very large lakes it describes the outlet area, not the whole lake.")}</p>
        <p>{tr(language, "method2", "A winter is Dec–Feb in the Northern Hemisphere (labeled by its January) and Jun–Aug in the Southern; only complete winters count. Trends are ordinary least squares (DuckDB regr_slope) in °C per decade, with 95% intervals of ±1.96 standard errors. Abraham uses every winter since 1951; the 300 largest lakes use 1991–2025 to stay within Open-Meteo's free limit of 10,000 calls a day, and they download over several days. Any other lake is fetched in your browser when you open it and cached on your device.")}</p>
        <p>{tr(language, "method3Ice", "Ice days and water temperature come from LakeTEMP v1.1 (Korver et al., 2024): Landsat 8 surface temperature readings from 2013–2021 at each lake's center point, with a seasonal trendline fitted per lake. Ice cover is estimated from that trendline, so it is an average season, not a count of observed ice days. Values are shown as reliable only when LakeTEMP used the trendline, the lake is not intermittent, and it has at least 46 readings, as its documentation advises; otherwise they are marked as low quality. Snapshot taken {date}.", { date: fmtDate(CAPTURED_AT, language) })}</p>
        <p className="method__sources">
          {tr(language, "sources", "Sources")}:{" "}
          <a href="https://www.hydrosheds.org/products/hydrolakes" rel="noopener">HydroSHEDS · HydroLAKES</a> (Messager et al., 2016, CC-BY 4.0)
          {" · "}<a href="https://www.hydrosheds.org/products/laketemp" rel="noopener">HydroSHEDS · LakeTEMP</a> (Korver et al., 2024, CC-BY 4.0)
          {" · "}<a href="https://open-meteo.com/" rel="noopener">Weather data by Open-Meteo.com</a> (CC-BY 4.0)
          {" · "}{tr(language, "era5Credit", "ERA5: Copernicus Climate Change Service")}
          {" · "}Natural Earth
        </p>
        <AbrahamSources checkedOn={fmtDate("2026-11-21", language)} language={language} />
      </section>
    </div>
  );
}

function Stat({ label, value, note, accent, pending }: { label: string; value: string; note: string; accent?: boolean; pending?: boolean }) {
  return (
    <div className={`stat${accent ? " stat--accent" : ""}${pending ? " stat--pending" : ""}`}>
      <span className="mono">{label}</span>
      <strong>{value}</strong>
      <span className="stat__note">{note}</span>
    </div>
  );
}

/** Three plain-language facts for the family flyer, computed from the data. */
function familyFacts(lake: Lake, series: Series, language: string): { title: string; text: string }[] {
  const facts: { title: string; text: string }[] = [];
  const lt = LAKETEMP.get(lake.id);
  if (lake.id === ABRAHAM_ID) {
    facts.push({
      title: tr(language, "f1Head", "Frozen bubbles"),
      text: tr(language, "f1Ice", "Plants and leaves rot on the lake bed and release methane. In winter the gas rises and gets stuck in the ice, stacking up like white coins. Abraham stays frozen about {days} days a year, from {from} to {to}.", {
        days: lt?.iceDays ?? 0, from: dayMonth(dayToDate(lt?.iceStart ?? 1), language), to: dayMonth(dayToDate(lt?.iceEnd ?? 1), language),
      }),
    });
  } else if (lt?.iceDays) {
    facts.push({
      title: tr(language, "f5Head", "Months of ice"),
      text: tr(language, "f5", "{name} is covered by ice about {days} days a year: that is {share} of the year.", {
        name: lakeName(lake), days: lt.iceDays, share: pct(lt.iceDays / 365, language),
      }),
    });
  }
  if (lake.volume != null) {
    facts.push({
      title: tr(language, "f2Head", "Pools of water"),
      text: tr(language, "f2", "{name} holds about {volume} million m³ of water: enough to fill {pools} Olympic swimming pools.", {
        name: lakeName(lake), volume: num(Math.round(lake.volume), language), pools: num(Math.round((lake.volume * 1e6) / OLYMPIC_POOL_M3), language),
      }),
    });
  }
  const larger = lake.id === ABRAHAM_ID ? UNIVERSE.larger_than_abraham : lake.rank ? lake.rank - 1 : null;
  facts.push(larger != null
    ? { title: tr(language, "f3Head", "Bigger than most"), text: tr(language, "f3", "Of the {total} lakes on the map of the world, only {larger} are bigger than {name}.", { total: num(UNIVERSE.total, language), larger: num(larger, language), name: lakeName(lake) }) }
    : { title: tr(language, "f3bHead", "Size"), text: tr(language, "f3b", "{name} covers {area} km², about {fields} soccer fields.", { name: lakeName(lake), area: num(Math.round(lake.area * 10) / 10, language), fields: num(Math.round(lake.area / 0.00714), language) }) });
  if (facts.length < 3 && series.length) {
    const cold = series.reduce((a, b) => (b[1] < a[1] ? b : a));
    facts.push({ title: tr(language, "f4Head", "The coldest winter"), text: tr(language, "f4", "The coldest winter on record here was {year}, averaging {temp} °C.", { year: cold[0], temp: fmt1(cold[1], language) }) });
  }
  return facts.slice(0, 3);
}
