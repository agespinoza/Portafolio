import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../language.jsx";
import { monthNames } from "../locales.js";
import {
  type Lake, type Region, type Series, type Trend,
  ABRAHAM_ID, ABRAHAM_MONTHS, AREA_BINS, CAPTURED_AT, LAKES, LAKE_BY_ID, SERIES, TOP300, TRENDS, UNIVERSE, WINDOW,
  clip, fetchWinters, fitTrend, lakeName, regionOf,
} from "./data";
import { LakeMap, MonthlyAirChart, SLOPE_LEGEND, TrendStrip, WinterTrendChart } from "./Charts";
import { tr, num, fmt0, fmt1, signed, pct, compact, fmtDate } from "./text";

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

export default function AbrahamLakeDay() {
  const language: string = useLanguage();
  const months = useMemo(() => monthNames(language) as string[], [language]);
  const [selected, setSelected] = useState(ABRAHAM_ID);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region>("all");
  const [type, setType] = useState<LakeType>("all");
  const [family, setFamily] = useState(false);
  const [span, setSpan] = useState<"full" | "window">("full");
  const [fetched, setFetched] = useState<Record<number, Fetch>>({});

  const lake = LAKE_BY_ID.get(selected) ?? ABRAHAM;
  const isAbraham = lake.id === ABRAHAM_ID;

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
        <Stat label={tr(language, "iceDays", "Ice days per year")} value="—" pending
          note={tr(language, "laketempPending", "LakeTEMP · coming in Sprint 2")} />
        <Stat label={tr(language, "waterTemp", "Water temperature")} value="—" pending
          note={tr(language, "laketempPending", "LakeTEMP · coming in Sprint 2")} />
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
          <div className="legend al-legend" aria-label={tr(language, "legendAria", "Color scale in °C per decade")}>
            {SLOPE_LEGEND.map((s) => <span key={s.label}><i style={{ background: s.color }} />{s.label}</span>)}
          </div>
        </div>
        <LakeMap lakes={mapLakes} trends={cmpTrends} selected={lake.id} onSelect={pick} language={language} />
      </section>

      <div className="two">
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

        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "lswtTitle", "Lake surface temperature by month")}</h2>
            <p className="muted">{tr(language, "lswtPending", "Water temperature from LakeTEMP arrives in Sprint 2. Until then, this shows the air above Abraham Lake, 1991–2020.")}</p>
          </div></div>
          <MonthlyAirChart months={ABRAHAM_MONTHS} names={months} language={language} />
        </section>
      </div>

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
          <li><strong>{tr(language, "t3Head", "{n} freezing months.", { n: freezingMonths.length })}</strong> {tr(language, "t3", "At Abraham the average day stays below 0 °C from {from} to {to}. That is the window when methane rising from the lake bed gets trapped as white discs in the ice.", {
            from: months[(freezingMonths.find((m) => m >= 7) ?? 11) - 1],
            to: months[(freezingMonths.filter((m) => m < 7).pop() ?? 3) - 1],
          })}</li>
          <li><strong>{tr(language, "t4Head", "A rare size.")}</strong> {tr(language, "t4", "HydroLAKES maps {total} lakes of at least 0.1 km²; {small} of them are under 1 km² and only {named} have a name. Abraham, at 52 km², is bigger than all but {larger}.", {
            total: num(UNIVERSE.total, language), small: pct(below1km / UNIVERSE.total, language), named: num(UNIVERSE.named, language), larger: num(UNIVERSE.larger_than_abraham, language),
          })}</li>
        </ul>
      </section>

      <section className="method">
        <h2>{tr(language, "methodTitle", "Method & sources")}</h2>
        <p>{tr(language, "method1", "Lake attributes come from HydroLAKES v1.0, read with DuckDB's spatial extension from the pour-point shapefile (one point per lake, at its outlet). Winter air temperature is the ERA5 reanalysis daily mean from Open-Meteo at the ERA5 grid cell nearest each pour point (about 25 km), so for very large lakes it describes the outlet area, not the whole lake.")}</p>
        <p>{tr(language, "method2", "A winter is Dec–Feb in the Northern Hemisphere (labeled by its January) and Jun–Aug in the Southern; only complete winters count. Trends are ordinary least squares (DuckDB regr_slope) in °C per decade, with 95% intervals of ±1.96 standard errors. Abraham uses every winter since 1951; the 300 largest lakes use 1991–2025 to stay within Open-Meteo's free limit of 10,000 calls a day, and they download over several days. Any other lake is fetched in your browser when you open it and cached on your device.")}</p>
        <p>{tr(language, "method3", "Air temperature is not lake ice: ice days and water temperature need LakeTEMP (Korver et al., 2024), which is planned for Sprint 2. Snapshot taken {date}.", { date: fmtDate(CAPTURED_AT, language) })}</p>
        <p className="method__sources">
          {tr(language, "sources", "Sources")}:{" "}
          <a href="https://www.hydrosheds.org/products/hydrolakes" rel="noopener">HydroSHEDS · HydroLAKES</a> (Messager et al., 2016, CC-BY 4.0)
          {" · "}<a href="https://open-meteo.com/" rel="noopener">Weather data by Open-Meteo.com</a> (CC-BY 4.0)
          {" · "}{tr(language, "era5Credit", "ERA5: Copernicus Climate Change Service")}
          {" · "}Natural Earth
        </p>
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
  if (lake.id === ABRAHAM_ID) {
    const winterDays = ABRAHAM_MONTHS.filter((m) => [12, 1, 2].includes(m[0])).map((m) => m[4]);
    facts.push({
      title: tr(language, "f1Head", "Frozen bubbles"),
      text: tr(language, "f1", "Plants and leaves rot on the lake bed and release methane. In winter the gas rises and gets stuck in the ice, stacking up like white coins. In Dec–Feb, {share} of days at Abraham are below freezing.", {
        share: `${Math.round(winterDays.reduce((a, b) => a + b, 0) / winterDays.length)}%`,
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
