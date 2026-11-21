-- Day 004 · local-winter mean air temperature per lake and its trend in °C per decade (regr_slope).
-- Abraham Lake: full daily ERA5 series since 1950 (raw/.../weather/7243.json); winter = Dec–Feb, labeled by
--   its January, so winter 1951 = Dec 1950 + Jan–Feb 1951. Only complete winters count.
-- 300 largest lakes: one mean per local winter 1991–2025 (data/day-004-abraham-lake/winters/<id>.json, from fetch-winters.mjs);
--   Dec–Feb in the north, Jun–Aug in the south.
CREATE OR REPLACE TABLE abraham_daily AS
SELECT CAST(unnest(daily.time) AS DATE) AS day, unnest(daily.temperature_2m_mean) AS temp_c
FROM read_json('raw/day-004-abraham-lake/weather/7243.json');

CREATE OR REPLACE TABLE winters AS
SELECT 7243 AS lake_id,
       CASE WHEN month(day) = 12 THEN year(day) + 1 ELSE year(day) END AS winter,
       avg(temp_c) AS mean_c
FROM abraham_daily
WHERE month(day) IN (12, 1, 2)
GROUP BY 1, 2
HAVING count(temp_c) >= 89;

INSERT INTO winters
SELECT r.lake_id, CAST(w.key AS INTEGER) AS winter, CAST(w.value.mean AS DOUBLE) AS mean_c
FROM (
  SELECT lake_id, unnest(map_entries(CAST(winters AS MAP(VARCHAR, STRUCT(mean DOUBLE, days INTEGER))))) AS w
  FROM read_json('data/day-004-abraham-lake/winters/*.json', columns = {lake_id: 'INTEGER', winters: 'JSON'})
) r
WHERE w.value.days >= 89 AND w.value.mean IS NOT NULL;

-- Abraham's monthly air-temperature climatology, 1991–2020 (WMO normal period).
CREATE OR REPLACE TABLE abraham_months AS
SELECT month(day) AS month, round(avg(temp_c), 1) AS mean_c, round(min(temp_c), 1) AS min_c, round(max(temp_c), 1) AS max_c,
       round(avg(CASE WHEN temp_c < 0 THEN 1 ELSE 0 END) * 100, 0) AS pct_below_zero
FROM abraham_daily WHERE year(day) BETWEEN 1991 AND 2020 GROUP BY 1 ORDER BY 1;

CREATE OR REPLACE TABLE winter_trend AS
SELECT lake_id, min(winter) AS first_winter, max(winter) AS last_winter, count(*) AS winters,
       round(avg(mean_c), 2) AS winter_mean_c,
       round(regr_slope(mean_c, winter) * 10, 3) AS slope_c_per_decade,
       round(regr_intercept(mean_c, winter), 3) AS intercept,
       round(regr_r2(mean_c, winter), 3) AS r2,
       round(sqrt((1 - regr_r2(mean_c, winter)) * var_samp(mean_c) / (var_samp(winter) * (count(*) - 2))) * 10, 3) AS slope_se
FROM winters GROUP BY 1;

-- Abraham's trend on the same 1991–2025 window as the comparison lakes, so the comparison is fair.
CREATE OR REPLACE TABLE abraham_trend_1991 AS
SELECT round(regr_slope(mean_c, winter) * 10, 3) AS slope_c_per_decade,
       round(sqrt((1 - regr_r2(mean_c, winter)) * var_samp(mean_c) / (var_samp(winter) * (count(*) - 2))) * 10, 3) AS slope_se
FROM winters WHERE lake_id = 7243 AND winter BETWEEN 1991 AND 2025;
