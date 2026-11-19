.headers on
.mode column
CREATE TABLE inspection (
    id INTEGER PRIMARY KEY,
    station_id INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0)
);
WITH RECURSIVE sample(n) AS (
    VALUES (1) UNION ALL SELECT n + 1 FROM sample WHERE n < 20000
)
INSERT INTO inspection
SELECT n, n % 40 + 1, 12 + (n * 17 % 45) FROM sample;

CREATE VIEW station_summary AS
SELECT station_id, COUNT(*) AS inspections, ROUND(AVG(duration_minutes), 2) AS average_minutes
FROM inspection WHERE station_id BETWEEN 4 AND 7
GROUP BY station_id;

.print Before indexing
EXPLAIN QUERY PLAN SELECT * FROM station_summary ORDER BY station_id;
SELECT * FROM station_summary ORDER BY station_id;

CREATE INDEX inspection_station_duration ON inspection(station_id, duration_minutes);
.print After indexing
EXPLAIN QUERY PLAN SELECT * FROM station_summary ORDER BY station_id;
SELECT * FROM station_summary ORDER BY station_id;
