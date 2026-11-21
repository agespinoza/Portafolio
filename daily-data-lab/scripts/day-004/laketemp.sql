-- Day 004 · LakeTEMP v1.1 aggregated statistics (Korver et al. 2024, hydrosheds.org, CC-BY 4.0), one row per lake.
-- Input: raw/day-004-abraham-lake/LakeTEMP_aggregated_v1.csv (download in a browser from figshare,
-- DOI 10.6084/m9.figshare.23844660; scripts get HTTP 403). Temperatures are stored as °C × 100.
-- Quality follows the tech doc: trendline statistics (stat_method = 0), no intermittency, n_obs ≥ 46.
COPY (
  SELECT
    Hylak_id                                                   AS lake_id,
    n_obs, stat_method, intermittency,
    (stat_method = 0 AND intermittency = 0 AND n_obs >= 46)    AS quality_ok,
    round(center_lat, 4)  AS center_lat,
    round(center_long, 4) AS center_lon,
    Tyear_mean, Tyear_mean_open, Tyear_min, Tyear_max,
    ice_days, ice_days_min, ice_days_max, ice_start, ice_end,
    [Tmonth_mean_1, Tmonth_mean_2, Tmonth_mean_3, Tmonth_mean_4, Tmonth_mean_5, Tmonth_mean_6,
     Tmonth_mean_7, Tmonth_mean_8, Tmonth_mean_9, Tmonth_mean_10, Tmonth_mean_11, Tmonth_mean_12] AS month_mean,
    [Tmonth_CImean_min_1, Tmonth_CImean_min_2, Tmonth_CImean_min_3, Tmonth_CImean_min_4, Tmonth_CImean_min_5, Tmonth_CImean_min_6,
     Tmonth_CImean_min_7, Tmonth_CImean_min_8, Tmonth_CImean_min_9, Tmonth_CImean_min_10, Tmonth_CImean_min_11, Tmonth_CImean_min_12] AS month_lo,
    [Tmonth_CImean_max_1, Tmonth_CImean_max_2, Tmonth_CImean_max_3, Tmonth_CImean_max_4, Tmonth_CImean_max_5, Tmonth_CImean_max_6,
     Tmonth_CImean_max_7, Tmonth_CImean_max_8, Tmonth_CImean_max_9, Tmonth_CImean_max_10, Tmonth_CImean_max_11, Tmonth_CImean_max_12] AS month_hi
  FROM read_csv('raw/day-004-abraham-lake/LakeTEMP_aggregated_v1.csv')
) TO 'raw/day-004-abraham-lake/laketemp.parquet' (FORMAT parquet, COMPRESSION zstd);
