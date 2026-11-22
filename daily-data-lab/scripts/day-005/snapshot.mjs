// Day 005 · builds summary.json and the bundled snapshot.json from the parquet tables written by build.sql.
// Run from daily-data-lab/:  npm run data:languages
// It also checks the AES counts against GlottoScope (glottolog.org/langdoc/status), which counts spoken L1 and
// sign languages, and stops if they differ.
import { mkdirSync, writeFileSync } from "node:fs";
import { DuckDBInstance } from "@duckdb/node-api";

const RAW = "raw/day-005-endangered-languages";
const db = await DuckDBInstance.create(":memory:");
const con = await db.connect();
const rows = async (q) => (await con.runAndReadAll(q)).getRowObjectsJson();
const n = (v) => (v == null ? null : Number(v));
await con.run(`CREATE VIEW d AS SELECT * FROM '${RAW}/dim_language.parquet';
  CREATE VIEW s AS SELECT * FROM '${RAW}/fact_status.parquet';
  CREATE VIEW c AS SELECT * FROM '${RAW}/fact_coverage.parquet';
  CREATE VIEW f AS SELECT * FROM '${RAW}/fact_features.parquet';
  CREATE VIEW j AS SELECT * FROM d JOIN s USING (glottocode) JOIN c USING (glottocode);`);

// GlottoScope figures for Glottolog 5.4, read from glottolog.org/langdoc/status on 2026-11-22.
const GLOTTOSCOPE = { aes: [2706, 1622, 1818, 425, 304, 975], med: [2001, 985, 1972, 1048, 1896] };
const [check] = await rows(`WITH u AS (
    SELECT l.ID FROM read_csv('${RAW}/glottolog-cldf/cldf/languages.csv') l
    JOIN read_csv('${RAW}/glottolog-cldf/cldf/values.csv', all_varchar=true) v ON v.Language_ID = l.ID AND v.Parameter_ID = 'category'
    WHERE l.Level = 'language' AND v.Value IN ('Spoken_L1_Language', 'Sign_Language')),
  x AS (SELECT v.Parameter_ID p, v.Value::INT k, count(*) n FROM u
    JOIN read_csv('${RAW}/glottolog-cldf/cldf/values.csv', all_varchar=true) v ON v.Language_ID = u.ID AND v.Parameter_ID IN ('aes', 'med') GROUP BY 1, 2)
  SELECT list(n ORDER BY k) FILTER (p = 'aes') aes, list(n ORDER BY k) FILTER (p = 'med') med FROM x`);
const aesCheck = check.aes.map(Number), medCheck = check.med.map(Number);
if (aesCheck.join() !== GLOTTOSCOPE.aes.join()) throw new Error(`AES differs from GlottoScope: ${aesCheck} vs ${GLOTTOSCOPE.aes}`);
console.log(`✓ AES matches GlottoScope (${aesCheck.reduce((a, b) => a + b)} languages incl. sign languages)`);
console.log(`  MED CLDF ${medCheck} vs GlottoScope ${GLOTTOSCOPE.med} (documented as a known difference)`);

// Summary tables: endangered = AES 2–5 (threatened … nearly extinct), priority = AES 3–5 and MED 3–4 (no grammar sketch).
const agg = `count(*) languages, count(*) FILTER (aes BETWEEN 1 AND 5) living, count(*) FILTER (aes BETWEEN 2 AND 5) endangered,
  count(*) FILTER (aes = 6) extinct, count(*) FILTER (aes BETWEEN 3 AND 5 AND (med >= 3 OR med IS NULL)) priority,
  count(*) FILTER (aes IS NULL) unassessed`;
const num = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v]));
const [global] = (await rows(`SELECT ${agg} FROM j`)).map(num);
const byMacroarea = (await rows(`SELECT macroarea, ${agg} FROM j WHERE macroarea IS NOT NULL GROUP BY 1 ORDER BY 2 DESC`)).map(num);
const byCountry = (await rows(`SELECT country, ${agg} FROM (SELECT unnest(countries) country, * FROM j) WHERE country <> '' GROUP BY 1 ORDER BY endangered DESC`)).map(num);
const outDir = "data/day-005-endangered-languages";
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/summary.json`, JSON.stringify({ source: "Glottolog 5.4 CLDF, doi:10.5281/zenodo.24101243 (CC-BY 4.0)", global, byMacroarea, byCountry }, null, 1));

// Languages, compact rows for the browser.
const fams = await rows(`SELECT family_id, any_value(family) AS family, count(*) n FROM d WHERE family_id IS NOT NULL GROUP BY 1 ORDER BY n DESC`);
const famIdx = new Map(fams.map((f, i) => [f.family_id, i]));
const MACRO = ["Africa", "Australia", "Eurasia", "North America", "Papunesia", "South America"];
const langs = await rows(`SELECT * FROM j ORDER BY name`);

// Grammar at risk: Grambank feature values with ≥ 30 carriers, ranked by the share of carriers that are endangered or extinct.
const [gbBase] = await rows(`SELECT count(*) n, avg((aes >= 2)::INT) p FROM j WHERE in_grambank AND aes IS NOT NULL`);
const gbVals = await rows(`SELECT f.feature_id, f.value, p.Name AS feature, count(*) n, count(*) FILTER (s.aes >= 2) k, bool_and(s.aes >= 2) only_end
  FROM f JOIN s USING (glottocode) JOIN read_csv('${RAW}/grambank/parameters.csv') p ON p.ID = f.feature_id
  WHERE s.aes IS NOT NULL GROUP BY ALL ORDER BY k / n DESC`);
const majority = gbVals.filter((v) => Number(v.k) / Number(v.n) > 0.5).length;

const out = {
  source: "Glottolog 5.4 CLDF (doi:10.5281/zenodo.24101243), Grambank 1.0.3 (doi:10.5281/zenodo.7844558), WALS Online 2020.6 CLDF — all CC-BY 4.0",
  capturedAt: new Date().toISOString(),
  glottoscope: { ...GLOTTOSCOPE, cldfAes: aesCheck, cldfMed: medCheck },
  macroareas: MACRO,
  families: fams.map((f) => [f.family_id, f.family]),
  columns: ["glottocode", "name", "family", "macroarea", "lat", "lon", "iso639_3", "countries", "aes", "med", "medYear", "firstYear", "grambank", "wals"],
  languages: langs.map((l) => [l.glottocode, l.name, l.family_id ? famIdx.get(l.family_id) : -1, MACRO.indexOf(l.macroarea), n(l.lat), n(l.lon),
    l.iso639_3 ?? "", l.countries.filter(Boolean).join(";"), n(l.aes) ?? 0, n(l.med) ?? -1, n(l.med_year), n(l.first_year), l.in_grambank ? 1 : 0, l.in_wals ? 1 : 0]),
  grambank: {
    languages: n(gbBase.n), baseEndangered: Math.round(Number(gbBase.p) * 1000) / 1000, values: gbVals.length,
    onlyEndangered: gbVals.filter((v) => v.only_end).length, majorityEndangered: majority,
    top: gbVals.filter((v) => Number(v.n) >= 30).slice(0, 10).map((v) => [v.feature_id, v.value, v.feature, n(v.n), n(v.k)]),
  },
};
writeFileSync("src/days/day-005-endangered-languages/snapshot.json", JSON.stringify(out));
console.log(`✓ snapshot.json · ${out.languages.length} languages · ${fams.length} families · ${global.endangered} endangered · ${global.priority} priority`);
