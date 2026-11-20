// Builds the Day 003 catalog of ice-crystal optics photographs (light pillars, sun pillars,
// parhelia, 22° halos, circumzenithal arcs) from Wikimedia Commons, places each geotagged
// photo in a country with Natural Earth, and links ERA5 reanalysis weather from Open-Meteo.
// The page and thumbnail URLs are rebuilt from the file title in data.ts.
// Run with: npm run snapshot:pillars   (takes a few minutes; Open-Meteo is queried once per photo)
import { writeFile } from "node:fs/promises";

const DIR = new URL("../src/days/day-003-light-pillars/", import.meta.url);
const UA = { "User-Agent": "DailyDataLab/1.0 (open-source educational visualization)" };
const FROM = "2000-01-01", TO = "2026-11-20";

// Phenomenon → Commons categories. Each category is read one level deep (files only), except
// the country sub-categories of sun pillars. "Vädersolstavlan" (a 17th-century painting) and
// "Parhelic circles" are left out on purpose.
const PHENOMENA = {
  sun_pillar: ["Sun pillars", "Sun pillars by country/*"],
  light_pillar: ["Light pillars"],
  parhelion: ["Parhelia"],
  halo22: ["22° halo"],
  cza: ["Circumzenithal arcs"],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getJSON(url, tries = 8) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: UA });
      if (res.status === 429 || res.status === 503) {
        const wait = Number(res.headers.get("retry-after")) || 10 * (i + 1);
        console.warn(`  rate limited, waiting ${wait}s`);
        await sleep(wait * 1000);
        continue;
      }
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return await res.json();
    } catch (err) {
      if (i === tries - 1) throw err;
      await sleep(1500 * (i + 1));
    }
  }
  throw new Error(`Gave up on ${url}`);
}
const api = (params) => getJSON(`https://commons.wikimedia.org/w/api.php?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`);

async function subcats(cat) {
  const out = [];
  let cont = {};
  do {
    const d = await api({ action: "query", list: "categorymembers", cmtitle: `Category:${cat}`, cmtype: "subcat", cmlimit: "500", ...cont });
    out.push(...d.query.categorymembers.map((m) => m.title.replace(/^Category:/, "")));
    cont = d.continue || null;
  } while (cont);
  return out;
}

async function filesIn(cat) {
  const pages = [];
  let cont = {};
  do {
    const d = await api({
      action: "query", generator: "categorymembers", gcmtitle: `Category:${cat}`, gcmtype: "file", gcmlimit: "50",
      prop: "coordinates|imageinfo", coprimary: "all", coprop: "type", colimit: "max",
      iiprop: "extmetadata",
      iiextmetadatafilter: "DateTimeOriginal|DateTime|LicenseShortName|LicenseUrl|Artist|ImageDescription|Credit|AttributionRequired",
      ...cont,
    });
    pages.push(...(d.query?.pages || []));
    cont = d.continue || null;
    await sleep(1200);
  } while (cont);
  return pages;
}

const strip = (html) => (html || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, " ").trim();

