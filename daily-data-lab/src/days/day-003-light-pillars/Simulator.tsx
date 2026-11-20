import { useDeferredValue, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  type SimParams, type Vec, type SourceKind, type TiltShape, type Orientation, type LampColors,
  renderSky, measurePillar, sourceElevation, sourceRgb, lampsFor, sunDir, crystalField, reflectingPaths, sceneDepth,
  fresnel, add, scale, sub, norm, dot, DEG_PER_RAD,
} from "./physics";
import { type Camera, makeProjector, hexagon, rgbCss, fitCanvas } from "./camera";
import { tr, fmt1 } from "./text";

const DEFAULTS: SimParams = {
  source: "lamps", elevation: 2, tilt: 3, shape: "gauss", orientation: "plates",
  lampHeight: 9, lampDistance: 320, lampColors: "mixed", layerBase: 30, layerTop: 160, observerHeight: 1.7, visibility: 15,
};

const PRESETS: { key: string; label: string; params: Partial<SimParams> }[] = [
  { key: "presetCity", label: "Winter city lights", params: { source: "lamps", lampColors: "mixed", tilt: 3, lampDistance: 320, layerBase: 30, layerTop: 160, orientation: "plates", observerHeight: 1.7 } },
  { key: "presetSunset", label: "Sun pillar at sunset", params: { source: "sun", elevation: 1, tilt: 4, orientation: "plates", observerHeight: 1.7, layerBase: 300, layerTop: 1500 } },
  { key: "presetAfterSunset", label: "Sun just below horizon", params: { source: "sun", elevation: -2, tilt: 5, orientation: "plates", observerHeight: 1.7, layerBase: 300, layerTop: 1500 } },
  { key: "presetAircraft", label: "Subsun from above", params: { source: "sun", elevation: 18, tilt: 1.5, orientation: "plates", layerBase: 300, layerTop: 900, observerHeight: 1050 } },
  { key: "presetRandom", label: "Tumbling crystals", params: { source: "lamps", orientation: "random", lampColors: "sodium", observerHeight: 1.7 } },
];

