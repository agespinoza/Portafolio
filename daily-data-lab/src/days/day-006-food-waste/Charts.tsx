// Day 006 charts: hand-built SVG (no chart library), the same pattern as Days 004–005: a focusable row or mark per
// datum, a hover/focus text readout, and a legend. All four card types are generic so the page reuses them.
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

const activate = (fn: () => void) => (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } };

/* ---------- horizontal bars, optionally stacked ---------- */
export interface BarRow { id: string; label: string; segments: number[]; highlight?: boolean; faded?: boolean; tag?: string; readout: string }
export function BarChartCard({ rows, colors, legend, ariaLabel, hint, fmt, pinnedFrom, labelWidth = 150, scroll, focusId }: {
  rows: BarRow[]; colors: string[]; legend?: string[]; ariaLabel: string; hint: string; fmt: (v: number) => string;
  /** Rows from this index on are shown below a dashed rule. */
  pinnedFrom?: number; labelWidth?: number;
  /** Long lists: cap the height and scroll inside the card. */
  scroll?: boolean;
  /** Row to scroll into view (the selected country). */
  focusId?: string;
}) {
  const [hover, setHover] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const W = 560, L = labelWidth, R = 64, RH = 16, GAP = 6, T = 4;
  const sep = pinnedFrom != null && pinnedFrom < rows.length ? 14 : 0;
  const H = T + rows.length * (RH + GAP) + sep + 4;
  const max = Math.max(1, ...rows.map((r) => r.segments.reduce((a, b) => a + b, 0)));
  const sx = (v: number) => (v / max) * (W - L - R);
  const focusIdx = focusId ? rows.findIndex((r) => r.id === focusId) : -1;
  useEffect(() => {
    const el = box.current;
    if (!el || focusIdx < 0) return;
    const svg = el.querySelector("svg");
    const scale = svg ? svg.getBoundingClientRect().height / H : 1;
    el.scrollTop = Math.max(0, (T + focusIdx * (RH + GAP)) * scale - el.clientHeight / 2);
  }, [focusIdx, H]);
  // Memoized so hovering (which only changes the readout) does not re-render thousands of rows.
  const svgEl = useMemo(() => (
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={ariaLabel}>
        {rows.map((r, i) => {
          const y = T + i * (RH + GAP) + (pinnedFrom != null && i >= pinnedFrom ? sep : 0);
          const total = r.segments.reduce((a, b) => a + b, 0);
          let x = L;
          return (
            <g key={r.id} className={`fw-row${r.highlight ? " fw-row--hl" : ""}${r.faded ? " fw-row--faded" : ""}`} tabIndex={0} role="img"
              aria-label={r.readout} onMouseEnter={() => setHover(r.readout)} onMouseLeave={() => setHover("")} onFocus={() => setHover(r.readout)} onBlur={() => setHover("")}>
              <text x={L - 8} y={y + RH / 2 + 4} textAnchor="end" className={`axis${r.highlight ? " axis--on" : ""}`}>{r.label}</text>
              {r.segments.map((v, k) => {
                const w = sx(v);
                const rect = <rect key={k} x={x} y={y} width={Math.max(0, w - (k < r.segments.length - 1 ? 1.5 : 0))} height={RH} rx={2}
                  style={{ fill: r.highlight && r.segments.length === 1 ? "var(--copper)" : colors[k] }} />;
                x += w;
                return rect;
              })}
              <text x={x + 6} y={y + RH / 2 + 4} className="axis">{fmt(total)}{r.tag ? ` ${r.tag}` : ""}</text>
            </g>
          );
        })}
        {sep > 0 && <line x1={0} x2={W} y1={T + pinnedFrom! * (RH + GAP) + sep / 2 - 3} y2={T + pinnedFrom! * (RH + GAP) + sep / 2 - 3} className="fw-rule" />}
      </svg>
  ), [rows, colors, ariaLabel, fmt, pinnedFrom, L, H, sep, max]);
  return (
    <figure className="chart fw-chart">
      {scroll && rows.length > 24 ? <div ref={box} className="fw-scroll">{svgEl}</div> : svgEl}
      {legend && legend.length > 1 && (
        <figcaption className="legend">{legend.map((l, k) => <span key={l}><i style={{ background: colors[k] }} />{l}</span>)}</figcaption>
      )}
      <p className="readout" aria-live="polite">{hover || hint}</p>
    </figure>
  );
}

