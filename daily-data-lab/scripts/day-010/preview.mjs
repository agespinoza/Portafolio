// Day 010 · writes the portfolio preview images (night and light, 792 × 346) from the bundled JSON.
// Run from daily-data-lab/:  node scripts/day-010/preview.mjs
import { readFileSync, writeFileSync } from "node:fs";

const S = JSON.parse(readFileSync("data/day-010-dark-skies/day-010.json", "utf8"));
const fmt = (n, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const THEMES = {
  night: { bg0: "#0f2142", bg1: "#050a16", ink: "#e9eef5", ink2: "rgba(233,238,245,.7)", ink3: "rgba(233,238,245,.5)", grid: "rgba(233,238,245,.12)", copper: "#f2a65a", teal: "#7fd3e3", mw: "#ecc44c", star: "#ffffff" },
  light: { bg0: "#ffffff", bg1: "#f3efe7", ink: "#0b1424", ink2: "#3d4a5f", ink3: "#6f7a8c", grid: "rgba(11,20,36,.1)", copper: "#a8642a", teal: "#0d6b7f", mw: "#c99a1f", star: "#0b1424" },
};
const NAMES = { ARE: "UAE", TTO: "Trinidad & Tobago", KOR: "South Korea", SAU: "Saudi Arabia", USA: "United States" };

// Left: certified places in Wikidata, cumulative by year.
const years = S.places.filter((p) => p.yearCertified).map((p) => p.yearCertified);
const Y0 = 2001, Y1 = 2025;
const cum = Array.from({ length: Y1 - Y0 + 1 }, (_, i) => years.filter((y) => y <= Y0 + i).length);
// Right: countries of ≥ 1 million people with the largest share unable to see the Milky Way, plus Mexico and the US.
const big = S.countries.filter((c) => (c.pop2015 ?? 0) >= 1e6).sort((a, b) => b.pop[4] - a.pop[4]);
const top = big.slice(0, 8);
for (const k of ["USA", "MEX"]) if (!top.some((c) => c.iso3 === k)) top.push(big.find((c) => c.iso3 === k));
top.sort((a, b) => b.pop[4] - a.pop[4]);

function svg(theme) {
  const T = THEMES[theme];
  const X0 = 44, X1 = 380, YB = 300, YT = 120, max = Math.ceil(Math.max(...cum) / 50) * 50;
  const sx = (y) => X0 + ((y - Y0) / (Y1 - Y0)) * (X1 - X0);
  const sy = (v) => YB - (v / max) * (YB - YT);
  let grid = "";
  for (let v = 0; v <= max; v += 50) grid += `<line x1="${X0}" x2="${X1}" y1="${sy(v)}" y2="${sy(v)}" stroke="${T.grid}"/><text x="${X0 - 6}" y="${sy(v) + 3}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${T.ink3}">${v}</text>`;
  for (const y of [2001, 2007, 2013, 2019, 2025]) grid += `<text x="${sx(y)}" y="${YB + 14}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${T.ink3}">${y}</text>`;
  const line = cum.map((v, i) => `${sx(Y0 + i).toFixed(1)},${sy(v).toFixed(1)}`).join(" ");
  const area = `${sx(Y0)},${YB} ${line} ${sx(Y1)},${YB}`;
  // A few deterministic stars behind the title.
  let stars = "", s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 40; i++) stars += `<circle cx="${(420 + rnd() * 360).toFixed(1)}" cy="${(10 + rnd() * 80).toFixed(1)}" r="${(0.4 + rnd() * 1.1).toFixed(2)}" fill="${T.star}" opacity="${(0.15 + rnd() * 0.5).toFixed(2)}"/>`;
  const BX = 560, BW = 180, BY = 122, RH = 19;
  let rows = `<text x="${BX}" y="${BY - 16}" font-family="JetBrains Mono, monospace" font-size="9" fill="${T.ink3}">people who cannot see the Milky Way</text>`;
  top.forEach((c, i) => {
    const y = BY + i * RH, on = c.iso3 === "MEX" || c.iso3 === "USA";
    rows += `<text x="${BX - 8}" y="${y + 4}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9.5" fill="${on ? T.copper : T.ink3}">${esc(NAMES[c.iso3] ?? c.name)}</text>`;
    rows += `<rect x="${BX}" y="${y - 6}" width="${BW}" height="11" rx="2" fill="${T.grid}"/>`;
    rows += `<rect x="${BX}" y="${y - 6}" width="${((c.pop[4] / 100) * BW).toFixed(1)}" height="11" rx="2" fill="${on ? T.copper : T.mw}"/>`;
    rows += `<text x="${BX + BW + 6}" y="${y + 4}" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${T.ink2}">${fmt(c.pop[4], 1)}%</text>`;
  });
  const title = `${fmt(S.world.pop[4], 1)}% of people cannot see the Milky Way from home; certified dark-sky places in Wikidata rose from 1 in 2001 to ${cum.at(-1)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 792 346" role="img" aria-label="${title}">
<defs><radialGradient id="bg" cx="30%" cy="0%" r="95%"><stop offset="0" stop-color="${T.bg0}"/><stop offset="1" stop-color="${T.bg1}"/></radialGradient></defs>
<rect width="792" height="346" fill="url(#bg)"/>
${stars}
<text x="28" y="40" font-family="JetBrains Mono, monospace" font-size="10.5" letter-spacing="1.2" fill="${T.copper}">DAY 010 · FALCHI 2016 · GLOBE AT NIGHT · WIKIDATA</text>
<text x="28" y="68" font-family="Instrument Serif, Georgia, serif" font-size="24" fill="${T.ink}">${fmt(S.world.pop[2], 1)}% live under light-polluted skies; ${fmt(S.world.pop[4], 1)}% cannot see the Milky Way</text>
<text x="28" y="88" font-family="Inter, sans-serif" font-size="11" fill="${T.ink2}">${S.countries.length} countries and territories · ${fmt(S.gan.funnel.kept)} citizen-science star counts · ${S.places.length} certified places in Wikidata</text>
${grid}
<text x="${X0}" y="${YT - 8}" font-family="JetBrains Mono, monospace" font-size="9" fill="${T.ink3}">certified dark-sky places (cumulative)</text>
<polygon points="${area}" fill="${T.teal}" opacity=".15"/>
<polyline points="${line}" fill="none" stroke="${T.teal}" stroke-width="2.6"/>
<text x="${sx(Y1) - 2}" y="${sy(cum.at(-1)) - 8}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9.5" fill="${T.teal}">${cum.at(-1)}</text>
${rows}
</svg>
`;
}

for (const [theme, file] of [["night", "../assets/img/lab-day-010.svg"], ["light", "../assets/img/lab-day-010-light.svg"]]) {
  writeFileSync(file, svg(theme));
  console.log(`✓ ${file}`);
}