export default function Simulator({ language }: { language: string }) {
  const [p, setP] = useState<SimParams>(DEFAULTS);
  const set = <K extends keyof SimParams>(k: K, v: SimParams[K]) => setP((old) => ({ ...old, [k]: v }));
  const deferred = useDeferredValue(p);
  const above = p.source !== "lamps" && p.observerHeight > p.layerTop;

  const sky = useMemo(() => renderSky(deferred), [deferred]);
  const size = useMemo(() => measurePillar(sky, deferred), [sky, deferred]);
  const srcEl = sourceElevation(p);
  const incidence = p.source === "lamps" ? 90 - Math.abs(srcEl) : 90 - Math.abs(p.elevation);
  const noPillar = p.orientation === "random";
  const R = fresnel(Math.cos(incidence / DEG_PER_RAD));

  const sourceOpts: { v: SourceKind; key: string; label: string }[] = [
    { v: "lamps", key: "srcLamps", label: "Street lights" }, { v: "sun", key: "srcSun", label: "Sun" }, { v: "moon", key: "srcMoon", label: "Moon" },
  ];
  const shapeOpts: { v: TiltShape; key: string; label: string }[] = [
    { v: "gauss", key: "shapeGauss", label: "Gaussian wobble" }, { v: "uniform", key: "shapeUniform", label: "Uniform up to max" },
  ];
  const orientOpts: { v: Orientation; key: string; label: string }[] = [
    { v: "plates", key: "orientPlates", label: "Horizontal plates" }, { v: "random", key: "orientRandom", label: "Random (tumbling)" },
  ];
  const colorOpts: { v: LampColors; key: string; label: string }[] = [
    { v: "sodium", key: "lampSodium", label: "Sodium" }, { v: "led", key: "lampLed", label: "White LED" }, { v: "mixed", key: "lampMixed", label: "Three colours" },
  ];

  return (
    <section className="card lp-panel lp-sim" aria-labelledby="lp-sim-title">
      <div className="card__head">
        <div>
          <p className="mono lp-eyebrow">D · {tr(language, "simEyebrow", "Physics simulator")}</p>
          <h2 id="lp-sim-title">{tr(language, "simTitle", "Why a light becomes a pillar")}</h2>
          <p className="lp-sub">{tr(language, "simLead", "Hexagonal plate crystals float almost flat, like tiny mirrors. Only the ones in a thin vertical band between you and the light are tilted just right to send it to your eye, so the light is stretched into a column.")}</p>
        </div>
        <span className="lp-badge lp-badge--sim">{tr(language, "simBadge", "Illustrative simulation · not observational data")}</span>
      </div>

      <div className="lp-presets" role="group" aria-label={tr(language, "presets", "Presets")}>
        {PRESETS.map((pr) => (
          <button key={pr.key} type="button" onClick={() => setP((old) => ({ ...old, ...pr.params }))}>{tr(language, pr.key, pr.label)}</button>
        ))}
        <button type="button" className="lp-presets__reset" onClick={() => setP(DEFAULTS)}>{tr(language, "reset", "Reset")}</button>
      </div>

      <div className="lp-sim__grid">
        <div className="lp-sim__controls">
          <Choice label={tr(language, "source", "Light source")} value={p.source} options={sourceOpts.map((o) => ({ value: o.v, label: tr(language, o.key, o.label) }))}
            onChange={(v) => setP((old) => ({ ...old, source: v, observerHeight: v === "lamps" ? 1.7 : old.observerHeight, layerBase: v === "lamps" ? 30 : 300, layerTop: v === "lamps" ? 160 : 1500 }))} />
          {p.source === "lamps" ? (
            <>
              <Slider label={tr(language, "lampHeight", "Lamp height")} unit="m" min={3} max={40} step={1} value={p.lampHeight} onChange={(v) => set("lampHeight", v)} />
              <Slider label={tr(language, "lampDistance", "Distance to the lights")} unit="m" min={60} max={1500} step={10} value={p.lampDistance} onChange={(v) => set("lampDistance", v)} />
              <Choice label={tr(language, "lampColors", "Lamp colours")} value={p.lampColors} options={colorOpts.map((o) => ({ value: o.v, label: tr(language, o.key, o.label) }))} onChange={(v) => set("lampColors", v)} />
            </>
          ) : (
            <>
              <Slider label={p.source === "sun" ? tr(language, "sunElevation", "Sun elevation") : tr(language, "moonElevation", "Moon elevation")} unit="°" min={-4} max={25} step={0.5} value={p.elevation} onChange={(v) => set("elevation", v)} />
              <Choice label={tr(language, "observer", "Observer")} value={above ? "above" : "ground"}
                options={[{ value: "ground", label: tr(language, "observerGround", "On the ground") }, { value: "above", label: tr(language, "observerAbove", "Above the crystals") }]}
                onChange={(v) => set("observerHeight", v === "above" ? p.layerTop + 150 : 1.7)} />
            </>
          )}
          <Choice label={tr(language, "orientation", "Crystal orientation")} value={p.orientation} options={orientOpts.map((o) => ({ value: o.v, label: tr(language, o.key, o.label) }))} onChange={(v) => set("orientation", v)} />
          <Slider label={p.shape === "gauss" ? tr(language, "tiltSigma", "Tilt spread σ") : tr(language, "tiltMax", "Maximum tilt")} unit="°" min={0.5} max={12} step={0.5}
            value={p.tilt} onChange={(v) => set("tilt", v)} disabled={p.orientation === "random"} />
          <Choice label={tr(language, "tiltShape", "Tilt distribution")} value={p.shape} options={shapeOpts.map((o) => ({ value: o.v, label: tr(language, o.key, o.label) }))} onChange={(v) => set("shape", v)} disabled={p.orientation === "random"} />
          <Slider label={tr(language, "visibility", "Visibility")} unit="km" min={1} max={60} step={1} value={p.visibility} onChange={(v) => set("visibility", v)} />
          <Slider label={tr(language, "layerBase", "Crystal layer base")} unit="m" min={0} max={p.source === "lamps" ? 300 : 3000} step={p.source === "lamps" ? 5 : 50} value={p.layerBase}
            onChange={(v) => setP((old) => ({ ...old, layerBase: Math.min(v, old.layerTop - 10), observerHeight: old.observerHeight > old.layerTop ? old.layerTop + 150 : old.observerHeight }))} />
          <Slider label={tr(language, "layerTop", "Crystal layer top")} unit="m" min={20} max={p.source === "lamps" ? 600 : 5000} step={p.source === "lamps" ? 5 : 50} value={p.layerTop}
            onChange={(v) => setP((old) => ({ ...old, layerTop: Math.max(v, old.layerBase + 10), observerHeight: old.observerHeight > old.layerTop ? Math.max(v, old.layerBase + 10) + 150 : old.observerHeight }))} />
        </div>

        <div className="lp-sim__scene">
          <Scene3D p={deferred} language={language} />
          <p className="lp-hint">{tr(language, "sceneHint", "Drag to orbit, or focus the scene and use the arrow keys. Bright hexagons are crystals tilted to reflect the light toward the observer; the lines trace their light paths.")}</p>
        </div>

        <div className="lp-sim__sky">
          <SkyView img={sky} p={deferred} language={language} />
        </div>
      </div>

      <div className="lp-sim__foot">
        <CrystalCloseUp p={deferred} language={language} />
        <dl className="lp-readouts" aria-live="polite">
          <div><dt>{tr(language, "readSource", "Light seen at")}</dt><dd>{fmt1(srcEl, language)}°</dd></div>
          {above ? (
            <>
              <div>
                <dt>{tr(language, "readSubsun", "Subsun seen at")}</dt>
                <dd>{size.peakEl == null ? "—" : `${fmt1(size.peakEl, language)}°`}</dd>
                <small>{tr(language, "readSubsunNote", "mirror image of the Sun, expected at −{e}°", { e: fmt1(p.elevation, language) })}</small>
              </div>
              <div>
                <dt>{tr(language, "readExtent", "Subsun vertical extent")}</dt>
                <dd>{size.extent == null ? "—" : `${fmt1(size.extent, language)}°`}</dd>
                <small>{tr(language, "readExtentNote", "half maximum; theory for Gaussian tilt ≈ 4.7σ = {v}°", { v: fmt1(4.71 * p.tilt, language) })}</small>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt>{tr(language, "readHeight", "Pillar height above the light")}</dt>
                <dd>{size.height == null || noPillar ? "—" : `${fmt1(size.height, language)}°`}</dd>
                <small>{noPillar ? tr(language, "readNoPillar", "tumbling crystals: a diffuse glow, no pillar") : tr(language, "readHeightNote", "half-maximum brightness, centre line")}</small>
              </div>
              <div>
                <dt>{tr(language, "readRatio", "Height ÷ tilt spread")}</dt>
                <dd>{size.height == null || noPillar ? "—" : `${fmt1(size.height / p.tilt, language)}×`}</dd>
                <small>{tr(language, "readRatioNote", "angles double on reflection: ≈ 2.4× for a Sun on the horizon in clear air; haze and long sight lines change it")}</small>
              </div>
            </>
          )}
          <div>
            <dt>{tr(language, "readFresnel", "Reflectance at the face")}</dt>
            <dd>{fmt1(R * 100, language)}%</dd>
            <small>{tr(language, "readFresnelNote", "Fresnel, ice n = 1.31, incidence {deg}°", { deg: Math.round(incidence) })}</small>
          </div>
        </dl>
      </div>
      <p className="lp-model">{tr(language, "simModel", "Model: single specular reflection from basal faces, brightness ∝ D(n)·F(θᵢ) integrated along each line of sight through the layer (microfacet form), with 1/r² falloff for lamps. Light is dimmed by Beer–Lambert extinction set from the visibility. Not modelled: refraction paths, multiple scattering, the Sun's 0.5° disk, column crystals, and crystal sizes. Use it to build intuition, not to predict a real event.")}</p>
    </section>
  );
}

