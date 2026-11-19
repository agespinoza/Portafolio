import { useEffect, useMemo, useState } from "react";
import {
  SIGHTINGS, NZ_RINGS, SNAPSHOT_DATE, MONTHS, WAITOMO, EFFORT, EFFORT_ISLAND, effortFor, poissonCI,
  fetchRecordCount, fetchWeatherNow, loadClimate, kmBetween,
} from "./api.js";
import { localeFor, t } from "../../../../assets/i18n.js";
import { useLanguage } from "../../language.jsx";
import { formatDate, monthNames } from "../locales.js";
import { makeTr } from "../tr.js";
import { MESSAGES } from "./messages.js";

const tr = makeTr("glow", MESSAGES);

const ISLANDS = [
  { value: "all", key: "allIslands", label: "Both islands" },
  { value: "North", key: "northIsland", label: "North Island" },
  { value: "South", key: "southIsland", label: "South Island" },
];
const SOURCE_OPTIONS = [
  { value: "all", key: "sourceAll", label: "All sources" },
  { value: "inat", key: "sourceInat", label: "iNaturalist" },
  { value: "museum", key: "sourceMuseum", label: "Museums & other" },
];
const DISTANCES = [
  { value: 0, key: "distanceAll", label: "Anywhere" },
  { value: 25, key: "distance25", label: "≤ 25 km" },
  { value: 100, key: "distance100", label: "≤ 100 km" },
];
const MEASURES = [
  { value: "count", key: "measureCount", label: "Records" },
  { value: "rate", key: "measureRate", label: "Per 100k observations" },
];
const PER = 100000;
const LOW_N = 10; // below this, a rate is too noisy to rank
const NEAR_KM = 25;
const BIN = 0.25; // map grid size in degrees

const ROWS = SIGHTINGS.map((s) => ({ ...s, km: kmBetween(s, WAITOMO) }));
const YEARS = [...new Set(ROWS.map((s) => s.year).filter(Boolean))].sort((a, b) => a - b);
const Y0 = YEARS[0], Y1 = YEARS[YEARS.length - 1];
const SNAP_YEAR = Number(SNAPSHOT_DATE.slice(0, 4));

const fmtDate = (iso, language) => formatDate(language, iso, { dateStyle: "medium" });
const num = (value, language) => value.toLocaleString(localeFor(language));
const fmtRate = (v, language) => (v == null ? "—" : v.toLocaleString(localeFor(language), { maximumFractionDigits: v < 10 ? 1 : 0 }));
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : "—");

const regionsOn = (island, region) => (region ? [region]
  : Object.keys(EFFORT).filter((n) => (island === "all" ? EFFORT_ISLAND[n] : EFFORT_ISLAND[n] === island)));

function rateOf(n, effort) {
  if (!effort) return null;
  const [lo, hi] = poissonCI(n);
  return { n, effort, v: (n / effort) * PER, lo: (lo / effort) * PER, hi: (hi / effort) * PER };
}

