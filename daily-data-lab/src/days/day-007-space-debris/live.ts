// Day 007 · live positions: CelesTrak GP elements (OMM, CSV) propagated with SGP4 (satellite.js) in the browser.
// Loaded only when the visitor asks. CelesTrak updates GP data every 2 hours and asks clients to download once per
// update, so the text is cached in this browser for 2 hours. CORS: celestrak.org answers access-control-allow-origin: *.
import { type SatRec, eciToEcf, gstime, json2satrec, propagate } from "satellite.js";

export const LIVE_GROUPS = [
  { group: "active", cls: 0 }, // CelesTrak "active" = operational status +, P, B, S or X, the page's definition
  { group: "fengyun-1c-debris", cls: 3 },
  { group: "cosmos-2251-debris", cls: 3 },
  { group: "iridium-33-debris", cls: 3 },
] as const;
const TTL_MS = 2 * 3600 * 1000;
const R_EARTH = 6378.137;
const NUMERIC = new Set(["MEAN_MOTION", "ECCENTRICITY", "INCLINATION", "RA_OF_ASC_NODE", "ARG_OF_PERICENTER", "MEAN_ANOMALY", "EPHEMERIS_TYPE",
  "NORAD_CAT_ID", "ELEMENT_SET_NO", "REV_AT_EPOCH", "BSTAR", "MEAN_MOTION_DOT", "MEAN_MOTION_DDOT"]);

export interface LiveSet { recs: SatRec[]; cls: Uint8Array; fetchedAt: number; epochMax: string; perGroup: Record<string, number> }

const url = (group: string) => `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=csv`;
const key = (group: string) => `dd7-gp-${group}`;

async function groupText(group: string): Promise<{ text: string; at: number }> {
  try {
    const hit = JSON.parse(localStorage.getItem(key(group)) ?? "null") as { text: string; at: number } | null;
    if (hit && Date.now() - hit.at < TTL_MS) return hit;
  } catch { /* storage blocked or full: fetch */ }
  const res = await fetch(url(group));
  if (!res.ok) throw new Error(`CelesTrak ${group}: HTTP ${res.status}`);
  const text = await res.text();
  if (!text.startsWith("OBJECT_NAME")) throw new Error(`CelesTrak ${group}: unexpected answer`);
  const hit = { text, at: Date.now() };
  try { localStorage.setItem(key(group), JSON.stringify(hit)); } catch { /* too big for storage: keep in memory only */ }
  return hit;
}

function parseCsv(text: string): Record<string, string | number>[] {
  const [head, ...lines] = text.trim().split(/\r?\n/);
  const cols = head.split(",");
  return lines.filter(Boolean).map((l) => {
    const v = l.split(","); // GP CSV has no quoted commas (names use spaces and hyphens)
    const o: Record<string, string | number> = {};
    cols.forEach((c, i) => { o[c] = NUMERIC.has(c) ? Number(v[i]) : v[i]; });
    return o;
  });
}

/** Loads every group (from cache when younger than 2 hours) and builds one SGP4 record per object. */
export async function loadLive(): Promise<LiveSet> {
  const recs: SatRec[] = [], cls: number[] = [], perGroup: Record<string, number> = {};
  let fetchedAt = Infinity, epochMax = "";
  for (const g of LIVE_GROUPS) {
    const { text, at } = await groupText(g.group);
    fetchedAt = Math.min(fetchedAt, at);
    const rows = parseCsv(text);
    perGroup[g.group] = rows.length;
    for (const r of rows) {
      try { recs.push(json2satrec(r as never)); cls.push(g.cls); } catch { /* malformed element set: skip */ }
      if (String(r.EPOCH) > epochMax) epochMax = String(r.EPOCH);
    }
  }
  return { recs, cls: Uint8Array.from(cls), fetchedAt, epochMax, perGroup };
}

/** Earth-fixed positions in Earth radii (z = north) at `date`; objects SGP4 cannot propagate are put at the origin (hidden by the Earth). */
export function positionsAt(set: LiveSet, date: Date): { pos: Float32Array; ok: number } {
  const gmst = gstime(date), pos = new Float32Array(set.recs.length * 3);
  let ok = 0;
  set.recs.forEach((rec, k) => {
    const pv = propagate(rec, date);
    const p = pv && typeof pv.position === "object" ? pv.position : null;
    if (!p) return;
    const f = eciToEcf(p, gmst);
    pos[k * 3] = f.x / R_EARTH; pos[k * 3 + 1] = f.y / R_EARTH; pos[k * 3 + 2] = f.z / R_EARTH;
    ok++;
  });
  return { pos, ok };
}
