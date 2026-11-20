import { useMemo, useState } from "react";
import { type Obs, type Phenomenon, PHENOMENA, PH, YEARS, WINDOW, summary, uniqueEvents, wilson, isPillar } from "./data";
import { tr, num, fmt1, pct } from "./text";

export type Unit = "photos" | "events";
const count = (rows: Obs[], unit: Unit) => (unit === "events" ? uniqueEvents(rows) : rows.length);
const LAST_YEAR = Number(WINDOW[1].slice(0, 4));

/* ---------- B1: observations per year, stacked by phenomenon ---------- */
export function YearChart({ rows, unit, active, language }: { rows: Obs[]; unit: Unit; active: Phenomenon[]; language: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const data = useMemo(() => YEARS.map((y) => {
    const ys = rows.filter((r) => r.year === y);
    const parts = active.map((ph) => ({ ph, n: count(ys.filter((r) => r.phenomena.includes(ph)), unit) }));
    return { y, total: count(ys, unit), parts };
  }), [rows, unit, active]);
  const Wd = 760, Ht = 230, L = 36, Rt = 8, T = 14, B = 26;
  const max = Math.max(1, ...data.map((d) => d.parts.reduce((s, p) => s + p.n, 0)));
  const bw = (Wd - L - Rt) / data.length;
  const y = (v: number) => T + (1 - v / max) * (Ht - T - B);
  const h = hover == null ? null : data.find((d) => d.y === hover);
  return (
    <figure className="chart lp-chart">
      <svg viewBox={`0 0 ${Wd} ${Ht}`} role="group" aria-label={tr(language, "yearChartAria", "Photographs per year from 2000 to {last}, stacked by phenomenon", { last: LAST_YEAR })}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={L} x2={Wd - Rt} y1={y(max * f)} y2={y(max * f)} className="grid" />
            <text x={L - 6} y={y(max * f) + 4} className="axis" textAnchor="end">{Math.round(max * f)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          let acc = 0;
          return (
            <g key={d.y} tabIndex={0} role="img" className="lp-bar"
              aria-label={`${d.y}: ${d.parts.map((p) => `${tr(language, PH[p.ph].key, PH[p.ph].label)} ${p.n}`).join(", ")}`}
              onMouseEnter={() => setHover(d.y)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(d.y)} onBlur={() => setHover(null)}>
              <rect x={L + i * bw} y={T} width={bw} height={Ht - T - B} className="lp-bar__hit" />
              {d.parts.map((p) => {
                if (!p.n) return null;
                const y0 = y(acc), y1 = y(acc + p.n);
                acc += p.n;
                return <rect key={p.ph} x={L + i * bw + 2} y={y1} width={bw - 4} height={Math.max(0.5, y0 - y1)} fill={PH[p.ph].color} opacity={d.y === LAST_YEAR ? 0.55 : 0.92} />;
              })}
              {((d.y % 5 === 0 && LAST_YEAR - d.y >= 2) || d.y === LAST_YEAR) && <text x={L + i * bw + bw / 2} y={Ht - 8} className="axis" textAnchor="middle">{d.y}</text>}
            </g>
          );
        })}
      </svg>
      <p className="readout" aria-live="polite">
        {h
          ? <><strong>{h.y}</strong>{h.y === LAST_YEAR ? ` (${tr(language, "partialYear", "to {date}, partial", { date: WINDOW[1].slice(5) })})` : ""} · {h.parts.filter((p) => p.n).map((p) => `${tr(language, PH[p.ph].key, PH[p.ph].label)} ${p.n}`).join(" · ") || tr(language, "none", "none")}</>
          : tr(language, "yearHover", "A photo that shows two phenomena counts once in each, so stacks can exceed the total. The last year is partial and faded.")}
      </p>
    </figure>
  );
}