export default function GlowwormDay() {
  const language = useLanguage();
  const months = useMemo(() => monthNames(language), [language]);
  const [island, setIsland] = useState("all");
  const [yearFrom, setYearFrom] = useState(Y0);
  const [yearTo, setYearTo] = useState(Y1);
  const [month, setMonth] = useState(0); // 0 = all months
  const [region, setRegion] = useState(null);
  const [source, setSource] = useState("all");
  const [distance, setDistance] = useState(0);
  const [measure, setMeasure] = useState("count");
  const [weather, setWeather] = useState({ status: "loading" });
  const [count, setCount] = useState(null);
  const [climate, setClimate] = useState(null);
  const [hoverBin, setHoverBin] = useState(null);
  const [hoverMonth, setHoverMonth] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () => fetchWeatherNow()
      .then((w) => alive && setWeather({ status: "ok", data: w }))
      .catch(() => alive && setWeather({ status: "error" }));
    load();
    const timer = setInterval(load, 15 * 60 * 1000);
    fetchRecordCount().then((n) => alive && setCount(n)).catch(() => {});
    loadClimate().then((c) => alive && setClimate(c));
    return () => { alive = false; clearInterval(timer); };
  }, []);

  // A reporting rate needs a matching denominator: iNaturalist effort exists per region, month,
  // and year, so rate mode counts iNaturalist records with a known region and ignores distance.
  const rate = measure === "rate";
  const src = rate ? "inat" : source;
  const dist = rate ? 0 : distance;
  const allYears = yearFrom === Y0 && yearTo === Y1;
  const yearOk = (y) => y != null && y >= yearFrom && y <= yearTo;
  const yearTest = allYears ? () => true : yearOk;

  // Cross-filtering: each chart ignores its own filter so the alternatives stay visible.
  const keep = (s, skip) =>
    (skip === "island" || island === "all" || s.island === island) &&
    (skip === "year" || allYears || yearOk(s.year)) &&
    (skip === "month" || !month || s.month === month) &&
    (skip === "region" || !region || s.region === region) &&
    (src === "all" || (src === "inat" ? s.source === "inat" : s.source !== "inat")) &&
    (!dist || s.km <= dist) &&
    (!rate || Boolean(s.region));

  const deps = [island, yearFrom, yearTo, month, region, src, dist, rate];
  const shown = useMemo(() => ROWS.filter((s) => keep(s)), deps);
  const forMonths = useMemo(() => ROWS.filter((s) => keep(s, "month")), deps);
  const forYears = useMemo(() => ROWS.filter((s) => keep(s, "year")), deps);
  const forRegions = useMemo(() => ROWS.filter((s) => keep(s, "region")), deps);

  const bins = useMemo(() => binSightings(forRegions), [forRegions]);
  const regions = useMemo(() => {
    const ranked = rankRegions(forRegions).map((r) => ({
      ...r, rate: r.name in EFFORT ? rateOf(r.n, effortFor({ regions: [r.name], month, yearOk: yearTest })) : null,
    }));
    return rate
      ? ranked.filter((r) => r.rate).sort((a, b) => (a.n < LOW_N) - (b.n < LOW_N) || b.rate.v - a.rate.v) // noisy rates last
      : ranked;
  }, [forRegions, rate, month, yearFrom, yearTo]);
  const monthly = useMemo(() => MONTHS.map((_, i) => {
    const n = forMonths.filter((s) => s.month === i + 1).length;
    return { n, rate: rate ? rateOf(n, effortFor({ regions: regionsOn(island, region), month: i + 1, yearOk: yearTest })) : null };
  }), [forMonths, rate, island, region, yearFrom, yearTo]);
  const yearly = useMemo(() => {
    const buckets = [{ label: "<2000", sample: 1999, test: (y) => y < 2000 }];
    for (let y = 2000; y <= Math.max(2000, Y1); y++) buckets.push({ label: String(y), sample: y, test: (v) => v === y });
    return buckets.map((b) => {
      const n = forYears.filter((s) => s.year != null && b.test(s.year)).length;
      return { ...b, n, rate: rate ? rateOf(n, effortFor({ regions: regionsOn(island, region), month, yearOk: b.test })) : null };
    });
  }, [forYears, rate, island, region, month]);

  // Overall reporting rate for the current filters (iNaturalist records only).
  const overall = useMemo(() => {
    if (src === "museum" || dist) return null;
    const n = shown.filter((s) => s.source === "inat" && s.region).length;
    return rateOf(n, effortFor({ regions: regionsOn(island, region), month, yearOk: yearTest }));
  }, [shown, src, dist, island, region, month, yearFrom, yearTo]);

  const near = shown.filter((s) => s.km <= NEAR_KM).length;
  const shownRegions = new Set(shown.map((s) => s.region).filter(Boolean));
  const insights = useMemo(() => computeInsights(climate, months), [climate, months]);

  const w = weather.status === "ok" ? weather.data : null;
  const filtersOn = island !== "all" || !allYears || month || region || source !== "all" || distance || rate;
  const reset = () => {
    setIsland("all"); setYearFrom(Y0); setYearTo(Y1); setMonth(0); setRegion(null);
    setSource("all"); setDistance(0); setMeasure("count");
  };
  const opts = (list) => list.map((item) => ({ value: item.value, label: tr(language, item.key, item.label) }));
  const scopeName = region || tr(language, island === "all" ? "scopeNZ" : island === "North" ? "scopeNorth" : "scopeSouth",
    island === "all" ? "all of New Zealand" : island === "North" ? "the North Island" : "the South Island");
  const valueOf = (d) => (rate ? d.rate?.v ?? 0 : d.n);
  const fmtValue = (d) => (rate ? fmtRate(d.rate?.v, language) : num(d.n, language));

  return (
    <div className="viz">
      {/* Controls */}
      <div className="controls" role="group" aria-label={tr(language, "controlsAria", "Filter glowworm records")}>
        <Segmented label={tr(language, "measure", "Measure")} value={measure} onChange={setMeasure} options={opts(MEASURES)} />
        <Segmented label={tr(language, "island", "Island")} value={island} onChange={(v) => { setIsland(v); setRegion(null); }} options={opts(ISLANDS)} />
        <div className="range">
          <span className="mono">{tr(language, "years", "Years")}</span>
          <div className="range__pair">
            <label className="select select--inline">
              <span className="sr">{tr(language, "yearFrom", "From")}</span>
              <select value={yearFrom} onChange={(e) => { const v = Number(e.target.value); setYearFrom(v); if (v > yearTo) setYearTo(v); }}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
            <span className="range__dash" aria-hidden="true">–</span>
            <label className="select select--inline">
              <span className="sr">{tr(language, "yearTo", "To")}</span>
              <select value={yearTo} onChange={(e) => { const v = Number(e.target.value); setYearTo(v); if (v < yearFrom) setYearFrom(v); }}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
          </div>
        </div>
        <label className="select">
          <span className="mono">{tr(language, "month", "Month")}</span>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            <option value={0}>{tr(language, "allMonths", "All months")}</option>
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </label>
        <Segmented label={tr(language, "source", "Source")} value={src} onChange={setSource} options={opts(SOURCE_OPTIONS)}
          disabled={rate} hint={rate ? tr(language, "rateSourceHint", "Rates use iNaturalist records only") : null} />
        <Segmented label={tr(language, "distance", "Distance from Waitomo")} value={dist} onChange={setDistance} options={opts(DISTANCES)}
          disabled={rate} hint={rate ? tr(language, "rateDistanceHint", "Effort is only known by region") : null} />
        {filtersOn ? <button type="button" className="gw-reset" onClick={reset}>{tr(language, "clearFilters", "Clear filters")}</button> : null}
      </div>

      {/* Headline numbers */}
      <section className="stats" aria-label={tr(language, "statsAria", "Key numbers")}>
        <Stat accent label={tr(language, "outsideNow", "Outside the caves now")}
          value={w ? `${Math.round(w.temp)}°C` : weather.status === "loading" ? "…" : "—"}
          note={w
            ? tr(language, "weatherNote", "{humidity}% humidity · {phase} in Waitomo", {
              humidity: w.humidity,
              phase: tr(language, w.isDay ? "daytime" : "nighttime", w.isDay ? "daytime" : "night"),
            })
            : weather.status === "error" ? tr(language, "weatherUnavailable", "Live weather unavailable") : tr(language, "weatherLoading", "Loading Open-Meteo")} />
        <Stat label={tr(language, "recordsShown", "Records shown")} value={num(shown.length, language)}
          note={count != null
            ? tr(language, "gbifToday", "GBIF lists {count} today · map from {date}", { count: num(count, language), date: fmtDate(SNAPSHOT_DATE, language) })
            : tr(language, "snapshotFrom", "Snapshot from {date}", { date: fmtDate(SNAPSHOT_DATE, language) })} />
        <Stat label={tr(language, "reportingRate", "Reporting rate")} value={overall ? fmtRate(overall.v, language) : "—"}
          note={overall
            ? tr(language, "rateNote", "per 100k iNaturalist observations · 95% CI {lo}–{hi}", { lo: fmtRate(overall.lo, language), hi: fmtRate(overall.hi, language) })
            : tr(language, "rateUnavailable", "Needs iNaturalist records and no distance filter")} />
        <Stat label={tr(language, "nearWaitomo", "Near Waitomo")} value={num(near, language)}
          note={tr(language, "withinRecords", "within {km} km of the caves · {percent} of records", { km: NEAR_KM, percent: pct(near, shown.length) })} />
      </section>

      {rate && (
        <p className="notice" role="note">
          {tr(language, "rateExplainer", "Rate mode divides glowworm records by all iNaturalist observations made in the same region and period. It corrects for where people use the app, so busy cities no longer dominate. Whiskers show 95% intervals; faded rows have fewer than {n} records.", { n: LOW_N })}
        </p>
      )}

      {/* Map + regions */}
      <div className="two">
        <section className="card gw-sky">
          <div className="card__head">
            <div>
              <h2>{tr(language, "mapTitle", "Where people have recorded glowworms")}</h2>
              <p className="gw-sub">{tr(language, "mapDescriptionCounts", "Each point groups records within about 25 km. Bigger and brighter means more records. The map always shows counts.")}</p>
            </div>
          </div>
          <NZMap bins={bins} region={region} dist={dist} onHover={setHoverBin} language={language} />
          <p className="readout gw-readout" aria-live="polite">
            {hoverBin
              ? <><strong>{hoverBin.region || tr(language, "unnamed", "Unnamed area")}</strong> · {num(hoverBin.n, language)} {tr(language, hoverBin.n === 1 ? "recordOne" : "recordMany", hoverBin.n === 1 ? "record" : "records")}
                {hoverBin.y0 ? ` · ${hoverBin.y0 === hoverBin.y1 ? hoverBin.y0 : `${hoverBin.y0}–${hoverBin.y1}`}` : ""}
                {` · ${tr(language, "kmFromWaitomo", "{km} km from Waitomo", { km: Math.round(kmBetween(hoverBin, WAITOMO)) })}`}</>
              : tr(language, "mapHover", "Hover or focus a point to see its records. The copper ring marks the Waitomo Caves.")}
          </p>
        </section>

        <section className="card">
          <div className="card__head">
            <div>
              <h2>{rate ? tr(language, "regionsRateTitle", "Reporting rate by region") : tr(language, "regionsTitle", "Records by region")}</h2>
              <p className="muted">{rate
                ? tr(language, "regionsRateHint", "Glowworm records per 100,000 iNaturalist observations. Click a region to light it up on the map.")
                : tr(language, "regionHint", "Click a region to light it up on the map.")}</p>
            </div>
          </div>
          <RegionList regions={regions} rate={rate} selected={region} onPick={(r) => setRegion(region === r ? null : r)} language={language} />
        </section>
      </div>

      {/* Climate vs records */}
      <section className="card">
        <div className="card__head">
          <div>
            <h2>{tr(language, "climateTitle", "Waitomo's seasons outside, and when people find glowworms")}</h2>
            <p className="muted">
              {climate
                ? tr(language, "climateAverages", "Monthly averages at Waitomo, {from}–{to}{snapshot}", {
                  from: climate.years[0], to: climate.years[1],
                  snapshot: climate.live ? "" : ` ${t(language, "border.savedSnapshot", "(saved snapshot)")}`,
                })
                : tr(language, "climateLoading", "Loading climate…")}
              {" "}· {rate
                ? tr(language, "climateRates", "Bottom row: reporting rate by month for the current filters.")
                : tr(language, "climateRecords", "Glowworm records by month for the current filters. Click a month to filter the map.")}
            </p>
          </div>
          <div className="keys gw-keys">
            <span><i className="gw-k-temp" />{tr(language, "averageLowHigh", "Avg. low–high")}</span>
            <span><i className="gw-k-ext" />{tr(language, "coldestHottest", "Coldest–hottest day")}</span>
            <span><i className="gw-k-rain" />{tr(language, "rain", "Rain")}</span>
            <span><i className="gw-k-rec" />{rate ? tr(language, "rateShort", "Rate") : tr(language, "records", "Records")}</span>
          </div>
        </div>
        {!dist && (
          <p className="notice notice--inline" role="note">
            {tr(language, "climateScope", "Climate is measured at Waitomo, but these records cover {scope}. Set the distance to ≤ 100 km to compare like with like.", { scope: scopeName })}
          </p>
        )}
        {climate
          ? <SeasonChart climate={climate.months} values={monthly.map(valueOf)} labels={monthly.map(fmtValue)} rows={monthly}
            rate={rate} selected={month} months={months} language={language}
            onPick={(m) => setMonth(month === m ? 0 : m)} onHover={setHoverMonth} />
          : <p className="muted pad">{tr(language, "climateLoadingData", "Loading climate data…")}</p>}
        <p className="readout" aria-live="polite">
          {hoverMonth && climate
            ? (() => {
              const c = climate.months[hoverMonth - 1];
              const m = monthly[hoverMonth - 1];
              return <strong>{tr(language, "monthStatsFull", "{month} · highs {high} °C, lows {low} °C (extremes {min}° to {max}°) · {humidity}% humidity · {rain} mm rain · {count} records{rate}", {
                month: months[hoverMonth - 1], high: c.high, low: c.low, min: c.min, max: c.max, humidity: c.humidity, rain: c.rain,
                count: num(m.n, language),
                rate: m.rate ? ` · ${tr(language, "ratePer", "{v} per 100k", { v: fmtRate(m.rate.v, language) })}` : "",
              })}</strong>;
            })()
            : tr(language, "caveClimate", "Inside the cave, the air stays cool and damp all year. Outside, it swings from frost to summer heat.")}
        </p>
      </section>

      {/* Years */}
      <section className="card">
        <div className="card__head">
          <div>
            <h2>{rate ? tr(language, "yearsRateTitle", "Reporting rate by year") : tr(language, "yearsTitle", "Records by year")}</h2>
            <p className="muted">{rate
              ? tr(language, "yearsRateDescription", "If the rate is flat while records grow, the growth comes from more people using iNaturalist. Highlighted bars match the selected years.")
              : tr(language, "yearsDescriptionRange", "Highlighted bars match the selected years. Records before 2000 are grouped together.")}</p>
          </div>
        </div>
        <YearChart buckets={yearly} rate={rate} test={yearTest} language={language} />
      </section>

      {/* Takeaways */}
      <section className="card takeaways">
        <h2>{tr(language, "takeawaysTitle", "What the data says")}</h2>
        <ul>
          <li><strong>{tr(language, "effortHeadline", "Raw counts favor busy places.")}</strong> {tr(language, "effortStats", "{raw} has the most records ({rawCount}), but adjusted for how much people use iNaturalist there, {top} leads with {topRate} per 100k observations, {ratio}× {raw}'s rate.", {
            raw: TAKE.rawTop.name, rawCount: num(TAKE.rawTop.n, language), top: TAKE.adjTop.name,
            topRate: fmtRate(TAKE.adjTop.v, language), ratio: (TAKE.adjTop.v / TAKE.rawTopRate).toLocaleString(localeFor(language), { maximumFractionDigits: 1 }),
          })}</li>
          <li><strong>{tr(language, "seasonHeadline", "Winter is glowworm season, relatively.")}</strong> {tr(language, "seasonStats", "Raw records peak in {rawPeak}, but relative to all iNaturalist activity the peak is {first} and {second} ({peakRate} per 100k, against {lowRate} in {low}). Dark early evenings help, and fewer other species are being logged in winter.", {
            rawPeak: months[TAKE.rawPeak], first: months[TAKE.ratePeaks[0].m], second: months[TAKE.ratePeaks[1].m],
            peakRate: fmtRate(TAKE.ratePeaks[0].v, language), lowRate: fmtRate(TAKE.rateLow.v, language), low: months[TAKE.rateLow.m],
          })}</li>
          <li><strong>{tr(language, "growthHeadline", "More records, not more glowworms.")}</strong> {tr(language, "growthStats", "Records rose from {a} in {fromYear} to {b} in {toYear}, yet the reporting rate stayed between {lo} and {hi} per 100k from {stableFrom} on. The growth reflects more people using iNaturalist.", {
            a: num(TAKE.growth.a, language), b: num(TAKE.growth.b, language), fromYear: TAKE.growth.fromYear, toYear: TAKE.growth.toYear,
            lo: fmtRate(TAKE.growth.lo, language), hi: fmtRate(TAKE.growth.hi, language), stableFrom: TAKE.growth.stableFrom,
          })}</li>
          <li><strong>{tr(language, "northHeadline", "Mostly a North Island story:")}</strong> {tr(language, "northStats", "{percent} of records are from the North Island, but the South Island's West Coast alone has {count}.", {
            percent: pct(ROWS.filter((s) => s.island === "North").length, ROWS.length),
            count: num(ROWS.filter((s) => s.region === "West Coast").length, language),
          })}</li>
          {insights && <li><strong>{tr(language, "temperatureHeadline", "A big swing outside:")}</strong> {tr(language, "temperatureStats", "Average highs at Waitomo range from {cool}°C in {coolMonth} to {warm}°C in {warmMonth}, and the coldest nights fall below {min}°C. The cave's stable air is what lets the larvae glow all year.", {
            cool: insights.coolHigh, coolMonth: insights.coolMonth, warm: insights.warmHigh, warmMonth: insights.warmMonth, min: insights.minLow,
          })}</li>}
          <li><strong>{tr(language, "biasHeadline", "Presence, not abundance.")}</strong> {tr(language, "biasStats", "These are records of where people saw glowworms, not counts of glowworms. Popular tracks and caves are over-represented, and iNaturalist can blur the location of some observations.")}</li>
        </ul>
      </section>

      <section className="method">
        <h2>{tr(language, "methodTitle", "Method & sources")}</h2>
        <p>{tr(language, "methodText", "Glowworm records are every georeferenced occurrence of Arachnocampa luminosa in New Zealand on GBIF.org, excluding records with geospatial issues. Most are iNaturalist research-grade observations and a few are museum specimens.")}</p>
        <p>{tr(language, "methodRate", "The reporting rate divides iNaturalist glowworm records by all iNaturalist research-grade observations in New Zealand (every species) for the same region, month, and years, then scales to 100,000. GBIF gives effort per region by month and per region by year. When both a month and a year range are selected, they are combined assuming month and year are independent within each region. Intervals are approximate 95% Poisson intervals on the glowworm count. Records without a region are left out of rates. Snapshot taken {date}.", { date: fmtDate(SNAPSHOT_DATE, language) })}</p>
        <p className="method__sources">
          {tr(language, "sources", "Sources")}:
          {" "}<a href="https://www.gbif.org/species/1564326" rel="noopener">GBIF.org</a>
          {" · "}<a href="https://www.inaturalist.org/" rel="noopener">iNaturalist</a>
          {" · "}<a href="https://open-meteo.com/" rel="noopener">Open-Meteo</a>
          {" · "}<a href="https://ackma.org/Proceedings/proceed/18/18cross.html" rel="noopener">ACKMA</a>
          {" · Natural Earth"}
        </p>
      </section>
    </div>
  );
}

