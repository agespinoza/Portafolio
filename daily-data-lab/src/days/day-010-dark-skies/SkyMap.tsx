// Day 010 map: the World Atlas 2015 (Falchi et al. 2016) as a downsampled image under Day 003's Equal Earth SVG map, with
// certified dark-sky places (Wikidata) and Globe at Night observation cells on top. A second view zooms on
// Arizona–Sonora at 1′ (about 1.8 km). Images: scripts/day-010/raster.py.
import { useMemo, useState } from "react";
import { project, VIEWS as LP_VIEWS } from "../day-003-light-pillars/WorldMap";
import { LAND_RINGS } from "../day-003-light-pillars/data";
import { type Place, type PlaceType, GAN, IMG, RASTER, TYPE_COLOR, bandOf, BANDS, aboveNatural } from "./data";
import { tr, num } from "./text";

export const VIEWS = [
  ...LP_VIEWS.filter((v) => v.id !== "asia"),
  { id: "azson", key: "viewAzson", label: "Arizona–Sonora", box: [-118, 26, -106, 38] as [number, number, number, number] },
];
export interface Layers { atlas: boolean; places: boolean; gan: boolean }

const W = project(180, 0)[0];
const ring = (pts: [number, number][]) => `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z`;
const OUTLINE = (() => {
  const pts: [number, number][] = [];
  for (let lat = -90; lat <= 90; lat += 2) pts.push(project(180, lat));
  for (let lat = 90; lat >= -90; lat -= 2) pts.push(project(-180, lat));
  return ring(pts);
})();
const LAND = LAND_RINGS.map((r) => {
  let prev = r[0][0], shift = 0;
  return ring(r.map(([lon, lat]) => {
    if (lon - prev > 180) shift -= 360; else if (prev - lon > 180) shift += 360;
    prev = lon;
    return project(lon + shift, lat);
  }));
}).join("");

function worldViewBox(box: [number, number, number, number]): string {
  if (box[0] === -180 && box[2] === 180) {
    const top = project(0, 85)[1], bottom = project(0, -60)[1];
    return `${-W - 4} ${top - 4} ${2 * W + 8} ${bottom - top + 8}`;
  }
  const pts: [number, number][] = [];
  for (let lon = box[0]; lon <= box[2]; lon += 5) for (const lat of [box[1], box[3], (box[1] + box[3]) / 2]) pts.push(project(lon, lat));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return `${Math.min(...xs)} ${Math.min(...ys)} ${Math.max(...xs) - Math.min(...xs)} ${Math.max(...ys) - Math.min(...ys)}`;
}

/* ---------- Arizona–Sonora: plate carrée scaled by cos(32°), 60 SVG units per degree of latitude ---------- */
const AZ = RASTER.azson;
const K = 60, COS = Math.cos((32 * Math.PI) / 180);
const azXY = (lon: number, lat: number): [number, number] => [(lon - AZ.west) * COS * K, (AZ.north - lat) * K];
const AZ_W = (AZ.east - AZ.west) * COS * K, AZ_H = (AZ.north - AZ.south) * K;
// US–Mexico border, Pacific to El Paso, from its published turning points (approximate at this scale).
const BORDER: [number, number][] = [[-117.12, 32.53], [-114.72, 32.72], [-114.81, 32.49], [-111.07, 31.33], [-108.21, 31.33], [-108.21, 31.78], [-106.53, 31.78]];
const CITIES: { name: string; lon: number; lat: number; check?: string }[] = [
  { name: "Phoenix", lon: -112.07, lat: 33.45, check: "Phoenix" }, { name: "Tucson", lon: -110.97, lat: 32.22, check: "Tucson" },
  { name: "Hermosillo", lon: -110.96, lat: 29.07, check: "Hermosillo" }, { name: "Kitt Peak", lon: -111.6, lat: 31.96, check: "Kitt Peak" },
  { name: "Flagstaff", lon: -111.65, lat: 35.2 }, { name: "Las Vegas", lon: -115.14, lat: 36.17 }, { name: "Mexicali", lon: -115.45, lat: 32.62 },
];

/** Colour of a Globe at Night cell by median limiting magnitude: bright skies warm, dark skies pale blue. */
const lmColor = (m: number) => (m <= 2 ? "#f08a4b" : m <= 3 ? "#f4d35e" : m <= 4 ? "#6fcf97" : m <= 5 ? "#7fd3e3" : "#d9e8ff");

