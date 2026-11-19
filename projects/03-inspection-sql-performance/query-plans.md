# Query plan comparison

| Setup | Station access | Grouping |
| --- | --- | --- |
| Before index | Full scan of `inspection` | Temporary B-tree |
| After index | Range search on covering index `inspection_station_duration` | Station ordering supplied by the index |

Both queries return 500 inspections per station for stations 4–7. Average durations are 32.95, 35.10, 31.94, and 34.00 minutes respectively. Both plans still use a temporary B-tree for the outer ordering.
