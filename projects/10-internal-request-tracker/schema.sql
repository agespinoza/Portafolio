CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 100),
    description TEXT NOT NULL CHECK(length(description) BETWEEN 1 AND 500),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO requests(id, title, description) VALUES
    (1, 'Replace meeting room keyboard', 'Facilities requested a replacement keyboard.'),
    (2, 'Restore training folder', 'Training requested a copy from the previous backup.');