/* ---------- donut ---------- */
export interface Slice { key: string; label: string; value: number; color: string; readout: string }
export function DonutCard({ slices, center, centerNote, ariaLabel, hint }: { slices: Slice[]; center: string; centerNote: string; ariaLabel: string; hint: string }) {
  const [hover, setHover] = useState("");
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const R = 92, r = 58, C = 110;
  let a0 = -Math.PI / 2;
  const arc = (a: number, b: number) => {
    const large = b - a > Math.PI ? 1 : 0;
    const p = (rad: number, ang: number) => `${(C + rad * Math.cos(ang)).toFixed(2)},${(C + rad * Math.sin(ang)).toFixed(2)}`;
    return `M${p(R, a)}A${R},${R} 0 ${large} 1 ${p(R, b)}L${p(r, b)}A${r},${r} 0 ${large} 0 ${p(r, a)}Z`;
  };
  return (
    <figure className="chart fw-donut">
      <svg viewBox="0 0 220 220" role="group" aria-label={ariaLabel}>
        {slices.map((s) => {
          const a1 = a0 + (s.value / total) * Math.PI * 2 - (slices.length > 1 ? 0.012 : 0);
          const d = s.value > 0 ? arc(a0, Math.max(a0, a1)) : "";
          a0 += (s.value / total) * Math.PI * 2;
          return d ? <path key={s.key} d={d} style={{ fill: s.color }} tabIndex={0} role="img" aria-label={s.readout} className="fw-slice"
            onMouseEnter={() => setHover(s.readout)} onMouseLeave={() => setHover("")} onFocus={() => setHover(s.readout)} onBlur={() => setHover("")} /> : null;
        })}
        <text x={C} y={C + 4} textAnchor="middle" className="fw-donut__big">{center}</text>
        <text x={C} y={C + 24} textAnchor="middle" className="axis">{centerNote}</text>
      </svg>
      <figcaption className="legend fw-legend-col">
        {slices.map((s) => <span key={s.key}><i style={{ background: s.color }} />{s.label} · {Math.round((s.value / total) * 100)}%</span>)}
      </figcaption>
      <p className="readout" aria-live="polite">{hover || hint}</p>
    </figure>
  );
}

/* ---------- scatter with OLS lines ---------- */
export interface Point { id: string; label: string; x: number; y: number; color: string; measured: boolean; highlight?: boolean; readout: string }
export interface Fit { a: number; b: number; dashed?: boolean; label: string }
export function ScatterCard({ points, fits, xLabel, yLabel, xDomain, ariaLabel, hint, legend, logX }: {
  points: Point[]; fits: Fit[]; xLabel: string; yLabel: string; xDomain: [number, number]; ariaLabel: string; hint: string;
  legend: { label: string; color: string }[]; logX?: boolean;
}) {
  const [hover, setHover] = useState("");
  const W = 760, H = 360, L = 52, R = 16, T = 12, B = 44;
  const yMax = Math.ceil(Math.max(100, ...points.map((p) => p.y)) / 20) * 20;
  const tx = (v: number) => (logX ? Math.log10(Math.max(v, xDomain[0])) : v);
  const [x0, x1] = [tx(xDomain[0]), tx(xDomain[1])];
  const sx = (v: number) => L + ((tx(v) - x0) / (x1 - x0)) * (W - L - R);
  const sy = (v: number) => H - B - (v / yMax) * (H - T - B);
  const xTicks = logX ? [2.5, 5, 10, 20, 40].filter((v) => v >= xDomain[0] && v <= xDomain[1]) : ticks(xDomain[0], xDomain[1], 6);
  const yTicks = ticks(0, yMax, 5);
  // Draw faded (extrapolated) points first, highlighted last.
  const ordered = [...points].sort((a, b) => Number(a.measured) - Number(b.measured) || Number(!!a.highlight) - Number(!!b.highlight));
  return (
    <figure className="chart fw-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={ariaLabel}>
        {yTicks.map((v) => <g key={`y${v}`}><line x1={L} x2={W - R} y1={sy(v)} y2={sy(v)} className="grid" /><text x={L - 8} y={sy(v) + 4} textAnchor="end" className="axis">{v}</text></g>)}
        {xTicks.map((v) => <g key={`x${v}`}><line x1={sx(v)} x2={sx(v)} y1={T} y2={H - B} className="grid" /><text x={sx(v)} y={H - B + 16} textAnchor="middle" className="axis">{v}</text></g>)}
        <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" className="axis">{xLabel}</text>
        <text x={14} y={(T + H - B) / 2} textAnchor="middle" className="axis" transform={`rotate(-90 14 ${(T + H - B) / 2})`}>{yLabel}</text>
        {fits.map((f) => {
          const ya = f.a + f.b * tx(xDomain[0]), yb = f.a + f.b * tx(xDomain[1]);
          return <line key={f.label} x1={sx(xDomain[0])} x2={sx(xDomain[1])} y1={sy(ya)} y2={sy(yb)} className={`fw-fit${f.dashed ? " fw-fit--dash" : ""}`} aria-hidden="true" />;
        })}
        {ordered.map((p) => (
          <g key={p.id} tabIndex={0} role="img" aria-label={p.readout} className="fw-pt"
            onMouseEnter={() => setHover(p.readout)} onMouseLeave={() => setHover("")} onFocus={() => setHover(p.readout)} onBlur={() => setHover("")}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={p.highlight ? 7 : 5} style={{ fill: p.color }}
              className={`${p.measured ? "" : "fw-pt--est"}${p.highlight ? " fw-pt--hl" : ""}`} />
            {p.highlight && <text x={sx(p.x) + 10} y={sy(p.y) - 8} className="fw-pt__label">{p.label}</text>}
          </g>
        ))}
      </svg>
      <figcaption className="legend">
        {legend.map((l) => <span key={l.label}><i style={{ background: l.color }} />{l.label}</span>)}
        {fits.map((f) => <span key={f.label}><i className={`fw-key-line${f.dashed ? " fw-key-line--dash" : ""}`} />{f.label}</span>)}
      </figcaption>
      <p className="readout" aria-live="polite">{hover || hint}</p>
    </figure>
  );
}

