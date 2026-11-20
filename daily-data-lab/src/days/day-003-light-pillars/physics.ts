// Light-pillar optics: specular reflection from the basal faces of hexagonal plate crystals.
//
// Frame: x east, y north (toward the light), z up, metres. The observer looks north.
// A light reaches the observer by reflection at a crystal only if the crystal's face normal is the
// bisector of the directions to the light and to the observer (law of reflection). For a population
// of facets, the reflected intensity per solid angle is proportional to D(n) · F(θi): D is the
// probability density of face normals per steradian and F is Fresnel reflectance (microfacet theory;
// the facet's projected area cos θi cancels the 4 cos θi Jacobian of mirror reflection).
// Light is dimmed along its path by Beer–Lambert extinction, with the extinction coefficient taken
// from the visibility (Koschmieder: β = 3.912 / V).
// This is an illustrative single-scattering model: no refraction paths, no multiple scattering,
// no Sun-disk blur, and no crystal size distribution.

export type Vec = [number, number, number];
export type SourceKind = "sun" | "moon" | "lamps";
export type TiltShape = "gauss" | "uniform";
export type Orientation = "plates" | "random";
export type LampColors = "sodium" | "led" | "mixed";

export interface SimParams {
  source: SourceKind;
  elevation: number; // sun/moon elevation, degrees
  tilt: number; // plate tilt scale σ (gauss) or maximum tilt (uniform), degrees
  shape: TiltShape;
  orientation: Orientation;
  lampHeight: number; // m
  lampDistance: number; // m, horizontal distance from observer
  lampColors: LampColors;
  layerBase: number; // m above ground
  layerTop: number; // m above ground
  observerHeight: number; // m (1.7 on the ground)
  visibility: number; // km, sets atmospheric extinction
}

export const ICE_N = 1.31;
const DEG = Math.PI / 180;

export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const len = (a: Vec) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a: Vec): Vec => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** Unpolarized Fresnel reflectance of an air→ice interface at incidence angle θi (radians). */
export function fresnel(cosI: number, n = ICE_N): number {
  const c = Math.min(1, Math.abs(cosI));
  const sinT = Math.sqrt(Math.max(0, 1 - c * c)) / n;
  if (sinT >= 1) return 1;
  const cosT = Math.sqrt(1 - sinT * sinT);
  const rs = (c - n * cosT) / (c + n * cosT);
  const rp = (n * c - cosT) / (n * c + cosT);
  return (rs * rs + rp * rp) / 2;
}

/** Density of face normals per steradian at tilt τ (radians) from the vertical. */
export function tiltDensity(tau: number, p: Pick<SimParams, "tilt" | "shape" | "orientation">): number {
  if (p.orientation === "random") return 1 / (2 * Math.PI); // isotropic over the upper hemisphere
  const s = Math.max(p.tilt, 0.05) * DEG;
  if (p.shape === "uniform") {
    return tau <= s ? 1 / (2 * Math.PI * (1 - Math.cos(s))) : 0;
  }
  // 2-D Gaussian tilt (Rayleigh-distributed magnitude, isotropic azimuth), normalised on the sphere
  return Math.exp(-(tau * tau) / (2 * s * s)) / (2 * Math.PI * s * s);
}

/** Direction to the Sun or Moon (unit vector), straight ahead of the observer. */
export const sunDir = (elevation: number): Vec => [0, Math.cos(elevation * DEG), Math.sin(elevation * DEG)];

export interface Lamp { pos: Vec; rgb: Vec }
export function lampsFor(p: SimParams): Lamp[] {
  const pos = (x: number): Vec => [x, p.lampDistance, p.lampHeight];
  if (p.lampColors === "sodium") return [{ pos: pos(0), rgb: [1, 0.62, 0.22] }];
  if (p.lampColors === "led") return [{ pos: pos(0), rgb: [0.86, 0.92, 1] }];
  const gap = Math.max(18, p.lampDistance * 0.05);
  return [
    { pos: pos(-gap), rgb: [1, 0.6, 0.2] },
    { pos: pos(0), rgb: [0.85, 0.92, 1] },
    { pos: pos(gap), rgb: [0.35, 1, 0.55] },
  ];
}

