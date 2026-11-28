// Day 011 map: the 50 largest bilateral flows of a spice (FAOSTAT Detailed trade matrix, importer reports) as arcs
// from exporter to importer on Day 003's Equal Earth map, with an optional historical layer: schematic routes and
// places of the cited events (scripts/day-011/history.json). Nodes sit at the capital city given by the World Bank.
import { useMemo, useState } from "react";
import { project } from "../day-003-light-pillars/WorldMap";
import { LAND_RINGS } from "../day-003-light-pillars/data";
import { type Flow, type HistoryEvent, type SpiceId, BY_ISO, COLOR, EVENTS, FLOWS } from "./data";
import { tr, usd, tonnes, countryName } from "./text";

export const VIEWS: { id: string; key: string; label: string; box: [number, number, number, number] }[] = [
  { id: "world", key: "viewWorld", label: "World", box: [-180, -58, 180, 80] },
  { id: "indian", key: "viewIndian", label: "Indian Ocean & Asia", box: [-12, -38, 150, 56] },
  { id: "europe", key: "viewEurope", label: "Europe & Mediterranean", box: [-25, 25, 60, 70] },
  { id: "americas", key: "viewAmericas", label: "Americas", box: [-130, -40, -30, 55] },
];

const W = project(180, 0)[0];
const path = (pts: [number, number][], close = false) => `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}${close ? "Z" : ""}`;
const OUTLINE = (() => {
  const pts: [number, number][] = [];
  for (let lat = -90; lat <= 90; lat += 2) pts.push(project(180, lat));
  for (let lat = 90; lat >= -90; lat -= 2) pts.push(project(-180, lat));
  return path(pts, true);
})();
const LAND = LAND_RINGS.map((r) => {
  let prev = r[0][0], shift = 0;
  return path(r.map(([lon, lat]) => {
    if (lon - prev > 180) shift -= 360; else if (prev - lon > 180) shift += 360;
    prev = lon;
    return project(lon + shift, lat);
  }), true);
}).join("");
function viewBox(box: [number, number, number, number]): string {
  if (box[0] === -180 && box[2] === 180) {
    const top = project(0, box[3])[1], bottom = project(0, box[1])[1];
    return `${-W - 4} ${top - 4} ${2 * W + 8} ${bottom - top + 8}`;
  }
  const pts: [number, number][] = [];
  for (let lon = box[0]; lon <= box[2]; lon += 5) for (const lat of [box[1], box[3], (box[1] + box[3]) / 2]) pts.push(project(lon, lat));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return `${Math.min(...xs)} ${Math.min(...ys)} ${Math.max(...xs) - Math.min(...xs)} ${Math.max(...ys) - Math.min(...ys)}`;
}
const xy = (iso3: string): [number, number] | null => {
  const c = BY_ISO.get(iso3);
  return c && c.lat != null && c.lon != null ? project(c.lon, c.lat) : null;
};
/** A gentle arc bending to the left of the exporter → importer direction. */
function arc(a: [number, number], b: [number, number]): string {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]], len = Math.hypot(dx, dy) || 1, k = Math.min(0.28 * len, 60);
  const mx = (a[0] + b[0]) / 2 - (dy / len) * k, my = (a[1] + b[1]) / 2 + (dx / len) * k;
  return `M${a[0].toFixed(1)},${a[1].toFixed(1)}Q${mx.toFixed(1)},${my.toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`;
}
export const cName = (iso3: string, language: string) => {
  const c = BY_ISO.get(iso3);
  return c ? countryName(c.iso2, c.name, language) : iso3;
};