/* ---------- takeaways, computed once from the full snapshot ---------- */
const TAKE = (() => {
  const inat = ROWS.filter((s) => s.source === "inat" && s.region);
  const all = regionsOn("all", null);
  const rateFor = (rows, filter) => rateOf(rows.length, effortFor({ regions: all, yearOk: () => true, ...filter }));
  const ranked = rankRegions(ROWS);
  const rawTop = ranked[0];
  const regionRates = rankRegions(inat)
    .filter((r) => r.name in EFFORT && r.n >= LOW_N)
    .map((r) => ({ ...r, v: rateOf(r.n, effortFor({ regions: [r.name], yearOk: () => true })).v }))
    .sort((a, b) => b.v - a.v);
  const rawTopRate = rateOf(inat.filter((s) => s.region === rawTop.name).length, effortFor({ regions: [rawTop.name], yearOk: () => true })).v;
  const byMonth = MONTHS.map((_, m) => ({ m, n: ROWS.filter((s) => s.month === m + 1).length }));
  const monthRates = MONTHS.map((_, m) => ({ m, v: rateFor(inat.filter((s) => s.month === m + 1), { month: m + 1 }).v }));
  const sortedRates = [...monthRates].sort((a, b) => b.v - a.v);
  const lastFull = SNAP_YEAR - 1, fromYear = 2016, stableFrom = 2018;
  const yearRates = [];
  for (let y = stableFrom; y <= lastFull; y++) yearRates.push(rateFor(inat.filter((s) => s.year === y), { yearOk: (v) => v === y }).v);
  return {
    rawTop, rawTopRate, adjTop: regionRates[0],
    rawPeak: [...byMonth].sort((a, b) => b.n - a.n)[0].m,
    ratePeaks: sortedRates.slice(0, 2), rateLow: sortedRates[sortedRates.length - 1],
    growth: {
      fromYear, toYear: lastFull, stableFrom,
      a: ROWS.filter((s) => s.year === fromYear).length, b: ROWS.filter((s) => s.year === lastFull).length,
      lo: Math.min(...yearRates), hi: Math.max(...yearRates),
    },
  };
})();

