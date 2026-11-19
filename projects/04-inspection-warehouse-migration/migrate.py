from pathlib import Path
import sqlite3

directory = Path(__file__).resolve().parent
with sqlite3.connect(":memory:") as database:
    database.execute("PRAGMA foreign_keys = ON")
    for filename in ("source.sql", "warehouse.sql"):
        database.executescript((directory / filename).read_text())
    database.execute("INSERT INTO dim_station(name) SELECT DISTINCT station FROM inspection_history")
    database.execute('''
        INSERT INTO fact_inspection
        SELECT inspection_id, station_id, inspected_on, duration_minutes
        FROM inspection_history JOIN dim_station ON name = station
    ''')
    source = database.execute('''
        SELECT station, COUNT(*), SUM(duration_minutes)
        FROM inspection_history GROUP BY station ORDER BY station
    ''').fetchall()
    target = database.execute('''
        SELECT name, COUNT(*), SUM(duration_minutes)
        FROM fact_inspection JOIN dim_station USING (station_id) GROUP BY name ORDER BY name
    ''').fetchall()
    if source != target or database.execute("PRAGMA foreign_key_check").fetchone():
        raise RuntimeError(f"Reconciliation failed. Source {source}, warehouse {target}")
    print("Station | Inspections | Duration (minutes)")
    for station, count, minutes in target:
        print(f"{station} | {count} | {minutes}")
    print(f"Total | {sum(row[1] for row in target)} | {sum(row[2] for row in target)}")