/* ---------- controls ---------- */
function Slider({ label, unit, min, max, step, value, onChange, disabled }: {
  label: string; unit: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void; disabled?: boolean;
}) {
  return (
    <label className={`lp-slider${disabled ? " is-off" : ""}`}>
      <span className="lp-slider__top"><span className="mono">{label}</span><output>{value}{unit === "°" ? "°" : ` ${unit}`}</output></span>
      <input type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function Choice<T extends string>({ label, value, options, onChange, disabled }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; disabled?: boolean;
}) {
  return (
    <div className={`lp-choice${disabled ? " is-off" : ""}`}>
      <span className="mono">{label}</span>
      <div role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} disabled={disabled}
            className={value === o.value ? "on" : ""} onClick={() => onChange(o.value)}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/* ---------- 3-D scene ---------- */
function Scene3D({ p, language }: { p: SimParams; language: string }) {
  const [box, width] = useWidth<HTMLDivElement>(560);
  const height = Math.round(Math.min(width * 0.62, 520));
  const canvas = useRef<HTMLCanvasElement>(null);
  const [orbit, setOrbit] = useState({ yaw: -0.95, pitch: 0.32 });
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const field = useMemo(() => crystalField(p), [p]);
  const paths = useMemo(() => reflectingPaths(p), [p]);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = fitCanvas(el, width, height);
    if (!ctx) return;
    ctx.textAlign = "left";
    const lamps = p.source === "lamps";
    const depthY = sceneDepth(p);
    const span = Math.max(depthY, p.layerTop * 1.6, p.observerHeight * 1.4);
    const cam: Camera = {
      yaw: orbit.yaw, pitch: orbit.pitch, dist: span * 1.55,
      target: [0, depthY * 0.45, Math.min(p.layerTop, span * 0.35) * 0.55], focal: width * 0.95, cx: width / 2, cy: height * 0.55,
    };
    const { project } = makeProjector(cam);
    const P = (v: Vec) => project(v);
    ctx.clearRect(0, 0, width, height);

    // sky backdrop
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, "#050a16"); g.addColorStop(0.7, "#0c1830"); g.addColorStop(1, "#13223d");
    ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);

    // ground grid
    const gx = span * 0.55;
    ctx.lineWidth = 1;
    for (let k = 0; k <= 10; k++) {
      const x = -gx + (2 * gx * k) / 10;
      const y = -span * 0.1 + (span * 1.2 * k) / 10;
      line(ctx, P([x, -span * 0.1, 0]), P([x, span * 1.1, 0]), "rgba(127,211,227,0.10)");
      line(ctx, P([-gx, y, 0]), P([gx, y, 0]), "rgba(127,211,227,0.10)");
    }

    // crystal layer slab (wireframe)
    const slab = (z: number): Vec[] => [[-gx * 0.7, 0, z], [gx * 0.7, 0, z], [gx * 0.7, depthY, z], [-gx * 0.7, depthY, z]];
    const lo = slab(p.layerBase), hi = slab(p.layerTop);
    ctx.fillStyle = "rgba(127,211,227,0.035)";
    poly(ctx, hi.map(P)); ctx.fill();
    [lo, hi].forEach((r) => { poly(ctx, r.map(P)); ctx.strokeStyle = "rgba(127,211,227,0.28)"; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]); });
    lo.forEach((v, k) => line(ctx, P(v), P(hi[k]), "rgba(127,211,227,0.18)"));

    // light sources
    const lampList = lamps ? lampsFor(p) : [];
    const srcCol = sourceRgb(p);
    if (lamps) {
      lampList.forEach((L) => {
        line(ctx, P([L.pos[0], L.pos[1], 0]), P(L.pos), "rgba(200,210,225,0.55)", 2);
        glow(ctx, P(L.pos), L.rgb, 16);
      });
    } else {
      const far = depthY * 1.3;
      const sp = P([0, far, Math.max(0, far * Math.tan(p.elevation / DEG_PER_RAD))]);
      glow(ctx, sp, srcCol, (p.source === "sun" ? 30 : 20) * (p.elevation < 0 ? 0.6 : 1));
      // parallel incoming rays
      for (let k = -2; k <= 2; k++) {
        const base: Vec = [k * span * 0.08, depthY * 0.55, p.layerTop];
        line(ctx, P(add(base, scale(sunDir(p.elevation), span * 0.7))), P(base), rgbCss(srcCol, 0.16), 1);
      }
    }

    // crystals, far to near
    const obs: Vec = [0, 0, p.observerHeight];
    const drawn = field.map((c) => ({ c, d: P(c.pos)[2] })).sort((a, b) => b.d - a.d);
    for (const { c, d } of drawn) {
      if (d <= 0) continue;
      const r = (6.5 * d) / cam.focal;
      const hex = hexagon(c.pos, c.normal, r).map(P);
      const lit = c.glint;
      ctx.fillStyle = lit > 0.05 ? rgbCss(mix([0.75, 0.86, 0.95], lamps ? [1, 0.85, 0.6] : srcCol, lit), 0.25 + 0.75 * lit) : "rgba(170,205,230,0.16)";
      poly(ctx, hex); ctx.fill();
      ctx.strokeStyle = lit > 0.05 ? "rgba(255,255,255,0.7)" : "rgba(170,205,230,0.35)";
      ctx.lineWidth = 0.8; ctx.stroke();
    }

    // reflection paths through the vertical plane: light → crystal → observer
    for (const path of paths) {
      if (path.weight < 0.04) continue;
      const a = 0.15 + 0.75 * path.weight;
      const col = lamps ? (lampList[Math.floor(lampList.length / 2)].rgb) : srcCol;
      const from = lamps ? path.light : add(path.pos, scale(norm(sub(path.light, path.pos)), span * 0.5));
      line(ctx, P(from), P(path.pos), rgbCss(col, a * 0.6), 1.2);
      line(ctx, P(path.pos), P(obs), rgbCss(col, a), 1.4);
      const hex = hexagon(path.pos, path.normal, (9 * P(path.pos)[2]) / cam.focal).map(P);
      ctx.fillStyle = rgbCss(col, 0.35 + 0.6 * path.weight); poly(ctx, hex); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 1; ctx.stroke();
    }

    // observer
    const foot = P([0, 0, Math.max(0, p.observerHeight - 1.7)]);
    const head = P(obs);
    const hpx = Math.max(10, foot[1] - head[1]);
    ctx.strokeStyle = "#f4efe6"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(foot[0], foot[1]); ctx.lineTo(foot[0], foot[1] - hpx); ctx.stroke();
    ctx.beginPath(); ctx.arc(foot[0], foot[1] - hpx - 4, 4, 0, Math.PI * 2); ctx.fillStyle = "#f4efe6"; ctx.fill();
    label(ctx, tr(language, "you", "You"), foot[0] + 8, foot[1] - hpx - 6);
    if (p.observerHeight > 2) line(ctx, P([0, 0, 0]), foot, "rgba(244,239,230,0.35)", 1);

    // layer labels
    label(ctx, tr(language, "layerLabel", "Ice-crystal layer {a}–{b} m", { a: p.layerBase, b: p.layerTop }), 12, 18);
  }, [p, field, paths, orbit, width, height, language]);

  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, ...orbit };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (!d) return;
    setOrbit({ yaw: d.yaw + (e.clientX - d.x) * 0.008, pitch: clamp(d.pitch + (e.clientY - d.y) * 0.006, 0.04, 1.35) });
  };
  const onKey = (e: React.KeyboardEvent) => {
    const k = { ArrowLeft: [-0.12, 0], ArrowRight: [0.12, 0], ArrowUp: [0, 0.08], ArrowDown: [0, -0.08] }[e.key];
    if (!k) return;
    e.preventDefault();
    setOrbit((o) => ({ yaw: o.yaw + k[0], pitch: clamp(o.pitch + k[1], 0.04, 1.35) }));
  };

  return (
    <div ref={box} className="lp-canvas">
      <canvas ref={canvas} style={{ width: "100%", height }} tabIndex={0} role="img"
        aria-label={tr(language, "sceneAria", "3-D scene: an observer, the light source, and a layer of hexagonal ice crystals. Crystals that reflect light to the observer are highlighted.")}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onKeyDown={onKey} />
      <span className="lp-canvas__tag mono">{tr(language, "sceneTag", "3-D scene · not to scale for crystals")}</span>
    </div>
  );
}

