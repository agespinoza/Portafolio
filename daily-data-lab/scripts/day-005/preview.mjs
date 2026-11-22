// Day 005 · writes the portfolio preview images (night and light, 792 × 346) from the bundled snapshot.
// Run from daily-data-lab/:  node scripts/day-005/preview.mjs
import { readFileSync, writeFileSync } from "node:fs";

const S = JSON.parse(readFileSync("src/days/day-005-endangered-languages/snapshot.json", "utf8"));
const langs = S.languages.map((r) => ({ lat: r[4], lon: r[5], aes: r[8], med: r[9] }));

// Equal Earth projection, same constants as the day's map.
const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, M = Math.sqrt(3) / 2;
const project = (lon, lat, R) => {
  const l = (lon * Math.PI) / 180, p = (lat * Math.PI) / 180;
  const t = Math.asin(M * Math.sin(p)), t2 = t * t, t6 = t2 * t2 * t2;
  return [(l * Math.cos(t)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2))) * R, -t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2)) * R];
};

const THEMES = {
  night: { bg0: "#0f2142", bg1: "#050a16", ink: "#e9eef5", ink2: "rgba(233,238,245,.7)", ink3: "rgba(233,238,245,.5)", copper: "#e3a35f",
    aes: ["#8390a5", "#6e4a2b", "#9c6232", "#cf8540", "#eda463", "#ffcf9a", "#8390a5"], heat: ["#142033", "#173543", "#1d5360", "#25717f", "#3f9fb0", "#7fd3e3"], dark: "#0a1220" },
  light: { bg0: "#ffffff", bg1: "#f3efe7", ink: "#0b1424", ink2: "#3d4a5f", ink3: "#6f7a8c", copper: "#a8642a",
    aes: ["#6f7a8c", "#f0cf9c", "#e3a35f", "#cc7339", "#a84a28", "#7a2418", "#5b6475"], heat: ["#f3efe7", "#dcefef", "#a9d6da", "#6bb7c1", "#2b8d9c", "#0d5e6d"], dark: "#ffffff" },
};

// AES × MED matrix (the one language without MED counts as "wordlist or less", as on the page).
const matrix = [1, 2, 3, 4, 5, 6].map(() => [0, 0, 0, 0, 0]);
for (const l of langs) if (l.aes > 0) matrix[l.aes - 1][l.med < 0 ? 4 : l.med]++;
const max = Math.max(...matrix.flat());
const priority = langs.filter((l) => l.aes >= 3 && l.aes <= 5 && (l.med >= 3 || l.med < 0)).length;
const fmt = (n) => n.toLocaleString("en-US");

function svg(theme) {
  const T = THEMES[theme];
  // Map: left 470 px. Dots drawn as zero-length round-cap segments grouped by status, safe first.
  const R = 74, cx = 240, cy = 182;
  const groups = new Map();
  for (const l of [...langs].filter((l) => l.lat != null).sort((a, b) => a.aes - b.aes)) {
    const [x, y] = project(l.lon, l.lat, R);
    const k = l.aes;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(`M${(cx + x).toFixed(1)} ${(cy + y).toFixed(1)}h0`);
  }
  const dots = [...groups.entries()].map(([k, d]) =>
    `<path d="${d.join("")}" stroke="${T.aes[k]}" stroke-width="${k >= 3 && k <= 5 ? 2.6 : 2}" stroke-linecap="round" fill="none"${k === 1 ? ' opacity=".8"' : ""}/>`).join("\n");
  // Heatmap: right side.
  const HX = 552, HY = 104, CW = 42, CH = 30;
  const step = (v) => (v === 0 ? 0 : 1 + Math.min(4, Math.floor(Math.sqrt(v / max) * 5)));
  const rows = ["Not endangered", "Threatened", "Shifting", "Moribund", "Nearly extinct", "Extinct"];
  const cols = ["Long", "Gram.", "Sketch", "Texts", "Words"];
  let heat = cols.map((c, j) => `<text x="${HX + j * CW + CW / 2}" y="${HY - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="${T.ink3}">${c}</text>`).join("");
  matrix.forEach((row, i) => {
    heat += `<text x="${HX - 8}" y="${HY + i * CH + CH / 2 + 3.5}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9" fill="${T.ink3}">${rows[i]}</text>`;
    row.forEach((v, j) => {
      const s = step(v);
      heat += `<rect x="${HX + j * CW + 1}" y="${HY + i * CH + 1}" width="${CW - 2}" height="${CH - 2}" rx="3" fill="${T.heat[s]}"/>`;
      heat += `<text x="${HX + j * CW + CW / 2}" y="${HY + i * CH + CH / 2 + 3.5}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" fill="${s >= 4 ? T.dark : T.ink}">${fmt(v)}</text>`;
    });
  });
  heat += `<rect x="${HX + 3 * CW}" y="${HY + 2 * CH}" width="${2 * CW}" height="${3 * CH}" rx="5" fill="none" stroke="${T.copper}" stroke-width="2" stroke-dasharray="5 3"/>`;
  const title = "7,685 languages, colored by endangerment, against how well each is described";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 792 346" role="img" aria-label="${title}">
<defs><radialGradient id="bg" cx="30%" cy="0%" r="95%"><stop offset="0" stop-color="${T.bg0}"/><stop offset="1" stop-color="${T.bg1}"/></radialGradient></defs>
<rect width="792" height="346" fill="url(#bg)"/>
${dots}
<text x="28" y="40" font-family="JetBrains Mono, monospace" font-size="10.5" letter-spacing="1.2" fill="${T.copper}">DAY 005 · GLOTTOLOG 5.4</text>
<text x="28" y="66" font-family="Instrument Serif, Georgia, serif" font-size="24" fill="${T.ink}">${fmt(S.languages.filter((r) => r[8] >= 2 && r[8] <= 5).length)} endangered languages</text>
<text x="${HX - 96}" y="54" font-family="Instrument Serif, Georgia, serif" font-size="20" fill="${T.ink}">${fmt(priority)} at risk, barely described</text>
<text x="${HX - 96}" y="74" font-family="Inter, sans-serif" font-size="10.5" fill="${T.ink2}">Endangerment × most extensive description</text>
${heat}
</svg>
`;
}
writeFileSync("../assets/img/lab-day-005.svg", svg("night"));
writeFileSync("../assets/img/lab-day-005-light.svg", svg("light"));
console.log(`✓ previews · ${fmt(priority)} priority languages`);