/* ---------- B2: seasons by hemisphere + pillar share ---------- */
export function SeasonChart({ rows, unit, months, align, language }: { rows: Obs[]; unit: Unit; months: string[]; align: boolean; language: string }) {
  const [hover, setHover] = useState<number | null>(null);
  // align=true shifts the Southern Hemisphere by six months so that column 1 is midwinter-ish for both
  const mIdx = (o: Obs) => (align && o.hemisphere === "S" ? ((o.month + 5) % 12) + 1 : o.month);
  const series = useMemo(() => {
    const rowsN = rows.filter((r) => r.hemisphere === "N"), rowsS = rows.filter((r) => r.hemisphere === "S");
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const all = rows.filter((r) => mIdx(r) === m);
      const pill = all.filter(isPillar);
      return {
        m, n: count(rowsN.filter((r) => mIdx(r) === m), unit), s: count(rowsS.filter((r) => mIdx(r) === m), unit),
        u: count(rows.filter((r) => r.hemisphere == null && r.month === m), unit),
        k: pill.length, tot: all.length, ci: wilson(pill.length, all.length),
      };
    });
  }, [rows, unit, align]);
  const Wd = 760, L = 104, Rt = 8, col = (Wd - L - Rt) / 12;
  const rowsDef = [
    { key: "n", label: tr(language, "hemiN", "Northern H."), top: 10, h: 62 },
    { key: "s", label: tr(language, "hemiS", "Southern H."), top: 88, h: 34 },
    { key: "u", label: tr(language, "unlocated", "No location"), top: 138, h: 40 },
  ] as const;
  const share = { top: 200, h: 70 };
  const Ht = share.top + share.h + 26;
  const maxBar = Math.max(1, ...series.flatMap((d) => [d.n, d.s, d.u]));
  const maxShare = Math.max(0.2, ...series.filter((d) => d.tot >= 8).map((d) => d.ci[1]));
  const sy = (v: number) => share.top + share.h - (Math.min(v, maxShare) / maxShare) * share.h;
  const hv = hover == null ? null : series[hover];
  return (
    <figure className="chart lp-chart">
      <svg viewBox={`0 0 ${Wd} ${Ht}`} role="group" aria-label={tr(language, "seasonAria", "Photos by month for each hemisphere, and the share of photos that show pillars")}>
        {rowsDef.map((r) => (
          <g key={r.key}>
            <text x={L - 8} y={r.top + r.h / 2 + 4} className="axis" textAnchor="end">{r.label}</text>
            <line x1={L} x2={Wd - Rt} y1={r.top + r.h} y2={r.top + r.h} className="grid" />
          </g>
        ))}
        <text x={L - 8} y={share.top + share.h / 2 + 4} className="axis" textAnchor="end">{tr(language, "pillarShareShort", "pillar share")}</text>
        <line x1={L} x2={Wd - Rt} y1={share.top + share.h} y2={share.top + share.h} className="grid" />
        <text x={L - 8} y={share.top + share.h + 4} className="axis" textAnchor="end">0</text>
        <text x={L - 8} y={sy(maxShare) + 4} className="axis" textAnchor="end">{pct(maxShare, language)}</text>
        <line x1={L} x2={Wd - Rt} y1={sy(maxShare)} y2={sy(maxShare)} className="grid" strokeDasharray="2 4" />
        {series.map((d, i) => {
          const cx = L + i * col + col / 2;
          const low = d.tot < 8;
          return (
            <g key={d.m} tabIndex={0} role="img" className="lp-bar"
              aria-label={tr(language, "seasonCellAria", "{month}: {n} north, {s} south, {u} without location; pillars {k} of {tot}", { month: monthLabel(months, d.m, align), n: d.n, s: d.s, u: d.u, k: d.k, tot: d.tot })}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
              <rect x={L + i * col} y={4} width={col} height={Ht - 10} className="lp-bar__hit" />
              {rowsDef.map((r) => {
                const v = d[r.key];
                const bh = (v / maxBar) * r.h;
                return <rect key={r.key} x={cx - col * 0.32} y={r.top + r.h - bh} width={col * 0.64} height={Math.max(v ? 1 : 0, bh)} rx={2}
                  className={`lp-mbar lp-mbar--${r.key}`} />;
              })}
              <line x1={cx} x2={cx} y1={sy(d.ci[1])} y2={sy(d.ci[0])} className={`lp-whisker${low ? " low" : ""}`} />
              <circle cx={cx} cy={sy(d.tot ? d.k / d.tot : 0)} r={3.6} className={`lp-share${low ? " low" : ""}`} />
              <text x={cx} y={Ht - 6} className="axis" textAnchor="middle">{monthLabel(months, d.m, align).slice(0, 3)}</text>
            </g>
          );
        })}
      </svg>
      <p className="readout" aria-live="polite">
        {hv
          ? <><strong>{monthLabel(months, hv.m, align)}</strong> · {tr(language, "seasonReadout", "North {n} · South {s} · no location {u} · pillars {k} of {tot} photos ({share}, 95% CI {lo}–{hi})", {
            n: hv.n, s: hv.s, u: hv.u, k: hv.k, tot: hv.tot, share: hv.tot ? pct(hv.k / hv.tot, language) : "—", lo: pct(hv.ci[0], language), hi: pct(hv.ci[1], language),
          })}</>
          : tr(language, "seasonHover", "Bottom row: of all ice-optics photos in a month, the share that are pillars, with 95% Wilson intervals. Comparing within the same photographers' uploads cancels much of the 'who photographs the sky when' bias. Faded points have fewer than 8 photos.")}
      </p>
    </figure>
  );
}
function monthLabel(months: string[], m: number, align: boolean) {
  return align ? `${months[m - 1]} / ${months[(m + 5) % 12]}` : months[m - 1];
}