export default function SkyMap({ places, view, layers, selected, onSelect, language }: {
  places: Place[]; view: string; layers: Layers; selected: string | null; onSelect: (id: string | null) => void; language: string;
}) {
  const [hover, setHover] = useState("");
  const isAz = view === "azson";
  const box = VIEWS.find((v) => v.id === view)?.box ?? VIEWS[0].box;
  const vb = useMemo(() => (isAz ? `0 0 ${AZ_W.toFixed(1)} ${AZ_H}` : worldViewBox(box)), [view]);
  const zoom = isAz ? 1 : view === "world" ? 1 : 2.6;
  const xy = (lon: number, lat: number) => (isAz ? azXY(lon, lat) : project(lon, lat));
  const inBox = (lon: number, lat: number) => !isAz || (lon >= AZ.west && lon <= AZ.east && lat >= AZ.south && lat <= AZ.north);
  const typeLabel = (t: PlaceType) => tr(language, `type_${t}`, { park: "Park", reserve: "Reserve", sanctuary: "Sanctuary", community: "Community" }[t]);
  const placeText = (p: Place) => tr(language, "placeReadout", "{name} · {type}, {country} · certified {year}{sky}", {
    name: p.name, type: typeLabel(p.type), country: p.countryName ?? "—", year: p.yearCertified ?? "—",
    sky: p.atlas == null ? "" : tr(language, "placeSky", " · sky {pct} above natural ({band})", { pct: `${num(aboveNatural(p.atlas) * 100, language, 0)}%`, band: tr(language, `band${bandOf(p.atlas)}`, BANDS[bandOf(p.atlas)].label) }),
  });
  const cells = isAz ? GAN.azCells.map(([lo, la, k, m]) => [lo, la, k, m] as [number, number, number, number]) : GAN.cells;
  const cellR = isAz ? 2.6 : 1.1 / zoom;
  const W0 = RASTER.world;
  const shown = places.filter((p) => p.lat != null && p.lon != null && inBox(p.lon, p.lat));

  return (
    <div className="lp-map ds-map">
      <svg viewBox={vb} role="group" preserveAspectRatio="xMidYMid meet"
        aria-label={isAz
          ? tr(language, "azMapAria", "Arizona–Sonora: artificial sky brightness with {n} certified dark-sky places", { n: shown.length })
          : tr(language, "mapAria", "World map of artificial sky brightness with {n} certified dark-sky places", { n: shown.length })}>
        <defs>
          <clipPath id="ds-clip"><path d={OUTLINE} /></clipPath>
          <filter id="ds-glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation={isAz ? 3 : 1.4 / zoom} /></filter>
        </defs>
        {isAz ? (
          <g>
            <rect x={0} y={0} width={AZ_W} height={AZ_H} className="ds-az-bg" />
            {layers.atlas && <image href={IMG.azson} x={0} y={0} width={AZ_W} height={AZ_H} preserveAspectRatio="none" />}
            <path d={`M${BORDER.map((p) => azXY(p[0], p[1]).map((v) => v.toFixed(1)).join(",")).join("L")}`} className="ds-border" />
            <text {...{ x: azXY(-113.4, 31.55)[0], y: azXY(-113.4, 31.55)[1] }} className="ds-border__label">{tr(language, "borderLabel", "US–Mexico border (approx.)")}</text>
            {CITIES.map((c) => {
              const [x, y] = azXY(c.lon, c.lat);
              const v = c.check ? RASTER.checks[c.check] : null;
              return <g key={c.name} className="ds-city"><circle cx={x} cy={y} r={2.2} /><text x={x + 6} y={y - 5}>{c.name}{v != null ? ` · ${num(v * 1000, language, 0)} μcd/m²` : ""}</text></g>;
            })}
          </g>
        ) : (
          <g>
            <path d={OUTLINE} className="lp-sphere" />
            <g clipPath="url(#ds-clip)">
              <path d={LAND} className="lp-land ds-land" />
              {layers.atlas && <image href={IMG.world} x={W0.x} y={W0.y} width={W0.w} height={W0.h} preserveAspectRatio="none" />}
            </g>
            <path d={OUTLINE} className="lp-sphere-edge" />
          </g>
        )}
        {layers.gan && cells.map(([lo, la, k, m]) => {
          if (!inBox(lo, la)) return null;
          const [x, y] = xy(lo, la);
          const text = tr(language, "cellReadout", "Globe at Night, {lat}°, {lon}°: {k} observations, median limiting magnitude {m}", { lat: num(la, language, isAz ? 2 : 1), lon: num(lo, language, isAz ? 2 : 1), k: num(k, language), m: num(m, language, 1) });
          return <rect key={`${lo}:${la}`} x={x - cellR} y={y - cellR} width={cellR * 2} height={cellR * 2} style={{ fill: lmColor(m) }} className="ds-cell"
            onMouseEnter={() => setHover(text)} onMouseLeave={() => setHover("")}><title>{text}</title></rect>;
        })}
        {layers.places && shown.map((p) => {
          const [x, y] = xy(p.lon!, p.lat!);
          const on = p.id === selected, r = (isAz ? 5 : 3.2) / zoom, color = TYPE_COLOR[p.type];
          const text = placeText(p);
          return (
            <g key={p.id} className={`lp-pt ds-pt${on ? " on" : ""}`} tabIndex={0} role="button" aria-pressed={on} aria-label={text}
              onClick={() => onSelect(on ? null : p.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(on ? null : p.id); } }}
              onMouseEnter={() => setHover(text)} onMouseLeave={() => setHover("")} onFocus={() => setHover(text)} onBlur={() => setHover("")}>
              <circle cx={x} cy={y} r={r * 2.4} fill={color} opacity={0.35} filter="url(#ds-glow)" />
              <circle cx={x} cy={y} r={r} fill={color} stroke="#050a16" strokeWidth={(isAz ? 1 : 0.5) / zoom} />
              {on && <circle cx={x} cy={y} r={r * 2.4} fill="none" stroke="#fff" strokeWidth={(isAz ? 1.5 : 1) / zoom} />}
            </g>
          );
        })}
      </svg>
      <p className="readout lp-readout" aria-live="polite">
        {hover || tr(language, "mapHover", "Hover, focus or click a place. Colours under the dots are the 2015 atlas: dark blue barely polluted, yellow where the Milky Way is gone, white where eyes cannot adapt to the dark.")}
      </p>
    </div>
  );
}

export function SkyLegend({ language }: { language: string }) {
  return (
    <div className="ds-legend" aria-hidden="true">
      <div className="ds-ramp" />
      <div className="ds-ramp__ticks">{["1.7", "14", "87", "688", "3000"].map((t) => <span key={t}>{t}</span>)}</div>
      <p className="lp-legend__note">{tr(language, "rampNote", "Artificial zenith brightness, μcd/m² (natural sky ≈ 174).")}</p>
    </div>
  );
}
export { lmColor };
