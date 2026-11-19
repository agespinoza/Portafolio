import { useEffect, useMemo, useState } from "react";
import {
  SIGHTINGS, NZ_RINGS, SNAPSHOT_DATE, MONTHS, WAITOMO, fetchRecordCount, fetchWeatherNow, loadClimate, kmBetween,
} from "./api.js";

const ISLANDS = [
  { value: "all", label: "Both islands" },
  { value: "North", label: "North Island" },
  { value: "South", label: "South Island" },
];
const PERIODS = [
  { value: "all", label: "All years", test: () => true },
  { value: "recent", label: "2016 onward", test: (y) => y != null && y >= 2016 },
  { value: "early", label: "Before 2016", test: (y) => y != null && y < 2016 },
];
const NEAR_KM = 25;
const BIN = 0.25; // map grid size in degrees
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-US", { dateStyle: "medium" });
const num = (n) => n.toLocaleString("en-US");
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : "—");

export default function GlowwormDay() {
  const [island, setIsland] = useState("all");
  const [period, setPeriod] = useState("all");
  const [month, setMonth] = useState(0); // 0 = all months
  const [region, setRegion] = useState(null);
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
    const t = setInterval(load, 15 * 60 * 1000);
    fetchRecordCount().then((n) => alive && setCount(n)).catch(() => {});
    loadClimate().then((c) => alive && setClimate(c));
    return () => { alive = false; clearInterval(t); };
  }, []);

  // Cross-filtering: each chart ignores its own filter so you can still see the alternatives.
  const per = PERIODS.find((p) => p.value === period);
  const keep = (s, skip) =>
    (skip === "island" || island === "all" || s.island === island) &&
    (skip === "period" || per.test(s.year)) &&
    (skip === "month" || !month || s.month === month) &&
    (skip === "region" || !region || s.region === region);

  const shown = useMemo(() => SIGHTINGS.filter((s) => keep(s)), [island, period, month, region]);
  const forMonths = useMemo(() => SIGHTINGS.filter((s) => keep(s, "month")), [island, period, region]);
  const forYears = useMemo(() => SIGHTINGS.filter((s) => keep(s, "period")), [island, month, region]);
  const forRegions = useMemo(() => SIGHTINGS.filter((s) => keep(s, "region")), [island, period, month]);

  const bins = useMemo(() => binSightings(forRegions), [forRegions]);
  const regions = useMemo(() => rankRegions(forRegions), [forRegions]);
  const monthly = useMemo(() => MONTHS.map((_, i) => forMonths.filter((s) => s.month === i + 1).length), [forMonths]);
  const near = shown.filter((s) => kmBetween(s, WAITOMO) <= NEAR_KM).length;
  const shownRegions = new Set(shown.map((s) => s.region).filter(Boolean));
  const insights = useMemo(() => computeInsights(climate), [climate]);

  const w = weather.status === "ok" ? weather.data : null;
  const filtersOn = island !== "all" || period !== "all" || month || region;
  const reset = () => { setIsland("all"); setPeriod("all"); setMonth(0); setRegion(null); };

  return (
    <div className="viz">
      {/* Controls */}
      <div className="controls" role="group" aria-label="Filter glowworm records">
        <Segmented label="Island" value={island} onChange={(v) => { setIsland(v); setRegion(null); }} options={ISLANDS} />
        <Segmented label="Period" value={period} onChange={setPeriod} options={PERIODS} />
        <label className="select">
          <span className="mono">Month</span>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            <option value={0}>All months</option>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </label>
        {filtersOn ? <button type="button" className="gw-reset" onClick={reset}>Clear filters</button> : null}
      </div>

      {/* Headline numbers */}
      <section className="stats" aria-label="Key numbers">
        <Stat accent label="Outside the caves now"
          value={w ? `${Math.round(w.temp)}°C` : weather.status === "loading" ? "…" : "—"}
          note={w ? `${w.humidity}% humidity · ${w.isDay ? "daytime" : "night"} in Waitomo` : weather.status === "error" ? "Live weather unavailable" : "Loading Open-Meteo"} />
        <Stat label="Records on the map" value={num(shown.length)}
          note={count != null ? `GBIF lists ${num(count)} today · map from ${fmtDate(SNAPSHOT_DATE)}` : `Snapshot from ${fmtDate(SNAPSHOT_DATE)}`} />
        <Stat label="Regions" value={shownRegions.size}
          note={regions[0] ? `Most records: ${regions[0].name} (${regions[0].n})` : "No records match"} />
        <Stat label="Near Waitomo" value={num(near)}
          note={`within ${NEAR_KM} km of the caves · ${pct(near, shown.length)} of records`} />
      </section>

      {/* Map + regions */}
      <div className="two">
        <section className="card gw-sky">
          <div className="card__head">
            <div>
              <h2>Where people have recorded glowworms</h2>
              <p className="gw-sub">Each point groups records within about 25 km. Bigger and brighter means more records.</p>
            </div>
          </div>
          <NZMap bins={bins} region={region} onHover={setHoverBin} />
          <p className="readout gw-readout" aria-live="polite">
            {hoverBin
              ? <><strong>{hoverBin.region || "Unnamed area"}</strong> · {hoverBin.n} record{hoverBin.n > 1 ? "s" : ""}
                {hoverBin.y0 ? ` · ${hoverBin.y0 === hoverBin.y1 ? hoverBin.y0 : `${hoverBin.y0}–${hoverBin.y1}`}` : ""}
                {` · ${Math.round(kmBetween(hoverBin, WAITOMO))} km from Waitomo`}</>
              : <>Hover or focus a point to see its records. The copper ring marks the Waitomo Caves.</>}
          </p>
        </section>

        <section className="card">
          <div className="card__head">
            <div>
              <h2>Records by region</h2>
              <p className="muted">Click a region to light it up on the map.</p>
            </div>
          </div>
          <RegionList regions={regions} selected={region} onPick={(r) => setRegion(region === r ? null : r)} />
        </section>
      </div>

      {/* Climate vs sightings */}
      <section className="card">
        <div className="card__head">
          <div>
            <h2>Waitomo's seasons outside, and when people find glowworms</h2>
            <p className="muted">
              {climate ? `Monthly averages at Waitomo, ${climate.years[0]}–${climate.years[1]}${climate.live ? "" : " (saved snapshot)"}` : "Loading climate…"}
              {" "}· Glowworm records by month for the current filters. Click a month to filter the map.
            </p>
          </div>
          <div className="keys gw-keys">
            <span><i className="gw-k-temp" />Avg. low–high</span>
            <span><i className="gw-k-ext" />Coldest–hottest day</span>
            <span><i className="gw-k-rain" />Rain</span>
            <span><i className="gw-k-rec" />Records</span>
          </div>
        </div>
        {climate
          ? <SeasonChart climate={climate.months} records={monthly} selected={month}
              onPick={(m) => setMonth(month === m ? 0 : m)} onHover={setHoverMonth} />
          : <p className="muted pad">Loading climate data…</p>}
        <p className="readout" aria-live="polite">
          {hoverMonth && climate
            ? (() => {
              const c = climate.months[hoverMonth - 1];
              return <><strong>{MONTHS[hoverMonth - 1]}</strong> · highs {c.high}°C, lows {c.low}°C (extremes {c.min}° to {c.max}°) · {c.humidity}% humidity · {c.rain} mm rain · {monthly[hoverMonth - 1]} glowworm records</>;
            })()
            : <>Inside the cave, the air stays cool and damp all year. Outside, it swings from frost to summer heat.</>}
        </p>
      </section>

      {/* Years */}
      <section className="card">
        <div className="card__head">
          <div>
            <h2>Records by year</h2>
            <p className="muted">Highlighted bars match the selected period. Records before 2000 are grouped together.</p>
          </div>
        </div>
        <YearChart rows={forYears} test={per.test} />
      </section>

      {/* Takeaways */}
      <section className="card takeaways">
        <h2>What the data says</h2>
        <ul>
          <li><strong>Waitomo is famous, but not the top region.</strong> {regionTakeaway()}</li>
          <li><strong>Mostly a North Island story:</strong> {pct(SIGHTINGS.filter((s) => s.island === "North").length, SIGHTINGS.length)} of
            records are from the North Island, but the South Island's West Coast alone has {SIGHTINGS.filter((s) => s.region === "West Coast").length}.</li>
          <li><strong>Phones changed the record:</strong> {pct(SIGHTINGS.filter((s) => s.year >= 2016).length, SIGHTINGS.length)} of
            records date from 2016 onward, nearly all from iNaturalist. The oldest are museum specimens from {Math.min(...SIGHTINGS.filter((s) => s.year).map((s) => s.year))}.</li>
          <li><strong>Busiest months for records:</strong> {busiestMonths()}. The larvae glow all year,
            so these peaks most likely follow when people are out exploring, not when glowworms shine brighter.</li>
          {insights && <li><strong>A big swing outside:</strong> average highs at Waitomo range from {insights.coolHigh}°C in {insights.coolMonth} to {insights.warmHigh}°C
            in {insights.warmMonth}, and the coldest nights fall below {insights.minLow}°C. The cave's stable air is what lets the larvae glow all year.</li>}
        </ul>
      </section>

      <section className="method">
        <h2>Method &amp; sources</h2>
        <p>
          Glowworm records are every georeferenced occurrence of <em>Arachnocampa luminosa</em> in New Zealand on{" "}
          <a href="https://www.gbif.org/species/1564326" rel="noopener">GBIF.org</a>, excluding records with geospatial issues. Most are
          iNaturalist research-grade observations, and a few are museum specimens. They show where people looked and reported,
          not how many glowworms live in each place, so popular trails and tourist caves stand out. Full records are large, so the map uses a
          snapshot captured on {fmtDate(SNAPSHOT_DATE)}, and the page checks GBIF's live total. Regions with no recorded name are assigned
          to an island by location. Weather comes from <a href="https://open-meteo.com/" rel="noopener">Open-Meteo</a> for the Waitomo
          Caves area: current conditions from the forecast API and monthly averages from the historical weather archive (ERA5 reanalysis).
          Cave monitoring at Waitomo has found only slight seasonal change and almost no day–night change inside the Glowworm Cave
          (<a href="https://ackma.org/Proceedings/proceed/18/18cross.html" rel="noopener">ACKMA proceedings</a>). Published cave
          temperatures vary by source, so this page does not chart one. Coastline: Natural Earth.
        </p>
      </section>
    </div>
  );
}

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