export function sourceRgb(p: SimParams): Vec {
  if (p.source === "moon") return [0.85, 0.9, 1];
  // the low Sun is reddened by the long path through the atmosphere
  const e = Math.max(-2, Math.min(25, p.elevation));
  const w = (e + 2) / 27;
  return [1, 0.55 + 0.4 * w, 0.25 + 0.6 * w];
}

/** Apparent elevation (degrees) of the light source seen by the observer. */
export function sourceElevation(p: SimParams): number {
  if (p.source !== "lamps") return p.elevation;
  return Math.atan2(p.lampHeight - p.observerHeight, p.lampDistance) / DEG;
}

export interface View { az0: number; az1: number; el0: number; el1: number; w: number; h: number }
export function viewFor(p: SimParams, w = 180, h = 200): View {
  if (p.source === "lamps") return { az0: -22, az1: 22, el0: -6, el1: 44, w: Math.round(w * 0.7), h: Math.round(h * 0.7) };
  if (p.observerHeight > p.layerTop) return { az0: -16, az1: 16, el0: -32, el1: 8, w, h };
  return { az0: -16, az1: 16, el0: -6, el1: 30, w, h };
}

const dirOf = (az: number, el: number): Vec => {
  const a = az * DEG, e = el * DEG;
  return [Math.sin(a) * Math.cos(e), Math.cos(a) * Math.cos(e), Math.sin(e)];
};

/** Parameter range [t0, t1] where the ray O + t·v lies inside the crystal layer. */
function layerSpan(o: Vec, v: Vec, base: number, top: number, maxT: number): [number, number] | null {
  if (Math.abs(v[2]) < 1e-6) return o[2] >= base && o[2] <= top ? [0, maxT] : null;
  let t0 = (base - o[2]) / v[2], t1 = (top - o[2]) / v[2];
  if (t0 > t1) [t0, t1] = [t1, t0];
  t0 = Math.max(t0, 0); t1 = Math.min(t1, maxT);
  return t1 > t0 ? [t0, t1] : null;
}

export interface SkyImage { rgb: Float32Array; w: number; h: number; peak: number; view: View; column: Float32Array }

/**
 * Renders what the observer sees: for each pixel direction, integrate reflected light along the
 * line of sight through the crystal layer. Returns linear RGB plus the luminance profile of the
 * centre column, used to measure the pillar's apparent height.
 */
