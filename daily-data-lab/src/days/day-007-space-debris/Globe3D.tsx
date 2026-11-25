// Day 007 · 3-D globe built on the same engine as the portfolio's Satellite Operations Console
// (projects/02-trajectory-visualization/globe.js): Three.js, an Earth lit from the real Sun direction with a
// twilight band, an atmosphere glow, a starfield, orbit controls and altitude rings. Every object is a point at its
// altitude: catalogue shells (pseudo-random place around the shell, SATCAT has no phase) or, in live mode, the
// SGP4 position in the Earth-fixed frame. Falls back to the canvas globe (Globe.tsx) when WebGL is unavailable.
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { gstime } from "satellite.js";
import { CLASSES } from "./data";
import { type Props, type Scale, CanvasGlobe, DOT, altFromRadius, buildDots, radius, shellBins } from "./Globe";
import LAND from "../day-003-light-pillars/world-land.json";

/** Scene axes as in the console: x = Earth x, y = north, z = −Earth y. */
const toScene = (x: number, y: number, z: number) => new THREE.Vector3(x, z, -y);
const RINGS: Record<Scale, number[]> = { leo: [500, 1000, 2000], true: [2000, 20200, 35786] };
const CAMERA: Record<Scale, number> = { leo: 4.4, true: 15.5 };

function webglOk(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch { return false; }
}

/** Sun direction in the Earth-fixed frame (unit vector, z = north), low-precision solar position (≈0.01°). */
export function sunEcef(date: Date): [number, number, number] {
  const n = date.getTime() / 86400000 + 2440587.5 - 2451545.0;
  const rad = Math.PI / 180;
  const L = (280.46 + 0.9856474 * n) % 360, g = ((357.528 + 0.9856003 * n) % 360) * rad;
  const lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad, eps = (23.439 - 0.0000004 * n) * rad;
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)), dec = Math.asin(Math.sin(eps) * Math.sin(lam));
  const lon = ra - gstime(date);
  return [Math.cos(dec) * Math.cos(lon), Math.cos(dec) * Math.sin(lon), Math.sin(dec)];
}

