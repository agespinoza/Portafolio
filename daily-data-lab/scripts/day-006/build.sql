-- Day 006 · Food waste: country table from UNEP Food Waste Index Report 2024 (SDG 12.3.1(b)),
-- FAOSTAT Food Security Indicators, World Bank WDI and CCKP. Raw files are listed in scripts/day-006/fetch.sh.
-- Run from daily-data-lab/:  node scripts/day-004/run-sql.mjs scripts/day-006/build.sql
SET VARIABLE raw = 'raw/day-006-food-waste';

-- UNEP FWI 2024 Level 1 estimates (year 2022) as published in the UN SDG Global Database, series
-- AG_FOOD_WST_PC (kg/cap/yr) and AG_FOOD_WST (tonnes). Sectors: HHS household, OOHC food service, RTL retail.
-- The FootNote column holds UNEP's confidence rating for each country × sector.
CREATE OR REPLACE TABLE fwi AS
WITH pc AS (
  SELECT GeoAreaCode::INT AS m49, GeoAreaName AS name, "[Food Waste Sector]" AS sector, Value::DOUBLE AS kg, FootNote AS note
  FROM read_csv(getvariable('raw') || '/AG_FOOD_WST_PC.csv', all_varchar = true)
  WHERE Source = 'Food Waste Index Report 2024' AND TimePeriod = '2022'
), t AS (
  SELECT GeoAreaCode::INT AS m49, "[Food Waste Sector]" AS sector, Value::DOUBLE AS tonnes
  FROM read_csv(getvariable('raw') || '/AG_FOOD_WST.csv', all_varchar = true)
  WHERE Source = 'Food Waste Index Report 2024' AND TimePeriod = '2022'
)
SELECT pc.*, t.tonnes FROM pc LEFT JOIN t USING (m49, sector);

-- M49 → ISO3 (UNSD M49 overview table).
CREATE OR REPLACE TABLE m49 AS
SELECT "M49 Code"::INT AS m49, "ISO-alpha3 Code" AS iso3, "ISO-alpha2 Code" AS iso2, "Country or Area" AS m49_name
FROM read_csv(getvariable('raw') || '/m49.csv', all_varchar = true) WHERE "ISO-alpha3 Code" <> '';

-- World Bank WDI: region, income group (current classification) and 2022 population.
CREATE OR REPLACE TABLE wb AS
WITH c AS (SELECT unnest(from_json(content::JSON -> 1, '["JSON"]')) AS r FROM read_text(getvariable('raw') || '/wb_countries.json')),
p AS (SELECT unnest(from_json(content::JSON -> 1, '["JSON"]')) AS r FROM read_text(getvariable('raw') || '/wb_pop2022.json'))
SELECT c.r ->> 'id' AS iso3, c.r ->> 'name' AS wb_name, trim(c.r -> 'region' ->> 'value') AS region,
  trim(c.r -> 'incomeLevel' ->> 'value') AS income, (p.r ->> 'value')::DOUBLE AS pop
FROM c JOIN p ON (p.r ->> 'countryiso3code') = (c.r ->> 'id')
WHERE (c.r -> 'region' ->> 'value') <> 'Aggregates';

