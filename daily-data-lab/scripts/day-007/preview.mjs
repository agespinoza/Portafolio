// Day 007 · writes the portfolio preview images (night and light, 792 × 346) from the bundled JSON.
// Run from daily-data-lab/:  node scripts/day-007/preview.mjs
import { readFileSync, writeFileSync } from "node:fs";

const S = JSON.parse(readFileSync("data/day-007-space-debris/day-007.json", "utf8"));
const fmt = (n, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
const CLS = ["active", "inactive", "rocket", "debris", "unknown"];
const NAMES = { active: "Active", inactive: "Dead satellites", rocket: "Rocket bodies", debris: "Debris", unknown: "Unidentified" };

const THEMES = {
  night: { bg0: "#0f2142", bg1: "#050a16", ink: "#e9eef5", ink2: "rgba(233,238,245,.7)", ink3: "rgba(233,238,245,.5)", copper: "#e3a35f", grid: "rgba(233,238,245,.12)",
    c: { active: "#5cc2d6", inactive: "#8390a5", rocket: "#c9a26a", debris: "#eda463", unknown: "#3a465a" } },
  light: { bg0: "#ffffff", bg1: "#f3efe7", ink: "#0b1424", ink2: "#3d4a5f", ink3: "#6f7a8c", copper: "#a8642a", grid: "rgba(11,20,36,.1)",
    c: { active: "#0d6b7f", inactive: "#7d8798", rocket: "#d9b37a", debris: "#a84a28", unknown: "#c9ced6" } },
};

// LEO altitude profile 200–1,500 km in 50 km bins, stacked by kind (vertical: altitude up).
const bins = new Map();
for (const r of S.byAltitudeBin) { if (!bins.has(r.km)) bins.set(r.km, Object.fromEntries(CLS.map((c) => [c, 0]))); bins.get(r.km)[r.cls] = r.n; }
const kms = [];
for (let km = 250; km < 1350; km += 50) kms.push(km);
const tot = (km) => CLS.reduce((a, c) => a + (bins.get(km)?.[c] ?? 0), 0);
const max = Math.max(...kms.map(tot));
// The densest band (mega-constellation shells) dwarfs the rest: cap the axis at the second-largest band and label the clipped bar.
const cap = [...kms.map(tot)].sort((a, b) => b - a)[1] * 1.25;
const inOrbit = Object.fromEntries(S.byType.map((t) => [t.key, t.n]));

function svg(theme) {
  const T = THEMES[theme];
  const X = 92, W = 360, Y0 = 326, RH = 9, GAP = 1.5;
  let bars = "";
  kms.forEach((km, i) => {
    const y = Y0 - (i + 1) * (RH + GAP);
    let x = X;
    for (const c of CLS) {
      const w = Math.min(((bins.get(km)?.[c] ?? 0) / cap) * W, X + W - x);
      if (w > 0.2) bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${RH}" fill="${T.c[c]}"/>`;
      x += Math.max(0, w);
    }
    if (tot(km) > cap) bars += `<text x="${X + W + 6}" y="${(y + RH - 1).toFixed(1)}" font-family="JetBrains Mono, monospace" font-size="9" fill="${T.ink2}">${fmt(tot(km))} →</text>`;
    if (km % 250 === 0) bars += `<text x="${X - 8}" y="${(y + RH).toFixed(1)}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9" fill="${T.ink3}">${fmt(km)} km</text>`;
  });
  // Donut: share of tracked objects in orbit by kind.
  const C = [628, 196], R = 80, r = 52, total = S.kpis.tracked;
  let a0 = -Math.PI / 2, donut = "";
  for (const c of CLS) {
    const v = inOrbit[c] ?? 0, a1 = a0 + (v / total) * Math.PI * 2;
    if (v / total > 0.002) {
      const p = (rad, a) => `${(C[0] + rad * Math.cos(a)).toFixed(2)},${(C[1] + rad * Math.sin(a)).toFixed(2)}`;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      donut += `<path d="M${p(R, a0)}A${R},${R} 0 ${large} 1 ${p(R, a1 - 0.012)}L${p(r, a1 - 0.012)}A${r},${r} 0 ${large} 0 ${p(r, a0)}Z" fill="${T.c[c]}"/>`;
    }
    a0 = a1;
  }
  const legend = CLS.slice(0, 4).map((c, i) => `<rect x="${520 + (i % 2) * 118}" y="${296 + Math.floor(i / 2) * 16}" width="9" height="9" rx="2" fill="${T.c[c]}"/><text x="${533 + (i % 2) * 118}" y="${304.5 + Math.floor(i / 2) * 16}" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${T.ink3}">${NAMES[c]} ${fmt(inOrbit[c])}</text>`).join("");
  const title = `${fmt(S.kpis.tracked)} tracked objects in Earth orbit, ${Math.round(S.kpis.pctJunk * 100)}% of them junk; objects in low Earth orbit by altitude and kind`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 792 346" role="img" aria-label="${title}">
<defs><radialGradient id="bg" cx="30%" cy="0%" r="95%"><stop offset="0" stop-color="${T.bg0}"/><stop offset="1" stop-color="${T.bg1}"/></radialGradient></defs>
<rect width="792" height="346" fill="url(#bg)"/>
<text x="28" y="40" font-family="JetBrains Mono, monospace" font-size="10.5" letter-spacing="1.2" fill="${T.copper}">DAY 007 · CELESTRAK SATCAT · ${S.asOf}</text>
<text x="28" y="64" font-family="Instrument Serif, Georgia, serif" font-size="24" fill="${T.ink}">Low Earth orbit by altitude</text>
${bars}
<text x="${C[0]}" y="54" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-size="20" fill="${T.ink}">${fmt(S.kpis.tracked)} objects in orbit</text>
<text x="${C[0]}" y="74" text-anchor="middle" font-family="Inter, sans-serif" font-size="10.5" fill="${T.ink2}">${fmt(S.kpis.active)} active satellites · ≈${fmt(S.kpis.est1cmPlus / 1e6, 1)} M pieces over 1 cm (ESA)</text>
${donut}
<text x="${C[0]}" y="${C[1] + 6}" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-size="26" fill="${T.ink}">${Math.round(S.kpis.pctJunk * 100)}%</text>
<text x="${C[0]}" y="${C[1] + 21}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${T.ink3}">JUNK</text>
${legend}
</svg>
`;
}
writeFileSync("../assets/img/lab-day-007.svg", svg("night"));
writeFileSync("../assets/img/lab-day-007-light.svg", svg("light"));
console.log(`✓ previews · ${kms.length} altitude bins, max ${max}`);