function regionTakeaway() {
  const ranked = rankRegions(SIGHTINGS);
  const waikato = ranked.find((r) => r.name === "Waikato");
  const top = ranked[0];
  if (!waikato || top.name === "Waikato") return `Waikato, home of the Waitomo Caves, leads with ${waikato?.n ?? 0} records.`;
  return `${top.name} has the most records (${top.n}), ahead of Waikato (${waikato.n}), home of the Waitomo Caves. Glowworm banks near cities get visited, and recorded, often.`;
}

function busiestMonths() {
  const counts = MONTHS.map((name, i) => ({ name, n: SIGHTINGS.filter((s) => s.month === i + 1).length }));
  const top = [...counts].sort((a, b) => b.n - a.n).slice(0, 2);
  const quiet = [...counts].sort((a, b) => a.n - b.n)[0];
  return `${top[0].name} (${top[0].n}) and ${top[1].name} (${top[1].n}) lead, while ${quiet.name} is the quietest (${quiet.n})`;
}

function computeInsights(climate) {
  if (!climate) return null;
  const m = climate.months;
  const warm = m.reduce((a, b) => (b.high > a.high ? b : a));
  const cool = m.reduce((a, b) => (b.high < a.high ? b : a));
  const minLow = Math.min(...m.map((x) => x.min));
  return {
    warmHigh: warm.high, warmMonth: MONTHS[warm.month - 1],
    coolHigh: cool.high, coolMonth: MONTHS[cool.month - 1],
    minLow: Math.ceil(minLow) === 0 ? 0 : Math.ceil(minLow),
  };
}

