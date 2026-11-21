import { useMemo, useState } from "react";
import { project } from "../day-003-light-pillars/WorldMap";
import { LAND_RINGS } from "../day-003-light-pillars/data";
import { type Lake, type Series, type Trend, ABRAHAM_ID, lakeName } from "./data";
import { tr, fmt1, fmt0, num, signed } from "./text";

/* ---------- shared scales ---------- */
/** Diverging color for a winter trend in °C per decade: teal = cooling, copper/red = warming. */
export function slopeColor(slope: number | undefined): string {
  if (slope == null) return "var(--ink-3)";
  if (slope <= -0.2) return "var(--dn2)";
  if (slope < -0.05) return "var(--dn1)";
  if (slope <= 0.05) return "var(--d0)";
  if (slope < 0.4) return "var(--dp1)";
  return "var(--dp2)";
}
export const SLOPE_LEGEND = [
  { label: "≤ −0.2", color: "var(--dn2)" },
  { label: "−0.2…−0.05", color: "var(--dn1)" },
  { label: "±0.05", color: "var(--d0)" },
  { label: "0.05…0.4", color: "var(--dp1)" },
  { label: "≥ 0.4", color: "var(--dp2)" },
];

/* ---------- world map ---------- */
const LAND = LAND_RINGS.map((ring) => {
  let prev = ring[0][0], shift = 0;
  const pts = ring.map(([lon, lat]) => {
    if (lon - prev > 180) shift -= 360; else if (prev - lon > 180) shift += 360;
    prev = lon;
    return project(lon + shift, lat);
  });
  return `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z`;
}).join("");
const [X0] = project(-180, 0), [X1] = project(180, 0);
const [, YN] = project(0, 84), [, YS] = project(0, -58);

export function LakeMap({ lakes, trends, selected, onSelect, language }: {
  lakes: Lake[]; trends: Map<number, Trend>; selected: number; onSelect: (id: number) => void; language: string;
}) {
  const [hover, setHover] = useState<Lake | null>(null);
  const maxArea = Math.max(...lakes.map((l) => l.area), 1);
  const r = (l: Lake) => 2 + Math.sqrt(l.area / maxArea) * 9;
  const sel = lakes.find((l) => l.id === selected);
  const ordered = useMemo(() => [...lakes].sort((a, b) => b.area - a.area), [lakes]);
  const info = hover ?? sel ?? null;
  const t = info ? trends.get(info.id) : undefined;
  return (
    <figure className="chart al-map">
      <svg viewBox={`${X0} ${YN} ${X1 - X0} ${YS - YN}`} role="group"
        aria-label={tr(language, "mapAria", "World map of {count} large lakes colored by their winter warming trend", { count: num(lakes.length, language) })}>
        <path d={LAND} className="al-land" />
        {ordered.map((l) => {
          const [x, y] = project(l.lon, l.lat);
          const tt = trends.get(l.id);
          return (
            <circle key={l.id} cx={x} cy={y} r={r(l)} tabIndex={0} role="button"
              className={`al-dot${tt ? "" : " al-dot--pending"}${l.id === selected ? " on" : ""}`}
              style={tt ? { fill: slopeColor(tt.slope) } : undefined}
              aria-label={`${lakeName(l)}, ${l.country}: ${tt ? signed(tt.slope, language) + " °C/" + tr(language, "decade", "decade") : tr(language, "pending", "trend pending")}`}
              onClick={() => onSelect(l.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(l.id); } }}
              onMouseEnter={() => setHover(l)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(l)} onBlur={() => setHover(null)} />
          );
        })}
        {sel && (() => {
          const [x, y] = project(sel.lon, sel.lat);
          return <circle cx={x} cy={y} r={r(sel) + 5} className="al-ring" aria-hidden="true" />;
        })()}
      </svg>
      <p className="readout" aria-live="polite">
        {info ? (
          <><strong>{lakeName(info)}</strong> · {info.country} · {num(Math.round(info.area), language)} km² · {t
            ? tr(language, "trendReadout", "winters {slope} °C/decade ({first}–{last})", { slope: signed(t.slope, language), first: t.first, last: t.last })
            : tr(language, "pendingReadout", "winter trend still downloading")}</>
        ) : tr(language, "mapHint", "Hover or focus a lake; click to open it. Dot size is lake area.")}
      </p>
    </figure>
  );
}

