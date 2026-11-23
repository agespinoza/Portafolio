// Writes sitemap.xml from the pages that exist and from assets/daily-data-lab-days.js.
//   node scripts/generate-sitemap.mjs          rewrite sitemap.xml
//   node scripts/generate-sitemap.mjs --check  fail if sitemap.xml is out of date
import { readFileSync, writeFileSync } from "node:fs";
import { DAILY_DATA_LAB_DAYS } from "../assets/daily-data-lab-days.js";

const BASE = "https://agespinoza.github.io/Portafolio/";
const LANGUAGES = [["en", ""], ["es", "es"], ["ja", "ja"], ["it", "it"], ["fr", "fr"], ["pt-BR", "pt"], ["zh-Hans", "zh"]];
const OUTPUT = new URL("../sitemap.xml", import.meta.url);

const withLanguages = (page) => {
  const href = (code) => `${BASE}${page}${code ? `?lang=${code}` : ""}`;
  return [
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${href("")}"/>`,
    ...LANGUAGES.map(([hreflang, code]) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href(code)}"/>`),
  ].join("\n");
};

const pages = [
  { path: "", languages: true },
  { path: "resume.html", languages: true },
  { path: "lab/" },
  ...[...DAILY_DATA_LAB_DAYS].sort((a, b) => b.day - a.day).map((day) => ({ path: `lab/studies/${day.slug}.html` })),
  { path: "projects/02-trajectory-visualization/index.html" },
  { path: "projects/09-employee-erp-integration/index.html" },
  { path: "projects/17-copper-mine-operations/index.html" },
  { path: "projects/18-bovine-tb-drift-monitor/index.html" },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map((page) => `  <url>
    <loc>${BASE}${page.path}</loc>${page.languages ? `\n${withLanguages(page.path)}` : ""}
  </url>`).join("\n")}
</urlset>
`;

if (process.argv.includes("--check")) {
  let current = "";
  try { current = readFileSync(OUTPUT, "utf8"); } catch { /* a missing file counts as stale */ }
  if (current !== xml) {
    console.error("sitemap.xml is out of date. Run: node scripts/generate-sitemap.mjs");
    process.exit(1);
  }
  console.log("sitemap.xml is up to date.");
} else {
  writeFileSync(OUTPUT, xml);
  console.log(`Wrote sitemap.xml with ${pages.length} URLs.`);
}