export function renderSky(p: SimParams, view = viewFor(p)): SkyImage {
  const { w, h } = view;
  const rgb = new Float32Array(w * h * 3);
  const column = new Float32Array(h);
  const o: Vec = [0, 0, p.observerHeight];
  const steps = p.source === "lamps" ? 20 : 28;
  const beta = 3.912 / (Math.max(p.visibility, 0.2) * 1000); // per metre
  const lamps = p.source === "lamps" ? lampsFor(p) : [];
  const s = sunDir(p.elevation);
  const col = sourceRgb(p);
  const maxT = p.source === "lamps" ? p.lampDistance * 4 + 4000 : 60000;
  let peak = 0;

  for (let j = 0; j < h; j++) {
    const el = view.el1 - ((j + 0.5) / h) * (view.el1 - view.el0);
    for (let i = 0; i < w; i++) {
      const az = view.az0 + ((i + 0.5) / w) * (view.az1 - view.az0);
      const v = dirOf(az, el);
      // the ground blocks downward lines of sight from a ground observer
      const ground = v[2] < 0 && p.observerHeight < p.layerBase ? -p.observerHeight / v[2] : Infinity;
      const span = layerSpan(o, v, p.layerBase, p.layerTop, Math.min(maxT, ground));
      let r = 0, g = 0, b = 0;
      if (span) {
        const dt = (span[1] - span[0]) / steps;
        const toObs = scale(v, -1);
        for (let k = 0; k < steps; k++) {
          const t = span[0] + (k + 0.5) * dt;
          if (p.source === "lamps") {
            const pt = add(o, scale(v, t));
            for (const L of lamps) {
              const dL = sub(L.pos, pt);
              const dist2 = dot(dL, dL);
              const dist = Math.sqrt(dist2);
              const a = scale(dL, 1 / dist);
              const n = norm(add(a, toObs));
              const tau = Math.acos(Math.min(1, Math.abs(n[2])));
              const val = (tiltDensity(tau, p) * fresnel(dot(a, n)) * dt * Math.exp(-beta * (t + dist))) / dist2;
              r += val * L.rgb[0]; g += val * L.rgb[1]; b += val * L.rgb[2];
            }
          } else {
            const n = norm(add(s, toObs));
            const tau = Math.acos(Math.min(1, Math.abs(n[2])));
            // sunlight is dimmed on its slant path down into the layer and again on the way to the eye
            const pt = o[2] + t * v[2];
            const down = s[2] > 0.02 ? Math.max(0, p.layerTop - pt) / s[2] : 0;
            const val = tiltDensity(tau, p) * fresnel(dot(s, n)) * dt * Math.exp(-beta * (t + down));
            r += val * col[0]; g += val * col[1]; b += val * col[2];
          }
        }
      }
      const idx = (j * w + i) * 3;
      rgb[idx] = r; rgb[idx + 1] = g; rgb[idx + 2] = b;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (lum > peak) peak = lum;
      if (i === w >> 1) column[j] = lum;
    }
  }
  return { rgb, w, h, peak, view, column };
}

export interface PillarSize {
  /** degrees above the light where the centre line falls to `frac` of its peak above the light */
  height: number | null;
  /** elevation of the brightest point on the centre line (the subsun, when seen from above) */
  peakEl: number | null;
  /** vertical extent of the half-maximum band around that brightest point */
  extent: number | null;
}

/**
 * Apparent size of the pillar from the centre column of the rendered sky. For a ground observer it
 * is the upper pillar's height above the light (half-maximum by default); from above the layer it is
 * the subsun's position and vertical extent.
 */
export function measurePillar(img: SkyImage, p: SimParams, frac = 0.5): PillarSize {
  const { view, column, h } = img;
  const srcEl = sourceElevation(p);
  const elAt = (j: number) => view.el1 - ((j + 0.5) / h) * (view.el1 - view.el0);
  let peakJ = -1, peak = 0;
  for (let j = 0; j < h; j++) if (column[j] > peak) { peak = column[j]; peakJ = j; }
  if (!(peak > 0)) return { height: null, peakEl: null, extent: null };
  let a = peakJ, b = peakJ;
  while (a > 0 && column[a - 1] >= peak * frac) a--;
  while (b < h - 1 && column[b + 1] >= peak * frac) b++;
  const extent = elAt(a) - elAt(b) + (view.el1 - view.el0) / h;
  let max = 0;
  for (let j = 0; j < h; j++) if (elAt(j) >= srcEl && column[j] > max) max = column[j];
  let height: number | null = null;
  if (max > 0) {
    for (let j = 0; j < h; j++) {
      if (elAt(j) >= srcEl && column[j] >= max * frac) { height = Math.max(0, elAt(j) - srcEl); break; }
    }
  }
  return { height, peakEl: elAt(peakJ), extent };
}

// ---------- 3-D scene helpers ----------

/**
 * How far north the 3-D scene reaches (m). For the Sun the reflecting crystals sit along low lines of
 * sight, far away, so the scene is stretched until those crystals are inside it.
 */