-- FAOSTAT prevalence (%) and number (million) of undernourished people, 3-year average 2021–2023 (centred on 2022).
-- "<2.5" is FAO's floor; kept as 2.5 with a flag. Number is missing when PoU < 2.5.
CREATE OR REPLACE TABLE pou AS
SELECT "Area Code (M49)" m49_txt, replace("Area Code (M49)", '''', '')::INT m49,
  max(CASE WHEN "Item Code" = '210041' THEN replace(Value, '<', '')::DOUBLE END) pou,
  bool_or("Item Code" = '210041' AND Value LIKE '<%') pou_floor,
  max(CASE WHEN "Item Code" = '210011' AND Value <> '' THEN replace(Value, '<', '')::DOUBLE END) hungry_m
FROM read_csv(getvariable('raw') || '/faostat/Food_Security_Data_E_All_Data_(Normalized).csv', all_varchar = true)
WHERE Year = '2021-2023' AND "Item Code" IN ('210041', '210011')
GROUP BY 1, 2;

-- CCKP mean annual near-surface air temperature, CRU TS 4.08 climatology 1991–2020 (°C).
CREATE OR REPLACE TABLE tas AS
WITH j AS (SELECT data FROM read_json(getvariable('raw') || '/cckp_tas.json', columns = {data: 'JSON'}))
SELECT k AS iso3, (j.data -> k ->> '1991-07')::DOUBLE AS temp_c FROM j, unnest(json_keys(j.data)) AS u(k);

-- UNEP FWI 2024 Annex 3 (household estimates for all countries), parsed from the report PDF by
-- scripts/day-006/annex3.py. Its total equals the published world household figure (630.96 Mt).
-- For 27 European countries (26 rated "Eurostat" plus Romania), the SDG database has no FWI 2024 row and carries Eurostat rows instead, so
-- food service and retail come from Eurostat-reported kg/cap for 2020, the year UNEP used
-- (Germany 78 kg/cap and Italy 107 kg/cap match Annex 3), scaled by the UN population implied by Annex 3.
CREATE OR REPLACE TABLE annex AS SELECT * FROM read_csv(getvariable('raw') || '/unep_annex3_household.csv');
CREATE OR REPLACE TABLE eurostat AS
SELECT GeoAreaCode::INT AS m49,
  max(Value::DOUBLE) FILTER ("[Food Waste Sector]" = 'OOHC') AS fs_kg,
  max(Value::DOUBLE) FILTER ("[Food Waste Sector]" = 'RTL') AS rt_kg
FROM read_csv(getvariable('raw') || '/AG_FOOD_WST_PC.csv', all_varchar = true)
WHERE Source = 'Eurostat' AND TimePeriod = '2020' GROUP BY 1;

CREATE OR REPLACE TABLE country AS
WITH s AS (
  SELECT m49,
    max(kg) FILTER (sector = 'OOHC') AS fs_kg, max(kg) FILTER (sector = 'RTL') AS rt_kg,
    max(tonnes) FILTER (sector = 'OOHC') AS fs_t, max(tonnes) FILTER (sector = 'RTL') AS rt_t
  FROM fwi GROUP BY 1
)
SELECT m.iso3, m.iso2, coalesce(w.wb_name, a.country) AS name, w.region, w.income, w.pop,
  1000 * a.hh_t / nullif(a.hh_kg, 0) AS pop_un, -- persons (tonnes ÷ kg per person × 1000)
  coalesce(s.fs_kg, e.fs_kg) AS fs_kg_raw, coalesce(s.rt_kg, e.rt_kg) AS rt_kg_raw,
  a.hh_kg, a.hh_t,
  coalesce(s.fs_t, e.fs_kg * a.hh_t / nullif(a.hh_kg, 0)) AS fs_t, -- kg/cap × persons ÷ 1000 = tonnes
  coalesce(s.rt_t, e.rt_kg * a.hh_t / nullif(a.hh_kg, 0)) AS rt_t,
  s.m49 IS NULL AS eurostat_fill,
  replace(replace(a.confidence, ' confidence', ''), 'Very low', 'Very low') AS confidence,
  p.pou, p.pou_floor, p.hungry_m, t.temp_c
FROM annex a JOIN m49 m ON m.m49 = a.m49
LEFT JOIN s ON s.m49 = a.m49
LEFT JOIN eurostat e ON e.m49 = a.m49
LEFT JOIN wb w ON w.iso3 = m.iso3
LEFT JOIN pou p ON p.m49 = a.m49
LEFT JOIN tas t ON t.iso3 = m.iso3;

COPY country TO 'raw/day-006-food-waste/country.parquet' (FORMAT parquet);