/* ---------- helpers ---------- */
function binSightings(rows) {
  const map = new Map();
  rows.forEach((s) => {
    const key = `${Math.floor(s.lat / BIN)}:${Math.floor(s.lon / BIN)}`;
    const b = map.get(key) || { key, n: 0, lat: 0, lon: 0, regions: {}, y0: null, y1: null };
    b.n += 1; b.lat += s.lat; b.lon += s.lon;
    if (s.region) b.regions[s.region] = (b.regions[s.region] || 0) + 1;
    if (s.year) { b.y0 = Math.min(b.y0 ?? s.year, s.year); b.y1 = Math.max(b.y1 ?? s.year, s.year); }
    map.set(key, b);
  });
  return [...map.values()].map((b) => ({
    ...b, lat: b.lat / b.n, lon: b.lon / b.n,
    region: Object.entries(b.regions).sort((a, c) => c[1] - a[1])[0]?.[0] || null,
  })).sort((a, b) => a.n - b.n); // biggest drawn last, on top
}

function rankRegions(rows) {
  const counts = {};
  rows.forEach((s) => { const k = s.region || "Unnamed area"; counts[k] = (counts[k] || 0) + 1; });
  return Object.entries(counts).map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n);
}

function computeInsights(climate, months) {
  if (!climate) return null;
  const m = climate.months;
  const warm = m.reduce((a, b) => (b.high > a.high ? b : a));
  const cool = m.reduce((a, b) => (b.high < a.high ? b : a));
  const minLow = Math.min(...m.map((x) => x.min));
  return {
    warmHigh: warm.high, warmMonth: months[warm.month - 1],
    coolHigh: cool.high, coolMonth: months[cool.month - 1],
    minLow: Math.ceil(minLow) === 0 ? 0 : Math.ceil(minLow),
  };
}

