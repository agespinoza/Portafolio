# Inspection SQL Performance

Compare SQLite access paths while reporting inspection volume and average duration by station.

## Career context

At Opus, I improved SQL query performance for vehicle inspection data. This SQLite example uses query plans to show how a covering index changes the access path.

## Run the demo

Run `sqlite3 -batch :memory: < demo.sql` from this directory. The initial plan scans the table and uses a temporary grouping structure. The second plan should search the covering index by station. Both summaries should match. The plans describe access paths and omit runtime benchmarking.

See the [observed query plans](query-plans.md) for the comparison.
