# Inspection Warehouse Migration

Load simulated inspection history into a station dimension and an inspection fact table. Reconcile totals overall and per station before committing.

## Career context

At Opus, I supported legacy data warehouse migrations involving Azure and SQL Server. This SQLite demo illustrates loading historical records and reconciling row counts and totals.

## Run the demo

Run `python3 migrate.py` from this directory. The demo uses an in-memory SQLite database and prints the [validation report](validation.md) totals.
