-- Migration: Update books table for edition-specific Amazon URLs
-- Remove old generic amazon_url
ALTER TABLE books RENAME TO books_old;

CREATE TABLE books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  series_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  publish_date TEXT,
  kindle_url TEXT,
  audio_url TEXT,
  paperback_url TEXT,
  excerpt TEXT,
  world_slug TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,
  FOREIGN KEY(series_id) REFERENCES series(id)
);

INSERT INTO books (
  id, slug, series_id, title, description, cover_image, publish_date, kindle_url, excerpt, world_slug, published, created_at, updated_at, deleted_at
)
SELECT
  id, slug, series_id, title, description, cover_image, publish_date, kindle_url, excerpt, world_slug, published, created_at, updated_at, deleted_at
FROM books_old;

-- Add new columns with NULL values for existing rows
UPDATE books SET audio_url = NULL, paperback_url = NULL WHERE audio_url IS NULL OR paperback_url IS NULL;

DROP TABLE books_old;
