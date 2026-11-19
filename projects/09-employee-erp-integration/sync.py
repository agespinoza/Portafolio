from pathlib import Path
import csv

directory = Path(__file__).resolve().parent
fields = ("employee_id", "name", "department")


def read_records(filename):
    with (directory / filename).open(newline="", encoding="utf-8") as source:
        reader = csv.DictReader(source)
        if reader.fieldnames != list(fields):
            raise ValueError(f"{filename} has an unexpected header")
        records = {}
        for row in reader:
            if None in row or not all(row[field] and row[field].strip() for field in fields):
                raise ValueError(f"{filename}:{reader.line_num} has an invalid record")
            key = row["employee_id"]
            if key in records:
                raise ValueError(f"{filename} repeats {key}")
            records[key] = row
        return records


def export(filename, columns, rows):
    output = directory / filename
    temporary = output.with_suffix(".tmp")
    with temporary.open("w", newline="", encoding="utf-8") as stream:
        writer = csv.writer(stream)
        writer.writerow(columns)
        writer.writerows(rows)
    temporary.replace(output)


hr = read_records("hr.csv")
erp = read_records("erp.csv")
keys = sorted(hr.keys() | erp.keys())
merged = {**erp, **hr}
report = []
for key in keys:
    if key not in hr:
        action = "ERP only"
    elif key not in erp:
        action = "Inserted"
    elif hr[key] != erp[key]:
        action = "Updated"
    else:
        action = "Matched"
    report.append((key, action, erp.get(key, {}).get("department", ""), merged[key]["department"]))

export("erp_synced.csv", fields, ([merged[key][field] for field in fields] for key in keys))
export("reconciliation.csv", ("employee_id", "action", "old_department", "new_department"), report)
