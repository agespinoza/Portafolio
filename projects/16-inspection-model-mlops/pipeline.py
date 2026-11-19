import csv
from hashlib import sha256
import json
from pathlib import Path
from statistics import mean

directory = Path(__file__).resolve().parent
source = directory / "inspections.csv"
with source.open(newline="", encoding="utf-8") as stream:
    rows = [(int(row["inspection_id"]), int(row["checklist_items"]), int(row["minutes"]))
            for row in csv.DictReader(stream)]

training = [(x, y) for key, x, y in rows if key % 4]
holdout = [(x, y) for key, x, y in rows if key % 4 == 0]

x_mean = mean(x for x, _ in training)
y_mean = mean(y for _, y in training)
slope = sum((x - x_mean) * (y - y_mean) for x, y in training) / sum(
    (x - x_mean) ** 2 for x, _ in training
)
intercept = y_mean - slope * x_mean
model = {
    "algorithm": "ordinary_least_squares",
    "data_sha256": sha256(source.read_bytes()).hexdigest(),
    "pipeline_sha256": sha256(Path(__file__).read_bytes()).hexdigest(),
    "feature": "checklist_items",
    "intercept": intercept,
    "slope": slope,
}
version = sha256(json.dumps(model, sort_keys=True).encode()).hexdigest()[:12]
metrics = {
    "model_version": version,
    "training_rows": len(training),
    "holdout_rows": len(holdout),
    "holdout_mae_minutes": mean(abs(y - (intercept + slope * x)) for x, y in holdout),
    "baseline_mae_minutes": mean(abs(y - y_mean) for _, y in holdout),
}
output = directory / "artifacts"
output.mkdir(exist_ok=True)
for label, data in (("model", model), ("evaluation", metrics)):
    (output / f"{label}-{version}.json").write_text(
        json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
print(json.dumps(metrics, indent=2))