/* ---------- winter trend ---------- */
export function WinterTrendChart({ series, trend, language }: { series: Series; trend: Trend | null; language: string }) {
  const [hover, setHover] = useState<[number, number] | null>(null);
  if (!series.length) return null;
  const W = 760, H = 280, L = 44, R = 14, T = 16, B = 30;
  const xs = series.map((p) => p[0]), ys = series.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const lo = Math.floor(Math.min(...ys) - 1), hi = Math.ceil(Math.max(...ys) + 1);
  const x = (w: number) => L + ((w - x0) / Math.max(1, x1 - x0)) * (W - L - R);
  const y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  // 5-winter centered rolling mean, to show the decade-scale shape behind the year-to-year noise.
  const roll = series.map(([w], i) => {
    const win = series.slice(Math.max(0, i - 2), i + 3).map((p) => p[1]);
    return [w, win.reduce((a, b) => a + b, 0) / win.length] as [number, number];
  }).slice(2, -2);
  const step = (hi - lo) > 12 ? 4 : 2;
  const ticks = []; for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);
  const decades = []; for (let d = Math.ceil(x0 / 10) * 10; d <= x1; d += 10) decades.push(d);
  const fit = (w: number) => (trend ? trend.intercept + (trend.slope / 10) * w : 0);
  const bw = Math.max(2, (W - L - R) / series.length - 2);
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={tr(language, "trendAria", "Winter mean air temperature for each winter from {first} to {last}, with a 5-winter average and a linear trend", { first: x0, last: x1 })}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className={v === 0 ? "zero" : "grid"} />
            <text x={L - 8} y={y(v) + 4} className="axis" textAnchor="end">{v}°</text>
          </g>
        ))}
        {decades.map((d) => <text key={d} x={x(d)} y={H - 8} className="axis" textAnchor="middle">{d}</text>)}
        {series.map(([w, v]) => (
          <rect key={w} x={x(w) - bw / 2} y={Math.min(y(v), y(lo))} width={bw} height={Math.max(2, Math.abs(y(lo) - y(v)))}
            className="al-bar" rx={1.5} tabIndex={-1}
            onMouseEnter={() => setHover([w, v])} onMouseLeave={() => setHover(null)} />
        ))}
        <path d={roll.map(([w, v], i) => `${i ? "L" : "M"}${x(w).toFixed(1)},${y(v).toFixed(1)}`).join("")} className="al-roll" />
        {trend && <line x1={x(x0)} x2={x(x1)} y1={y(fit(x0))} y2={y(fit(x1))} className="al-fit" />}
      </svg>
      <figcaption className="keys">
        <span><i className="al-k-bar" />{tr(language, "winterMean", "Winter mean")}</span>
        <span><i className="al-k-roll" />{tr(language, "rolling", "5-winter average")}</span>
        <span><i className="al-k-fit" />{tr(language, "linear", "Linear trend")}</span>
        <span className="muted" aria-live="polite">{hover ? `${hover[0]}: ${fmt1(hover[1], language)} °C` : ""}</span>
      </figcaption>
    </figure>
  );
}

