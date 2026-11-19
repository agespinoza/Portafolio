CREATE TABLE inspection_history (
    inspection_id INTEGER PRIMARY KEY,
    station TEXT NOT NULL,
    inspected_on TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0)
);
INSERT INTO inspection_history VALUES
    (101, 'North', '2026-01-05', 24), (102, 'South', '2026-01-05', 31),
    (103, 'North', '2026-01-06', 28), (104, 'South', '2026-01-06', 37);
