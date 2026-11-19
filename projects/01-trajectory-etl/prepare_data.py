"""Prepare simulated trajectory points for plotting."""
import csv
import math
from datetime import datetime, timezone
from pathlib import Path

DIRECTORY = Path(__file__).resolve().parent
FIELDS = ("timestamp_utc", "x_km", "y_km")


def prepare_data(source, destination):
    points = {}
    rejected = 0
    duplicates = 0
    with source.open(encoding="utf-8", newline="") as stream:
        for row in csv.DictReader(stream):
            try:
                timestamp = datetime.fromisoformat(row["timestamp_utc"].replace("Z", "+00:00"))
                x, y = float(row["x_km"]), float(row["y_km"])
                if timestamp.tzinfo is None or not all(map(math.isfinite, (x, y))):
                    raise ValueError
            except (ValueError, TypeError, AttributeError):
                rejected += 1
                continue
            timestamp = timestamp.astimezone(timezone.utc)
            if timestamp in points:
                if points[timestamp] != (x, y):
                    raise ValueError(f"Conflicting coordinates for {timestamp.isoformat()}")
                duplicates += 1
                continue
            points[timestamp] = (x, y)

    with destination.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.writer(stream)
        writer.writerow(FIELDS)
        for timestamp, (x, y) in sorted(points.items()):
            writer.writerow((timestamp.isoformat().replace("+00:00", "Z"), x, y))
    print(f"Valid points: {len(points)}. Duplicates: {duplicates}. Invalid rows: {rejected}.")


if __name__ == "__main__":
    prepare_data(DIRECTORY / "simulated_state.csv", DIRECTORY / "clean_trajectory.csv")
