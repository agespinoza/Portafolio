import { useMemo, useState } from "react";
import { project } from "../day-003-light-pillars/WorldMap";
import { LAND_RINGS } from "../day-003-light-pillars/data";
import { type Lake, type LakeTemp, type Series, type Trend, ABRAHAM_ID, lakeName, dayToDate } from "./data";
import { tr, fmt1, num, signed } from "./text";

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

/** Sequential color for ice days per year (LakeTEMP): dark = open water, bright = long ice season. */
export function iceColor(days: number | null | undefined): string {
  if (days == null) return "var(--ink-3)";
  if (days === 0) return "var(--i0)";
  if (days < 60) return "var(--i1)";
  if (days < 120) return "var(--i2)";
  if (days < 180) return "var(--i3)";
  if (days < 240) return "var(--i4)";
  return "var(--i5)";
}
export const ICE_LEGEND = [
  { label: "0", color: "var(--i0)" }, { label: "1–59", color: "var(--i1)" }, { label: "60–119", color: "var(--i2)" },
  { label: "120–179", color: "var(--i3)" }, { label: "180–239", color: "var(--i4)" }, { label: "240+", color: "var(--i5)" },
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

export function LakeMap({ lakes, trends, ice, metric, selected, onSelect, language }: {
  lakes: Lake[]; trends: Map<number, Trend>; ice: Map<number, LakeTemp>; metric: "trend" | "ice";
  selected: number; onSelect: (id: number) => void; language: string;
}) {
  const [hover, setHover] = useState<Lake | null>(null);
  const maxArea = Math.max(...lakes.map((l) => l.area), 1);
  const r = (l: Lake) => 2 + Math.sqrt(l.area / maxArea) * 9;
  const sel = lakes.find((l) => l.id === selected);
  const ordered = useMemo(() => [...lakes].sort((a, b) => b.area - a.area), [lakes]);
  const info = hover ?? sel ?? null;
  const t = info ? trends.get(info.id) : undefined;
  const it = info ? ice.get(info.id) : undefined;
  return (
    <figure className="chart al-map">
      <svg viewBox={`${X0} ${YN} ${X1 - X0} ${YS - YN}`} role="group"
        aria-label={tr(language, "mapAria", "World map of {count} large lakes colored by their winter warming trend", { count: num(lakes.length, language) })}>
        <path d={LAND} className="al-land" />
        {ordered.map((l) => {
          const [x, y] = project(l.lon, l.lat);
          const tt = trends.get(l.id);
          const lt = ice.get(l.id);
          const has = metric === "trend" ? !!tt : lt?.iceDays != null;
          const fill = metric === "trend" ? slopeColor(tt?.slope) : iceColor(lt?.iceDays);
          const value = metric === "trend"
            ? (tt ? signed(tt.slope, language) + " °C/" + tr(language, "decade", "decade") : tr(language, "pending", "trend pending"))
            : (lt?.iceDays != null ? tr(language, "iceDaysValue", "{days} ice days", { days: lt.iceDays }) : tr(language, "noIceData", "no LakeTEMP data"));
          return (
            <circle key={l.id} cx={x} cy={y} r={r(l)} tabIndex={0} role="button"
              className={`al-dot${has ? "" : " al-dot--pending"}${l.id === selected ? " on" : ""}`}
              style={has ? { fill } : undefined}
              aria-label={`${lakeName(l)}, ${l.country}: ${value}`}
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
            : tr(language, "pendingReadout", "winter trend still downloading")}
            {it?.iceDays != null ? ` · ${tr(language, "iceDaysValue", "{days} ice days", { days: it.iceDays })}` : ""}</>
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
    <figure className="chart" tabIndex={0}>
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

/* ---------- lake surface water temperature by month (LakeTEMP), with air for Abraham ---------- */
export function LswtMonthlyChart({ lt, air, names, language }: {
  lt: LakeTemp; air?: [number, number, number, number, number][]; names: string[]; language: string;
}) {
  const W = 760, H = 270, L = 44, R = 14, T = 14, B = air ? 46 : 30;
  const vals = [...lt.months, ...(lt.monthsHi ?? []), ...(air ? air.map((a) => a[1]) : [])].filter((v): v is number => v != null);
  const lo = Math.min(0, Math.floor(Math.min(...vals) / 5) * 5), hi = Math.max(10, Math.ceil(Math.max(...vals) / 5) * 5);
  const col = (W - L - R) / 12;
  const cx = (m: number) => L + (m - 1) * col + col / 2;
  const y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const line = (a: (number | null)[]) => a.map((v, i) => (v == null ? "" : `${i && a[i - 1] != null ? "L" : "M"}${cx(i + 1).toFixed(1)},${y(v).toFixed(1)}`)).join("");
  const band = lt.monthsLo && lt.monthsHi
    ? `M${lt.monthsHi.map((v, i) => `${cx(i + 1).toFixed(1)},${y(v ?? 0).toFixed(1)}`).join("L")}L${[...lt.monthsLo].map((v, i) => [i, v] as const).reverse().map(([i, v]) => `${cx(i + 1).toFixed(1)},${y(v ?? 0).toFixed(1)}`).join("L")}Z`
    : null;
  // Ice season as shaded months: from the month of ice-on to the month of ice-off (wrapping over New Year).
  const iceMonths = new Set<number>();
  if (lt.iceDays && lt.iceStart != null && lt.iceEnd != null) {
    const s0 = dayToDate(lt.iceStart).getUTCMonth() + 1, e0 = dayToDate(lt.iceEnd).getUTCMonth() + 1;
    for (let m = s0; ; m = (m % 12) + 1) { iceMonths.add(m); if (m === e0) break; }
  }
  const step = hi - lo > 30 ? 10 : 5;
  const ticks = []; for (let v = lo; v <= hi; v += step) ticks.push(v);
  return (
    <figure className="chart" tabIndex={0}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tr(language, "lswtAria", "Lake surface water temperature by month from LakeTEMP, with its 95% interval{air}", {
        air: air ? tr(language, "lswtAriaAir", " and the air temperature above the lake") : "",
      })}>
        {[...iceMonths].map((m) => <rect key={m} x={L + (m - 1) * col} y={T} width={col} height={H - T - B} className="al-icebg" />)}
        {ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className={v === 0 ? "zero" : "grid"} />
            <text x={L - 8} y={y(v) + 4} className="axis" textAnchor="end">{v}°</text>
          </g>
        ))}
        {band && <path d={band} className="al-wband" />}
        {air && <path d={line(air.map((a) => a[1]))} className="al-air" />}
        <path d={line(lt.months)} className="al-water" />
        {lt.months.map((v, i) => (v == null ? null : (
          <circle key={i} cx={cx(i + 1)} cy={y(v)} r={4.5} className="al-wdot">
            <title>{`${names[i]}: ${fmt1(v, language)} °C${air ? ` · ${tr(language, "airShort", "air")} ${fmt1(air[i][1], language)} °C` : ""}`}</title>
          </circle>
        )))}
        {names.map((n, i) => <text key={n} x={cx(i + 1)} y={air ? H - 26 : H - 8} className="axis" textAnchor="middle">{n.slice(0, 3)}</text>)}
        {air && air.map(([m, , , , pct]) => (
          <text key={m} x={cx(m)} y={H - 10} className={`axis${pct >= 50 ? " al-ice" : ""}`} textAnchor="middle">{pct}%</text>
        ))}
      </svg>
      <figcaption className="keys">
        <span><i className="al-k-water" />{tr(language, "water", "Water surface (LakeTEMP)")}</span>
        {band && <span><i className="al-k-wband" />{tr(language, "ci95", "95% interval")}</span>}
        {air && <span><i className="al-k-air" />{tr(language, "airAbove", "Air (ERA5, 1991–2020)")}</span>}
        {iceMonths.size > 0 && <span><i className="al-k-ice" />{tr(language, "iceSeason", "Ice season")}</span>}
        {air && <span className="muted">{tr(language, "pctBelow", "Bottom row: share of days below freezing")}</span>}
      </figcaption>
    </figure>
  );
}

/* ---------- ice days by latitude over every LakeTEMP lake ---------- */
export function IceLatitudeChart({ bands, points, language }: {
  bands: [number, number, number, number, number, number][];
  points: { id: number; lat: number; days: number; label: string; kind: "abraham" | "selected" }[];
  language: string;
}) {
  const W = 760, H = 260, L = 44, R = 14, T = 14, B = 30;
  const rows = bands.filter((b) => b[1] >= 30); // skip thin bands
  const x0 = -60, x1 = 80, hi = 366;
  const x = (lat: number) => L + ((lat - x0) / (x1 - x0)) * (W - L - R);
  const y = (d: number) => T + (1 - d / hi) * (H - T - B);
  const mid = (b: number) => b + 0.5;
  const area = `M${rows.map((b) => `${x(mid(b[0])).toFixed(1)},${y(b[4]).toFixed(1)}`).join("L")}L${[...rows].reverse().map((b) => `${x(mid(b[0])).toFixed(1)},${y(b[2]).toFixed(1)}`).join("L")}Z`;
  const median = rows.map((b, i) => `${i && b[0] - rows[i - 1][0] === 1 ? "L" : "M"}${x(mid(b[0])).toFixed(1)},${y(b[3]).toFixed(1)}`).join("");
  return (
    <figure className="chart" tabIndex={0}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tr(language, "latAria", "Ice days per year by latitude for about 1.2 million lakes: median and middle half, with the chosen lakes marked")}>
        {[0, 90, 180, 270, 365].map((d) => (
          <g key={d}>
            <line x1={L} x2={W - R} y1={y(d)} y2={y(d)} className="grid" />
            <text x={L - 8} y={y(d) + 4} className="axis" textAnchor="end">{d}</text>
          </g>
        ))}
        {[-60, -30, 0, 30, 60].map((lat) => <text key={lat} x={x(lat)} y={H - 8} className="axis" textAnchor="middle">{lat}°</text>)}
        <path d={area} className="al-latband" />
        <path d={median} className="al-latmed" />
        {points.map((p) => (
          <g key={`${p.kind}-${p.id}`}>
            <circle cx={x(p.lat)} cy={y(p.days)} r={7} className={p.kind === "abraham" ? "al-pt-abr" : "al-pt-sel"} />
            <text x={x(p.lat) + 10} y={y(p.days) - 8} className={p.kind === "abraham" ? "al-abr-label" : "al-sel-label"}>{p.label}</text>
          </g>
        ))}
      </svg>
      <figcaption className="keys">
        <span><i className="al-k-latmed" />{tr(language, "latMedian", "Median of lakes at that latitude")}</span>
        <span><i className="al-k-latband" />{tr(language, "latMiddle", "Middle half (25th–75th percentile)")}</span>
        <span className="muted">{tr(language, "latAxis", "Ice days per year · latitude")}</span>
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
    <figure className="chart" tabIndex={0}>
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
