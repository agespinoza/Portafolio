// Minimal perspective camera for the hand-drawn 3-D canvases (no WebGL, no library).
import { type Vec, add, sub, scale, dot, norm } from "./physics";

export interface Camera { yaw: number; pitch: number; dist: number; target: Vec; focal: number; cx: number; cy: number }

const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export function makeProjector(cam: Camera) {
  const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const eye: Vec = add(cam.target, scale([Math.sin(cam.yaw) * cp, -Math.cos(cam.yaw) * cp, sp], cam.dist));
  const f = norm(sub(cam.target, eye));
  const r = norm(cross(f, [0, 0, 1]));
  const u = cross(r, f);
  /** Screen point and depth; depth ≤ 0 means behind the camera. */
  const project = (p: Vec): [number, number, number] => {
    const d = sub(p, eye);
    const z = dot(d, f);
    const k = cam.focal / Math.max(z, 1e-3);
    return [cam.cx + dot(d, r) * k, cam.cy - dot(d, u) * k, z];
  };
  return { project, eye, forward: f, right: r, up: u };
}

/** Two unit vectors perpendicular to n, for drawing a hexagon in the plane of a crystal face. */
export function basisFor(n: Vec): [Vec, Vec] {
  const helper: Vec = Math.abs(n[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const e1 = norm(cross(n, helper));
  const e2 = cross(n, e1);
  return [e1, e2];
}

export function hexagon(center: Vec, n: Vec, radius: number, rotation = 0): Vec[] {
  const [e1, e2] = basisFor(n);
  return Array.from({ length: 6 }, (_, k) => {
    const a = rotation + (k * Math.PI) / 3;
    return add(center, add(scale(e1, Math.cos(a) * radius), scale(e2, Math.sin(a) * radius)));
  });
}

export const rgbCss = (c: Vec, alpha = 1) =>
  `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${alpha})`;

/** Canvas sized for the device pixel ratio; returns the 2-D context in CSS pixels. */
export function fitCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

export { cross };
