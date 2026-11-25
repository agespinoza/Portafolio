// Day 008 · writes the portfolio preview images (night and light, 792 × 346) from the bundled JSON.
// Run from daily-data-lab/:  node scripts/day-008/preview.mjs
import { readFileSync, writeFileSync } from "node:fs";

const S = JSON.parse(readFileSync("data/day-008-seed-banks/day-008.json", "utf8"));
const fmt = (n, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const THEMES = {
  night: { bg0: "#0f2142", bg1: "#050a16", ink: "#e9eef5", ink2: "rgba(233,238,245,.7)", ink3: "rgba(233,238,245,.5)", grid: "rgba(233,238,245,.12)", copper: "#e3a35f", teal: "#5cc2d6", sand: "#c9a26a", area: "rgba(92,194,214,.18)" },
  light: { bg0: "#ffffff", bg1: "#f3efe7", ink: "#0b1424", ink2: "#3d4a5f", ink3: "#6f7a8c", grid: "rgba(11,20,36,.1)", copper: "#a8642a", teal: "#0d6b7f", sand: "#d9b37a", area: "rgba(13,107,127,.14)" },
};

const cum = S.svalbardCumulativeByYear;
const crops = S.genera.slice(0, 9);
const total = S.kpis.svalbardSamples;

function svg(theme) {
  const T = THEMES[theme];
  // Left: samples held at year end, 2008–2026.
  const X0 = 40, X1 = 400, Y0 = 300, Y1 = 110, max = 1.5e6;
  const sx = (y) => X0 + ((y - 2008) / (2026 - 2008)) * (X1 - X0);
  const sy = (v) => Y0 - (v / max) * (Y0 - Y1);
  const pts = cum.map((r) => `${sx(r.year).toFixed(1)},${sy(r.holdings).toFixed(1)}`);
  const area = `M${sx(2008)},${Y0} L${pts.join(" L")} L${sx(2026)},${Y0} Z`;
  let grid = "";
  for (const v of [0.5e6, 1e6, 1.5e6]) grid += `<line x1="${X0}" x2="${X1}" y1="${sy(v)}" y2="${sy(v)}" stroke="${T.grid}"/><text x="${X0 - 6}" y="${sy(v) + 3}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${T.ink3}">${v / 1e6}M</text>`;
  for (const y of [2008, 2014, 2020, 2026]) grid += `<text x="${sx(y)}" y="${Y0 + 14}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${T.ink3}">${y}</text>`;
  const icarda = cum.filter((r) => [2015, 2017, 2019].includes(r.year));
  const marks = icarda.map((r) => `<circle cx="${sx(r.year).toFixed(1)}" cy="${sy(r.holdings).toFixed(1)}" r="3" fill="${T.copper}"/>`).join("");
  const last = cum.at(-1);
  // Right: top genera by samples.
  const BX = 548, BW = 200, BY = 100, RH = 14, GAP = 6.5;
  let bars = "";
  crops.forEach((g, i) => {
    const y = BY + i * (RH + GAP), w = (g.samples / crops[0].samples) * BW;
    const name = g.common === g.genus ? g.genus : g.common;
    bars += `<text x="${BX - 8}" y="${y + RH - 3}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9.5" fill="${T.ink3}">${esc(name)}</text>`;
    bars += `<rect x="${BX}" y="${y}" width="${w.toFixed(1)}" height="${RH}" rx="2" fill="${i < 2 ? T.teal : T.sand}"/>`;
    bars += `<text x="${(BX + w + 5).toFixed(1)}" y="${y + RH - 3}" font-family="JetBrains Mono, monospace" font-size="9" fill="${T.ink2}">${Math.round((100 * g.samples) / total)}%</text>`;
  });
  const title = `${fmt(total)} seed samples held in the Svalbard Global Seed Vault, 2008 to 2026, and the crops that hold most of them`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 792 346" role="img" aria-label="${title}">
<defs><radialGradient id="bg" cx="30%" cy="0%" r="95%"><stop offset="0" stop-color="${T.bg0}"/><stop offset="1" stop-color="${T.bg1}"/></radialGradient></defs>
<rect width="792" height="346" fill="url(#bg)"/>
<text x="28" y="40" font-family="JetBrains Mono, monospace" font-size="10.5" letter-spacing="1.2" fill="${T.copper}">DAY 008 · SVALBARD GLOBAL SEED VAULT · FAO WIEWS</text>
<text x="28" y="68" font-family="Instrument Serif, Georgia, serif" font-size="24" fill="${T.ink}">${fmt(total / 1e6, 2)} million seed samples in the vault</text>
<text x="28" y="88" font-family="Inter, sans-serif" font-size="11" fill="${T.ink2}">${S.kpis.depositors} genebanks · ${fmt(S.kpis.species)} species · vs ${fmt(S.kpis.globalExSituAccessions / 1e6, 1)} million accessions in the world's genebanks</text>
${grid}
<path d="${area}" fill="${T.area}"/>
<polyline points="${pts.join(" ")}" fill="none" stroke="${T.teal}" stroke-width="2.4"/>
${marks}
<text x="${sx(2016)}" y="${sy(icarda[0].holdings) + 26}" font-family="Inter, sans-serif" font-size="9.5" fill="${T.copper}">ICARDA withdrawals 2015–19</text>
<text x="${sx(2026) - 4}" y="${sy(last.holdings) - 8}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9.5" fill="${T.ink}">${fmt(last.holdings)}</text>
<text x="${BX - 8}" y="${BY - 10}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9" fill="${T.ink3}">share of samples</text>
${bars}
</svg>
`;
}

for (const [theme, file] of [["night", "../assets/img/lab-day-008.svg"], ["light", "../assets/img/lab-day-008-light.svg"]]) {
  writeFileSync(file, svg(theme));
  console.log(`✓ ${file}`);
}
