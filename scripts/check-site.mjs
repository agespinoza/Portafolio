// Site checks that need no build: run with `node scripts/check-site.mjs`.
//   1. Every language has the message keys and {placeholders} of Spanish (the reference).
//   2. Every résumé language has the same keys, list lengths and {placeholders} as English.
//   3. Local links, images, scripts and stylesheets in the main pages point at files that exist.
//   4. The JSON-LD block on the front page is valid JSON.
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { LANGUAGES, MESSAGES } from "../assets/i18n.js";
import { TEXT } from "../assets/resume-data.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];
const fail = (message) => problems.push(message);

function flatten(value, path = "", out = {}) {
  if (Array.isArray(value)) {
    out[`${path}#length`] = value.length;
    value.forEach((item, index) => flatten(item, `${path}[${index}]`, out));
  } else if (value && typeof value === "object") {
    for (const key of Object.keys(value)) flatten(value[key], path ? `${path}.${key}` : key, out);
  } else {
    out[path] = value;
  }
  return out;
}

const placeholders = (text) => (typeof text === "string" ? [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",") : "");

// `tolerated` returns true for extra keys that are allowed (see the i18n loop below).
function compare(label, reference, candidate, referenceName, tolerated = () => false) {
  const expected = flatten(reference);
  const actual = flatten(candidate);
  for (const key of Object.keys(expected)) {
    if (!(key in actual)) fail(`${label}: missing "${key}" (present in ${referenceName})`);
    else if (key.endsWith("#length") && actual[key] !== expected[key]) fail(`${label}: "${key.replace("#length", "")}" has ${actual[key]} items, ${referenceName} has ${expected[key]}`);
    else if (placeholders(actual[key]) !== placeholders(expected[key])) fail(`${label}: "${key}" has placeholders {${placeholders(actual[key])}}, ${referenceName} has {${placeholders(expected[key])}}`);
  }
  for (const key of Object.keys(actual)) if (!(key in expected) && !tolerated(key)) fail(`${label}: extra "${key}" not in ${referenceName}`);
}

// Portuguese and Chinese also carry the Data Lab research texts that the other languages keep in the lab's
// own components, so extra keys are accepted there as long as both of them have the same ones.
const labOnly = { pt: "zh", zh: "pt" };
for (const language of LANGUAGES.filter((code) => code !== "en" && code !== "es")) {
  if (!MESSAGES[language]) { fail(`i18n: no messages for "${language}"`); continue; }
  const twin = labOnly[language] && flatten(MESSAGES[labOnly[language]]);
  compare(`i18n ${language}`, MESSAGES.es, MESSAGES[language], "es", (key) => Boolean(twin && key in twin));
}
for (const language of LANGUAGES.filter((code) => code !== "en")) {
  if (!TEXT[language]) fail(`résumé: no text for "${language}"`);
  else compare(`résumé ${language}`, TEXT.en, TEXT[language], "en");
}

const pages = ["index.html", "resume.html", "404.html", "lab/index.html"];
const SKIP = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
for (const page of pages) {
  const file = resolve(root, page);
  const html = readFileSync(file, "utf8");
  for (const [, , target] of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    if (SKIP.test(target)) continue;
    const resolved = resolve(dirname(file), target.split("#")[0].split("?")[0]);
    const exists = existsSync(resolved) && (!statSync(resolved).isDirectory() || existsSync(resolve(resolved, "index.html")));
    if (!exists) fail(`${page}: "${target}" does not exist`);
  }
}

const front = readFileSync(resolve(root, "index.html"), "utf8");
const ld = front.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!ld) fail("index.html: JSON-LD block is missing");
else {
  try { JSON.parse(ld[1]); } catch (error) { fail(`index.html: JSON-LD is not valid JSON (${error.message})`); }
}

if (problems.length) {
  console.error(`${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("Site checks passed: translations, résumé, local links and JSON-LD.");
