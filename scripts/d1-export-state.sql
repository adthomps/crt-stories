-- D1 schema migration: export_state table
CREATE TABLE IF NOT EXISTS export_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  needs_export INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

-- Ensure a single row exists
INSERT OR IGNORE INTO export_state (id, needs_export, updated_at)
VALUES (1, 0, datetime('now'));