/* ---------- C: weather panel ---------- */
export type WxVar = "t" | "rh" | "ws" | "cch" | "ccl" | "sun";
export const WX_VARS: { id: WxVar; key: string; label: string; unit: string; lo: number; hi: number }[] = [
  { id: "t", key: "varTemp", label: "Air temperature (2 m)", unit: "°C", lo: -40, hi: 40 },
  { id: "rh", key: "varRh", label: "Relative humidity", unit: "%", lo: 0, hi: 100 },
  { id: "ws", key: "varWind", label: "Wind speed (10 m)", unit: "km/h", lo: 0, hi: 60 },
  { id: "cch", key: "varHigh", label: "High cloud cover", unit: "%", lo: 0, hi: 100 },
  { id: "ccl", key: "varLow", label: "Low cloud cover", unit: "%", lo: 0, hi: 100 },
  { id: "sun", key: "varSun", label: "Sun elevation (computed)", unit: "°", lo: -30, hi: 90 },
];
export const valueOf = (o: Obs, v: WxVar): number | null => (v === "sun" ? o.sunElevation : (o.wx?.[v] ?? null));

export function StripPlot({ rows, variable, active, onPick, language }: {
  rows: Obs[]; variable: WxVar; active: Phenomenon[]; onPick: (id: string) => void; language: string;
}) {
  const meta = WX_VARS.find((v) => v.id === variable)!;
  const [hover, setHover] = useState<Obs | null>(null);
  const Wd = 760, L = 150, Rt = 16, rowH = 46, T = 26;
  const Ht = T + active.length * rowH + 28;
  const x = (v: number) => L + ((Math.max(meta.lo, Math.min(meta.hi, v)) - meta.lo) / (meta.hi - meta.lo)) * (Wd - L - Rt);
  const ticks = niceTicks(meta.lo, meta.hi);
  const refs = variable === "sun"
    ? [{ v: 0, label: tr(language, "refHorizon", "horizon") }, { v: -6, label: tr(language, "refCivil", "civil twilight") }, { v: 32.2, label: tr(language, "refCza", "CZA limit 32.2°") }, { v: 60.75, label: tr(language, "refParhelia", "parhelia limit 60.75°") }]
    : variable === "t" ? [{ v: 0, label: "0 °C" }] : [];
  return (
    <figure className="chart lp-chart">
      <svg viewBox={`0 0 ${Wd} ${Ht}`} role="group" aria-label={tr(language, "stripAria", "{v} for each phenomenon: dots are photos, boxes span the middle half, the line is the median", { v: tr(language, meta.key, meta.label) })}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={T - 6} y2={Ht - 24} className="grid" />
            <text x={x(t)} y={Ht - 8} className="axis" textAnchor="middle">{t}{meta.unit === "%" ? "%" : meta.unit === "°" || meta.unit === "°C" ? "°" : ""}</text>
          </g>
        ))}
        {refs.map((r, i) => (
          <g key={r.v}>
            <line x1={x(r.v)} x2={x(r.v)} y1={T - 8} y2={Ht - 24} className="lp-ref" />
            <text x={x(r.v) + 4} y={T - 10 + (i % 2) * 10} className="lp-ref__label">{r.label}</text>
          </g>
        ))}
        {active.map((ph, i) => {
          const sub = rows.filter((r) => r.phenomena.includes(ph));
          const vals = sub.map((r) => valueOf(r, variable));
          const s = summary(vals);
          const cy = T + i * rowH + rowH / 2;
          return (
            <g key={ph}>
              <text x={L - 10} y={cy - 2} className="lp-rowlabel" textAnchor="end">{tr(language, PH[ph].key, PH[ph].label)}</text>
              <text x={L - 10} y={cy + 11} className="axis" textAnchor="end">n = {s.n}{s.missing ? ` · ${tr(language, "missingN", "{n} missing", { n: s.missing })}` : ""}</text>
              {s.n >= 3 && <rect x={x(s.q1)} y={cy - 9} width={Math.max(1, x(s.q3) - x(s.q1))} height={18} rx={4} className="lp-box" style={{ stroke: PH[ph].color }} />}
              {s.n >= 1 && <line x1={x(s.med)} x2={x(s.med)} y1={cy - 12} y2={cy + 12} stroke={PH[ph].color} strokeWidth={2.5} />}
              {sub.map((r, k) => {
                const v = valueOf(r, variable);
                if (v == null) return null;
                const jitter = ((hash(r.id) % 1000) / 1000 - 0.5) * 22;
                const out = v < meta.lo || v > meta.hi;
                return (
                  <circle key={r.id + k} cx={x(v)} cy={cy + jitter} r={out ? 3 : 2.6} className={`lp-dot${r.wx?.basis === "daymean" && variable !== "sun" ? " day" : ""}${out ? " out" : ""}`}
                    style={{ fill: PH[ph].color, color: PH[ph].color }} tabIndex={-1}
                    onMouseEnter={() => setHover(r)} onMouseLeave={() => setHover(null)} onClick={() => onPick(r.id)} />
                );
              })}
            </g>
          );
        })}
      </svg>
      <p className="readout" aria-live="polite">
        {hover
          ? <><strong>{hover.country ?? "—"}</strong> · {hover.date}{hover.time ? ` ${hover.time}` : ""} · {tr(language, meta.key, meta.label)} {fmtVal(valueOf(hover, variable), language)}{meta.unit === "%" ? "%" : ` ${meta.unit}`}
            {hover.wx?.basis === "daymean" && variable !== "sun" ? ` · ${tr(language, "dayMean", "daily mean, no capture time")}` : ""} · {tr(language, "clickToMap", "click to show on the map")}</>
          : variable === "sun"
            ? tr(language, "stripSunHover", "Sun elevation is computed from each photo's capture time and place; camera clocks are often wrong, so values that break the physical limits flag a bad time, not new physics.")
            : tr(language, "stripHover", "ERA5 reanalysis at the photo's place and hour (hollow dots: daily mean when no time is known). It describes the air near the ground, not the cirrus where most halos form.")}
      </p>
    </figure>
  );
}