/* ---------- components ---------- */
function Segmented({ label, value, onChange, options, disabled, hint }) {
  return (
    <div className={`seg${disabled ? " seg--off" : ""}`}>
      <span className="mono">{label}</span>
      <div className="seg__opts" role="radiogroup" aria-label={label} aria-disabled={disabled || undefined}>
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} disabled={disabled}
            className={value === o.value ? "on" : ""} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
      {hint ? <span className="seg__hint">{hint}</span> : null}
    </div>
  );
}

function Stat({ label, value, note, accent }) {
  return (
    <div className={`stat${accent ? " stat--accent" : ""}`}>
      <span className="mono">{label}</span>
      <strong>{value}</strong>
      <span className="stat__note">{note}</span>
    </div>
  );
}

// Equirectangular projection, with longitude scaled by cos(41°) so New Zealand keeps its shape.
const LON0 = 166.2, LAT0 = -34.2, KY = 44, KX = KY * Math.cos((41 * Math.PI) / 180);
const px = (lon) => 6 + (lon - LON0) * KX;
const py = (lat) => 6 + (LAT0 - lat) * KY;
const MAP_W = Math.ceil(px(178.8)) + 6, MAP_H = Math.ceil(py(-47.4)) + 6;
const COAST = NZ_RINGS.map((ring) => `M${ring.map(([lon, lat]) => `${px(lon).toFixed(1)},${py(lat).toFixed(1)}`).join("L")}Z`).join("");
const KM_PER_DEG = 111.32;

