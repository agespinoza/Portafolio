# Employee ERP Integration

Synchronize employee departments from an HR CSV into a simulated ERP CSV. Report inserted, updated, matched, and ERP-only records.

## Career context

At DIF, I designed an Oracle and C# ERP system that integrated with human resources. The demo uses sample employee records to illustrate synchronization and reconciliation.

## Run the demo

Run `python3 sync.py`. The command writes `erp_synced.csv` and `reconciliation.csv` beside the inputs. The [data model](data-model.md) defines the synchronization rules.
