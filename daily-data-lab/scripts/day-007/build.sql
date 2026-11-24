-- Day 007 · CelesTrak SATCAT → raw/day-007-space-debris/object.parquet (one row per Earth-orbiting object, decayed or not).
-- Run from daily-data-lab/:  node scripts/day-004/run-sql.mjs scripts/day-007/build.sql
-- Orbit classes follow ESA's Annual Space Environment Report 2026, Table 1.2 (perigee hp, apogee ha, inclination i,
-- semi-major axis a, eccentricity e). Active = CelesTrak OPS_STATUS_CODE in (+, P, B, S, X).

CREATE TABLE s AS
SELECT
  NORAD_CAT_ID::INT AS id, OBJECT_NAME AS name, OBJECT_ID AS intl, substr(OBJECT_ID, 1, 8) AS launch_key,
  OBJECT_TYPE AS type, OPS_STATUS_CODE AS status, OWNER AS owner,
  LAUNCH_DATE::DATE AS launch, TRY_CAST(DECAY_DATE AS DATE) AS decay,
  TRY_CAST(APOGEE AS DOUBLE) AS ha, TRY_CAST(PERIGEE AS DOUBLE) AS hp, TRY_CAST(INCLINATION AS DOUBLE) AS incl, TRY_CAST(RCS AS DOUBLE) AS rcs,
  ORBIT_CENTER AS center, ORBIT_TYPE AS orbit_type, DATA_STATUS_CODE AS data_status
FROM read_csv('raw/day-007-space-debris/satcat.csv', header = true, all_varchar = true)
-- Earth orbit only: objects around Earth (or decayed from it) and modules docked to an Earth-orbiting station.
WHERE ORBIT_CENTER = 'EA' OR ORBIT_TYPE = 'DOC';

CREATE TABLE o AS
WITH g AS (
  SELECT *, (hp + ha) / 2 + 6378.137 AS a, (ha - hp) / (hp + ha + 2 * 6378.137) AS e FROM s
)
SELECT
  id, name, intl, launch_key, type, status, owner, launch, decay, ha, hp, incl, rcs, data_status,
  decay IS NULL AS in_orbit,
  CASE
    WHEN hp IS NULL OR ha IS NULL OR incl IS NULL THEN 'UFO'
    WHEN incl BETWEEN 0 AND 25 AND hp BETWEEN 35586 AND 35986 AND ha BETWEEN 35586 AND 35986 THEN 'GEO'
    WHEN a BETWEEN 37948 AND 46380 AND e BETWEEN 0 AND 0.25 AND incl > 25 THEN 'IGO'
    WHEN a BETWEEN 37948 AND 46380 AND e BETWEEN 0 AND 0.25 THEN 'EGO'
    WHEN incl BETWEEN 50 AND 70 AND hp BETWEEN 18100 AND 24300 AND ha BETWEEN 18100 AND 24300 THEN 'NSO'
    WHEN hp < 2000 AND ha <= 2000 THEN 'LEO'
    WHEN hp >= 2000 AND ha <= 31570 THEN 'MEO'
    WHEN hp < 2000 AND ha > 31570 AND ha <= 40002 AND incl <= 90 THEN 'GTO'
    WHEN hp < 2000 AND ha > 2000 AND ha <= 31570 THEN 'LMO'
    WHEN hp >= 2000 AND hp <= 31570 AND ha > 31570 AND ha <= 40002 THEN 'MGO'
    WHEN hp <= 31570 AND ha > 40002 THEN 'HEO'
    WHEN hp > 31570 AND hp <= 40002 AND ha > 40002 THEN 'GHO'
    WHEN hp > 40002 THEN 'HAO'
    ELSE 'UFO'
  END AS orbit,
  (hp + ha) / 2 AS mean_alt_km,
  CASE
    WHEN status IN ('+', 'P', 'B', 'S', 'X') THEN 'active'
    WHEN type = 'PAY' THEN 'inactive'
    WHEN type = 'R/B' THEN 'rocket'
    WHEN type = 'DEB' THEN 'debris'
    ELSE 'unknown'
  END AS cls,
  -- SATCAT has no cataloguing date. Catalogue numbers are assigned in order, so the latest launch date among objects
  -- with a lower or equal number approximates when an object entered the catalogue (Fengyun-1C debris: 2007-01-18).
  greatest(launch, max(launch) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)) AS cat_date
FROM g;

-- Break-up causes: NASA History of On-orbit Satellite Fragmentations, 16th ed., Table 2.1 (scripts/day-007/hoosf.py),
-- data to 1 May 2022. When a launch had several break-ups, the one with the most catalogued debris gives the cause.
CREATE TABLE b AS
SELECT launch_key, arg_max(cause, debris_catalogued) AS cause, arg_max(event, debris_catalogued) AS event
FROM read_csv('raw/day-007-space-debris/breakups.csv', header = true, all_varchar = true, types = {'debris_catalogued': 'INT'})
GROUP BY 1;

-- RCS size classes: the historical NORAD classes, below 0.1 m² (small), 0.1–1 m² (medium), above 1 m² (large).
-- Debris cause: NASA's assessed cause for its launch; ESA's "CZ-6A Upper Stage" class (propulsion, SER 2026 §5) for the
-- two CZ-6A launches after NASA's cut-off; otherwise "after NASA's list" if the piece entered the catalogue after
-- 1 May 2022, else "no recorded break-up" (mission-related pieces and minor events).
CREATE TABLE f AS
SELECT o.*,
  CASE WHEN rcs IS NULL THEN 'none' WHEN rcs < 0.1 THEN 'small' WHEN rcs <= 1 THEN 'medium' ELSE 'large' END AS rcs_class,
  CASE
    WHEN cls <> 'debris' THEN NULL
    WHEN b.cause = 'Collision, Deliberate' THEN 'asat'
    WHEN b.cause = 'Collision, Accidental' THEN 'collision'
    WHEN b.cause = 'Propulsion' THEN 'propulsion'
    WHEN b.cause = 'Battery' THEN 'battery'
    WHEN b.cause = 'Deliberate' THEN 'selfDestruct'
    WHEN b.cause IS NOT NULL THEN 'unknown'
    WHEN o.launch_key IN ('2022-151', '2024-140') THEN 'propulsion'
    WHEN o.cat_date >= DATE '2022-05-01' THEN 'afterList'
    ELSE 'none'
  END AS cause
FROM o LEFT JOIN b USING (launch_key);

COPY f TO 'raw/day-007-space-debris/object.parquet' (FORMAT parquet);
