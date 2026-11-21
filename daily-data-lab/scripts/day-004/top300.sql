-- The 300 largest lakes by surface area, the comparison set for winter trends.
COPY (
  SELECT lake_id, name, country, lat, lon, area_km2
  FROM 'raw/day-004-abraham-lake/dim_lake.parquet'
  ORDER BY area_km2 DESC
  LIMIT 300
) TO 'data/day-004-abraham-lake/top300.json' (FORMAT json, ARRAY true);