/** Equirectangular night texture: deep ocean, a dot matrix over land (Natural Earth 1:110m), faint graticule. */
function earthTexture(): HTMLCanvasElement {
  const W = 2048, H = 1024;
  const mask = document.createElement("canvas");
  mask.width = W; mask.height = H;
  const m = mask.getContext("2d", { willReadFrequently: true })!;
  const px = (lon: number) => ((lon + 180) / 360) * W, py = (lat: number) => ((90 - lat) / 180) * H;
  m.fillStyle = "#fff";
  for (const ring of (LAND as unknown as { rings: [number, number][][] }).rings) {
    // Unwrap across the antimeridian; a ring that circles a pole is closed through that pole.
    const pts: [number, number][] = [];
    let off = 0;
    ring.forEach(([lon, lat], i) => {
      if (i) { const d = lon + off - pts[i - 1][0]; if (d > 180) off -= 360; else if (d < -180) off += 360; }
      pts.push([lon + off, lat]);
    });
    const span = pts[pts.length - 1][0] - pts[0][0];
    if (Math.abs(span) > 300) { const pole = pts.reduce((a, p) => a + p[1], 0) < 0 ? -90 : 90; pts.push([pts[pts.length - 1][0], pole], [pts[0][0], pole]); }
    for (const shift of [-360, 0, 360]) {
      m.beginPath();
      pts.forEach(([lon, lat], i) => (i ? m.lineTo(px(lon + shift), py(lat)) : m.moveTo(px(lon + shift), py(lat))));
      m.closePath(); m.fill("evenodd");
    }
  }
  const land = m.getImageData(0, 0, W, H).data;
  const isLand = (lon: number, lat: number) => {
    const x = Math.min(W - 1, Math.max(0, Math.floor(px(lon)))), y = Math.min(H - 1, Math.max(0, Math.floor(py(lat))));
    return land[(y * W + x) * 4] > 127;
  };
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const ocean = ctx.createLinearGradient(0, 0, 0, H);
  ocean.addColorStop(0, "#0c1a33"); ocean.addColorStop(0.5, "#0f2340"); ocean.addColorStop(1, "#0c1a33");
  ctx.fillStyle = ocean; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(131,144,165,.16)"; ctx.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 15) { ctx.beginPath(); ctx.moveTo(px(lon), 0); ctx.lineTo(px(lon), H); ctx.stroke(); }
  for (let lat = -75; lat <= 75; lat += 15) { ctx.beginPath(); ctx.moveTo(0, py(lat)); ctx.lineTo(W, py(lat)); ctx.stroke(); }
  const step = 1;
  for (let lat = -90 + step / 2; lat < 90; lat += step) {
    const stretch = 1 / Math.max(0.08, Math.cos((lat * Math.PI) / 180));
    for (let lon = -180 + (step * stretch) / 2; lon < 180; lon += step * stretch) {
      if (!isLand(lon, lat)) continue;
      const shade = 0.62 + 0.38 * Math.cos((lat * Math.PI) / 180);
      ctx.fillStyle = `rgba(${Math.round(120 * shade + 40)},${Math.round(190 * shade + 30)},${Math.round(205 * shade + 30)},.92)`;
      ctx.beginPath(); ctx.ellipse(px(lon), py(lat), Math.min(30, 1.6 * stretch), 1.6, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  return c;
}

const EARTH_VS = `varying vec2 vUv; varying vec3 vN;
void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const EARTH_FS = `uniform sampler2D map; uniform vec3 sunDir; varying vec2 vUv; varying vec3 vN;
void main(){ vec3 c = texture2D(map, vUv).rgb; float d = dot(normalize(vN), normalize(sunDir));
  float day = smoothstep(-0.10, 0.18, d); vec3 night = c * 0.34; vec3 lit = c * (0.92 + 0.45 * max(d, 0.0));
  vec3 tw = vec3(0.86, 0.48, 0.24) * 0.10 * (1.0 - abs(d) * 6.0);
  gl_FragColor = vec4(mix(night, lit, day) + max(tw, 0.0), 1.0); }`;
const ATMO_VS = `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const ATMO_FS = `varying vec3 vN; void main(){ float i = pow(0.62 - dot(vN, vec3(0.0, 0.0, 1.0)), 3.2); gl_FragColor = vec4(0.36, 0.76, 0.88, 1.0) * i; }`;
/** Round, soft points sized in screen pixels, coloured per kind. */
const DOT_VS = `attribute vec3 color; uniform float size; varying vec3 vColor;
void main(){ vColor = color; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size; gl_Position = projectionMatrix * mv; }`;
const DOT_FS = `uniform float opacity; varying vec3 vColor;
void main(){ vec2 p = gl_PointCoord - 0.5; float r = length(p); if (r > 0.5) discard; gl_FragColor = vec4(vColor, opacity * smoothstep(0.5, 0.25, r)); }`;

interface Scene3D {
  renderer: THREE.WebGLRenderer; camera: THREE.PerspectiveCamera; controls: OrbitControls; points: THREE.Points;
  rings: THREE.Group; earth: THREE.ShaderMaterial; labels: HTMLDivElement; ringLabels: { el: HTMLSpanElement; pos: THREE.Vector3 }[];
  dispose: () => void; setSize: () => void;
}

export function GlobeCard(props: Props) {
  const [gl] = useState(() => typeof window !== "undefined" && webglOk());
  return gl ? <Globe3D {...props} /> : <CanvasGlobe {...props} />;
}

function Globe3D({ cells, scale, hidden, ariaLabel, hint, shellReadout, live }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const s3 = useRef<Scene3D | null>(null);
  const [readout, setReadout] = useState("");
  const dots = useMemo(() => buildDots(cells, scale, live), [cells, scale, live]);
  const binKm = scale === "leo" ? 50 : 1000;
  const bins = useMemo(() => shellBins(dots, binKm), [dots, binKm]);
  const readRef = useRef({ bins, binKm, scale, shellReadout });
  readRef.current = { bins, binKm, scale, shellReadout };

  // Scene: built once.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute("tabindex", "0");
    renderer.domElement.className = "sd-globe3d__canvas";
    el.append(renderer.domElement);
    const labels = document.createElement("div");
    labels.className = "sd-globe3d__labels";
    el.append(labels);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 4000);
    // Open on the day side: look from the Sun's direction, turned 35° and raised, as the console does.
    camera.position.copy(toScene(...sunEcef(new Date()))).applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.6).add(new THREE.Vector3(0, 0.45, 0)).setLength(CAMERA.leo);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.enablePan = false; controls.minDistance = 1.3; controls.maxDistance = 60;
    controls.rotateSpeed = 0.6; controls.zoomSpeed = 0.8;
    controls.autoRotate = !(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    controls.autoRotateSpeed = 0.35;
    controls.listenToKeyEvents(renderer.domElement);

    // Starfield.
    const stars: number[] = [];
    for (let i = 0; i < 2400; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(900 + Math.random() * 400); stars.push(v.x, v.y, v.z); }
    scene.add(new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(stars, 3)),
      new THREE.PointsMaterial({ color: 0x9fb4d6, size: 1.1, sizeAttenuation: false, transparent: true, opacity: 0.55 })));
    // Earth and atmosphere.
    const tex = new THREE.CanvasTexture(earthTexture());
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const earthMat = new THREE.ShaderMaterial({ uniforms: { map: { value: tex }, sunDir: { value: new THREE.Vector3(1, 0, 0) } }, vertexShader: EARTH_VS, fragmentShader: EARTH_FS });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1, 128, 64), earthMat));
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.08, 64, 32), new THREE.ShaderMaterial({
      vertexShader: ATMO_VS, fragmentShader: ATMO_FS, side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })));
    // Objects.
    const points = new THREE.Points(new THREE.BufferGeometry(), new THREE.ShaderMaterial({
      uniforms: { size: { value: 3 }, opacity: { value: 0.85 } }, vertexShader: DOT_VS, fragmentShader: DOT_FS, transparent: true, depthWrite: false }));
    scene.add(points);
    const rings = new THREE.Group();
    scene.add(rings);

    const setSize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Keep the horizontal field of view of a 16:10 frame on narrow, portrait screens (as in the console).
      const halfH = Math.atan(Math.tan((19 * Math.PI) / 180) * 1.6);
      camera.fov = camera.aspect < 1.6 ? Math.min(80, (2 * Math.atan(Math.tan(halfH) / camera.aspect) * 180) / Math.PI) : 38;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(setSize);
    ro.observe(el);

    const ringLabels: Scene3D["ringLabels"] = [];
    let running = true, raf = 0, target: number | null = null;
    const io = new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting; if (running && !was) loop(); });
    io.observe(el);
    const loop = () => {
      if (!running) return;
      const sun = sunEcef(new Date());
      earthMat.uniforms.sunDir.value.copy(toScene(...sun)).normalize();
      if (target) {
        const d = camera.position.length(), next = d + (target - d) * 0.08;
        camera.position.setLength(next);
        if (Math.abs(next - target) < 0.01 * target) target = null;
      }
      controls.update();
      renderer.render(scene, camera);
      const w = el.clientWidth, h = el.clientHeight;
      for (const r of ringLabels) {
        const p = r.pos.clone().project(camera);
        r.el.hidden = p.z > 1;
        r.el.style.transform = `translate(${((p.x + 1) / 2) * w + 6}px, ${((1 - p.y) / 2) * h - 8}px)`;
      }
      raf = requestAnimationFrame(loop);
    };

    // Readout: the shell whose silhouette passes under the pointer (closest approach of the view ray to the centre).
    const ray = new THREE.Raycaster();
    const onMove = (e: PointerEvent) => {
      const b = renderer.domElement.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1), camera);
      const o = ray.ray.origin, d = ray.ray.direction;
      const t = -o.dot(d), r = t > 0 ? o.clone().addScaledVector(d, t).length() : o.length();
      const { bins: bs, binKm: bk, scale: sc, shellReadout: fmt } = readRef.current;
      const alt = altFromRadius(r, sc);
      if (r < 1 || alt > (sc === "leo" ? 2000 : 45000)) { setReadout(""); return; }
      const bin = Math.floor(alt / bk);
      setReadout(fmt(bin * bk, (bin + 1) * bk, bs.get(bin) ?? CLASSES.map(() => 0)));
    };
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerleave", () => setReadout(""));
    renderer.domElement.addEventListener("pointerdown", () => { controls.autoRotate = false; });

    s3.current = {
      renderer, camera, controls, points, rings, earth: earthMat, labels, ringLabels, setSize,
      dispose: () => { running = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); controls.dispose(); renderer.dispose(); el.replaceChildren(); },
    };
    (s3.current as Scene3D & { zoom: (d: number) => void }).zoom = (d: number) => { target = d; };
    setSize();
    loop();
    return () => { s3.current?.dispose(); s3.current = null; };
  }, []);

  // Points: rebuilt when the data, scale or visible kinds change.
  useEffect(() => {
    const s = s3.current;
    if (!s) return;
    const keep: number[] = [];
    for (let k = 0; k < dots.n; k++) if (!hidden.has(dots.cls[k])) keep.push(k);
    const pos = new Float32Array(keep.length * 3), col = new Float32Array(keep.length * 3);
    const palette = CLASSES.map((c) => new THREE.Color(DOT[c]));
    keep.forEach((k, i) => {
      const v = toScene(dots.pos[k * 3], dots.pos[k * 3 + 1], dots.pos[k * 3 + 2]);
      pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
      const c = palette[dots.cls[k]];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    });
    s.points.geometry.dispose();
    s.points.geometry = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(pos, 3)).setAttribute("color", new THREE.BufferAttribute(col, 3));
    const m = s.points.material as THREE.ShaderMaterial;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    m.uniforms.size.value = (keep.length > 20000 ? 2.2 : keep.length > 3000 ? 2.8 : 3.6) * dpr;
    m.uniforms.opacity.value = keep.length > 20000 ? 0.7 : 0.9;
  }, [dots, hidden]);

  // Altitude rings in the equatorial plane, with labels, and the camera distance for the scale.
  useEffect(() => {
    const s = s3.current;
    if (!s) return;
    s.rings.clear();
    s.labels.replaceChildren();
    s.ringLabels.length = 0;
    RINGS[scale].forEach((km, idx) => {
      const r = radius(km, scale), pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 192; i++) { const a = (i / 192) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
      s.rings.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x8390a5, transparent: true, opacity: 0.28, depthWrite: false })));
      const el = document.createElement("span");
      el.className = "sd-globe3d__label";
      el.textContent = `${km.toLocaleString("en-US")} km`;
      s.labels.append(el);
      const a = (-25 + idx * 38) * (Math.PI / 180); // spread the labels around the rings so they never overlap
      s.ringLabels.push({ el, pos: new THREE.Vector3(r * Math.cos(a), 0, -r * Math.sin(a)) });
    });
    (s as Scene3D & { zoom: (d: number) => void }).zoom(CAMERA[scale]);
  }, [scale]);

  useEffect(() => { s3.current?.renderer.domElement.setAttribute("aria-label", ariaLabel); }, [ariaLabel]);

  return (
    <figure className="chart">
      <div ref={box} className="sd-globe3d" />
      <p className="readout" aria-live="polite">{readout || hint}</p>
    </figure>
  );
}
