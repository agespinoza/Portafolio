// Day 006 · writes the portfolio preview images (night and light, 792 × 346) from the bundled JSON.
// Run from daily-data-lab/:  node scripts/day-006/preview.mjs
import { readFileSync, writeFileSync } from "node:fs";

const S = JSON.parse(readFileSync("data/day-006-food-waste/day-006.json", "utf8"));
const fmt = (n, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
const DN = new Intl.DisplayNames(["en"], { type: "region" });
const names_ = (c) => DN.of(c.iso2) ?? c.name;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const THEMES = {
  night: { bg0: "#0f2142", bg1: "#050a16", ink: "#e9eef5", ink2: "rgba(233,238,245,.7)", ink3: "rgba(233,238,245,.5)", copper: "#e3a35f", s: ["#5cc2d6", "#2f8596", "#c9a26a"], faded: ".4", hole: "#0a1426" },
  light: { bg0: "#ffffff", bg1: "#f3efe7", ink: "#0b1424", ink2: "#3d4a5f", ink3: "#6f7a8c", copper: "#a8642a", s: ["#0d6b7f", "#5fa8b5", "#d9b37a"], faded: ".35", hole: "#faf8f4" },
};

// Top 12 by household kg per person, plus Mexico and the USA if they are outside.
const sorted = [...S.countries].sort((a, b) => b.householdKgCap - a.householdKgCap);
const rank = new Map(sorted.map((c, i) => [c.iso3, i + 1]));
const top = sorted.slice(0, 9);
const extra = sorted.slice(9).filter((c) => c.iso3 === "MEX" || c.iso3 === "USA");
const rows = [...top, ...extra];
const max = sorted[0].householdKgCap;
const sectors = S.bySector;
const total = sectors.reduce((a, s) => a + s.t, 0);

function svg(theme) {
  const T = THEMES[theme];
  const X = 152, W = 290, Y0 = 90, RH = 15, GAP = 4.5;
  let bars = "";
  rows.forEach((c, i) => {
    const y = Y0 + i * (RH + GAP) + (i >= top.length ? 8 : 0);
    const hl = c.iso3 === "MEX" || c.iso3 === "USA";
    const est = c.confidence === "Low" || c.confidence === "Very low";
    const w = (c.householdKgCap / max) * W;
    bars += `<text x="${X - 8}" y="${y + RH - 4}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9.5" fill="${hl ? T.copper : T.ink3}"${hl ? ' font-weight="700"' : ""}>${rank.get(c.iso3)}. ${esc(names_(c))}</text>`;
    bars += `<rect x="${X}" y="${y}" width="${w.toFixed(1)}" height="${RH}" rx="2" fill="${hl ? T.copper : T.s[0]}"${est ? ` opacity="${T.faded}"` : ""}/>`;
    bars += `<text x="${(X + w + 6).toFixed(1)}" y="${y + RH - 4}" font-family="JetBrains Mono, monospace" font-size="9.5" fill="${hl ? T.copper : T.ink2}">${c.householdKgCap} kg</text>`;
  });
  // Donut of sectors.
  const C = [628, 205], R = 78, r = 50;
  let a0 = -Math.PI / 2, donut = "";
  sectors.forEach((s, i) => {
    const a1 = a0 + (s.t / total) * Math.PI * 2;
    const p = (rad, a) => `${(C[0] + rad * Math.cos(a)).toFixed(2)},${(C[1] + rad * Math.sin(a)).toFixed(2)}`;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    donut += `<path d="M${p(R, a0)}A${R},${R} 0 ${large} 1 ${p(R, a1 - 0.015)}L${p(r, a1 - 0.015)}A${r},${r} 0 ${large} 0 ${p(r, a0)}Z" fill="${T.s[i]}"/>`;
    a0 = a1;
  });
  const names = ["Households", "Food service", "Retail"];
  const legend = sectors.map((s, i) => `<rect x="${C[0] - 150 + i * 108}" y="306" width="9" height="9" rx="2" fill="${T.s[i]}"/><text x="${C[0] - 137 + i * 108}" y="314.5" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${T.ink3}">${names[i]} ${Math.round((s.t / total) * 100)}%</text>`).join("");
  const title = `${fmt(S.kpis.totalMt)} million tonnes of food wasted in 2022; household waste per person in the top countries, with Mexico and the United States highlighted`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 792 346" role="img" aria-label="${title}">
<defs><radialGradient id="bg" cx="30%" cy="0%" r="95%"><stop offset="0" stop-color="${T.bg0}"/><stop offset="1" stop-color="${T.bg1}"/></radialGradient></defs>
<rect width="792" height="346" fill="url(#bg)"/>
<text x="28" y="40" font-family="JetBrains Mono, monospace" font-size="10.5" letter-spacing="1.2" fill="${T.copper}">DAY 006 · UNEP FOOD WASTE INDEX 2024</text>
<text x="28" y="66" font-family="Instrument Serif, Georgia, serif" font-size="24" fill="${T.ink}">Wasted at home, kg per person a year</text>
${bars}
<text x="${C[0]}" y="54" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-size="20" fill="${T.ink}">${fmt(S.kpis.totalMt)} Mt wasted in 2022</text>
<text x="${C[0]}" y="74" text-anchor="middle" font-family="Inter, sans-serif" font-size="10.5" fill="${T.ink2}">${Math.round(S.kpis.pctWasted * 100)}% of food available to consumers</text>
${donut}
<text x="${C[0]}" y="${C[1] + 4}" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-size="22" fill="${T.ink}">${fmt(S.kpis.householdKgCap)} kg</text>
<text x="${C[0]}" y="${C[1] + 19}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${T.ink3}">AT HOME / PERSON</text>
${legend}
</svg>
`;
}
writeFileSync("../assets/img/lab-day-006.svg", svg("night"));
writeFileSync("../assets/img/lab-day-006-light.svg", svg("light"));
console.log(`✓ previews · top ${top.length} + ${extra.map((c) => c.iso3).join(", ") || "none"}`);
