// Downloads local-winter daily ERA5 air temperature (Open-Meteo, no key) for the 300 largest lakes,
// winters 1991–2025, and stores one winter mean per lake and winter. Resumable: run it again on later
// days and it continues where it stopped.
//
// Open-Meteo's free tier allows 10,000 calls/day; a request longer than 2 weeks counts as days/14 calls,
// so one winter (~90 days) costs ~6.4 calls. A ledger in raw/ keeps each day under BUDGET.
// Usage: node scripts/day-004/fetch-winters.mjs [budget=9000]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Progress is versioned in data/day-004-abraham-lake/ so the daily GitHub Action can resume it.
const STATE = "data/day-004-abraham-lake";
const OUT = `${STATE}/winters`;
const LEDGER = `${STATE}/open-meteo-ledger.json`;
const BUDGET = Number(process.argv[2] ?? 9000);
const FIRST = 1991, LAST = 2025;
mkdirSync(OUT, { recursive: true });

const lakes = JSON.parse(readFileSync(`${STATE}/top300.json`, "utf8"));
const ledger = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, "utf8")) : {};
const today = new Date().toISOString().slice(0, 10);
const save = () => writeFileSync(LEDGER, JSON.stringify(ledger, null, 1));
const used = () => ledger[today] ?? 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Local winter: Dec–Feb in the Northern Hemisphere (labeled by its January), Jun–Aug in the Southern.
const winterRange = (w, lat) => {
  if (lat < 0) return [`${w}-06-01`, `${w}-08-31`];
  const end = new Date(Date.UTC(w, 2, 1) - 86400000).toISOString().slice(0, 10); // last day of February
  return [`${w - 1}-12-01`, end];
};
const daysBetween = (a, b) => (Date.parse(b) - Date.parse(a)) / 86400000 + 1;

let done = 0, skipped = 0;
outer:
for (const lake of lakes) {
  const file = `${OUT}/${lake.lake_id}.json`;
  const rec = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { lake_id: lake.lake_id, name: lake.name, lat: lake.lat, lon: lake.lon, winters: {} };
  for (let w = FIRST; w <= LAST; w++) {
    if (rec.winters[w]) continue;
    const [start, end] = winterRange(w, lake.lat);
    const cost = Math.max(1, daysBetween(start, end) / 14);
    if (used() + cost > BUDGET) { console.log(`Budget reached (${used().toFixed(0)} calls today). Run again tomorrow.`); break outer; }
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lake.lat}&longitude=${lake.lon}` +
      `&start_date=${start}&end_date=${end}&daily=temperature_2m_mean&models=era5&timezone=auto`;
    let res;
    for (let attempt = 1; ; attempt++) {
      res = await fetch(url);
      if (res.ok || attempt >= 3 || (res.status !== 429 && res.status < 500)) break;
      await sleep(5000 * attempt);
    }
    ledger[today] = used() + cost; save();
    if (!res.ok) {
      const msg = await res.text();
      console.warn(`${lake.lake_id} ${w}: HTTP ${res.status} ${msg.slice(0, 120)}`);
      if (res.status === 429) break outer;
      continue;
    }
    const json = await res.json();
    const vals = (json.daily?.temperature_2m_mean ?? []).filter((v) => v != null);
    rec.grid = { lat: json.latitude, lon: json.longitude, elevation: json.elevation };
    rec.winters[w] = { mean: vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null, days: vals.length };
    writeFileSync(file, JSON.stringify(rec));
    await sleep(150);
  }
  if (Object.keys(rec.winters).length === LAST - FIRST + 1) done++; else skipped++;
}
console.log(`Complete lakes: ${done}/${lakes.length} · calls today: ${used().toFixed(0)}/${BUDGET}`);