export function sceneDepth(p: SimParams): number {
  if (p.source === "lamps") return p.lampDistance * 1.25;
  const zmid = (p.layerBase + p.layerTop) / 2;
  const clampD = (v: number) => Math.min(30000, Math.max(1500, v));
  if (p.observerHeight > p.layerTop) return clampD(((p.observerHeight - zmid) / Math.tan(Math.max(p.elevation, 3) * DEG)) * 1.6);
  return clampD((zmid / Math.tan((Math.max(p.elevation, 0) + 2 * p.tilt + 1) * DEG)) * 1.2);
}

/** Small deterministic PRNG so the 3-D crystal field does not jump between renders. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Draw a tilt (radians) from the selected distribution. */
export function sampleTilt(rand: () => number, p: Pick<SimParams, "tilt" | "shape" | "orientation">): number {
  if (p.orientation === "random") return Math.acos(rand());
  const s = Math.max(p.tilt, 0.05) * DEG;
  if (p.shape === "uniform") return Math.acos(1 - rand() * (1 - Math.cos(s)));
  return s * Math.sqrt(-2 * Math.log(Math.max(1e-9, rand())));
}

export interface Crystal { pos: Vec; normal: Vec; glint: number }

/**
 * A field of crystals in the layer for the 3-D view. `glint` is how strongly each one sends light
 * to the observer, relative to a perfectly aligned crystal.
 */
export function crystalField(p: SimParams, count = 220, seed = 7): Crystal[] {
  const rand = rng(seed);
  const o: Vec = [0, 0, p.observerHeight];
  const span = sceneDepth(p);
  const out: Crystal[] = [];
  const lamps = p.source === "lamps" ? lampsFor(p) : [];
  const s = sunDir(p.elevation);
  for (let i = 0; i < count; i++) {
    const pos: Vec = [
      (rand() - 0.5) * span * 0.8,
      rand() * span,
      p.layerBase + rand() * (p.layerTop - p.layerBase),
    ];
    const tau = sampleTilt(rand, p);
    const phi = rand() * 2 * Math.PI;
    const normal: Vec = [Math.sin(tau) * Math.cos(phi), Math.sin(tau) * Math.sin(phi), Math.cos(tau)];
    const toObs = norm(sub(o, pos));
    const dirs = p.source === "lamps" ? lamps.map((L) => norm(sub(L.pos, pos))) : [s];
    let glint = 0;
    for (const a of dirs) {
      const need = norm(add(a, toObs));
      const err = Math.acos(Math.min(1, Math.abs(dot(need, normal))));
      glint = Math.max(glint, Math.exp(-(err * err) / (2 * (1.2 * DEG) ** 2)));
    }
    out.push({ pos, normal, glint });
  }
  return out;
}

/**
 * The crystals that actually light the pillar: points in the vertical plane between the observer and
 * the light, each with the face normal reflection requires and how likely that tilt is.
 */
export function reflectingPaths(p: SimParams, count = 9) {
  const o: Vec = [0, 0, p.observerHeight];
  const lamps = p.source === "lamps" ? lampsFor(p) : [];
  const light: Vec = p.source === "lamps" ? lamps[Math.floor(lamps.length / 2)].pos : scale(sunDir(p.elevation), 1e5);
  const yMax = p.source === "lamps" ? p.lampDistance * 1.1 : sceneDepth(p);
  const peakD = tiltDensity(0, p);
  const out: { pos: Vec; normal: Vec; light: Vec; weight: number; tau: number }[] = [];
  for (let i = 0; i < count; i++) {
    for (const zf of [0.25, 0.75]) {
      const pos: Vec = [0, (yMax * (i + 0.5)) / count, p.layerBase + zf * (p.layerTop - p.layerBase)];
      const a = norm(sub(light, pos));
      const n = norm(add(a, norm(sub(o, pos))));
      const tau = Math.acos(Math.min(1, Math.abs(n[2])));
      const weight = peakD > 0 ? tiltDensity(tau, p) / peakD : 0;
      out.push({ pos, normal: n, light, weight, tau: tau / DEG });
    }
  }
  return out;
}

export const DEG_PER_RAD = 1 / DEG;