function NZMap({ bins, region, dist, onHover, language }) {
  return (
    <div className="gw-map">
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="group"
        aria-label={tr(language, "mapAria", "Map of New Zealand with {count} clusters of glowworm records", { count: num(bins.length, language) })}>
        <defs>
          <filter id="gw-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
        </defs>
        <path d={COAST} className="gw-coast" />
        {dist ? (
          <ellipse cx={px(WAITOMO.lon)} cy={py(WAITOMO.lat)} className="gw-radius" aria-hidden="true"
            rx={(dist / (KM_PER_DEG * Math.cos((WAITOMO.lat * Math.PI) / 180))) * KX} ry={(dist / KM_PER_DEG) * KY} />
        ) : null}
        {bins.map((b) => {
          const r = 1.8 + Math.sqrt(b.n) * 1.5;
          const dim = region && b.region !== region;
          const name = b.region || tr(language, "unnamed", "Unnamed area");
          return (
            <g key={b.key} className={`gw-bin${dim ? " dim" : ""}`} tabIndex={dim ? -1 : 0} role="img"
              aria-label={tr(language, "regionAria", "{name}: {count} records", { name, count: num(b.n, language) })}
              onMouseEnter={() => onHover(b)} onFocus={() => onHover(b)}
              onMouseLeave={() => onHover(null)} onBlur={() => onHover(null)}>
              <circle cx={px(b.lon)} cy={py(b.lat)} r={r + 5} className="gw-halo" filter="url(#gw-glow)" />
              <circle cx={px(b.lon)} cy={py(b.lat)} r={r} className="gw-core" />
            </g>
          );
        })}
        <g aria-hidden="true">
          <circle cx={px(WAITOMO.lon)} cy={py(WAITOMO.lat)} r={11} className="gw-waitomo" />
          <text x={px(WAITOMO.lon) - 16} y={py(WAITOMO.lat) + 4} className="gw-label" textAnchor="end">Waitomo</text>
        </g>
      </svg>
    </div>
  );
}

