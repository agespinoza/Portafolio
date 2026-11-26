// Day 009 charts: hand-built SVG, same conventions as Days 006 and 008 (focusable marks, a hover/focus readout, a
// legend, long country lists scrolling inside the card). Bars, lines and the scatter are reused from Day 006; this file
// adds a dot-and-interval ranking (uncertainty) and a diverging bar chart.
import { useEffect, useMemo, useRef, useState } from "react";

export { BarChartCard, LineChartCard, ScatterCard, type BarRow, type Point, type Series } from "../day-006-food-waste/Charts";

function useScrollTo(focusIdx: number, rowStep: number, top: number, H: number) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el || focusIdx < 0) return;
    const svg = el.querySelector("svg");
    const scale = svg ? svg.getBoundingClientRect().height / H : 1;
    el.scrollTop = Math.max(0, (top + focusIdx * rowStep) * scale - el.clientHeight / 2);
  }, [focusIdx, H]);
  return box;
}
function ticks(a: number, b: number, n: number): number[] {
  const span = b - a, raw = span / n, mag = 10 ** Math.floor(Math.log10(raw || 1));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= n) ?? mag * 10;
  const out: number[] = [];
  for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
}

/* ---------- ranking with 95% uncertainty intervals (dot = estimate, line = interval) ---------- */
export interface RangeRow { id: string; label: string; value: number; lo: number; hi: number; highlight?: boolean; faded?: boolean; readout: string }
export function RangeCard({ rows, ariaLabel, hint, fmt, focusId, labelWidth = 170, refValue, refLabel, width = 560 }: {
  rows: RangeRow[]; ariaLabel: string; hint: string; fmt: (v: number) => string; focusId?: string; labelWidth?: number;
  /** viewBox width: wider for full-width cards so the text keeps its size. */
  width?: number;
  /** A vertical reference line (the world value). */
  refValue?: number; refLabel?: string;
}) {
  const [hover, setHover] = useState("");
  const W = width, L = labelWidth, R = 44, RH = 16, GAP = 4, T = 22;
  const H = T + rows.length * (RH + GAP) + 4;
  const lo = Math.floor(Math.min(...rows.map((r) => r.lo)) / 5) * 5, hi = Math.ceil(Math.max(...rows.map((r) => r.hi)) / 5) * 5;
  const sx = (v: number) => L + ((v - lo) / (hi - lo || 1)) * (W - L - R);
  const box = useScrollTo(focusId ? rows.findIndex((r) => r.id === focusId) : -1, RH + GAP, T, H);
  const svg = useMemo(() => (
    <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={ariaLabel}>
      {ticks(lo, hi, 6).map((v) => <g key={v}><line x1={sx(v)} x2={sx(v)} y1={T - 6} y2={H} className="grid" /><text x={sx(v)} y={T - 10} textAnchor="middle" className="axis">{fmt(v)}</text></g>)}
      {refValue != null && <g><line x1={sx(refValue)} x2={sx(refValue)} y1={T - 4} y2={H} className="lg-ref" />{refLabel && <text x={sx(refValue) + 4} y={T + 8} className="lg-ref__label">{refLabel}</text>}</g>}
      {rows.map((r, i) => {
        const y = T + i * (RH + GAP), cy = y + RH / 2;
        return (
          <g key={r.id} tabIndex={0} role="img" aria-label={r.readout} className={`fw-row lg-range${r.highlight ? " fw-row--hl lg-range--hl" : ""}${r.faded ? " fw-row--faded" : ""}`}
            onMouseEnter={() => setHover(r.readout)} onMouseLeave={() => setHover("")} onFocus={() => setHover(r.readout)} onBlur={() => setHover("")}>
            <rect x={0} y={y} width={W} height={RH + GAP} className="lg-hit" />
            <text x={L - 8} y={cy + 4} textAnchor="end" className={`axis${r.highlight ? " axis--on" : ""}`}>{r.label}</text>
            <line x1={sx(r.lo)} x2={sx(r.hi)} y1={cy} y2={cy} className="lg-range__ci" />
            <circle cx={sx(r.value)} cy={cy} r={4.2} className="lg-range__dot" />
            <text x={sx(r.hi) + 6} y={cy + 4} className="axis">{fmt(r.value)}</text>
          </g>
        );
      })}
    </svg>
  ), [rows, ariaLabel, fmt, W, L, H, lo, hi, refValue, refLabel]);
  return (
    <figure className="chart fw-chart">
      {rows.length > 24 ? <div ref={box} className={`fw-scroll${width > 700 ? " lg-wide-scroll" : ""}`}>{svg}</div> : svg}
      <p className="readout" aria-live="polite">{hover || hint}</p>
    </figure>
  );
}

