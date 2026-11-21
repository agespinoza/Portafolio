-- Day 004 · dim_lake: one row per HydroLAKES lake (~1.43 M), from the pour-point shapefile.
-- Source: HydroLAKES v1.0, Messager et al. (2016), hydrosheds.org, CC-BY 4.0.
INSTALL spatial;
LOAD spatial;

CREATE OR REPLACE TABLE dim_lake AS
SELECT
  Hylak_id                            AS lake_id,
  NULLIF(trim(Lake_name), '')         AS name,
  Country                             AS country,
  Continent                           AS continent,
  round(ST_Y(geom), 5)                AS lat,
  round(ST_X(geom), 5)                AS lon,
  Lake_area                           AS area_km2,
  Depth_avg                           AS depth_m,
  Vol_total                           AS volume_mcm,
  Elevation                           AS elevation_m,
  Lake_type = 2                       AS is_reservoir,
  Lake_type                           AS lake_type
FROM ST_Read('raw/day-004-abraham-lake/HydroLAKES_points_v10_shp/HydroLAKES_points_v10.shp');

COPY dim_lake TO 'raw/day-004-abraham-lake/dim_lake.parquet' (FORMAT parquet, COMPRESSION zstd);
