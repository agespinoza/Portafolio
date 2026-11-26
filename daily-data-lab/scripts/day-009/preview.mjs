// Day 009 · writes the portfolio preview images (night and light, 792 × 346) from the bundled JSON.
// Run from daily-data-lab/:  node scripts/day-009/preview.mjs
import { readFileSync, writeFileSync } from "node:fs";

const S = JSON.parse(readFileSync("data/day-009-longevity/day-009.json", "utf8"));
const fmt = (n, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const THEMES = {
  night: { bg0: "#0f2142", bg1: "#050a16", ink: "#e9eef5", ink2: "rgba(233,238,245,.7)", ink3: "rgba(233,238,245,.5)", grid: "rgba(233,238,245,.12)", copper: "#e3a35f", teal: "#5cc2d6", ci: "rgba(233,238,245,.45)" },
  light: { bg0: "#ffffff", bg1: "#f3efe7", ink: "#0b1424", ink2: "#3d4a5f", ink3: "#6f7a8c", grid: "rgba(11,20,36,.1)", copper: "#a8642a", teal: "#0d6b7f", ci: "rgba(11,20,36,.35)" },
};
const NAMES = { SGP: "Singapore", JPN: "Japan", KOR: "South Korea", LUX: "Luxembourg", ITA: "Italy", ESP: "Spain", CHE: "Switzerland", ISR: "Israel", MLT: "Malta", SWE: "Sweden" };

const T0 = S.e0Trend, rec = S.recordFemaleE0, K = S.kpis;
const top = S.countries.filter((c) => c.hale != null).sort((a, b) => b.hale - a.hale).slice(0, 10);

function svg(theme) {
  const T = THEMES[theme];
  // Left: world life expectancy and the record female life expectancy, 1950–2023.
  const X0 = 44, X1 = 400, Y0 = 300, Y1 = 110, lo = 40, hi = 90;
  const sx = (y) => X0 + ((y - 1950) / (2023 - 1950)) * (X1 - X0);
  const sy = (v) => Y0 - ((v - lo) / (hi - lo)) * (Y0 - Y1);
  const world = T0.years.map((y, i) => `${sx(y).toFixed(1)},${sy(T0.world[i]).toFixed(1)}`).join(" ");
  const record = rec.map((r) => `${sx(r.year).toFixed(1)},${sy(r.e0Female).toFixed(1)}`).join(" ");
  let grid = "";
  for (const v of [50, 60, 70, 80, 90]) grid += `<line x1="${X0}" x2="${X1}" y1="${sy(v)}" y2="${sy(v)}" stroke="${T.grid}"/><text x="${X0 - 6}" y="${sy(v) + 3}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${T.ink3}">${v}</text>`;
  for (const y of [1950, 1970, 1990, 2010, 2023]) grid += `<text x="${sx(y)}" y="${Y0 + 14}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${T.ink3}">${y}</text>`;
  const wl = T0.world.at(-1), rl = rec.at(-1);
  // Right: top ten HALE with 95% uncertainty intervals.
  const BX = 560, BW = 190, BY = 112, RH = 18.5, hlo = 66, hhi = 78;
  const bx = (v) => BX + ((v - hlo) / (hhi - hlo)) * BW;
  let rows = `<text x="${BX}" y="${BY - 14}" font-family="JetBrains Mono, monospace" font-size="9" fill="${T.ink3}">healthy life expectancy, 95% UI</text>`;
  top.forEach((c, i) => {
    const y = BY + i * RH;
    const on = c.iso3 === "JPN" || c.iso3 === "ITA";
    rows += `<text x="${BX - 8}" y="${y + 3}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9.5" fill="${on ? T.copper : T.ink3}">${esc(NAMES[c.iso3] ?? c.name)}</text>`;
    rows += `<line x1="${bx(c.haleLo).toFixed(1)}" x2="${bx(c.haleHi).toFixed(1)}" y1="${y}" y2="${y}" stroke="${on ? T.copper : T.ci}" stroke-width="2" stroke-linecap="round"/>`;
    rows += `<circle cx="${bx(c.hale).toFixed(1)}" cy="${y}" r="3.6" fill="${on ? T.copper : T.teal}"/>`;
    rows += `<text x="${(bx(c.haleHi) + 5).toFixed(1)}" y="${y + 3}" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${T.ink2}">${fmt(c.hale, 1)}</text>`;
  });
  const title = `World life expectancy from ${fmt(K.worldE0_1950, 1)} years in 1950 to ${fmt(K.worldE0, 1)} in 2023, and the ten countries with the highest healthy life expectancy`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 792 346" role="img" aria-label="${title}">
<defs><radialGradient id="bg" cx="30%" cy="0%" r="95%"><stop offset="0" stop-color="${T.bg0}"/><stop offset="1" stop-color="${T.bg1}"/></radialGradient></defs>
<rect width="792" height="346" fill="url(#bg)"/>
<text x="28" y="40" font-family="JetBrains Mono, monospace" font-size="10.5" letter-spacing="1.2" fill="${T.copper}">DAY 009 · UN WPP 2024 · WHO GHO · WORLD BANK</text>
<text x="28" y="68" font-family="Instrument Serif, Georgia, serif" font-size="24" fill="${T.ink}">${fmt(K.worldWhoE0, 1)} years of life (WHO), ${fmt(K.worldHale, 1)} of them in full health</text>
<text x="28" y="88" font-family="Inter, sans-serif" font-size="11" fill="${T.ink2}">${K.countries} countries and areas · ${fmt(K.centenarians)} people aged 100+ · the top ten healthy-life countries overlap</text>
${grid}
<polyline points="${record}" fill="none" stroke="${T.copper}" stroke-width="2" stroke-dasharray="5 3"/>
<polyline points="${world}" fill="none" stroke="${T.teal}" stroke-width="2.6"/>
<text x="${sx(1953)}" y="${sy(rec[3].e0Female) - 8}" font-family="Inter, sans-serif" font-size="9.5" fill="${T.copper}">record (women)</text>
<text x="${sx(2023) - 4}" y="${sy(rl.e0Female) - 7}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9.5" fill="${T.copper}">${fmt(rl.e0Female, 1)}</text>
<text x="${sx(2023) - 4}" y="${sy(wl) + 16}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9.5" fill="${T.ink}">world ${fmt(wl, 1)}</text>
${rows}
</svg>
`;
}

for (const [theme, file] of [["night", "../assets/img/lab-day-009.svg"], ["light", "../assets/img/lab-day-009-light.svg"]]) {
  writeFileSync(file, svg(theme));
  console.log(`✓ ${file}`);
}
