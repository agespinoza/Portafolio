// Day 008 charts: hand-built SVG, same conventions as Day 006 (focusable marks, a hover/focus readout, a legend).
// Bars, donut and lines are reused from Day 006; this file adds vertical columns and a Pareto chart.
import { useMemo, useState } from "react";

export { BarChartCard, DonutCard, LineChartCard, type BarRow } from "../day-006-food-waste/Charts";

function ticks(a: number, b: number, n: number): number[] {
  const span = b - a, raw = span / n, mag = 10 ** Math.floor(Math.log10(raw || 1));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= n) ?? mag * 10;
  const out: number[] = [];
  for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
}

/* ---------- vertical columns, with an optional negative series below the axis ---------- */
export interface Column { id: string; label: string; value: number; neg?: number; tick?: string; highlight?: boolean; readout: string }
export function ColumnChartCard({ cols, ariaLabel, hint, fmt, legend }: {
  cols: Column[]; ariaLabel: string; hint: string; fmt: (v: number) => string;
  legend?: { label: string; color: string }[];
}) {
  const [hover, setHover] = useState("");
  const W = 760, H = 260, L = 56, R = 12, T = 12, B = 28;
  const max = Math.max(1, ...cols.map((c) => c.value));
  const minNeg = Math.max(0, ...cols.map((c) => c.neg ?? 0));
  const yTop = max, yBot = -minNeg;
  const sy = (v: number) => T + ((yTop - v) / (yTop - yBot || 1)) * (H - T - B);
  const bw = (W - L - R) / Math.max(1, cols.length);
  const gap = Math.min(4, bw * 0.25);
  const yt = ticks(yBot, yTop, 5);
  const svg = useMemo(() => (
    <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={ariaLabel}>
      {yt.map((v) => <g key={v}><line x1={L} x2={W - R} y1={sy(v)} y2={sy(v)} className="grid" /><text x={L - 8} y={sy(v) + 4} textAnchor="end" className="axis">{fmt(Math.abs(v))}</text></g>)}
      <line x1={L} x2={W - R} y1={sy(0)} y2={sy(0)} className="sb-zero" />
      {cols.map((c, i) => {
        const x = L + i * bw + gap / 2, w = Math.max(1, bw - gap);
        return (
          <g key={c.id} tabIndex={0} role="img" aria-label={c.readout} className={`sb-col${c.highlight ? " sb-col--hl" : ""}`}
            onMouseEnter={() => setHover(c.readout)} onMouseLeave={() => setHover("")} onFocus={() => setHover(c.readout)} onBlur={() => setHover("")}>
            <rect x={L + i * bw} y={T} width={bw} height={H - T - B} className="sb-col__hit" />
            {c.value > 0 && <rect x={x} y={sy(c.value)} width={w} height={sy(0) - sy(c.value)} rx={1.5} className="sb-col__pos" />}
            {(c.neg ?? 0) > 0 && <rect x={x} y={sy(0)} width={w} height={sy(-(c.neg ?? 0)) - sy(0)} rx={1.5} className="sb-col__neg" />}
            {c.tick && <text x={x + w / 2} y={H - 8} textAnchor="middle" className="axis">{c.tick}</text>}
          </g>
        );
      })}
    </svg>
  ), [cols, ariaLabel, fmt]);
  return (
    <figure className="chart fw-chart">
      <div className="sb-scroll">{svg}</div>
      {legend && <figcaption className="legend">{legend.map((l) => <span key={l.label}><i style={{ background: l.color }} />{l.label}</span>)}</figcaption>}
      <p className="readout" aria-live="polite">{hover || hint}</p>
    </figure>
  );
}

/* ---------- Pareto: share of each item (bars) and cumulative share (line), with reference levels ---------- */
export interface ParetoItem { id: string; label: string; value: number; readout: string }
export function ParetoCard({ items, total, show = 30, marks = [0.5, 0.8, 0.9], ariaLabel, hint, pct }: {
  items: ParetoItem[]; total: number; show?: number; marks?: number[]; ariaLabel: string; hint: string; pct: (v: number) => string;
}) {
  const [hover, setHover] = useState("");
  const W = 760, H = 320, L = 48, R = 48, T = 14, B = 84;
  const shown = items.slice(0, show);
  const bw = (W - L - R) / Math.max(1, shown.length);
  const maxShare = Math.max(0.01, ...shown.map((i) => i.value / total));
  const sb = (v: number) => H - B - (v / maxShare) * (H - T - B); // bar share (left axis)
  const sc = (v: number) => H - B - v * (H - T - B); // cumulative share (right axis, 0–100%)
  let acc = 0;
  const cum = shown.map((i) => (acc += i.value) / total);
  const line = cum.map((c, k) => `${k ? "L" : "M"}${(L + k * bw + bw / 2).toFixed(1)},${sc(c).toFixed(1)}`).join("");
  return (
    <figure className="chart fw-chart">
      <div className="sb-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={ariaLabel}>
          {ticks(0, maxShare, 4).map((v) => <g key={`l${v}`}><line x1={L} x2={W - R} y1={sb(v)} y2={sb(v)} className="grid" /><text x={L - 6} y={sb(v) + 4} textAnchor="end" className="axis">{pct(v)}</text></g>)}
          {[0, 0.25, 0.5, 0.75, 1].map((v) => <text key={`r${v}`} x={W - R + 6} y={sc(v) + 4} className="axis sb-axis-cum">{pct(v)}</text>)}
          {marks.map((m) => <line key={m} x1={L} x2={W - R} y1={sc(m)} y2={sc(m)} className="fw-rule" />)}
          {shown.map((it, k) => {
            const x = L + k * bw;
            return (
              <g key={it.id} tabIndex={0} role="img" aria-label={`${it.readout} · ${pct(cum[k])}`} className="sb-col"
                onMouseEnter={() => setHover(`${it.readout} · ${pct(cum[k])}`)} onMouseLeave={() => setHover("")} onFocus={() => setHover(`${it.readout} · ${pct(cum[k])}`)} onBlur={() => setHover("")}>
                <rect x={x} y={T} width={bw} height={H - T - B} className="sb-col__hit" />
                <rect x={x + 1.5} y={sb(it.value / total)} width={Math.max(1, bw - 3)} height={H - B - sb(it.value / total)} rx={1.5} className="sb-col__pos" />
                <text x={x + bw / 2} y={H - B + 10} transform={`rotate(-55 ${x + bw / 2} ${H - B + 10})`} textAnchor="end" className="axis sb-tick">{it.label}</text>
              </g>
            );
          })}
          <path d={line} className="sb-cum" />
          {cum.map((c, k) => <circle key={k} cx={L + k * bw + bw / 2} cy={sc(c)} r={2.4} className="sb-cum__pt" />)}
        </svg>
      </div>
      <p className="readout" aria-live="polite">{hover || hint}</p>
    </figure>
  );
}
