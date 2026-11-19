// Fetching and shaping for Day 002. These functions have no bundler-only imports,
// so both the page (api.js) and the snapshot script (scripts/snapshot-glowworms.mjs) use them.
// Both APIs allow cross-origin requests from the browser and need no API key.

export const TAXON_KEY = 1564326; // GBIF backbone: Arachnocampa luminosa (Skuse, 1891)
export const WAITOMO = { lat: -38.26, lon: 175.1, name: "Waitomo Caves" };

const GBIF = "https://api.gbif.org/v1/occurrence/search";
const PAGE = 300; // GBIF's maximum page size

export const SOUTH_REGIONS = new Set([
  "Tasman", "Nelson", "Marlborough", "West Coast", "Canterbury", "Otago", "Southland",
]);

async function getJSON(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const QUERY = `taxonKey=${TAXON_KEY}&country=NZ&hasCoordinate=true&hasGeospatialIssue=false`;

/** Current number of matching GBIF records: one tiny request the page makes live. */
export async function fetchRecordCount() {
  const json = await getJSON(`${GBIF}?${QUERY}&limit=0`);
  return json.count;
}

/**
 * Every georeferenced GBIF record in New Zealand, as rows of [lat, lon, year, month, region].
 * Full records are large (about 2 MB per page of 300), so only the snapshot script calls this.
 */
export async function fetchSightings() {
  const total = await fetchRecordCount();
  const results = [];
  // GBIF sometimes fails to serialize one record and returns broken JSON for the whole page.
  // When that happens, split the page in halves until the bad record is isolated, then skip it.
  async function grab(offset, limit) {
    try {
      const page = await withRetry(() => getJSON(`${GBIF}?${QUERY}&limit=${limit}&offset=${offset}`), 2);
      results.push(...(page.results || []));
    } catch (err) {
      if (limit === 1) { console.warn(`Skipped record at offset ${offset}: ${err.message}`); return; }
      const half = Math.ceil(limit / 2);
      await grab(offset, half);
      await grab(offset + half, limit - half);
    }
  }
  for (let offset = 0; offset < total; offset += PAGE) await grab(offset, Math.min(PAGE, total - offset));
  return results
    .filter((r) => Number.isFinite(r.decimalLatitude) && Number.isFinite(r.decimalLongitude))
    .map((r) => [
      round(r.decimalLatitude, 3), round(r.decimalLongitude, 3),
      r.year ?? null, r.month ?? null, cleanRegion(r.stateProvince),
    ]);
}

/** Current conditions outside the caves (Open-Meteo forecast API, local time). */
export async function fetchWeatherNow() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${WAITOMO.lat}&longitude=${WAITOMO.lon}` +
    "&current=temperature_2m,relative_humidity_2m,precipitation,is_day&timezone=Pacific%2FAuckland";
  const json = await getJSON(url);
  const c = json.current || {};
  return { time: c.time, temp: c.temperature_2m, humidity: c.relative_humidity_2m, rain: c.precipitation, isDay: c.is_day === 1 };
}

/** Daily weather at Waitomo for whole years, reduced to 12 monthly averages. */
export async function fetchClimate(startYear, endYear) {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${WAITOMO.lat}&longitude=${WAITOMO.lon}` +
    `&start_date=${startYear}-01-01&end_date=${endYear}-12-31` +
    "&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,precipitation_sum&timezone=Pacific%2FAuckland";
  const json = await getJSON(url);
  return { years: [startYear, endYear], months: toMonthly(json.daily, endYear - startYear + 1) };
}

/** Monthly means of daily highs, lows, extremes, and humidity, plus average rainfall per month. */
export function toMonthly(daily, yearCount) {
  const acc = Array.from({ length: 12 }, () => ({ hi: [], lo: [], rh: [], rain: 0 }));
  daily.time.forEach((t, i) => {
    const m = acc[Number(t.slice(5, 7)) - 1];
    const hi = daily.temperature_2m_max[i], lo = daily.temperature_2m_min[i];
    const rh = daily.relative_humidity_2m_mean[i], rain = daily.precipitation_sum[i];
    if (hi != null) m.hi.push(hi);
    if (lo != null) m.lo.push(lo);
    if (rh != null) m.rh.push(rh);
    if (rain != null) m.rain += rain;
  });
  const mean = (a) => (a.length ? round(a.reduce((s, v) => s + v, 0) / a.length, 1) : null);
  return acc.map((m, i) => ({
    month: i + 1,
    high: mean(m.hi), low: mean(m.lo),
    max: m.hi.length ? Math.max(...m.hi) : null, min: m.lo.length ? Math.min(...m.lo) : null,
    humidity: mean(m.rh), rain: round(m.rain / yearCount, 0),
  }));
}

/** The last complete calendar years, so every month is counted the same number of times. */
export function climateYears(today = new Date(), span = 5) {
  const end = today.getFullYear() - 1;
  return [end - span + 1, end];
}

export function islandOf(lat, lon, region) {
  if (region) return SOUTH_REGIONS.has(region) ? "South" : "North";
  // No region recorded: split along Cook Strait.
  return lat < -41.6 || (lat < -40.4 && lon < 174.5) ? "South" : "North";
}

function cleanRegion(s) {
  if (!s) return null;
  return s.replace(/ Region$/i, "").replace(/^Manawat[uū][-–\s]Whanganui$/i, "Manawatū-Whanganui")
    .replace(/^Manawatu-Wanganui$/i, "Manawatū-Whanganui").trim();
}

async function withRetry(fn, tries = 4) {
  for (let i = 1; ; i++) {
    try { return await fn(); } catch (err) {
      if (i >= tries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

function round(v, d) { const k = 10 ** d; return Math.round(v * k) / k; }
