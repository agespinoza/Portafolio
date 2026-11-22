import { memo, useMemo, useState } from "react";
import { project } from "../day-003-light-pillars/WorldMap";
import { LAND_RINGS } from "../day-003-light-pillars/data";
import {
  type Aes, type FamilyStat, type Language, type Med,
  AES_LABEL, AES_LEVELS, FAMILIES, GRAMBANK, MACROAREAS, MED_LABEL, aesColor, medColor, totals, wilson,
} from "./data";
import { tr, num, pct } from "./text";

const aesName = (a: Aes, language: string) => tr(language, AES_LABEL[a][0], AES_LABEL[a][1]);
const medName = (m: Med, language: string) => tr(language, MED_LABEL[m][0], MED_LABEL[m][1]);

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
const [, YN] = project(0, 80), [, YS] = project(0, -56);

export type ColorBy = "aes" | "med";

/** The dot layer is memoised: 7,685 circles re-render only when the data, filter, or coloring changes. */
const Dots = memo(function Dots({ list, colorBy, match }: { list: Language[]; colorBy: ColorBy; match: (l: Language) => boolean }) {
  // Draw safe languages first so endangered ones sit on top.
  const ordered = useMemo(() => [...list].filter((l) => l.lat != null).sort((a, b) => (colorBy === "aes" ? a.aes - b.aes : b.med - a.med)), [list, colorBy]);
  return (
    <g>
      {ordered.map((l) => {
        const [x, y] = project(l.lon!, l.lat!);
        const on = match(l);
        return <circle key={l.code} data-code={l.code} cx={x.toFixed(1)} cy={y.toFixed(1)} r={on ? 1.7 : 1.1}
          className={`el-dot${on ? "" : " el-dot--off"}`} style={{ fill: colorBy === "aes" ? aesColor(l.aes) : medColor(l.med) }} />;
      })}
    </g>
  );
});

export function LanguageMap({ list, colorBy, match, selected, onSelect, language }: {
  list: Language[]; colorBy: ColorBy; match: (l: Language) => boolean; selected: Language | null;
  onSelect: (code: string) => void; language: string;
}) {
  const [hover, setHover] = useState<Language | null>(null);
  const byCode = useMemo(() => new Map(list.map((l) => [l.code, l])), [list]);
  const pick = (target: EventTarget) => byCode.get((target as SVGElement).dataset?.code ?? "") ?? null;
  const info = hover ?? selected;
  const sel = selected && selected.lat != null ? project(selected.lon!, selected.lat) : null;
  return (
    <figure className="chart al-map el-map">
      <svg viewBox={`${X0} ${YN} ${X1 - X0} ${YS - YN}`} role="img"
        aria-label={tr(language, "mapAria", "World map of {count} languages colored by {by}. Use the search box or the tables to reach a language by keyboard.", {
          count: num(list.length, language), by: colorBy === "aes" ? tr(language, "byAes", "endangerment status") : tr(language, "byMed", "how well they are described"),
        })}
        onMouseOver={(e) => setHover(pick(e.target))} onMouseLeave={() => setHover(null)}
        onClick={(e) => { const l = pick(e.target); if (l) onSelect(l.code); }}>
        <path d={LAND} className="el-land" />
        <Dots list={list} colorBy={colorBy} match={match} />
        {sel && <circle cx={sel[0]} cy={sel[1]} r={5} className="el-ring" aria-hidden="true" />}
      </svg>
      <figcaption className="legend el-legend">
        {colorBy === "aes"
          ? AES_LEVELS.map((a) => <span key={a}><i style={{ background: aesColor(a) }} />{aesName(a, language)}</span>)
          : ([0, 1, 2, 3, 4] as Med[]).map((m) => <span key={m}><i style={{ background: medColor(m) }} />{medName(m, language)}</span>)}
      </figcaption>
      <p className="readout" aria-live="polite">
        {info ? (
          <><strong>{info.name}</strong> · {info.family >= 0 ? FAMILIES[info.family].name : tr(language, "isolate", "isolate")} · {aesName(info.aes, language)} · {medName(info.med, language)}</>
        ) : tr(language, "mapHint", "Hover a dot to read it; click to open its profile. Faded dots are outside the current filter.")}
      </p>
    </figure>
  );
}

