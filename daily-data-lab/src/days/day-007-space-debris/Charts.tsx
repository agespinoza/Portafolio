// Day 007 charts: hand-built SVG (no chart library). Horizontal bars and donuts are reused from Day 006; this file adds
// a year chart (lines, stacked area, or stacked columns over 1957–today) and a log-scale bar chart for size classes.
// Same interaction pattern as Days 004–006: focusable marks, a hover/focus text readout, and a legend.
import { useState } from "react";

export { BarChartCard, DonutCard, type BarRow, type Slice } from "../day-006-food-waste/Charts";

export interface YearSeries { key: string; label: string; color: string; values: number[] }
/** Years on x (one value per year from `from`), counts on y. `mode` picks lines, stacked area, or stacked columns. */
export function YearChartCard({ series, from, mode, ariaLabel, hint, fmt, yearReadout, marks = [] }: {
  series: YearSeries[]; from: number; mode: "lines" | "area" | "columns"; ariaLabel: string; hint: string;
  fmt: (v: number) => string;
  /** Text for one year's readout (all series). */
  yearReadout: (year: number, values: number[]) => string;
  /** Labeled vertical markers (events). */
  marks?: { year: number; label: string }[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 760, H = 300, L = 56, R = 12, T = 14, B = 28;
  const n = series[0]?.values.length ?? 0;
  const stacked = mode !== "lines";
  const totals = Array.from({ length: n }, (_, i) => series.reduce((a, s) => a + s.values[i], 0));
  const yMax = niceMax(Math.max(1, ...(stacked ? totals : series.flatMap((s) => s.values))));
  const step = (W - L - R) / n;
  const sx = (i: number) => L + i * step + step / 2;
  const sy = (v: number) => H - B - (v / yMax) * (H - T - B);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax);
  const xTicks = Array.from({ length: n }, (_, i) => from + i).filter((y) => y % 10 === 0);
  // Stacked layers: cumulative bottoms.
  const base = Array.from({ length: n }, () => 0);
  const layers = series.map((s) => {
    const lo = [...base];
    s.values.forEach((v, i) => { base[i] += v; });
    return { s, lo, hi: [...base] };
  });
  const text = hover == null ? hint : yearReadout(from + hover, series.map((s) => s.values[hover]));
  return (
    <figure className="chart fw-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={ariaLabel} onMouseLeave={() => setHover(null)}>
        {yTicks.map((v) => <g key={v}><line x1={L} x2={W - R} y1={sy(v)} y2={sy(v)} className="grid" /><text x={L - 8} y={sy(v) + 4} textAnchor="end" className="axis">{fmt(v)}</text></g>)}
        {xTicks.map((y) => <text key={y} x={sx(y - from)} y={H - 8} textAnchor="middle" className="axis">{y}</text>)}
        {marks.map((m) => (
          <g key={m.label} aria-hidden="true">
            <line x1={sx(m.year - from)} x2={sx(m.year - from)} y1={T} y2={H - B} className="fw-rule" />
            <text x={sx(m.year - from) - 4} y={T + 10} textAnchor="end" className="axis sd-mark">{m.label}</text>
          </g>
        ))}
        {mode === "area" && layers.map(({ s, lo, hi }) => (
          <path key={s.key} style={{ fill: s.color }} className="sd-area"
            d={`${hi.map((v, i) => `${i ? "L" : "M"}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join("")}${lo.map((_, i) => i).reverse().map((i) => `L${sx(i).toFixed(1)},${sy(lo[i]).toFixed(1)}`).join("")}Z`} />
        ))}
        {mode === "columns" && layers.map(({ s, lo, hi }) => (
          <g key={s.key} style={{ fill: s.color }}>
            {hi.map((v, i) => v > lo[i] ? <rect key={i} x={sx(i) - step * 0.4} width={step * 0.8} y={sy(v)} height={Math.max(0.5, sy(lo[i]) - sy(v))} /> : null)}
          </g>
        ))}
        {mode === "lines" && series.map((s) => (
          <path key={s.key} d={s.values.map((v, i) => `${i ? "L" : "M"}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join("")} className="fw-line fw-line--bold" style={{ stroke: s.color }} />
        ))}
        {hover != null && <line x1={sx(hover)} x2={sx(hover)} y1={T} y2={H - B} className="sd-cursor" />}
        {/* One focusable hit area per year. */}
        {Array.from({ length: n }, (_, i) => (
          <rect key={i} x={L + i * step} y={T} width={step} height={H - T - B} className="sd-hit" tabIndex={0} role="img"
            aria-label={yearReadout(from + i, series.map((s) => s.values[i]))}
            onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} />
        ))}
      </svg>
      <figcaption className="legend">{series.map((s) => <span key={s.key}><i style={{ background: s.color }} />{s.label}</span>)}</figcaption>
      <p className="readout" aria-live="polite">{text}</p>
    </figure>
  );
}

/** Horizontal bars on a log10 axis, for counts that span orders of magnitude (debris size classes). */
export function LogBarCard({ rows, ariaLabel, hint, fmt }: {
  rows: { key: string; label: string; value: number; color: string; readout: string }[]; ariaLabel: string; hint: string; fmt: (v: number) => string;
}) {
  const [hover, setHover] = useState("");
  const W = 560, L = 150, R = 70, RH = 26, GAP = 12, T = 4, B = 26;
  const H = T + rows.length * (RH + GAP) + B;
  const lo = 3, hi = Math.ceil(Math.log10(Math.max(...rows.map((r) => r.value))));
  const sx = (v: number) => L + ((Math.log10(Math.max(v, 10 ** lo)) - lo) / (hi - lo)) * (W - L - R);
  const decades = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  return (
    <figure className="chart fw-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={ariaLabel}>
        {decades.map((d) => (
          <g key={d}><line x1={sx(10 ** d)} x2={sx(10 ** d)} y1={T} y2={H - B} className="grid" />
            <text x={sx(10 ** d)} y={H - 8} textAnchor="middle" className="axis">{fmt(10 ** d)}</text></g>
        ))}
        {rows.map((r, i) => {
          const y = T + i * (RH + GAP);
          return (
            <g key={r.key} className="fw-row" tabIndex={0} role="img" aria-label={r.readout}
              onMouseEnter={() => setHover(r.readout)} onMouseLeave={() => setHover("")} onFocus={() => setHover(r.readout)} onBlur={() => setHover("")}>
              <text x={L - 8} y={y + RH / 2 + 4} textAnchor="end" className="axis">{r.label}</text>
              <rect x={L} y={y} width={Math.max(1, sx(r.value) - L)} height={RH} rx={3} style={{ fill: r.color }} />
              <text x={sx(r.value) + 6} y={y + RH / 2 + 4} className="axis">{fmt(r.value)}</text>
            </g>
          );
        })}
      </svg>
      <p className="readout" aria-live="polite">{hover || hint}</p>
    </figure>
  );
}

function niceMax(v: number): number {
  const mag = 10 ** Math.floor(Math.log10(v));
  return ([1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((m) => m * mag >= v) ?? 10) * mag;
}
