// Saves a fallback copy of CBP historical wait times so the page still works
// if the live API is unavailable. Run with: npm run snapshot
import { writeFile } from "node:fs/promises";

const API = "https://bwt.cbp.gov/api";
const CROSSINGS = { "09250302": "Calexico West", "09250301": "Calexico East" };

const historical = {};
for (const id of Object.keys(CROSSINGS)) {
  historical[id] = {};
  for (let month = 1; month <= 12; month++) {
    const res = await fetch(`${API}/historicalwaittimes/${id}/POV/GEN/${month}/7`);
    if (!res.ok) throw new Error(`${id} month ${month}: HTTP ${res.status}`);
    const json = await res.json();
    historical[id][month] = (json.wait_times || []).map((r) => [
      Number(r.bwt_day), Number(r.time_slot),
      Number(r.pv_time_avg), Number(r.xpv_time_avg), Number(r.pv_ready_lanes_time_avg), Number(r.ped_time_avg),
    ]);
    console.log(`${CROSSINGS[id]} · month ${month}: ${historical[id][month].length} rows`);
  }
}

const out = {
  source: "U.S. Customs and Border Protection, Border Wait Times (bwt.cbp.gov)",
  columns: ["day (0=Mon)", "hour", "car_standard", "car_sentri", "car_ready", "pedestrian"],
  capturedAt: new Date().toISOString(),
  historical,
};
await writeFile(new URL("../src/days/day-001-border/snapshot.json", import.meta.url), JSON.stringify(out));
console.log("Saved src/days/day-001-border/snapshot.json");
