import { useEffect, useMemo, useState } from "react";
import {
  CROSSINGS, LANES, DAY_NAMES, MONTHS, borderNow, fetchLive, fetchToday, fetchHistorical, fetchSnapshot, toGrid, hourLabel,
} from "./api.js";

const DAYTIME = [6, 22]; // 6 am – 10 pm: hours when both crossings are open
const STEPS = [
  { max: 15, label: "≤ 15", color: "var(--h1)" },
  { max: 30, label: "16–30", color: "var(--h2)" },
  { max: 45, label: "31–45", color: "var(--h3)" },
  { max: 60, label: "46–60", color: "var(--h4)" },
  { max: 90, label: "61–90", color: "var(--h5)" },
  { max: Infinity, label: "90+", color: "var(--h6)" },
];
const colorFor = (v) => (v == null ? "var(--h0)" : STEPS.find((s) => v <= s.max).color);
const mins = (v) => (v == null ? "—" : `${Math.round(v)} min`);

export default function BorderDay() {
  const now = useMemo(borderNow, []);
  const [crossing, setCrossing] = useState(CROSSINGS[0].id);
  const [laneId, setLaneId] = useState("car");
  const [month, setMonth] = useState(now.month);
  const [live, setLive] = useState({ status: "loading" });
  const [today, setToday] = useState({ status: "loading" });
  const [hist, setHist] = useState({ status: "loading" });
  const [snapshot, setSnapshot] = useState(null);
  const [hover, setHover] = useState(null);

  const lane = LANES.find((l) => l.id === laneId);
  const cross = CROSSINGS.find((c) => c.id === crossing);

  useEffect(() => { fetchSnapshot().then(setSnapshot).catch(() => setSnapshot(null)); }, []);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetchLive().then((d) => alive && setLive({ status: "ok", data: d })).catch(() => alive && setLive({ status: "error" }));
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  useEffect(() => {
    let alive = true;
    setToday({ status: "loading" });
    fetchToday(crossing, now.iso)
      .then((d) => alive && setToday({ status: "ok", data: d }))
      .catch(() => alive && setToday({ status: "error" }));
    return () => { alive = false; };
  }, [crossing, now.iso]);

  useEffect(() => {
    let alive = true;
    setHist({ status: "loading" });
    fetchHistorical(crossing, month)
      .then((rows) => {
        if (!alive) return;
        if (rows.length) setHist({ status: "ok", rows, live: true });
        else throw new Error("empty");
      })
      .catch(() => {
        if (!alive) return;
        const rows = snapshot?.historical?.[crossing]?.[month];
        setHist(rows ? { status: "ok", rows, live: false } : { status: "error" });
      });
    return () => { alive = false; };
  }, [crossing, month, snapshot]);

  const grid = useMemo(() => (hist.status === "ok" ? toGrid(hist.rows, lane.hist) : null), [hist, lane]);
  const insights = useMemo(() => (grid ? computeInsights(grid, now.weekday) : null), [grid, now.weekday]);
  const monthly = useMemo(() => {
    const h = snapshot?.historical?.[crossing];
    if (!h) return null;
    return MONTHS.map((_, i) => {
      const g = toGrid(h[i + 1] || [], lane.hist);
      return { month: i + 1, value: daytimeMean(g) };
    });
  }, [snapshot, crossing, lane]);

  const liveLane = live.status === "ok" ? pick(live.data[cross.port], lane.live) : null;
  const todaySlots = today.status === "ok" ? today.data[lane.graph[0]] : null;
  const nowSlot = todaySlots?.find((s) => Number(s.time) === now.hour);
  const nowToday = nowSlot ? Number(nowSlot[`${lane.graph[1]}_today_wait`]) : null;
  const nowTypical = nowSlot ? Number(nowSlot[`${lane.graph[1]}_average_wait`]) : null;

  return (
    <div className="viz">
      {/* Controls */}
      <div className="controls" role="group" aria-label="Choose crossing and lane">
        <Segmented label="Crossing" value={crossing} onChange={setCrossing}
          options={CROSSINGS.map((c) => ({ value: c.id, label: c.name }))} />
        <Segmented label="Lane" value={laneId} onChange={setLaneId}
          options={LANES.map((l) => ({ value: l.id, label: l.label }))} />
        <label className="select">
          <span className="mono">Month</span>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </label>
      </div>

      {/* Headline numbers */}
      <section className="stats" aria-label="Key numbers">
        <Stat label="Right now" value={liveLane?.delay_minutes ? `${liveLane.delay_minutes} min` : live.status === "loading" ? "…" : "—"}
          note={liveLane ? `${liveLane.lanes_open || 0} lanes open · ${liveLane.update_time || "CBP live"}` : live.status === "error" ? "Live feed unavailable" : "Loading live feed"}
          accent />
        <Stat label="Typical at this hour" value={mins(nowTypical)}
          note={nowToday != null && nowTypical ? compare(nowToday, nowTypical) : `${DAY_NAMES[now.weekday]} · ${hourLabel(now.hour)}`} />
        <Stat label={`Best hour on ${DAY_NAMES[now.weekday]}s`} value={insights?.bestToday ? hourLabel(insights.bestToday.h) : "—"}
          note={insights?.bestToday ? `~${mins(insights.bestToday.v)} on average (6 am–10 pm)` : ""} />
        <Stat label="Least busy day" value={insights?.bestDay ? DAY_NAMES[insights.bestDay.d] : "—"}
          note={insights?.bestDay ? `${mins(insights.bestDay.v)} average daytime wait` : ""} />
      </section>

      {/* Heatmap */}
      <section className="card">
        <div className="card__head">
          <div>
            <h2>Average wait by day and hour</h2>
            <p className="muted">{cross.name} · {lane.label} · {MONTHS[month - 1]} historical averages{hist.status === "ok" && !hist.live ? " (saved snapshot)" : ""}</p>
          </div>
          <Legend />
        </div>
        {hist.status === "loading" && <p className="muted pad">Loading historical data…</p>}
        {hist.status === "error" && <p className="muted pad">Historical data is unavailable right now.</p>}
        {grid && <Heatmap grid={grid} now={month === now.month ? now : null} onHover={setHover} />}
        <p className="readout" aria-live="polite">
          {hover
            ? <><strong>{DAY_NAMES[hover.d]}, {hourLabel(hover.h)}</strong> — {hover.v == null ? "closed or no data" : `about ${mins(hover.v)}`}</>
            : <>Hover or focus a cell to see the average wait. The outlined cell is now.</>}
        </p>
      </section>

      <div className="two">
        {/* Today vs typical */}
        <section className="card">
          <div className="card__head">
            <div>
              <h2>Today vs. a typical {DAY_NAMES[now.weekday]}</h2>
              <p className="muted">{cross.name} · {lane.label} · {now.iso}</p>
            </div>
          </div>
          {today.status === "loading" && <p className="muted pad">Loading today's data…</p>}
          {today.status === "error" && <p className="muted pad">Today's data is unavailable right now.</p>}
          {todaySlots && <TodayChart slots={todaySlots} prefix={lane.graph[1]} hour={now.hour} />}
        </section>

        {/* Seasonality */}
        <section className="card">
          <div className="card__head">
            <div>
              <h2>Busiest months</h2>
              <p className="muted">Average daytime wait (6 am–10 pm) by month</p>
            </div>
          </div>
          {monthly ? <MonthChart data={monthly} current={month} onPick={setMonth} /> : <p className="muted pad">Loading…</p>}
        </section>
      </div>

      {/* Takeaways */}
      {insights && (
        <section className="card takeaways">
          <h2>What the data says</h2>
          <ul>
            <li><strong>Quietest daytime window:</strong> {DAY_NAMES[insights.best.d]} at {hourLabel(insights.best.h)}, about {mins(insights.best.v)}.</li>
            <li><strong>Busiest window:</strong> {DAY_NAMES[insights.worst.d]} at {hourLabel(insights.worst.h)}, about {mins(insights.worst.v)}.</li>
            <li><strong>On {DAY_NAMES[now.weekday]}s</strong>, waits range from {mins(insights.bestToday?.v)} at {hourLabel(insights.bestToday?.h ?? 0)} to {mins(insights.worstToday?.v)} at {hourLabel(insights.worstToday?.h ?? 0)}.</li>
            <li><strong>SENTRI matters:</strong> switch the lane above to compare. Trusted-traveler lanes are usually a fraction of the standard wait.</li>
          </ul>
        </section>
      )}

      <section className="method">
        <h2>Method &amp; sources</h2>
        <p>
          Data comes from the U.S. Customs and Border Protection <a href="https://bwt.cbp.gov/" rel="noopener">Border Wait Times</a> service.
          "Right now" uses the live feed (refreshed every five minutes). The heatmap shows CBP's historical average for each
          weekday and hour of the selected month. "Today" compares the hourly waits reported so far with the typical value for
          the same weekday. Times are Pacific Time, the local time in Mexicali and Calexico. Waits are northbound (Mexico → U.S.).
          If the live service is unreachable, the page falls back to a snapshot captured on{" "}
          {snapshot ? new Date(snapshot.capturedAt).toLocaleDateString("en-US", { dateStyle: "medium" }) : "build"}.
        </p>
      </section>
    </div>
  );
}

/* ---------- helpers ---------- */
function pick(obj, path) { return path.reduce((o, k) => (o ? o[k] : null), obj); }

function daytimeMean(grid) {
  const vals = [];
  grid.forEach((row) => row.forEach((v, h) => { if (v != null && h >= DAYTIME[0] && h <= DAYTIME[1]) vals.push(v); }));
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

function computeInsights(grid, weekday) {
  const cells = [];
  grid.forEach((row, d) => row.forEach((v, h) => { if (v != null && h >= DAYTIME[0] && h <= DAYTIME[1]) cells.push({ d, h, v }); }));
  if (!cells.length) return null;
  const byV = [...cells].sort((a, b) => a.v - b.v);
  const today = byV.filter((c) => c.d === weekday);
  const days = DAY_NAMES.map((_, d) => {
    const vs = cells.filter((c) => c.d === d).map((c) => c.v);
    return { d, v: vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : Infinity };
  }).sort((a, b) => a.v - b.v);
  return { best: byV[0], worst: byV[byV.length - 1], bestToday: today[0], worstToday: today[today.length - 1], bestDay: days[0] };
}

function compare(today, typical) {
  const diff = today - typical;
  if (Math.abs(diff) < 5) return `Today: ${today} min, about normal`;
  return `Today: ${today} min, ${Math.abs(Math.round(diff))} min ${diff > 0 ? "longer" : "shorter"} than usual`;
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

function Legend() {
  return (
    <div className="legend" aria-label="Color scale in minutes">
      {STEPS.map((s) => (
        <span key={s.label}><i style={{ background: s.color }} />{s.label}</span>
      ))}
      <span><i style={{ background: "var(--h0)" }} />Closed</span>
    </div>
  );
}

function Heatmap({ grid, now, onHover }) {
  const cw = 30, ch = 30, gap = 3, left = 92, top = 26;
  const width = left + 24 * (cw + gap), height = top + 7 * (ch + gap);
  return (
    <div className="heat">
      <svg viewBox={`0 0 ${width} ${height}`} role="grid" aria-label="Average wait in minutes by weekday and hour">
        {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
          <text key={h} x={left + h * (cw + gap) + cw / 2} y={14} className="axis" textAnchor="middle">{hourLabel(h)}</text>
        ))}
        {grid.map((row, d) => (
          <g key={d} role="row">
            <text x={left - 12} y={top + d * (ch + gap) + ch / 2 + 4} className="axis" textAnchor="end">{DAY_NAMES[d].slice(0, 3)}</text>
            {row.map((v, h) => {
              const isNow = now && now.weekday === d && now.hour === h;
              return (
                <rect key={h} role="gridcell" tabIndex={0}
                  aria-label={`${DAY_NAMES[d]} ${hourLabel(h)}: ${v == null ? "closed or no data" : `${Math.round(v)} minutes`}`}
                  x={left + h * (cw + gap)} y={top + d * (ch + gap)} width={cw} height={ch} rx={5}
                  fill={colorFor(v)} className={isNow ? "cell now" : "cell"}
                  onMouseEnter={() => onHover({ d, h, v })} onFocus={() => onHover({ d, h, v })}
                  onMouseLeave={() => onHover(null)} onBlur={() => onHover(null)} />
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

function TodayChart({ slots, prefix, hour }) {
  const W = 560, H = 240, L = 36, R = 12, T = 14, B = 28;
  const pts = Array.from({ length: 24 }, (_, h) => {
    const s = slots.find((x) => Number(x.time) === h) || {};
    const n = (k) => { const v = Number(s[`${prefix}_${k}`]); return Number.isFinite(v) ? v : 0; };
    return { h, today: h <= hour ? n("today_wait") : null, avg: n("average_wait"), min: n("min_wait"), max: n("max_wait") };
  });
  const maxV = Math.max(30, ...pts.map((p) => Math.max(p.max, p.today || 0)));
  const top = Math.ceil(maxV / 30) * 30;
  const x = (h) => L + (h / 23) * (W - L - R);
  const y = (v) => T + (1 - v / top) * (H - T - B);
  const line = (key) => pts.filter((p) => p[key] != null).map((p, i) => `${i ? "L" : "M"}${x(p.h)},${y(p[key])}`).join(" ");
  const band = `M${pts.map((p) => `${x(p.h)},${y(p.max)}`).join(" L")} L${[...pts].reverse().map((p) => `${x(p.h)},${y(p.min)}`).join(" L")} Z`;
  const ticks = Array.from({ length: top / 30 + 1 }, (_, i) => i * 30);
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Hourly waits today compared with the typical average. Current hour ${hourLabel(hour)}.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="grid" />
            <text x={L - 8} y={y(t) + 4} className="axis" textAnchor="end">{t}</text>
          </g>
        ))}
        {[0, 6, 12, 18, 23].map((h) => <text key={h} x={x(h)} y={H - 8} className="axis" textAnchor="middle">{hourLabel(h)}</text>)}
        <path d={band} className="band" />
        <path d={line("avg")} className="avg" />
        <path d={line("today")} className="today" />
        <line x1={x(hour)} x2={x(hour)} y1={T} y2={H - B} className="nowline" />
        {pts[hour]?.today != null && <circle cx={x(hour)} cy={y(pts[hour].today)} r={5} className="dot" />}
      </svg>
      <figcaption className="keys">
        <span><i className="k-today" />Today</span>
        <span><i className="k-avg" />Typical average</span>
        <span><i className="k-band" />Typical range</span>
        <span className="muted">Minutes</span>
      </figcaption>
    </figure>
  );
}

function MonthChart({ data, current, onPick }) {
  const max = Math.max(...data.map((d) => d.value || 0), 1);
  const worst = data.reduce((a, b) => ((b.value || 0) > (a.value || 0) ? b : a));
  return (
    <div className="months" role="list">
      {data.map((d) => (
        <button key={d.month} role="listitem" type="button"
          className={`m${d.month === current ? " on" : ""}${d.month === worst.month ? " peak" : ""}`}
          onClick={() => onPick(d.month)} aria-label={`${MONTHS[d.month - 1]}: ${mins(d.value)} average. Show in heatmap.`}>
          <span className="m__val">{d.value ? Math.round(d.value) : "—"}</span>
          <span className="m__bar" style={{ height: `${((d.value || 0) / max) * 100}%` }} />
          <span className="m__lbl">{MONTHS[d.month - 1].slice(0, 3)}</span>
        </button>
      ))}
    </div>
  );
}