/* ---------- diverging bars around a reference value ---------- */
export interface DivRow { id: string; label: string; value: number; highlight?: boolean; faded?: boolean; readout: string }
export function DivergingBarCard({ rows, ariaLabel, hint, fmt, focusId, labelWidth = 170, legend }: {
  rows: DivRow[]; ariaLabel: string; hint: string; fmt: (v: number) => string; focusId?: string; labelWidth?: number;
  legend: [string, string];
}) {
  const [hover, setHover] = useState("");
  const W = 560, L = labelWidth, R = 52, RH = 14, GAP = 5, T = 22;
  const H = T + rows.length * (RH + GAP) + 4;
  const m = Math.max(1, ...rows.map((r) => Math.abs(r.value)));
  const x0 = L + 30, x1 = W - R, mid = (x0 + x1) / 2;
  const sx = (v: number) => mid + (v / m) * ((x1 - x0) / 2);
  const box = useScrollTo(focusId ? rows.findIndex((r) => r.id === focusId) : -1, RH + GAP, T, H);
  const svg = useMemo(() => (
    <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={ariaLabel}>
      {ticks(-m, m, 6).map((v) => <g key={v}><line x1={sx(v)} x2={sx(v)} y1={T - 6} y2={H} className="grid" /><text x={sx(v)} y={T - 10} textAnchor="middle" className="axis">{fmt(v)}</text></g>)}
      <line x1={mid} x2={mid} y1={T - 6} y2={H} className="sb-zero" />
      {rows.map((r, i) => {
        const y = T + i * (RH + GAP), pos = r.value >= 0;
        const xa = Math.min(sx(0), sx(r.value)), w = Math.abs(sx(r.value) - sx(0));
        return (
          <g key={r.id} tabIndex={0} role="img" aria-label={r.readout} className={`fw-row${r.highlight ? " fw-row--hl" : ""}${r.faded ? " fw-row--faded" : ""}`}
            onMouseEnter={() => setHover(r.readout)} onMouseLeave={() => setHover("")} onFocus={() => setHover(r.readout)} onBlur={() => setHover("")}>
            <rect x={0} y={y} width={W} height={RH + GAP} className="lg-hit" />
            <text x={L - 8} y={y + RH / 2 + 4} textAnchor="end" className={`axis${r.highlight ? " axis--on" : ""}`}>{r.label}</text>
            <rect x={xa} y={y} width={Math.max(1, w)} height={RH} rx={2} className={r.highlight ? "lg-div--hl" : pos ? "lg-div--pos" : "lg-div--neg"} />
            <text x={pos ? sx(r.value) + 5 : sx(r.value) - 5} y={y + RH / 2 + 4} textAnchor={pos ? "start" : "end"} className="axis">{fmt(r.value)}</text>
          </g>
        );
      })}
    </svg>
  ), [rows, ariaLabel, fmt, L, H, m]);
  return (
    <figure className="chart fw-chart">
      {rows.length > 24 ? <div ref={box} className="fw-scroll">{svg}</div> : svg}
      <figcaption className="legend"><span><i className="lg-key--neg" />{legend[0]}</span><span><i className="lg-key--pos" />{legend[1]}</span></figcaption>
      <p className="readout" aria-live="polite">{hover || hint}</p>
    </figure>
  );
}