/* ---------- AES by macroarea, 100% stacked bars ---------- */
export function StackedBarCard({ list, active, onSelect, language }: {
  list: Language[]; active: number; onSelect: (macro: number) => void; language: string;
}) {
  const [hover, setHover] = useState<string>("");
  const rows = useMemo(() => {
    const groups = [-2, ...MACROAREAS.map((_, i) => i)].map((m) => {
      const sub = m === -2 ? list : list.filter((l) => l.macro === m);
      const counts = AES_LEVELS.map((a) => sub.filter((l) => l.aes === a).length);
      return { m, label: m === -2 ? tr(language, "world", "World") : tr(language, `macro${m}`, MACROAREAS[m]), counts, total: counts.reduce((a, b) => a + b, 0) };
    });
    return groups;
  }, [list, language]);
  const W = 760, L = 120, R = 56, RH = 30, GAP = 10, T = 6;
  const H = T + rows.length * (RH + GAP);
  return (
    <figure className="chart el-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={tr(language, "stackAria", "Share of languages in each endangerment status, by macroarea")}>
        {rows.map((r, i) => {
          const y = T + i * (RH + GAP);
          let x = L;
          const isOn = active === r.m || (r.m === -2 && active < 0);
          return (
            <g key={r.m} className={`el-row${isOn ? " on" : ""}`} tabIndex={0} role="button" aria-pressed={isOn}
              aria-label={`${r.label}: ${AES_LEVELS.map((a, k) => `${aesName(a, language)} ${num(r.counts[k], language)}`).join(", ")}`}
              onClick={() => onSelect(r.m === -2 ? -1 : r.m)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(r.m === -2 ? -1 : r.m); } }}>
              <text x={L - 10} y={y + RH / 2 + 4} className={`axis el-rowlabel${isOn ? " on" : ""}`} textAnchor="end">{r.label}</text>
              {r.counts.map((c, k) => {
                const w = r.total ? (c / r.total) * (W - L - R) : 0;
                const seg = <rect key={k} x={x} y={y} width={Math.max(0, w - 2)} height={RH} rx={3} style={{ fill: aesColor(AES_LEVELS[k]) }}
                  onMouseEnter={() => setHover(`${r.label} · ${aesName(AES_LEVELS[k], language)}: ${num(c, language)} (${pct(r.total ? c / r.total : 0, language)})`)}
                  onMouseLeave={() => setHover("")} />;
                x += w;
                return seg;
              })}
              <text x={W - R + 8} y={y + RH / 2 + 4} className="axis">{num(r.total, language)}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="legend el-legend">
        {AES_LEVELS.map((a) => <span key={a}><i style={{ background: aesColor(a) }} />{aesName(a, language)}</span>)}
      </figcaption>
      <p className="readout" aria-live="polite">{hover || tr(language, "stackHint", "Click a row to filter the whole page by macroarea.")}</p>
    </figure>
  );
}

/* ---------- AES × MED heatmap ---------- */
const MED_COLS: Med[] = [0, 1, 2, 3, 4];
export type Cell = { aes: Aes; med: Med } | null;

export function RiskDocHeatmap({ matrix, cell, onCellClick, language }: {
  matrix: number[][]; cell: Cell; onCellClick: (c: Cell) => void; language: string;
}) {
  const [hover, setHover] = useState<string>("");
  const max = Math.max(1, ...matrix.flat());
  const W = 760, L = 130, T = 70, CW = (W - L - 8) / MED_COLS.length, CH = 40;
  const H = T + AES_LEVELS.length * CH + 8;
  // Six-step teal ramp on a square-root scale so small cells stay visible.
  const step = (v: number) => (v === 0 ? 0 : 1 + Math.min(4, Math.floor(Math.sqrt(v / max) * 5)));
  const zone = { x: L + 3 * CW, y: T + 2 * CH, w: 2 * CW, h: 3 * CH };
  return (
    <figure className="chart el-chart el-heat">
      <svg viewBox={`0 0 ${W} ${H}`} role="grid" aria-label={tr(language, "heatAria", "Number of languages for each combination of endangerment status (rows) and most extensive description (columns)")}>
        {MED_COLS.map((m, j) => (
          <text key={m} x={L + j * CW + CW / 2} y={T - 12} className="axis" textAnchor="middle">
            {medName(m, language).split(" ").reduce<string[]>((acc, w) => { const last = acc[acc.length - 1]; if (last && (last + " " + w).length <= 12) acc[acc.length - 1] = last + " " + w; else acc.push(w); return acc; }, [])
              .map((line, k, all) => <tspan key={k} x={L + j * CW + CW / 2} dy={k === 0 ? -(all.length - 1) * 13 : 13}>{line}</tspan>)}
          </text>
        ))}
        {AES_LEVELS.map((a, i) => (
          <g key={a} role="row">
            <text x={L - 10} y={T + i * CH + CH / 2 + 4} className="axis" textAnchor="end">{aesName(a, language)}</text>
            {MED_COLS.map((m, j) => {
              const v = matrix[i][j];
              const on = cell?.aes === a && cell?.med === m;
              const label = `${aesName(a, language)} × ${medName(m, language)}: ${num(v, language)}`;
              return (
                <g key={m} role="gridcell" tabIndex={0} aria-label={label} aria-selected={on} className={`el-cell${on ? " on" : ""}`}
                  onClick={() => onCellClick(on ? null : { aes: a, med: m })}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onCellClick(on ? null : { aes: a, med: m }); } }}
                  onMouseEnter={() => setHover(label)} onMouseLeave={() => setHover("")} onFocus={() => setHover(label)}>
                  <rect x={L + j * CW + 1} y={T + i * CH + 1} width={CW - 2} height={CH - 2} rx={4} style={{ fill: `var(--el-h${step(v)})` }} />
                  <text x={L + j * CW + CW / 2} y={T + i * CH + CH / 2 + 4} textAnchor="middle" className={`el-cellnum${step(v) >= 4 ? " el-cellnum--inv" : ""}`}>{num(v, language)}</text>
                </g>
              );
            })}
          </g>
        ))}
        <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx={6} className="el-zone" aria-hidden="true" />
        <text x={zone.x + zone.w} y={zone.y + zone.h + 1} dy={-6} dx={-8} textAnchor="end" className="el-zone-label" aria-hidden="true">{tr(language, "zone", "priority zone")}</text>
      </svg>
      <p className="readout" aria-live="polite">{hover || tr(language, "heatHint", "Click a cell to filter the map, treemap, and tables to those languages. The dashed box is the priority zone: shifting or worse, no grammar sketch.")}</p>
    </figure>
  );
}

