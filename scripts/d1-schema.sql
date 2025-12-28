-- D1 schema for CRT Stories

-- Series table
CREATE TABLE IF NOT EXISTS series (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  series_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  publish_date TEXT,
  amazon_url TEXT,
  kindle_url TEXT,
  excerpt TEXT,
  world_slug TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,
  FOREIGN KEY(series_id) REFERENCES series(id)
);

-- Worlds table
CREATE TABLE IF NOT EXISTS worlds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  history TEXT,
  geography TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  image TEXT,
  backstory TEXT,
  abilities TEXT,
  world_slug TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

-- Book-Characters relationship table
CREATE TABLE IF NOT EXISTS book_characters (
  book_id INTEGER NOT NULL,
  character_id INTEGER NOT NULL,
  PRIMARY KEY (book_id, character_id),
  FOREIGN KEY(book_id) REFERENCES books(id),
  FOREIGN KEY(character_id) REFERENCES characters(id)
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Export state table
CREATE TABLE IF NOT EXISTS export_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  needs_export INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

-- Ensure a single export_state row exists
INSERT OR IGNORE INTO export_state (id, needs_export, updated_at)
VALUES (1, 0, datetime('now'));
