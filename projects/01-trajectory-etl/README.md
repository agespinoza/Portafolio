# Trajectory Data Preparation

This ETL demo prepares simulated trajectory points for a chart. It reads a CSV, validates coordinates, normalizes timestamps to UTC, removes duplicate records, and exports the points in chronological order.

## Run the demo

From this directory, run the following command with Python 3.8 or later. The script uses only the Python standard library.

```sh
python3 prepare_data.py
```

[The input CSV](simulated_state.csv) contains five sample records. The script removes one duplicate and rejects one record with a missing coordinate. [The output CSV](clean_trajectory.csv) contains the three valid points in chronological order.
