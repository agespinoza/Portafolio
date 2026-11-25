// Day 007 · 3-D shell view: every object in orbit drawn as a dot at its real mean altitude and inclination, on a
// hand-drawn canvas (no 3-D library), in the same night style as the Day 003 simulator. SATCAT has no node or phase,
// so each object's place around its shell is a fixed pseudo-random spread: the picture shows density by altitude and
// inclination, not where anything is right now. Drag or use the arrow keys to turn the globe.
import { type KeyboardEvent, type PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { type Cls, CLASSES } from "./data";
import LAND from "../day-003-light-pillars/world-land.json";

/** Natural Earth 1:110m land rings ([lon, lat]) as unit vectors, drawn only in live mode (positions are Earth-fixed). */
const COAST: Float32Array[] = (LAND as unknown as { rings: [number, number][][] }).rings.map((ring) => {
  const out = new Float32Array(ring.length * 3);
  ring.forEach(([lon, lat], i) => {
    const a = (lon * Math.PI) / 180, b = (lat * Math.PI) / 180;
    out[i * 3] = Math.cos(b) * Math.cos(a); out[i * 3 + 1] = Math.cos(b) * Math.sin(a); out[i * 3 + 2] = Math.sin(b);
  });
  return out;
});

const R_EARTH = 6378.137;
/** Night palette (the canvas is always dark): same hues as the page's dark-mode tokens. */
export const DOT: Record<Cls, string> = { active: "#5cc2d6", inactive: "#9aa6ba", rocket: "#d9b37a", debris: "#f08a4b", unknown: "#c9ced6" };

export type Scale = "leo" | "true";
export interface GlobeCell { cls: number; alt: number; inc: number; n: number }
/** Real Earth-fixed positions in Earth radii (z = north) from SGP4, one kind per object. */
export interface LiveDots { pos: Float32Array; cls: Uint8Array }
export interface Props {
  cells: GlobeCell[]; scale: Scale; hidden: Set<number>; ariaLabel: string; hint: string;
  /** When set, draw these real positions (and the continents) instead of the catalogue shells. */
  live?: LiveDots | null;
  /** Readout for the shell whose outer edge is under the pointer. */
  shellReadout: (lo: number, hi: number, counts: number[]) => string;
}

/** Deterministic PRNG so the dots do not jump when the filter changes. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Radius in Earth radii. Close-up exaggerates low orbit (2,000 km → 1.7 R); true scale is to scale. */
export const radius = (alt: number, scale: Scale) => (scale === "leo" ? 1 + (Math.min(alt, 2000) / 2000) * 0.7 : 1 + alt / R_EARTH);
export const altFromRadius = (r: number, scale: Scale) => (scale === "leo" ? ((r - 1) / 0.7) * 2000 : (r - 1) * R_EARTH);


export interface Dots { pos: Float32Array; cls: Uint8Array; alt: Float32Array; n: number }
/** One dot per object: position in Earth radii (x, y, z with z = north), its kind, and its altitude. */
export function buildDots(cells: GlobeCell[], scale: Scale, live: LiveDots | null | undefined): Dots {
    if (live) {
      // Real positions: keep the direction, map the altitude onto the chosen radial scale (close-up keeps low orbit only).
      const n0 = live.cls.length, pos = new Float32Array(n0 * 3), cls = new Uint8Array(n0), altA = new Float32Array(n0);
      let k = 0;
      for (let j = 0; j < n0; j++) {
        const x = live.pos[j * 3], y = live.pos[j * 3 + 1], z = live.pos[j * 3 + 2], r = Math.hypot(x, y, z);
        if (r < 1) continue; // not propagated
        const alt = (r - 1) * R_EARTH;
        if (scale === "leo" && alt >= 2000) continue;
        const f = radius(alt, scale) / r;
        pos[k * 3] = x * f; pos[k * 3 + 1] = y * f; pos[k * 3 + 2] = z * f; cls[k] = live.cls[j]; altA[k] = alt; k++;
      }
      return { pos, cls, alt: altA, n: k };
    }
    const visible = cells.filter((c) => (scale === "true" || c.alt < 2000));
    const total = visible.reduce((a, c) => a + c.n, 0);
    const pos = new Float32Array(total * 3), cls = new Uint8Array(total), altA = new Float32Array(total);
    let k = 0;
    for (const c of visible) {
      const rnd = mulberry32(c.alt * 7919 + c.inc * 104729 + c.cls * 15485863);
      const q = c.alt < 2000 ? 10 : 100; // spread each dot within its 10 km (or 100 km) step, rounded down in the data
      for (let j = 0; j < c.n; j++) {
        const alt = c.alt + rnd() * q, inc = ((c.inc + rnd() - 0.5) * Math.PI) / 180;
        const r = radius(alt, scale), node = rnd() * Math.PI * 2, u = rnd() * Math.PI * 2;
        const cu = Math.cos(u), su = Math.sin(u), cn = Math.cos(node), sn = Math.sin(node);
        pos[k * 3] = r * (cn * cu - sn * su * Math.cos(inc));
        pos[k * 3 + 1] = r * (sn * cu + cn * su * Math.cos(inc));
        pos[k * 3 + 2] = r * su * Math.sin(inc);
        cls[k] = c.cls; altA[k] = alt; k++;
      }
    }
    return { pos, cls, alt: altA, n: total };
}

/** Counts per shell (bin of binKm) and kind, for the pointer readout. */
export function shellBins(dots: Dots, binKm: number): Map<number, number[]> {
    const m = new Map<number, number[]>();
    for (let k = 0; k < dots.n; k++) {
      const b = Math.floor(dots.alt[k] / binKm);
      const row = m.get(b) ?? CLASSES.map(() => 0);
      row[dots.cls[k]] += 1;
      m.set(b, row);
    }
    return m;
}

export function CanvasGlobe({ cells, scale, hidden, ariaLabel, hint, shellReadout, live }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [w, setW] = useState(640);
  const view = useRef({ yaw: 0.6, pitch: 0.35 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [readout, setReadout] = useState("");
  const [tick, setTick] = useState(0);
  const H = Math.round(Math.min(560, Math.max(320, w * 0.72)));

  // One dot per object: position in Earth radii (x, y, z with z = north), its kind, and its altitude.
  const dots = useMemo(() => buildDots(cells, scale, live), [cells, scale, live]);

  // Counts per shell for the pointer readout: 50 km bins in close-up, 1,000 km bins at true scale.
  const binKm = scale === "leo" ? 50 : 1000;
  const bins = useMemo(() => shellBins(dots, binKm), [dots, binKm]);

  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Slow spin unless the visitor prefers reduced motion or is dragging.
  useEffect(() => {
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, last = 0;
    const loop = (t: number) => {
      if (!drag.current && last) { view.current.yaw += (t - last) * 0.00008; setTick((x) => x + 1); }
      last = t; raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scaleR = () => (Math.min(w, H) / 2 - 12) / (scale === "leo" ? 1.72 : 7.1);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, H);
    const cx = w / 2, cy = H / 2, s = scaleR();
    const { yaw, pitch } = view.current;
    const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    // View: turn about the polar axis (yaw), then tilt toward the viewer (pitch). Screen x right, y up, depth toward viewer.
    const project = (x: number, y: number, z: number) => {
      const x1 = x * cyw - y * syw, y1 = x * syw + y * cyw;
      return { sx: cx + x1 * s, sy: cy - (z * cp - y1 * sp) * s, d: z * sp + y1 * cp };
    };
    const size = dots.n > 20000 ? 1.4 : dots.n > 3000 ? 1.8 : 2.4;
    const alpha = dots.n > 20000 ? 0.55 : 0.8;
    const drawDots = (front: boolean) => {
      for (let c = 0; c < CLASSES.length; c++) {
        if (hidden.has(c)) continue;
        ctx.fillStyle = DOT[CLASSES[c]];
        ctx.globalAlpha = front ? alpha : alpha * 0.35;
        for (let k = 0; k < dots.n; k++) {
          if (dots.cls[k] !== c) continue;
          const p = project(dots.pos[k * 3], dots.pos[k * 3 + 1], dots.pos[k * 3 + 2]);
          const behind = p.d < 0 && Math.hypot(p.sx - cx, p.sy - cy) < s;
          if (behind === front) continue;
          ctx.fillRect(p.sx - size / 2, p.sy - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;
    };
    drawDots(false);
    // Earth: shaded disc with equator and a meridian.
    const g = ctx.createRadialGradient(cx - s * 0.35, cy - s * 0.35, s * 0.1, cx, cy, s);
    g.addColorStop(0, "#1f4f73"); g.addColorStop(1, "#0a1a2e");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, s, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(233,238,245,.22)"; ctx.lineWidth = 1;
    for (const ring of [(t: number) => [Math.cos(t), Math.sin(t), 0], (t: number) => [Math.cos(t), 0, Math.sin(t)]]) {
      ctx.beginPath();
      let pen = false;
      for (let i = 0; i <= 96; i++) {
        const [x, y, z] = ring((i / 96) * Math.PI * 2), p = project(x, y, z);
        if (p.d < 0) { pen = false; continue; }
        if (pen) ctx.lineTo(p.sx, p.sy); else ctx.moveTo(p.sx, p.sy);
        pen = true;
      }
      ctx.stroke();
    }
    if (live) {
      ctx.strokeStyle = "rgba(127,211,227,.55)"; ctx.lineWidth = 0.9;
      for (const ring of COAST) {
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i < ring.length / 3; i++) {
          const p = project(ring[i * 3], ring[i * 3 + 1], ring[i * 3 + 2]);
          if (p.d < 0) { pen = false; continue; }
          if (pen) ctx.lineTo(p.sx, p.sy); else ctx.moveTo(p.sx, p.sy);
          pen = true;
        }
        ctx.stroke();
      }
    }
    drawDots(true);
    // Altitude rings in the plane of the screen (outer edge of each shell), labeled.
    const marks = scale === "leo" ? [1000, 2000] : [2000, 20200, 35786];
    ctx.font = "10px JetBrains Mono, monospace"; ctx.textAlign = "left";
    for (const km of marks) {
      const r = radius(km, scale) * s;
      ctx.strokeStyle = "rgba(233,238,245,.14)"; ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(233,238,245,.55)";
      ctx.fillText(`${km.toLocaleString("en-US")} km`, cx + r * 0.71 + 4, cy - r * 0.71 - 4);
    }
  }, [dots, w, H, hidden, scale, tick, live]);

  const onDown = (e: PointerEvent<HTMLCanvasElement>) => { drag.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (drag.current) {
      view.current.yaw += (e.clientX - drag.current.x) * 0.008;
      view.current.pitch = Math.max(-1.4, Math.min(1.4, view.current.pitch + (e.clientY - drag.current.y) * 0.008));
      drag.current = { x: e.clientX, y: e.clientY };
      setTick((x) => x + 1);
    }
    // Readout: the shell whose outer edge passes under the pointer.
    const rect = e.currentTarget.getBoundingClientRect();
    const r = Math.hypot(e.clientX - rect.left - w / 2, e.clientY - rect.top - H / 2) / scaleR();
    const alt = altFromRadius(r, scale);
    if (r < 1 || alt > (scale === "leo" ? 2000 : 45000)) { setReadout(""); return; }
    const b = Math.floor(alt / binKm);
    setReadout(shellReadout(b * binKm, (b + 1) * binKm, bins.get(b) ?? CLASSES.map(() => 0)));
  };
  const onKey = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const step = 0.12, v = view.current;
    if (e.key === "ArrowLeft") v.yaw -= step; else if (e.key === "ArrowRight") v.yaw += step;
    else if (e.key === "ArrowUp") v.pitch = Math.max(-1.4, v.pitch - step); else if (e.key === "ArrowDown") v.pitch = Math.min(1.4, v.pitch + step);
    else return;
    e.preventDefault(); setTick((x) => x + 1);
  };

  return (
    <figure className="chart">
      <div ref={box} className="lp-canvas sd-globe">
        <canvas ref={canvas} style={{ width: "100%", height: H }} tabIndex={0} role="img" aria-label={ariaLabel}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
          onPointerLeave={() => { if (!drag.current) setReadout(""); }} onKeyDown={onKey} />
      </div>
      <p className="readout" aria-live="polite">{readout || hint}</p>
    </figure>
  );
}