/** Capture date from EXIF/Information template. Returns {date, time, quality} or null. */
function captureDate(meta) {
  const raw = strip(meta.DateTimeOriginal?.value);
  const m = raw.match(/(\d{4})[-:](\d{2})[-:](\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, hh, mm] = m;
  if (Number(mo) < 1 || Number(mo) > 12 || Number(d) < 1 || Number(d) > 31) return null;
  return { date: `${y}-${mo}-${d}`, time: hh ? `${hh}:${mm}` : null };
}

// 1. Collect files per phenomenon
const files = new Map(); // pageid → record
for (const [phenomenon, cats] of Object.entries(PHENOMENA)) {
  const list = [];
  for (const c of cats) {
    if (c.endsWith("/*")) list.push(...await subcats(c.slice(0, -2)));
    else list.push(c);
  }
  for (const cat of list) {
    const pages = await filesIn(cat);
    console.log(`${phenomenon.padEnd(12)} ${cat}: ${pages.length} files`);
    for (const p of pages) {
      const rec = files.get(p.pageid) || { page: p, phenomena: new Set(), categories: new Set() };
      rec.phenomena.add(phenomenon);
      rec.categories.add(cat);
      files.set(p.pageid, rec);
    }
  }
}
console.log(`Unique files: ${files.size}`);

// 2. Natural Earth countries for point-in-polygon
const ne = await getJSON("https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_50m_admin_0_countries.geojson");
const countries = ne.features.map((f) => {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const bbox = [180, 90, -180, -90];
  polys.forEach((poly) => poly[0].forEach(([x, y]) => {
    bbox[0] = Math.min(bbox[0], x); bbox[1] = Math.min(bbox[1], y); bbox[2] = Math.max(bbox[2], x); bbox[3] = Math.max(bbox[3], y);
  }));
  return { name: f.properties.NAME_EN || f.properties.NAME, iso: f.properties.ISO_A2_EH || f.properties.ISO_A2, sub: f.properties.SUBREGION, polys, bbox };
});
const inRing = (x, y, ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const inPoly = (x, y, poly) => inRing(x, y, poly[0]) && !poly.slice(1).some((h) => inRing(x, y, h));
function countryAt(lat, lon) {
  for (const c of countries) {
    if (lon < c.bbox[0] || lon > c.bbox[2] || lat < c.bbox[1] || lat > c.bbox[3]) continue;
    if (c.polys.some((p) => inPoly(lon, lat, p))) return { ...c, offshore: false };
  }
  // Coastal points that fall just outside the 1:50m coastline: nearest vertex within ~30 km.
  let best = null, bestD = 0.3;
  for (const c of countries) {
    if (lon < c.bbox[0] - 1 || lon > c.bbox[2] + 1 || lat < c.bbox[1] - 1 || lat > c.bbox[3] + 1) continue;
    for (const p of c.polys) for (const [x, y] of p[0]) {
      const d = Math.hypot((x - lon) * Math.cos((lat * Math.PI) / 180), y - lat);
      if (d < bestD) { bestD = d; best = c; }
    }
  }
  return best ? { ...best, offshore: true } : null;
}

/** Study regions requested in the brief. The polar circles take precedence over country. */
function regionOf(lat, lon, c) {
  if (Math.abs(lat) >= 66.56) return "polar";
  if (!c) return "other";
  if (c.iso === "RU") return lon >= 60 ? "asia" : "europe_central";
  if (c.sub === "Northern Europe") return "europe_north";
  if (c.sub === "Western Europe" || c.sub === "Eastern Europe") return "europe_central";
  if (c.sub === "Southern Europe") return "europe_south";
  if (c.sub === "Northern America") return "north_america";
  if (c.sub === "Eastern Asia" || c.sub === "Central Asia") return "asia";
  if (c.sub === "Australia and New Zealand") return "oceania";
  return "other";
}

// 3. Build records
const rows = [];
const excluded = { noDate: 0, outOfRange: 0, total: files.size };
for (const { page, phenomena } of files.values()) {
  const info = page.imageinfo?.[0];
  if (!info) continue;
  const meta = info.extmetadata || {};
  const cap = captureDate(meta);
  if (!cap) { excluded.noDate++; continue; }
  if (cap.date < FROM || cap.date > TO) { excluded.outOfRange++; continue; }
  const coords = (page.coordinates || []).filter((c) => c.globe === "earth" || !c.globe);
  const camera = coords.find((c) => c.primary) || null;
  const object = coords.find((c) => !c.primary) || null;
  const pt = camera || object;
  const lat = pt ? Math.round(pt.lat * 1e4) / 1e4 : null;
  const lon = pt ? Math.round(pt.lon * 1e4) / 1e4 : null;
  const country = pt ? countryAt(lat, lon) : null;
  const text = `${page.title} ${strip(meta.ImageDescription?.value)}`.toLowerCase();
  const lunar = /\b(moon|lunar|mond|lune|luna|kuu|måne|månen)\b/.test(text);
  const ph = [...phenomena];
  // Moon pillars have no Commons category: flag pillar photos whose title or description names the Moon.
  if (lunar && (ph.includes("light_pillar") || ph.includes("sun_pillar"))) ph.push("moon_pillar");
  rows.push({
    id: `WMC-${page.pageid}`,
    title: page.title.replace(/^File:/, ""),
    artist: strip(meta.Artist?.value).slice(0, 80) || null,
    license: strip(meta.LicenseShortName?.value) || null,
    licenseUrl: meta.LicenseUrl?.value || null,
    description: strip(meta.ImageDescription?.value).slice(0, 140) || null,
    phenomena: ph,
    date: cap.date,
    time: cap.time,
    lat, lon,
    locType: camera ? "camera" : object ? "object" : null,
    country: country?.name ?? null,
    iso: country?.iso ?? null,
    offshore: country?.offshore ?? null,
    region: pt ? regionOf(lat, lon, country) : null,
    hemisphere: pt ? (lat >= 0 ? "N" : "S") : null,
  });
}
console.log(`Records in ${FROM}..${TO}: ${rows.length} (no date ${excluded.noDate}, out of range ${excluded.outOfRange})`);

// 4. ERA5 weather at the place and hour of each geotagged photo (Open-Meteo archive, timezone=auto)
const HOURLY = ["temperature_2m", "relative_humidity_2m", "dew_point_2m", "wind_speed_10m", "wind_direction_10m",
  "cloud_cover", "cloud_cover_low", "cloud_cover_mid", "cloud_cover_high", "surface_pressure"];
let done = 0;
for (const r of rows) {
  if (r.lat == null) continue;
  const url = `https://archive-api.open-meteo.com/v1/archive?${new URLSearchParams({
    latitude: r.lat, longitude: r.lon, start_date: r.date, end_date: r.date, hourly: HOURLY.join(","), timezone: "auto",
  })}`;
  try {
    const d = await getJSON(url);
    const h = d.hourly;
    const pick = (k) => {
      const vals = h[k];
      if (!vals) return null;
      if (r.time) return vals[Number(r.time.slice(0, 2))] ?? null;
      const ok = vals.filter((v) => v != null);
      return ok.length ? Math.round((ok.reduce((a, b) => a + b, 0) / ok.length) * 10) / 10 : null;
    };
    r.tz = d.timezone;
    r.utcOffset = d.utc_offset_seconds / 3600;
    r.gridElevation = d.elevation;
    r.wx = {
      basis: r.time ? "hour" : "daymean",
      t: pick("temperature_2m"), rh: pick("relative_humidity_2m"), td: pick("dew_point_2m"),
      ws: pick("wind_speed_10m"), wd: r.time ? pick("wind_direction_10m") : null,
      cc: pick("cloud_cover"), ccl: pick("cloud_cover_low"), ccm: pick("cloud_cover_mid"), cch: pick("cloud_cover_high"),
      p: pick("surface_pressure"),
    };
  } catch (err) {
    r.wx = null;
    console.warn(`weather failed for ${r.id}: ${err.message}`);
  }
  if (++done % 50 === 0) console.log(`weather ${done}`);
  await sleep(120);
}

await writeFile(new URL("catalog.json", DIR), JSON.stringify({
  capturedAt: new Date().toISOString(),
  window: [FROM, TO],
  sources: {
    photos: "Wikimedia Commons categories: " + Object.values(PHENOMENA).flat().join(", "),
    countries: "Natural Earth 1:50m admin-0 countries v5.1.2",
    weather: "Open-Meteo historical weather API (ERA5 / ERA5-Land reanalysis, Copernicus Climate Change Service)",
  },
  excluded,
  rows,
}));
console.log(`Saved catalog.json with ${rows.length} rows`);

// 5. World land outline for the map (world-atlas 110m), as rings of [lon, lat]
const topo = await getJSON("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json");
const { scale, translate } = topo.transform;
const arcs = topo.arcs.map((arc) => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * scale[0] + translate[0], y * scale[1] + translate[1]]; });
});
const ringFrom = (ids) => ids.flatMap((i, n) => {
  const pts = i < 0 ? [...arcs[~i]].reverse() : arcs[i];
  return n ? pts.slice(1) : pts;
});
const geoms = topo.objects.land.geometries;
const rings = geoms.flatMap((g) => (g.type === "MultiPolygon" ? g.arcs : [g.arcs]).map((poly) => ringFrom(poly[0])))
  .map((ring) => ring.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]));
await writeFile(new URL("world-land.json", DIR), JSON.stringify({ source: "Natural Earth 1:110m land via world-atlas@2.0.2", rings }));
console.log(`Saved world-land.json (${rings.length} rings)`);