function RegionList({ regions, rate, selected, onPick, language }) {
  if (!regions.length) return <p className="muted pad">{tr(language, "noRecordsMatch", "No records match these filters.")}</p>;
  const max = rate ? Math.max(...regions.map((r) => r.rate.hi)) : regions[0].n;
  return (
    <ol className="gw-regions">
      {regions.map((r) => {
        const low = rate && r.n < LOW_N;
        const unnamed = r.name === "Unnamed area";
        const label = rate
          ? tr(language, "regionRateAria", "{name}: {v} per 100k observations, 95% interval {lo} to {hi}, {n} records", {
            name: r.name, v: fmtRate(r.rate.v, language), lo: fmtRate(r.rate.lo, language), hi: fmtRate(r.rate.hi, language), n: r.n,
          })
          : undefined;
        return (
          <li key={r.name}>
            <button type="button" aria-pressed={selected === r.name} aria-label={label}
              className={`${selected === r.name ? "on" : ""}${low ? " low" : ""}`}
              disabled={unnamed} onClick={() => onPick(r.name)}>
              <span className="gw-regions__name">{unnamed ? tr(language, "unnamed", "Unnamed area") : r.name}{r.name === "Waikato" ? " · Waitomo" : ""}</span>
              <span className="gw-regions__bar">
                <i style={{ width: `${((rate ? r.rate.v : r.n) / max) * 100}%` }} />
                {rate && <b className="gw-ci" style={{ left: `${(r.rate.lo / max) * 100}%`, width: `${((r.rate.hi - r.rate.lo) / max) * 100}%` }} />}
              </span>
              <span className="gw-regions__n">{rate ? fmtRate(r.rate.v, language) : r.n}{low ? <small> n={r.n}</small> : null}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function SeasonChart({ climate, values, labels, rows, rate, selected, onPick, onHover, months, language }) {
  const W = 760, L = 44, R = 8, col = (W - L - R) / 12;
  const T = { top: 12, bottom: 150, lo: -5, hi: 30 };
  const RAIN = { top: 186, bottom: 236 }, REC = { top: 268, bottom: 330 };
  const H = REC.bottom + 22;
  const ty = (v) => T.bottom - ((v - T.lo) / (T.hi - T.lo)) * (T.bottom - T.top);
  const maxRain = Math.max(...climate.map((c) => c.rain), 1);
  const maxRec = Math.max(...(rate ? rows.map((r) => r.rate?.hi ?? 0) : values), 1);
  const ry = (v) => REC.bottom - (v / maxRec) * (REC.bottom - REC.top);
  const cx = (i) => L + i * col + col / 2;
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={tr(language, "climateChartAria", "Monthly temperature, rain, and glowworm records at Waitomo")}>
        {[0, 10, 20, 30].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={ty(v)} y2={ty(v)} className="grid" />
            <text x={L - 8} y={ty(v) + 4} className="axis" textAnchor="end">{v}°</text>
          </g>
        ))}
        <text x={L - 8} y={RAIN.top - 6} className="axis" textAnchor="end">{tr(language, "humidityShort", "RH")}</text>
        <text x={L - 8} y={RAIN.top + 14} className="axis" textAnchor="end">{tr(language, "rain", "rain")}</text>
        <text x={L - 8} y={REC.top + 8} className="axis" textAnchor="end">{rate ? tr(language, "rateAxis", "rate") : tr(language, "recordsShort", "recs")}</text>
        {climate.map((c, i) => {
          const m = i + 1, on = selected === m;
          const rainH = (c.rain / maxRain) * (RAIN.bottom - RAIN.top);
          const ci = rate ? rows[i].rate : null;
          return (
            <g key={m} className={`gw-col${on ? " on" : ""}${selected && !on ? " off" : ""}`} tabIndex={0} role="button"
              aria-pressed={on}
              aria-label={tr(language, "monthTooltipValue", "{month}: highs {high} degrees, lows {low}, {humidity}% humidity, {rain} millimetres of rain, {value} glowworm {unit}. Filter the map to {month}.", {
                month: months[i], high: c.high, low: c.low, humidity: c.humidity, rain: c.rain, value: labels[i],
                unit: rate ? tr(language, "unitRate", "records per 100k observations") : tr(language, "recordMany", "records"),
              })}
              onClick={() => onPick(m)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(m); } }}
              onMouseEnter={() => onHover(m)} onFocus={() => onHover(m)} onMouseLeave={() => onHover(null)} onBlur={() => onHover(null)}>
              <rect x={L + i * col} y={2} width={col} height={H - 4} className="gw-col__hit" rx={8} />
              <line x1={cx(i)} x2={cx(i)} y1={ty(c.max)} y2={ty(c.min)} className="gw-ext" />
              <rect x={cx(i) - 9} y={ty(c.high)} width={18} height={ty(c.low) - ty(c.high)} rx={9} className="gw-temp" />
              <text x={cx(i)} y={RAIN.top - 10} className="axis" textAnchor="middle">{Math.round(c.humidity)}%</text>
              <rect x={cx(i) - 11} y={RAIN.bottom - rainH} width={22} height={rainH} rx={3} className="gw-rain" />
              <text x={cx(i)} y={REC.top - 6} className="gw-val" textAnchor="middle">{labels[i]}</text>
              <rect x={cx(i) - 11} y={ry(values[i])} width={22} height={Math.max(REC.bottom - ry(values[i]), 1.5)} rx={3} className="gw-rec" />
              {ci && <line x1={cx(i)} x2={cx(i)} y1={ry(ci.hi)} y2={ry(ci.lo)} className="gw-whisker" />}
              <text x={cx(i)} y={H - 6} className="axis" textAnchor="middle">{months[i].slice(0, 3)}</text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

function YearChart({ buckets, rate, test, language }) {
  const W = 760, H = 200, L = 34, R = 8, T = 18, B = 26;
  const val = (b) => (rate ? b.rate?.v ?? 0 : b.n);
  const max = Math.max(...buckets.map((b) => (rate ? b.rate?.hi ?? 0 : b.n)), 1);
  const bw = (W - L - R) / buckets.length;
  const y = (v) => T + (1 - v / max) * (H - T - B);
  const last = buckets[buckets.length - 1].sample;
  const [hover, setHover] = useState(null);
  const yearName = (b) => (b.label === "<2000" ? tr(language, "before2000", "Before 2000") : b.label);
  const describe = (b) => (rate
    ? tr(language, "yearRateText", "{v} per 100k ({n} records)", { v: fmtRate(b.rate?.v, language), n: num(b.n, language) })
    : `${num(b.n, language)} ${tr(language, b.n === 1 ? "recordOne" : "recordMany", b.n === 1 ? "record" : "records")}`);
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={rate ? tr(language, "yearsRateAria", "Glowworm reporting rate per year") : tr(language, "yearsChartAria", "Glowworm records per year")}>
        <line x1={L} x2={W - R} y1={H - B} y2={H - B} className="grid" />
        <text x={L - 6} y={y(max) + 4} className="axis" textAnchor="end">{rate ? fmtRate(max, language) : max}</text>
        <text x={L - 6} y={H - B + 4} className="axis" textAnchor="end">0</text>
        {buckets.map((b, i) => {
          const inRange = test(b.sample);
          const ci = rate && b.n ? b.rate : null;
          return (
            <g key={b.label} tabIndex={0} role="img" aria-label={`${yearName(b)}: ${describe(b)}`}
              onMouseEnter={() => setHover(b)} onFocus={() => setHover(b)} onMouseLeave={() => setHover(null)} onBlur={() => setHover(null)}
              className="gw-year">
              <rect x={L + i * bw + 2} y={y(val(b))} width={bw - 4} height={Math.max(H - B - y(val(b)), b.n ? 1.5 : 0)} rx={3}
                className={inRange ? "gw-rec" : "gw-rec off"} />
              {ci && <line x1={L + i * bw + bw / 2} x2={L + i * bw + bw / 2} y1={y(ci.hi)} y2={y(ci.lo)} className="gw-whisker" />}
              {(i === 0 || b.sample % 5 === 0 || b.sample === last) && (
                <text x={L + i * bw + bw / 2} y={H - 8} className="axis" textAnchor="middle">{b.label}</text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="readout" aria-live="polite">
        {hover
          ? <><strong>{yearName(hover)}</strong> · {describe(hover)}</>
          : tr(language, "yearHover", "Hover or focus a bar for its count.")}
      </p>
    </figure>
  );
}