/* ---------- components ---------- */
function Segmented({ label, value, onChange, options }) {
  return (
    <div className="seg">
      <span className="mono">{label}</span>
      <div className="seg__opts" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value}
            className={value === o.value ? "on" : ""} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
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

function NZMap({ bins, region, onHover }) {
  return (
    <div className="gw-map">
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="group"
        aria-label={`Map of New Zealand with ${bins.length} clusters of glowworm records`}>
        <defs>
          <filter id="gw-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
        </defs>
        <path d={COAST} className="gw-coast" />
        {bins.map((b) => {
          const r = 1.8 + Math.sqrt(b.n) * 1.5;
          const dim = region && b.region !== region;
          return (
            <g key={b.key} className={`gw-bin${dim ? " dim" : ""}`} tabIndex={dim ? -1 : 0} role="img"
              aria-label={`${b.region || "Unnamed area"}: ${b.n} records`}
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

function RegionList({ regions, selected, onPick }) {
  if (!regions.length) return <p className="muted pad">No records match these filters.</p>;
  const max = regions[0].n;
  return (
    <ol className="gw-regions">
      {regions.map((r) => (
        <li key={r.name}>
          <button type="button" aria-pressed={selected === r.name} className={selected === r.name ? "on" : ""}
            disabled={r.name === "Unnamed area"} onClick={() => onPick(r.name)}>
            <span className="gw-regions__name">{r.name}{r.name === "Waikato" ? " · Waitomo" : ""}</span>
            <span className="gw-regions__bar"><i style={{ width: `${(r.n / max) * 100}%` }} /></span>
            <span className="gw-regions__n">{r.n}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}

function SeasonChart({ climate, records, selected, onPick, onHover }) {
  const W = 760, L = 44, R = 8, col = (W - L - R) / 12;
  const T = { top: 12, bottom: 150, lo: -5, hi: 30 };
  const RAIN = { top: 186, bottom: 236 }, REC = { top: 268, bottom: 330 };
  const H = REC.bottom + 22;
  const ty = (v) => T.bottom - ((v - T.lo) / (T.hi - T.lo)) * (T.bottom - T.top);
  const maxRain = Math.max(...climate.map((c) => c.rain), 1);
  const maxRec = Math.max(...records, 1);
  const cx = (i) => L + i * col + col / 2;
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Monthly temperature, rain, and glowworm records at Waitomo">
        {[0, 10, 20, 30].map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={ty(t)} y2={ty(t)} className="grid" />
            <text x={L - 8} y={ty(t) + 4} className="axis" textAnchor="end">{t}°</text>
          </g>
        ))}
        <text x={L - 8} y={RAIN.top - 6} className="axis" textAnchor="end">RH</text>
        <text x={L - 8} y={RAIN.top + 14} className="axis" textAnchor="end">rain</text>
        <text x={L - 8} y={REC.top + 8} className="axis" textAnchor="end">recs</text>
        {climate.map((c, i) => {
          const m = i + 1, on = selected === m;
          const rainH = (c.rain / maxRain) * (RAIN.bottom - RAIN.top);
          const recH = (records[i] / maxRec) * (REC.bottom - REC.top);
          return (
            <g key={m} className={`gw-col${on ? " on" : ""}${selected && !on ? " off" : ""}`} tabIndex={0} role="button"
              aria-pressed={on}
              aria-label={`${MONTHS[i]}: highs ${c.high} degrees, lows ${c.low}, ${c.humidity}% humidity, ${c.rain} millimetres of rain, ${records[i]} glowworm records. Filter the map to ${MONTHS[i]}.`}
              onClick={() => onPick(m)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(m); } }}
              onMouseEnter={() => onHover(m)} onFocus={() => onHover(m)} onMouseLeave={() => onHover(null)} onBlur={() => onHover(null)}>
              <rect x={L + i * col} y={2} width={col} height={H - 4} className="gw-col__hit" rx={8} />
              <line x1={cx(i)} x2={cx(i)} y1={ty(c.max)} y2={ty(c.min)} className="gw-ext" />
              <rect x={cx(i) - 9} y={ty(c.high)} width={18} height={ty(c.low) - ty(c.high)} rx={9} className="gw-temp" />
              <text x={cx(i)} y={RAIN.top - 10} className="axis" textAnchor="middle">{Math.round(c.humidity)}%</text>
              <rect x={cx(i) - 11} y={RAIN.bottom - rainH} width={22} height={rainH} rx={3} className="gw-rain" />
              <text x={cx(i)} y={REC.top - 6} className="gw-val" textAnchor="middle">{records[i]}</text>
              <rect x={cx(i) - 11} y={REC.bottom - recH} width={22} height={Math.max(recH, 1.5)} rx={3} className="gw-rec" />
              <text x={cx(i)} y={H - 6} className="axis" textAnchor="middle">{MONTHS[i].slice(0, 3)}</text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

function YearChart({ rows, test }) {
  const years = rows.map((s) => s.year).filter(Boolean);
  const last = Math.max(2000, ...years);
  const buckets = [{ label: "<2000", n: 0, sample: 1999 }];
  for (let y = 2000; y <= last; y++) buckets.push({ label: String(y), n: 0, sample: y });
  years.forEach((y) => { (y < 2000 ? buckets[0] : buckets[y - 1999]).n += 1; });
  const W = 760, H = 200, L = 34, R = 8, T = 18, B = 26;
  const max = Math.max(...buckets.map((b) => b.n), 1);
  const bw = (W - L - R) / buckets.length;
  const y = (v) => T + (1 - v / max) * (H - T - B);
  const [hover, setHover] = useState(null);
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Glowworm records per year">
        <line x1={L} x2={W - R} y1={H - B} y2={H - B} className="grid" />
        <text x={L - 6} y={y(max) + 4} className="axis" textAnchor="end">{max}</text>
        <text x={L - 6} y={H - B + 4} className="axis" textAnchor="end">0</text>
        {buckets.map((b, i) => {
          const inPeriod = test(b.sample);
          return (
            <g key={b.label} tabIndex={0} role="img" aria-label={`${b.label === "<2000" ? "Before 2000" : b.label}: ${b.n} records`}
              onMouseEnter={() => setHover(b)} onFocus={() => setHover(b)} onMouseLeave={() => setHover(null)} onBlur={() => setHover(null)}
              className="gw-year">
              <rect x={L + i * bw + 2} y={y(b.n)} width={bw - 4} height={Math.max(H - B - y(b.n), b.n ? 1.5 : 0)} rx={3}
                className={inPeriod ? "gw-rec" : "gw-rec off"} />
              {(i === 0 || b.sample % 5 === 0 || b.sample === last) && (
                <text x={L + i * bw + bw / 2} y={H - 8} className="axis" textAnchor="middle">{b.label}</text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="readout" aria-live="polite">
        {hover
          ? <><strong>{hover.label === "<2000" ? "Before 2000" : hover.label}</strong> · {hover.n} record{hover.n === 1 ? "" : "s"}</>
          : <>Hover or focus a bar for its count.</>}
      </p>
    </figure>
  );
}
