// Data access for CBP Border Wait Times (https://bwt.cbp.gov).
// All endpoints below allow cross-origin requests from the browser.
import SNAPSHOT from "./snapshot.json";

const API = "https://bwt.cbp.gov/api";

export const CROSSINGS = [
  { id: "09250302", port: "250302", name: "Calexico West", note: "Downtown · open 24 hours" },
  { id: "09250301", port: "250301", name: "Calexico East", note: "East side · 6 am – 10 pm" },
];

// Each lane maps to the field names used by the three CBP endpoints.
export const LANES = [
  { id: "car", label: "Car · Standard", hist: 2, graph: ["private", "standard_lane"], live: ["passenger_vehicle_lanes", "standard_lanes"] },
  { id: "sentri", label: "Car · SENTRI", hist: 3, graph: ["private", "fast_lane"], live: ["passenger_vehicle_lanes", "NEXUS_SENTRI_lanes"] },
  { id: "ready", label: "Car · Ready Lane", hist: 4, graph: ["private", "ready_lane"], live: ["passenger_vehicle_lanes", "ready_lanes"] },
  { id: "ped", label: "Pedestrian", hist: 5, graph: ["pedestrian", "standard_lane"], live: ["pedestrian_lanes", "standard_lanes"] },
];

export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Current date parts in the border's time zone (Pacific). */
export function borderNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", hour12: false, weekday: "long",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return {
    iso: `${get("year")}-${get("month")}-${get("day")}`,
    month: Number(get("month")),
    hour: Number(get("hour")) % 24,
    weekday: DAY_NAMES.indexOf(get("weekday")),
  };
}

async function getJSON(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Live status for every lane at both Calexico crossings. */
export async function fetchLive() {
  const all = await getJSON(`${API}/bwtnew`);
  return Object.fromEntries(
    all.filter((p) => CROSSINGS.some((c) => c.port === p.port_number)).map((p) => [p.port_number, p])
  );
}

/** Today's hourly waits with the typical average, minimum, and maximum for this weekday. */
export async function fetchToday(crossingId, iso) {
  const [g] = await getJSON(`${API}/bwtwaittimegraph/${crossingId}/${iso}`);
  return {
    private: g?.private_time_slots?.private_slot || [],
    pedestrian: g?.pedestrain_time_slots?.pedestrain_slot || [],
  };
}

/** Historical averages for one month as rows of [day, hour, car, sentri, ready, ped]. */
export async function fetchHistorical(crossingId, month) {
  const json = await getJSON(`${API}/historicalwaittimes/${crossingId}/POV/GEN/${month}/7`);
  return (json.wait_times || []).map((r) => [
    Number(r.bwt_day), Number(r.time_slot),
    Number(r.pv_time_avg), Number(r.xpv_time_avg), Number(r.pv_ready_lanes_time_avg), Number(r.ped_time_avg),
  ]);
}

/** Snapshot bundled into the app, used when the live API is unreachable. */
export async function fetchSnapshot() {
  return SNAPSHOT;
}

/** 7 × 24 grid of minutes (null = closed / no data). */
export function toGrid(rows, laneIndex) {
  const grid = Array.from({ length: 7 }, () => Array(24).fill(null));
  rows.forEach((r) => {
    const v = r[laneIndex];
    if (r[0] >= 0 && r[0] < 7 && r[1] >= 0 && r[1] < 24 && v > 0) grid[r[0]][r[1]] = v;
  });
  return grid;
}

export function hourLabel(h) {
  if (h === 0) return "12 am";
  if (h === 12) return "12 pm";
  return h < 12 ? `${h} am` : `${h - 12} pm`;
}

/** Adds whole days to a YYYY-MM-DD date. */
export function shiftDate(iso, days) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