export function Scatter({ rows, active, onPick, language }: { rows: Obs[]; active: Phenomenon[]; onPick: (id: string) => void; language: string }) {
  const [hover, setHover] = useState<Obs | null>(null);
  const Wd = 380, Ht = 300, L = 40, Rt = 10, T = 12, B = 34;
  const x = (t: number) => L + ((t + 40) / 80) * (Wd - L - Rt);
  const y = (rh: number) => T + (1 - rh / 100) * (Ht - T - B);
  const pts = rows.filter((r) => r.wx?.t != null && r.wx?.rh != null && r.phenomena.some((p) => active.includes(p)));
  // RH with respect to water at which air is saturated with respect to ice (Magnus formulas)
  const ice = Array.from({ length: 41 }, (_, i) => -40 + i).map((t) => {
    const ew = 6.112 * Math.exp((17.62 * t) / (243.12 + t)), ei = 6.112 * Math.exp((22.46 * t) / (272.62 + t));
    return [x(t), y(Math.min(100, (100 * ei) / ew))];
  });
  return (
    <figure className="chart lp-chart">
      <svg viewBox={`0 0 ${Wd} ${Ht}`} role="group" aria-label={tr(language, "scatterAria", "Scatter of ERA5 temperature against relative humidity for {n} located photos", { n: pts.length })}>
        {[-40, -20, 0, 20, 40].map((t) => (
          <g key={t}><line x1={x(t)} x2={x(t)} y1={T} y2={Ht - B} className="grid" /><text x={x(t)} y={Ht - B + 14} className="axis" textAnchor="middle">{t}°</text></g>
        ))}
        {[0, 50, 100].map((v) => (
          <g key={v}><line x1={L} x2={Wd - Rt} y1={y(v)} y2={y(v)} className="grid" /><text x={L - 5} y={y(v) + 4} className="axis" textAnchor="end">{v}%</text></g>
        ))}
        <path d={`M${ice.map((p) => p.join(",")).join("L")}`} className="lp-ice" />
        <text x={x(-39)} y={y(58)} className="lp-ref__label">{tr(language, "iceSat", "ice saturation")}</text>
        <text x={(Wd + L) / 2} y={Ht - 4} className="axis" textAnchor="middle">{tr(language, "scatterX", "temperature at 2 m (ERA5)")}</text>
        {pts.map((r) => {
          const ph = r.phenomena.find((p) => active.includes(p))!;
          return <circle key={r.id} cx={x(r.wx!.t!)} cy={y(r.wx!.rh!)} r={PH[ph].family === "reflection" ? 4 : 2.8}
            className={`lp-dot${r.wx!.basis === "daymean" ? " day" : ""}`} style={{ fill: PH[ph].color, color: PH[ph].color }}
            onMouseEnter={() => setHover(r)} onMouseLeave={() => setHover(null)} onClick={() => onPick(r.id)} />;
        })}
      </svg>
      <p className="readout" aria-live="polite">
        {hover
          ? <><strong>{tr(language, PH[hover.phenomena[0]].key, PH[hover.phenomena[0]].label)}</strong> · {fmt1(hover.wx!.t!, language)} °C · {Math.round(hover.wx!.rh!)}% · {hover.country ?? "—"}</>
          : tr(language, "scatterHover", "Points above the dashed curve are saturated with respect to ice, where crystals can grow.")}
      </p>
    </figure>
  );
}

function niceTicks(lo: number, hi: number) {
  const step = hi - lo > 100 ? 30 : hi - lo > 60 ? 20 : hi - lo > 40 ? 10 : 10;
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(v);
  return out;
}
const fmtVal = (v: number | null, language: string) => (v == null ? "—" : fmt1(v, language));
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

export { PHENOMENA, num };