/* ---------- families, squarified treemap ---------- */
interface Rect { x: number; y: number; w: number; h: number }
function squarify<T extends { value: number }>(items: T[], box: Rect): (T & Rect)[] {
  const out: (T & Rect)[] = [];
  const total = items.reduce((s, d) => s + d.value, 0);
  const scale = (box.w * box.h) / Math.max(1, total);
  let rest = items.map((d) => ({ d, a: d.value * scale }));
  let { x, y, w, h } = box;
  const worst = (row: { a: number }[], side: number) => {
    const s = row.reduce((t, r) => t + r.a, 0), mx = Math.max(...row.map((r) => r.a)), mn = Math.min(...row.map((r) => r.a));
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  while (rest.length) {
    const side = Math.min(w, h);
    let row = [rest[0]], i = 1;
    while (i < rest.length && worst([...row, rest[i]], side) <= worst(row, side)) { row.push(rest[i]); i++; }
    const s = row.reduce((t, r) => t + r.a, 0);
    const thick = s / side;
    let off = 0;
    for (const r of row) {
      const len = r.a / thick;
      out.push(w >= h ? { ...r.d, x, y: y + off, w: thick, h: len } : { ...r.d, x: x + off, y, w: len, h: thick });
      off += len;
    }
    if (w >= h) { x += thick; w -= thick; } else { y += thick; h -= thick; }
    rest = rest.slice(i);
  }
  return out;
}
/** Share of living languages that are endangered, in five steps of the AES ramp. */
const shareStep = (p: number) => (p < 0.2 ? 1 : p < 0.4 ? 2 : p < 0.6 ? 3 : p < 0.8 ? 4 : 5);
export const SHARE_LEGEND = ["< 20%", "20–40%", "40–60%", "60–80%", "≥ 80%"];

export function FamilyTreemap({ fams, active, onSelect, language }: {
  fams: FamilyStat[]; active: number | null; onSelect: (idx: number | null) => void; language: string;
}) {
  const [hover, setHover] = useState<string>("");
  const W = 760, H = 420, TOP = 28;
  const items = useMemo(() => {
    const top = fams.filter((f) => f.idx >= 0).slice(0, TOP);
    const iso = fams.find((f) => f.idx < 0);
    const rest = fams.filter((f) => f.idx >= 0).slice(TOP);
    const other = rest.reduce((o, f) => ({ ...o, languages: o.languages + f.languages, living: o.living + f.living, endangered: o.endangered + f.endangered, extinct: o.extinct + f.extinct, priority: o.priority + f.priority }),
      { idx: -99, name: tr(language, "otherFamilies", "{n} smaller families", { n: rest.length }), languages: 0, living: 0, endangered: 0, extinct: 0, priority: 0 } as FamilyStat);
    const all = [...top, ...(iso ? [{ ...iso, name: tr(language, "isolates", "Isolates") }] : []), ...(other.languages ? [other] : [])];
    return squarify(all.map((f) => ({ ...f, value: f.languages })), { x: 0, y: 0, w: W, h: H });
  }, [fams, language]);
  return (
    <figure className="chart el-chart el-tree">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={tr(language, "treeAria", "Language families sized by number of languages and colored by the share of living languages that are endangered")}>
        {items.map((f) => {
          const share = f.living ? f.endangered / f.living : 0;
          const s = shareStep(share);
          const clickable = f.idx >= 0;
          const on = active === f.idx;
          const label = `${f.name}: ${num(f.languages, language)} ${tr(language, "langsShort", "languages")} · ${pct(share, language)} ${tr(language, "endangeredShort", "endangered")} · ${num(f.extinct, language)} ${tr(language, "extinctShort", "extinct")}`;
          return (
            <g key={f.idx} className={`el-tile${clickable ? " el-tile--btn" : ""}${on ? " on" : ""}`} tabIndex={clickable ? 0 : -1} role={clickable ? "button" : undefined}
              aria-label={label} aria-pressed={clickable ? on : undefined}
              onClick={() => clickable && onSelect(on ? null : f.idx)}
              onKeyDown={(e) => { if (clickable && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onSelect(on ? null : f.idx); } }}
              onMouseEnter={() => setHover(label)} onMouseLeave={() => setHover("")} onFocus={() => setHover(label)}>
              <rect x={f.x + 1} y={f.y + 1} width={Math.max(0, f.w - 2)} height={Math.max(0, f.h - 2)} rx={4} style={{ fill: `var(--el-a${s})` }} />
              {f.w > 64 && f.h > 30 && (
                <text x={f.x + 8} y={f.y + 18} className={`el-tile-label${s >= 3 ? " el-tile-label--inv" : ""}`}>
                  <tspan>{f.name.length * 7 > f.w - 12 ? f.name.slice(0, Math.max(3, Math.floor((f.w - 16) / 7))) + "…" : f.name}</tspan>
                  {f.h > 46 && <tspan x={f.x + 8} dy={16} className="el-tile-sub">{num(f.languages, language)} · {pct(share, language)}</tspan>}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="legend el-legend">
        <span className="muted">{tr(language, "treeLegend", "Endangered share of living languages")}</span>
        {SHARE_LEGEND.map((l, i) => <span key={l}><i style={{ background: `var(--el-a${i + 1})` }} />{l}</span>)}
      </figcaption>
      <p className="readout" aria-live="polite">{hover || tr(language, "treeHint", "Area = number of languages. Click a family to filter the page.")}</p>
    </figure>
  );
}

/* ---------- Grambank: grammatical features carried mostly by endangered languages ---------- */
export function GrammarAtRisk({ language }: { language: string }) {
  const rows = GRAMBANK.top.map(([id, value, feature, n, k]) => ({ id, value, feature, n, k, p: k / n, ci: wilson(k, n) }));
  const W = 760, L = 16, R = 70, RH = 34, T = 22;
  const H = T + rows.length * RH + 24;
  const x = (p: number) => L + p * (W - L - R);
  const base = GRAMBANK.baseEndangered;
  return (
    <figure className="chart el-chart el-gram">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tr(language, "gramAria", "Ten Grambank feature values with the highest share of endangered or extinct languages among the languages that have them, with 95% intervals")}>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={T - 6} y2={H - 20} className="grid" />
            <text x={x(v)} y={H - 4} className="axis" textAnchor="middle">{pct(v, language)}</text>
          </g>
        ))}
        <line x1={x(base)} x2={x(base)} y1={T - 14} y2={H - 20} className="el-base" />
        <text x={x(base) + 6} y={T - 10} className="el-base-label">{tr(language, "baseline", "all Grambank languages {p}", { p: pct(base, language) })}</text>
        {rows.map((r, i) => {
          const y = T + i * RH;
          return (
            <g key={r.id + r.value}>
              <title>{`${r.id} = ${r.value}: ${r.feature} (${num(r.k, language)} / ${num(r.n, language)})`}</title>
              <rect x={x(0)} y={y + 14} width={x(r.p) - x(0)} height={10} rx={3} className="el-gbar" />
              <line x1={x(r.ci[0])} x2={x(r.ci[1])} y1={y + 19} y2={y + 19} className="el-ci" />
              <text x={L} y={y + 10} className="el-gtext">{`${r.id} = ${r.value === "1" ? tr(language, "yes", "yes") : r.value === "0" ? tr(language, "no", "no") : r.value} · ${r.feature.length > 92 ? r.feature.slice(0, 90) + "…" : r.feature}`}</text>
              <text x={W - R + 8} y={y + 24} className="axis">{pct(r.p, language)} <tspan className="el-n">n={r.n}</tspan></text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

/* ---------- typology coverage by AES ---------- */
export function CoverageChart({ list, language }: { list: Language[]; language: string }) {
  const rows = AES_LEVELS.map((a) => {
    const sub = list.filter((l) => l.aes === a);
    return { a, n: sub.length, gb: sub.filter((l) => l.grambank).length, wals: sub.filter((l) => l.wals).length };
  });
  const W = 760, L = 130, R = 50, RH = 40, T = 10;
  const H = T + rows.length * RH + 24;
  const top = Math.max(0.2, Math.ceil(Math.max(...rows.map((r) => (r.n ? Math.max(r.gb, r.wals) / r.n : 0))) * 10) / 10);
  const x = (p: number) => L + (p / top) * (W - L - R);
  const ticks = Array.from({ length: Math.round(top * 10) + 1 }, (_, i) => i / 10);
  return (
    <figure className="chart el-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tr(language, "covAria", "Share of languages coded in Grambank and in WALS, by endangerment status")}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={T} y2={H - 20} className="grid" />
            <text x={x(v)} y={H - 4} className="axis" textAnchor="middle">{pct(v, language)}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const y = T + i * RH, pg = r.n ? r.gb / r.n : 0, pw = r.n ? r.wals / r.n : 0;
          return (
            <g key={r.a}>
              <title>{`${aesName(r.a, language)}: Grambank ${num(r.gb, language)} / ${num(r.n, language)}, WALS ${num(r.wals, language)} / ${num(r.n, language)}`}</title>
              <text x={L - 10} y={y + 20} className="axis" textAnchor="end">{aesName(r.a, language)}</text>
              <rect x={x(0)} y={y + 6} width={Math.max(0, x(pg) - x(0))} height={11} rx={3} className="el-cov-gb" />
              <rect x={x(0)} y={y + 19} width={Math.max(0, x(pw) - x(0))} height={11} rx={3} className="el-cov-wals" />
              <text x={x(pg) + 6} y={y + 15} className="el-n">{pct(pg, language)}</text>
              <text x={x(pw) + 6} y={y + 28} className="el-n">{pct(pw, language)}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="keys">
        <span><i className="el-k-gb" />Grambank 1.0.3</span>
        <span><i className="el-k-wals" />WALS 2020.6</span>
      </figcaption>
    </figure>
  );
}

export { aesName, medName, totals };
