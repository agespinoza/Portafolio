CREATE TABLE dim_station (
    station_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
CREATE TABLE fact_inspection (
    inspection_id INTEGER PRIMARY KEY,
    station_id INTEGER NOT NULL REFERENCES dim_station,
    inspected_on TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0)
);