/* ---------- lines ---------- */
export interface Series { key: string; label: string; color: string; points: [number, number][]; bold?: boolean }
export function LineChartCard({ series, ariaLabel, hint, baseline, yFmt }: { series: Series[]; ariaLabel: string; hint: string; baseline?: number; yFmt: (v: number) => string }) {
  const [hover, setHover] = useState("");
  const W = 760, H = 280, L = 52, R = 120, T = 12, B = 28;
  const xs = series.flatMap((s) => s.points.map((p) => p[0])), ys = series.flatMap((s) => s.points.map((p) => p[1]));
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  const [y0, y1] = [Math.floor(Math.min(...ys, baseline ?? Infinity) - 1), Math.ceil(Math.max(...ys, baseline ?? -Infinity) + 1)];
  const sx = (v: number) => L + ((v - x0) / (x1 - x0 || 1)) * (W - L - R);
  const sy = (v: number) => H - B - ((v - y0) / (y1 - y0 || 1)) * (H - T - B);
  return (
    <figure className="chart fw-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={ariaLabel}>
        {ticks(y0, y1, 5).map((v) => <g key={v}><line x1={L} x2={W - R} y1={sy(v)} y2={sy(v)} className="grid" /><text x={L - 8} y={sy(v) + 4} textAnchor="end" className="axis">{yFmt(v)}</text></g>)}
        {Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i).map((y) => <text key={y} x={sx(y)} y={H - 8} textAnchor="middle" className="axis">{y}</text>)}
        {baseline != null && <line x1={L} x2={W - R} y1={sy(baseline)} y2={sy(baseline)} className="fw-rule" />}
        {series.map((s) => {
          const last = s.points[s.points.length - 1];
          return (
            <g key={s.key}>
              <path d={s.points.map((p, i) => `${i ? "L" : "M"}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join("")} className={`fw-line${s.bold ? " fw-line--bold" : ""}`} style={{ stroke: s.color }} />
              {s.points.map((p) => {
                const text = `${s.label} · ${p[0]}: ${yFmt(p[1])}`;
                return <circle key={p[0]} cx={sx(p[0])} cy={sy(p[1])} r={s.bold ? 4 : 3} style={{ fill: s.color }} tabIndex={0} role="img" aria-label={text} className="fw-pt"
                  onMouseEnter={() => setHover(text)} onMouseLeave={() => setHover("")} onFocus={() => setHover(text)} onBlur={() => setHover("")} />;
              })}
              <text x={sx(last[0]) + 8} y={sy(last[1]) + 4} className="axis" style={{ fill: s.color }}>{s.label}</text>
            </g>
          );
        })}
      </svg>
      <p className="readout" aria-live="polite">{hover || hint}</p>
    </figure>
  );
}

function ticks(a: number, b: number, n: number): number[] {
  const span = b - a, raw = span / n, mag = 10 ** Math.floor(Math.log10(raw || 1));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= n) ?? mag * 10;
  const out: number[] = [];
  for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
}
export { activate };
