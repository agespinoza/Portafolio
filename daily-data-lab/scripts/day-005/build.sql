-- Day 005 · Endangered languages: dimension and fact tables from Glottolog 5.4 CLDF (+ Grambank 1.0.3, WALS 2020.6).
-- Sources (all CC-BY 4.0): Hammarström, Forkel, Haspelmath & Bank, Glottolog 5.4, doi:10.5281/zenodo.24101243;
-- Skirgård et al., Grambank v1.0.3, doi:10.5281/zenodo.7844558; Dryer & Haspelmath (eds.), WALS Online v2020.6 (CLDF).
-- Run from daily-data-lab/:  node scripts/day-004/run-sql.mjs scripts/day-005/build.sql
SET VARIABLE raw = 'raw/day-005-endangered-languages';

CREATE OR REPLACE VIEW g_lang AS SELECT * FROM read_csv(getvariable('raw') || '/glottolog-cldf/cldf/languages.csv');
CREATE OR REPLACE VIEW g_val AS SELECT * FROM read_csv(getvariable('raw') || '/glottolog-cldf/cldf/values.csv', all_varchar = true);

-- Universe: languoids at level "language" whose category is Spoken L1 Language (7,685 in Glottolog 5.4).
-- GlottoScope (glottolog.org/langdoc/status) also counts sign languages; the check in snapshot.mjs adds them back.
CREATE OR REPLACE TABLE dim_language AS
SELECT
  l.Glottocode                                   AS glottocode,
  l.Name                                         AS name,
  f.Name                                         AS family,
  l.Family_ID                                    AS family_id,
  coalesce(l.Is_Isolate, false)                  AS is_isolate,
  NULLIF(split_part(l.Macroarea, ';', 1), '')   AS macroarea,   -- 9 languages list two or three; the first is kept
  round(l.Latitude, 3)                           AS lat,
  round(l.Longitude, 3)                          AS lon,
  l.ISO639P3code                                 AS iso639_3,
  string_split(coalesce(l.Countries, ''), ';')   AS countries
FROM g_lang l
JOIN g_val c ON c.Language_ID = l.ID AND c.Parameter_ID = 'category' AND c.Value = 'Spoken_L1_Language'
LEFT JOIN g_lang f ON f.ID = l.Family_ID
WHERE l.Level = 'language';

-- medovertime lists each improvement in the most extensive description, newest first, as "ref[year];ref[year]".
CREATE OR REPLACE TABLE fact_status AS
WITH hist AS (
  SELECT Language_ID AS glottocode,
         list_transform(regexp_extract_all(coalesce(Source, ''), '\[(\d{4})\]', 1), x -> x::INT) AS years
  FROM g_val WHERE Parameter_ID = 'medovertime'
)
SELECT
  d.glottocode,
  a.Value::INT                                   AS aes,   -- 1 not endangered … 6 extinct (NULL = not assessed)
  m.Value::INT                                   AS med,   -- 0 long grammar … 4 wordlist or less (NULL = nothing)
  CASE WHEN len(h.years) > 0 THEN h.years[1] END AS med_year,       -- year of the current best description
  CASE WHEN len(h.years) > 0 THEN list_min(h.years) END AS first_year -- oldest description Glottolog links
FROM dim_language d
LEFT JOIN g_val a ON a.Language_ID = d.glottocode AND a.Parameter_ID = 'aes'
LEFT JOIN g_val m ON m.Language_ID = d.glottocode AND m.Parameter_ID = 'med'
LEFT JOIN hist h ON h.glottocode = d.glottocode;

-- Grambank: one row per language × feature with a coded value (0/1/2/3; "?" = not known, dropped).
-- onlyEndangered: every language in Glottolog's universe that carries this feature value is endangered or extinct (AES 2–6).
CREATE OR REPLACE TABLE fact_features AS
WITH gb AS (
  SELECT v.Language_ID AS glottocode, v.Parameter_ID AS feature_id, v.Value AS value
  FROM read_csv(getvariable('raw') || '/grambank/values.csv', all_varchar = true) v
  WHERE v.Value <> '?'
),
carriers AS (
  SELECT gb.feature_id, gb.value, count(*) AS n, bool_and(s.aes >= 2) AS only_endangered
  FROM gb JOIN fact_status s USING (glottocode) WHERE s.aes IS NOT NULL
  GROUP BY 1, 2
)
SELECT gb.glottocode, gb.feature_id, gb.value, c.n AS carriers, coalesce(c.only_endangered, false) AS only_endangered
FROM gb LEFT JOIN carriers c USING (feature_id, value);

-- Typology database coverage: is the language coded in Grambank and/or WALS?
CREATE OR REPLACE TABLE fact_coverage AS
SELECT d.glottocode,
  d.glottocode IN (SELECT DISTINCT glottocode FROM fact_features)                    AS in_grambank,
  d.glottocode IN (SELECT l.Glottocode FROM read_csv(getvariable('raw') || '/wals/languages.csv') l
                   WHERE l.ID IN (SELECT DISTINCT Language_ID FROM read_csv(getvariable('raw') || '/wals/values.csv'))) AS in_wals
FROM dim_language d;

COPY dim_language  TO 'raw/day-005-endangered-languages/dim_language.parquet'  (FORMAT parquet, COMPRESSION zstd);
COPY fact_status   TO 'raw/day-005-endangered-languages/fact_status.parquet'   (FORMAT parquet, COMPRESSION zstd);
COPY fact_features TO 'raw/day-005-endangered-languages/fact_features.parquet' (FORMAT parquet, COMPRESSION zstd);
COPY fact_coverage TO 'raw/day-005-endangered-languages/fact_coverage.parquet' (FORMAT parquet, COMPRESSION zstd);