/* ---------- observer's view ---------- */
function SkyView({ img, p, language }: { img: ReturnType<typeof renderSky>; p: SimParams; language: string }) {
  const [box, width] = useWidth<HTMLDivElement>(300);
  const height = Math.round(width * (img.h / img.w));
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = fitCanvas(el, width, height);
    if (!ctx) return;
    const { view } = img;
    const ex = (az: number) => ((az - view.az0) / (view.az1 - view.az0)) * width;
    const ey = (el: number) => ((view.el1 - el) / (view.el1 - view.el0)) * height;
    const groundObs = p.observerHeight < p.layerBase;

    // background: night or twilight sky and dark ground
    const night = p.source !== "sun" || p.elevation < -1;
    const g = ctx.createLinearGradient(0, 0, 0, ey(0));
    if (night) { g.addColorStop(0, "#03060f"); g.addColorStop(1, "#0c1630"); } else { g.addColorStop(0, "#0b1a3a"); g.addColorStop(1, "#3a3550"); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);
    if (groundObs) { ctx.fillStyle = "#05070c"; ctx.fillRect(0, ey(0), width, height - ey(0)); }

    // pillar image, tone-mapped and added on top
    const off = document.createElement("canvas");
    off.width = img.w; off.height = img.h;
    const octx = off.getContext("2d");
    if (octx && img.peak > 0) {
      const data = octx.createImageData(img.w, img.h);
      const k = 1 / (img.peak * 0.42);
      for (let i = 0; i < img.w * img.h; i++) {
        for (let c = 0; c < 3; c++) data.data[i * 4 + c] = Math.round(255 * (1 - Math.exp(-img.rgb[i * 3 + c] * k)));
        data.data[i * 4 + 3] = 255;
      }
      octx.putImageData(data, 0, 0);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(off, 0, 0, width, height);
      ctx.restore();
    }

    // light sources at their apparent positions
    if (p.source === "lamps") {
      lampsFor(p).forEach((L) => {
        const az = Math.atan2(L.pos[0], L.pos[1]) * DEG_PER_RAD;
        const el = Math.atan2(L.pos[2] - p.observerHeight, Math.hypot(L.pos[0], L.pos[1])) * DEG_PER_RAD;
        glow(ctx, [ex(az), ey(el), 1], L.rgb, 7);
      });
    } else if (p.elevation > view.el0 && (p.elevation > -0.3 || !groundObs)) {
      glow(ctx, [ex(0), ey(p.elevation), 1], sourceRgb(p), (0.53 / (view.el1 - view.el0)) * height * 2.2);
    }

    // horizon & elevation scale
    ctx.strokeStyle = "rgba(244,239,230,0.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, ey(0)); ctx.lineTo(width, ey(0)); ctx.stroke();
    ctx.font = "500 10px 'JetBrains Mono', monospace"; ctx.fillStyle = "rgba(233,238,245,0.6)"; ctx.textBaseline = "middle";
    for (let e = Math.ceil(view.el0 / 10) * 10; e <= view.el1; e += 10) {
      ctx.fillRect(0, ey(e), 6, 1);
      ctx.fillText(`${e}°`, 9, ey(e));
    }
    ctx.textAlign = "right";
    ctx.fillText(tr(language, "horizon", "horizon"), width - 6, ey(0) - 8);
    ctx.textAlign = "left";
  }, [img, p, width, height, language]);

  return (
    <div ref={box} className="lp-canvas lp-canvas--sky">
      <canvas ref={canvas} style={{ width: "100%", height }} role="img"
        aria-label={tr(language, "skyAria", "Simulated view from the observer's eyes toward the light, with elevation marks in degrees")} />
      <span className="lp-canvas__tag mono">{tr(language, "skyTag", "What you would see · {w}° wide", { w: Math.round(img.view.az1 - img.view.az0) })}</span>
    </div>
  );
}