/* ---------- monthly air climate (Abraham) ---------- */
export function MonthlyAirChart({ months, names, language }: {
  months: [number, number, number, number, number][]; names: string[]; language: string;
}) {
  const W = 760, H = 250, L = 44, R = 14, T = 14, B = 46, lo = -35, hi = 25;
  const col = (W - L - R) / 12;
  const y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tr(language, "monthsAria", "Air temperature by month at Abraham Lake, 1991–2020: daily mean, coldest and warmest day, and share of days below freezing")}>
        {[-30, -20, -10, 0, 10, 20].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className={v === 0 ? "zero" : "grid"} />
            <text x={L - 8} y={y(v) + 4} className="axis" textAnchor="end">{v}°</text>
          </g>
        ))}
        {months.map(([m, mean, min, max, pct]) => {
          const cx = L + (m - 1) * col + col / 2;
          return (
            <g key={m}>
              <title>{`${names[m - 1]}: ${fmt1(mean, language)} °C · ${fmt0(min, language)}° / ${fmt0(max, language)}° · ${pct}% < 0 °C`}</title>
              <line x1={cx} x2={cx} y1={y(max)} y2={y(min)} className="al-range" />
              <circle cx={cx} cy={y(mean)} r={6} className={mean < 0 ? "al-cold" : "al-warm"} />
              <text x={cx} y={H - 26} className="axis" textAnchor="middle">{names[m - 1].slice(0, 3)}</text>
              <text x={cx} y={H - 10} className={`axis${pct >= 50 ? " al-ice" : ""}`} textAnchor="middle">{pct}%</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="keys">
        <span><i className="al-k-cold" />{tr(language, "meanBelow", "Mean below 0 °C")}</span>
        <span><i className="al-k-range" />{tr(language, "extremes", "Coldest–warmest day")}</span>
        <span className="muted">{tr(language, "pctBelow", "Bottom row: share of days below freezing")}</span>
      </figcaption>
    </figure>
  );
}

/* ---------- where a lake sits among the 300 largest ---------- */
export function TrendStrip({ lakes, trends, selected, abrahamSlope, onSelect, language }: {
  lakes: Lake[]; trends: Map<number, Trend>; selected: number; abrahamSlope: number; onSelect: (id: number) => void; language: string;
}) {
  const pts = lakes.map((l) => ({ l, t: trends.get(l.id) })).filter((p): p is { l: Lake; t: Trend } => !!p.t);
  const W = 760, H = 150, L = 20, R = 20, mid = 70;
  const vals = [...pts.map((p) => p.t.slope), abrahamSlope];
  const lo = Math.min(-0.2, ...vals) - 0.05, hi = Math.max(1, ...vals) + 0.05;
  const x = (v: number) => L + ((v - lo) / (hi - lo)) * (W - L - R);
  // Deterministic vertical jitter so overlapping dots stay visible.
  const jitter = (id: number) => (((id * 2654435761) % 1000) / 1000 - 0.5) * 70;
  const ticks = []; for (let v = Math.ceil(lo * 5) / 5; v <= hi; v += 0.2) ticks.push(Math.round(v * 10) / 10);
  const sel = trends.get(selected);
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={tr(language, "stripAria", "Winter warming trend of each large lake, 1991–2025")}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={18} y2={H - 26} className={v === 0 ? "zero" : "grid"} />
            <text x={x(v)} y={H - 8} className="axis" textAnchor="middle">{signed(v, language)}</text>
          </g>
        ))}
        {pts.map(({ l, t }) => (
          <circle key={l.id} cx={x(t.slope)} cy={mid + jitter(l.id)} r={l.id === selected ? 7 : 4.5}
            className={`al-sdot${l.id === selected ? " on" : ""}`} style={{ fill: slopeColor(t.slope) }} tabIndex={0} role="button"
            aria-label={`${lakeName(l)}: ${signed(t.slope, language)} °C/${tr(language, "decade", "decade")}`}
            onClick={() => onSelect(l.id)} onKeyDown={(e) => { if (e.key === "Enter") onSelect(l.id); }}>
            <title>{`${lakeName(l)} (${l.country}): ${signed(t.slope, language)} °C/${tr(language, "decade", "decade")}`}</title>
          </circle>
        ))}
        <g aria-hidden="true">
          <line x1={x(abrahamSlope)} x2={x(abrahamSlope)} y1={10} y2={H - 26} className="al-abr" />
          <text x={x(abrahamSlope) + 6} y={16} className="al-abr-label">Abraham</text>
        </g>
        {sel && selected !== ABRAHAM_ID && <text x={x(sel.slope)} y={H - 30} className="axis" textAnchor="middle">▲</text>}
      </svg>
    </figure>
  );
}