export default function FlowMap({ spice, year, view, history, event, onEvent, country, onCountry, language }: {
  spice: SpiceId; year: number; view: string; history: boolean; event: string | null; onEvent: (id: string) => void;
  country: string | null; onCountry: (iso3: string) => void; language: string;
}) {
  const [hover, setHover] = useState("");
  const flows: Flow[] = FLOWS[spice][year] ?? [];
  const box = VIEWS.find((v) => v.id === view)?.box ?? VIEWS[0].box;
  const maxUsd = Math.max(1, ...flows.map((f) => f[3] ?? 0));
  const width = (v: number | null) => 0.6 + 5.4 * Math.sqrt((v ?? 0) / maxUsd);
  const nodes = useMemo(() => {
    const m = new Map<string, { exp: number; imp: number }>();
    for (const [imp, exp, , v] of flows) {
      m.set(exp, { exp: (m.get(exp)?.exp ?? 0) + (v ?? 0), imp: m.get(exp)?.imp ?? 0 });
      m.set(imp, { exp: m.get(imp)?.exp ?? 0, imp: (m.get(imp)?.imp ?? 0) + (v ?? 0) });
    }
    return [...m.entries()].map(([iso3, s]) => ({ iso3, ...s, p: xy(iso3) })).filter((n) => n.p);
  }, [flows]);
  const maxNode = Math.max(1, ...nodes.map((n) => Math.max(n.exp, n.imp)));
  const events: HistoryEvent[] = history ? EVENTS : [];
  const readFlow = (f: Flow) => tr(language, "flowReadout", "{from} → {to}, {y}: {usd} · {t} (reported by the importer)", { from: cName(f[1], language), to: cName(f[0], language), y: year, usd: usd(f[3], language), t: tonnes(f[2], language) });
  const sorted = [...flows].sort((a, b) => (a[3] ?? 0) - (b[3] ?? 0));
  return (
    <figure className="chart sp-map">
      <svg viewBox={viewBox(box)} role="group" aria-label={tr(language, "mapAria", "Largest bilateral spice flows, exporter to importer")}>
        <path d={OUTLINE} className="sp-ocean" />
        <path d={LAND} className="sp-land" />
        {sorted.map((f, i) => {
          const a = xy(f[1]), b = xy(f[0]);
          if (!a || !b) return null;
          const on = country && (f[0] === country || f[1] === country);
          const text = readFlow(f);
          return (
            <path key={`${f[0]}-${f[1]}-${i}`} d={arc(a, b)} className={`sp-arc${on ? " sp-arc--on" : ""}${country && !on ? " sp-arc--dim" : ""}`}
              style={{ stroke: COLOR[spice], strokeWidth: width(f[3]) }} tabIndex={0} role="img" aria-label={text}
              onMouseEnter={() => setHover(text)} onMouseLeave={() => setHover("")} onFocus={() => setHover(text)} onBlur={() => setHover("")} />
          );
        })}
        {nodes.map((n) => {
          const r = 1.6 + 4 * Math.sqrt(Math.max(n.exp, n.imp) / maxNode), exporter = n.exp >= n.imp;
          const text = tr(language, "nodeReadout", "{c}: exports {x} and imports {m} within these {n} flows. Click for its profile.", { c: cName(n.iso3, language), x: usd(n.exp, language), m: usd(n.imp, language), n: flows.length });
          return (
            <g key={n.iso3} className={`sp-node${n.iso3 === country ? " sp-node--on" : ""}${n.iso3 === "MEX" ? " sp-node--hl" : ""}`} tabIndex={0} role="button" aria-label={text}
              onClick={() => onCountry(n.iso3)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onCountry(n.iso3); } }}
              onMouseEnter={() => setHover(text)} onMouseLeave={() => setHover("")} onFocus={() => setHover(text)} onBlur={() => setHover("")}>
              <circle cx={n.p![0]} cy={n.p![1]} r={r} className={exporter ? "sp-node__exp" : "sp-node__imp"} style={exporter ? { fill: COLOR[spice] } : { stroke: COLOR[spice] }} />
            </g>
          );
        })}
        {events.filter((e) => e.route.length > 1).map((e) => (
          <path key={`r-${e.id}`} d={path(e.route.map(([lon, lat]) => project(lon, lat)))} className={`sp-route${event === e.id ? " sp-route--on" : ""}`} />
        ))}
        {events.flatMap((e) => e.places.map(([lon, lat, name], k) => {
          const [x, y] = project(lon, lat), text = `${e.when} · ${name}: ${tr(language, `h_${e.id}`, e.text)}`;
          return (
            <g key={`p-${e.id}-${k}`} className={`sp-place${event === e.id ? " sp-place--on" : ""}`} tabIndex={0} role="button" aria-label={text}
              onClick={() => onEvent(e.id)} onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onEvent(e.id); } }}
              onMouseEnter={() => setHover(text)} onMouseLeave={() => setHover("")} onFocus={() => setHover(text)} onBlur={() => setHover("")}>
              <rect x={x - 2.6} y={y - 2.6} width={5.2} height={5.2} transform={`rotate(45 ${x} ${y})`} />
              {event === e.id && <text x={x + 5} y={y - 4}>{name}</text>}
            </g>
          );
        }))}
      </svg>
      <figcaption className="legend">
        <span><i style={{ background: COLOR[spice] }} />{tr(language, "legendExporter", "Mainly exporter (size: value in these flows)")}</span>
        <span><i className="sp-key-ring" style={{ borderColor: COLOR[spice] }} />{tr(language, "legendImporter", "Mainly importer")}</span>
        <span><i className="sp-key-arc" style={{ background: COLOR[spice] }} />{tr(language, "legendArc", "Flow, bending left from exporter to importer (width: US$)")}</span>
        {history && <span><i className="sp-key-route" />{tr(language, "legendRoute", "Historical route (schematic) and places")}</span>}
      </figcaption>
      <p className="readout" aria-live="polite">{hover || tr(language, "mapHint", "Hover or focus an arc or a country; click a country to open its profile.")}</p>
    </figure>
  );
}