/* ---------- crystal close-up ---------- */
function CrystalCloseUp({ p, language }: { p: SimParams; language: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [spin, setSpin] = useState(0.6);
  useEffect(() => {
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, last = performance.now();
    const tick = (now: number) => { setSpin((s) => s + (now - last) * 0.00025); last = now; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const W = 260, H = 200;
    const ctx = fitCanvas(el, W, H);
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    const cam: Camera = { yaw: spin, pitch: 0.42, dist: 6.2, target: [0, 0, 0], focal: 300, cx: W / 2, cy: H / 2 + 6 };
    const { project, eye } = makeProjector(cam);
    const tau = p.orientation === "random" ? 35 / DEG_PER_RAD : p.tilt / DEG_PER_RAD;
    const n: Vec = [0, Math.sin(tau), Math.cos(tau)]; // tilted toward the light
    const thick = 0.32, radius = 1;
    const top = hexagon(scale(n, thick / 2), n, radius, 0.3);
    const bot = hexagon(scale(n, -thick / 2), n, radius, 0.3);
    const light: Vec = norm(p.source === "lamps" ? [0, 1, Math.tan(Math.max(1, sourceElevation(p)) / DEG_PER_RAD)] : sunDir(Math.max(p.elevation, 0.5)));
    const lightDir = light;
    const faces: { pts: Vec[]; normal: Vec }[] = [{ pts: top, normal: n }, { pts: [...bot].reverse(), normal: scale(n, -1) }];
    for (let k = 0; k < 6; k++) {
      const a = top[k], b = top[(k + 1) % 6], c = bot[(k + 1) % 6], d = bot[k];
      const mid = scale(add(add(a, b), add(c, d)), 0.25);
      faces.push({ pts: [a, b, c, d], normal: norm(sub(mid, scale(n, dot(mid, n)))) });
    }
    // painter's sort by depth, back-face cull toward the eye
    faces.map((f) => ({ f, z: f.pts.reduce((s, v) => s + project(v)[2], 0) / f.pts.length }))
      .sort((a, b) => b.z - a.z)
      .forEach(({ f }) => {
        const centre = scale(f.pts.reduce((s, v) => add(s, v), [0, 0, 0] as Vec), 1 / f.pts.length);
        if (dot(f.normal, sub(eye, centre)) <= 0) return;
        const shade = 0.35 + 0.65 * Math.max(0, dot(f.normal, lightDir));
        ctx.fillStyle = `rgba(${Math.round(150 * shade + 60)}, ${Math.round(195 * shade + 45)}, ${Math.round(225 * shade + 30)}, 0.55)`;
        poly(ctx, f.pts.map(project)); ctx.fill();
        ctx.strokeStyle = "rgba(230,245,255,0.8)"; ctx.lineWidth = 1; ctx.stroke();
      });
    // rays: incoming along -light, reflected r = d − 2(d·n)n
    const hit = scale(n, thick / 2);
    const d = scale(light, -1);
    const r = sub(d, scale(n, 2 * dot(d, n)));
    const col = p.source === "lamps" ? lampsFor(p)[Math.floor(lampsFor(p).length / 2)].rgb : sourceRgb(p);
    arrow(ctx, project(add(hit, scale(light, 2.6))), project(hit), rgbCss(col, 0.95));
    arrow(ctx, project(hit), project(add(hit, scale(r, 2.6))), rgbCss(col, 0.95));
    ctx.setLineDash([3, 3]);
    line(ctx, project(hit), project(add(hit, scale(n, 1.5))), "rgba(244,239,230,0.75)", 1);
    line(ctx, project(hit), project(add(hit, [0, 0, 1.5])), "rgba(244,239,230,0.3)", 1);
    ctx.setLineDash([]);
    const nTip = project(add(hit, scale(n, 1.6)));
    label(ctx, `τ = ${fmt1(tau * DEG_PER_RAD, language)}°`, nTip[0] + 4, nTip[1]);
  }, [p, spin, language]);

  return (
    <figure className="lp-closeup">
      <canvas ref={canvas} style={{ width: 260, height: 200 }} role="img"
        aria-label={tr(language, "closeAria", "A hexagonal plate crystal tilted by {t} degrees, with the incoming and reflected rays", { t: fmt1(p.tilt, language) })} />
      <figcaption>{tr(language, "closeCaption", "One plate crystal at the selected tilt τ: the face acts as a mirror, so tilting it by τ turns the reflected ray by 2τ.")}</figcaption>
    </figure>
  );
}

/* ---------- canvas helpers ---------- */
type Pt = [number, number, number];
function line(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, color: string, width = 1) {
  if (a[2] <= 0 || b[2] <= 0) return;
  ctx.strokeStyle = color; ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
}
function poly(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  ctx.beginPath();
  pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
  ctx.closePath();
}
function glow(ctx: CanvasRenderingContext2D, at: Pt, rgb: Vec, r: number) {
  if (at[2] <= 0) return;
  const g = ctx.createRadialGradient(at[0], at[1], 0, at[0], at[1], r);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, rgbCss(rgb, 0.9)); g.addColorStop(1, rgbCss(rgb, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(at[0], at[1], r, 0, Math.PI * 2); ctx.fill();
}
function arrow(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, color: string) {
  line(ctx, a, b, color, 2);
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(b[0], b[1]);
  ctx.lineTo(b[0] - 8 * Math.cos(ang - 0.4), b[1] - 8 * Math.sin(ang - 0.4));
  ctx.lineTo(b[0] - 8 * Math.cos(ang + 0.4), b[1] - 8 * Math.sin(ang + 0.4));
  ctx.closePath(); ctx.fill();
}
function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.font = "500 10.5px 'JetBrains Mono', monospace"; ctx.fillStyle = "rgba(233,238,245,0.75)"; ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}
const mix = (a: Vec, b: Vec, t: number): Vec => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
