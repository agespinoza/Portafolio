// Day 011 · writes the portfolio preview images (night and light, 792 × 346) from the bundled JSON.
// Left: world black-pepper production since 1961 and today's four largest growers. Right: HHI of production, 8 spices.
// Run from daily-data-lab/:  node scripts/day-011/preview.mjs
import { readFileSync, writeFileSync } from "node:fs";

const S = JSON.parse(readFileSync("data/day-011-spices/day-011.json", "utf8"));
const fmt = (n, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const L = S.latest - S.first;
const NAMES = { VNM: "Viet Nam", IND: "India", BRA: "Brazil", BFA: "Burkina Faso (imputed)", IDN: "Indonesia" };
const SHORT = Object.fromEntries(S.spices.map((s) => [s.id, s.short]));

const THEMES = {
  night: { bg0: "#2a1a10", bg1: "#0a0f1a", ink: "#f3ede4", ink2: "rgba(243,237,228,.72)", ink3: "rgba(243,237,228,.5)", grid: "rgba(243,237,228,.12)", copper: "#e3a35f", line: ["#f3ede4", "#7fd3e3", "#f08a4b", "#c5d86d", "#bfa0e6"], bar: "#d9b27a" },
  light: { bg0: "#ffffff", bg1: "#f3efe7", ink: "#0b1424", ink2: "#3d4a5f", ink3: "#6f7a8c", grid: "rgba(11,20,36,.1)", copper: "#95551e", line: ["#0b1424", "#0d6b7f", "#a84a28", "#6b7f2a", "#7b4fa0"], bar: "#8a6a3d" },
};

const world = S.world.pepper.prod.map((v, i) => [S.first + i, v / 1000]);
const top = Object.entries(S.prod.pepper).map(([k, v]) => [k, v[L] ?? 0]).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k);
const series = [{ key: "World", pts: world }, ...top.map((k) => ({ key: NAMES[k] ?? k, pts: S.prod.pepper[k].map((v, i) => [S.first + i, v]).filter((p) => p[1] != null).map(([y, v]) => [y, v / 1000]) }))];
const hhi = S.spices.map((s) => [s.id, S.summary[s.id].hhi]).sort((a, b) => b[1] - a[1]);

function svg(theme) {
  const T = THEMES[theme];
  const X0 = 46, X1 = 352, YB = 300, YT = 122, max = Math.ceil(Math.max(...world.map((p) => p[1])) / 200) * 200;
  const sx = (y) => X0 + ((y - S.first) / (S.latest - S.first)) * (X1 - X0);
  const sy = (v) => YB - (v / max) * (YB - YT);
  let g = "";
  for (let v = 0; v <= max; v += 200) g += `<line x1="${X0}" x2="${X1}" y1="${sy(v)}" y2="${sy(v)}" stroke="${T.grid}"/><text x="${X0 - 6}" y="${sy(v) + 3}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${T.ink3}">${v}</text>`;
  for (const y of [1961, 1980, 2000, 2024]) g += `<text x="${sx(y)}" y="${YB + 14}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${T.ink3}">${y}</text>`;
  const labels = [];
  series.forEach((s, i) => {
    g += `<polyline points="${s.pts.map(([y, v]) => `${sx(y).toFixed(1)},${sy(v).toFixed(1)}`).join(" ")}" fill="none" stroke="${T.line[i]}" stroke-width="${i ? 1.6 : 2.6}"/>`;
    labels.push({ y: sy(s.pts.at(-1)[1]) + 3, text: s.key, c: T.line[i] });
  });
  labels.sort((a, b) => a.y - b.y).forEach((l, i, a) => { if (i) l.y = Math.max(l.y, a[i - 1].y + 11); g += `<text x="${X1 + 6}" y="${l.y.toFixed(1)}" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${l.c}">${esc(l.text)}</text>`; });
  const BX = 560, BW = 170, BY = 124, RH = 21, MAXH = 10000;
  let rows = `<text x="${BX - 120}" y="${BY - 16}" font-family="JetBrains Mono, monospace" font-size="9" fill="${T.ink3}">supply concentration, HHI ${S.latest} (2,500 = high)</text>`;
  hhi.forEach(([id, h], i) => {
    const y = BY + i * RH, on = id === "pepper" || id === "vanilla";
    rows += `<text x="${BX - 8}" y="${y + 4}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9.5" fill="${on ? T.copper : T.ink3}">${esc(SHORT[id])}</text>`;
    rows += `<rect x="${BX}" y="${y - 6}" width="${BW}" height="11" rx="2" fill="${T.grid}"/>`;
    rows += `<rect x="${BX}" y="${y - 6}" width="${((h / MAXH) * BW).toFixed(1)}" height="11" rx="2" fill="${on ? T.copper : T.bar}"/>`;
    rows += `<text x="${BX + BW + 6}" y="${y + 4}" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${T.ink2}">${fmt(h)}</text>`;
  });
  const ref = BX + (2500 / MAXH) * BW;
  rows += `<line x1="${ref}" x2="${ref}" y1="${BY - 10}" y2="${BY + hhi.length * RH - 8}" stroke="${T.copper}" stroke-dasharray="3 3"/>`;
  const totalUsd = S.spices.reduce((a, s) => a + S.summary[s.id].exportUsd, 0);
  const high = S.spices.filter((s) => S.summary[s.id].hhi > 2500).length;
  const title = `Black pepper grew from ${fmt(world[0][1] * 1000)} t in ${S.first} to ${fmt(world[L][1] * 1000)} t in ${S.latest}; ${high} of 8 spice groups are highly concentrated`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 792 346" role="img" aria-label="${esc(title)}">
<defs><radialGradient id="bg" cx="25%" cy="0%" r="95%"><stop offset="0" stop-color="${T.bg0}"/><stop offset="1" stop-color="${T.bg1}"/></radialGradient></defs>
<rect width="792" height="346" fill="url(#bg)"/>
<text x="28" y="40" font-family="JetBrains Mono, monospace" font-size="10.5" letter-spacing="1.2" fill="${T.copper}">DAY 011 · FAOSTAT · SPICE TRADE ${S.first}–${S.latest}</text>
<text x="28" y="68" font-family="Instrument Serif, Georgia, serif" font-size="24" fill="${T.ink}">${high} of 8 spice groups are highly concentrated; pepper moved to Viet Nam</text>
<text x="28" y="88" font-family="Inter, sans-serif" font-size="11" fill="${T.ink2}">${S.countries.length} countries and areas · US$${fmt(totalUsd / 1e9, 1)} billion of exports in ${S.latest} · 50 largest flows per spice · 8 cited historical events</text>
<text x="${X0}" y="${YT - 8}" font-family="JetBrains Mono, monospace" font-size="9" fill="${T.ink3}">black pepper production, thousand t</text>
${g}
${rows}
</svg>
`;
}

for (const [theme, file] of [["night", "../assets/img/lab-day-011.svg"], ["light", "../assets/img/lab-day-011-light.svg"]]) {
  writeFileSync(file, svg(theme));
  console.log(`✓ ${file}`);
}
