import { useMemo, useState } from "react";
import { type Obs, LAND_RINGS, PH } from "./data";
import { tr, num } from "./text";

// Equal Earth projection (Šavrič, Patterson & Jenny 2018): equal-area, so dense areas are not inflated.
const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, M = Math.sqrt(3) / 2;
const R = 150;
export function project(lon: number, lat: number): [number, number] {
  const l = (lon * Math.PI) / 180, p = (lat * Math.PI) / 180;
  const t = Math.asin(M * Math.sin(p)), t2 = t * t, t6 = t2 * t2 * t2;
  const x = (l * Math.cos(t)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
  const y = t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
  return [x * R, -y * R];
}

const W = project(180, 0)[0];
const outline = (() => {
  const pts: string[] = [];
  for (let lat = -90; lat <= 90; lat += 2) pts.push(project(180, lat).map((v) => v.toFixed(1)).join(","));
  for (let lat = 90; lat >= -90; lat -= 2) pts.push(project(-180, lat).map((v) => v.toFixed(1)).join(","));
  return `M${pts.join("L")}Z`;
})();

// Land rings that cross the antimeridian are unwrapped and clipped by the outline.
const LAND = (() => LAND_RINGS.map((ring) => {
  let prev = ring[0][0], shift = 0;
  const pts = ring.map(([lon, lat]) => {
    if (lon - prev > 180) shift -= 360; else if (prev - lon > 180) shift += 360;
    prev = lon;
    return project(lon + shift, lat);
  });
  return `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z`;
}).join(""))();

const GRATICULE = (() => {
  const d: string[] = [];
  for (let lon = -150; lon <= 150; lon += 30) {
    const pts = []; for (let lat = -90; lat <= 90; lat += 3) pts.push(project(lon, lat));
    d.push(`M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}`);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts = []; for (let lon = -180; lon <= 180; lon += 3) pts.push(project(lon, lat));
    d.push(`M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}`);
  }
  return d.join("");
})();
const CIRCLES = [66.56, -66.56].map((lat) => {
  const pts = []; for (let lon = -180; lon <= 180; lon += 3) pts.push(project(lon, lat));
  return `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}`;
}).join("");

export const VIEWS: { id: string; key: string; label: string; box: [number, number, number, number] }[] = [
  { id: "world", key: "viewWorld", label: "World", box: [-180, -60, 180, 90] },
  { id: "europe", key: "viewEurope", label: "Europe", box: [-25, 34, 45, 72] },
  { id: "namerica", key: "viewNorthAmerica", label: "North America", box: [-170, 15, -50, 75] },
  { id: "asia", key: "viewAsia", label: "Asia", box: [60, 10, 160, 75] },
];

function viewBox(box: [number, number, number, number]): string {
  if (box[0] === -180 && box[2] === 180) {
    const top = project(0, box[3])[1], bottom = project(0, box[1])[1];
    return `${-W - 4} ${top - 4} ${2 * W + 8} ${bottom - top + 8}`;
  }
  const pts = [];
  for (let lon = box[0]; lon <= box[2]; lon += 5) for (const lat of [box[1], box[3], (box[1] + box[3]) / 2]) pts.push(project(lon, lat));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  return `${x0} ${y0} ${x1 - x0} ${y1 - y0}`;
}

/** The colour of a record on the map: pillars first, then the halo it shows. */
export const primary = (o: Obs) =>
  o.phenomena.find((p) => PH[p].family === "reflection") ?? o.phenomena[0];

export default function WorldMap({ rows, selected, onSelect, view, language }: {
  rows: Obs[]; selected: string | null; onSelect: (id: string | null) => void; view: string; language: string;
}) {
  const [hover, setHover] = useState<Obs | null>(null);
  const box = VIEWS.find((v) => v.id === view)?.box ?? VIEWS[0].box;
  const vb = useMemo(() => viewBox(box), [box]);
  const zoom = view === "world" ? 1 : 2.6;
  // draw pillars last so the rarer class stays visible
  const ordered = useMemo(() => [...rows].sort((a, b) => Number(a.families.includes("reflection")) - Number(b.families.includes("reflection"))), [rows]);
  const active = hover ?? rows.find((r) => r.id === selected) ?? null;

  return (
    <div className="lp-map">
      <svg viewBox={vb} role="group" preserveAspectRatio="xMidYMid meet"
        aria-label={tr(language, "mapAria", "World map with {n} located photographs of ice-crystal optics", { n: num(rows.length, language) })}>
        <defs>
          <clipPath id="lp-clip"><path d={outline} /></clipPath>
          <filter id="lp-glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation={1.6 / zoom} /></filter>
        </defs>
        <path d={outline} className="lp-sphere" />
        <g clipPath="url(#lp-clip)">
          <path d={GRATICULE} className="lp-grat" />
          <path d={CIRCLES} className="lp-polar" />
          <path d={LAND} className="lp-land" />
        </g>
        <path d={outline} className="lp-sphere-edge" />
        {ordered.map((o) => {
          const [x, y] = project(o.lon!, o.lat!);
          const ph = primary(o);
          const color = PH[ph].color;
          const on = o.id === selected;
          const r = (o.families.includes("reflection") ? 3.4 : 2.5) / zoom;
          return (
            <g key={o.id} className={`lp-pt${on ? " on" : ""}`} tabIndex={0} role="button" aria-pressed={on}
              aria-label={tr(language, "pointAria", "{ph}, {place}, {date}, evidence level {ev}", {
                ph: tr(language, PH[ph].key, PH[ph].label), place: o.country ?? tr(language, "unknownPlace", "unknown place"), date: o.date, ev: o.evidence,
              })}
              onClick={() => onSelect(on ? null : o.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(on ? null : o.id); } }}
              onMouseEnter={() => setHover(o)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(o)} onBlur={() => setHover(null)}>
              <circle cx={x} cy={y} r={r * 2.6} fill={color} opacity={0.35} filter="url(#lp-glow)" />
              {o.evidence === "A"
                ? <circle cx={x} cy={y} r={r} fill={color} stroke="#050a16" strokeWidth={0.5 / zoom} />
                : <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={1.1 / zoom} />}
              {on && <circle cx={x} cy={y} r={r * 2.4} fill="none" stroke="#fff" strokeWidth={1 / zoom} />}
            </g>
          );
        })}
      </svg>
      <p className="readout lp-readout" aria-live="polite">
        {active
          ? <><strong>{tr(language, PH[primary(active)].key, PH[primary(active)].label)}</strong> · {active.country ?? "—"} · {active.date}{active.time ? ` ${active.time}` : ""} · {tr(language, "evidenceShort", "evidence {ev}", { ev: active.evidence })}</>
          : tr(language, "mapHover", "Hover, focus, or click a point. Filled points have camera coordinates and a capture time; rings have a place but no time or an object location.")}
      </p>
    </div>
  );
}
