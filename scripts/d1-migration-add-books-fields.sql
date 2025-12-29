-- Migration: Add badges, tags, formats, subtitle, longDescription, status, author, ogImage to books table
ALTER TABLE books ADD COLUMN badges TEXT;
ALTER TABLE books ADD COLUMN tags TEXT;
ALTER TABLE books ADD COLUMN formats TEXT;
ALTER TABLE books ADD COLUMN subtitle TEXT;
ALTER TABLE books ADD COLUMN longDescription TEXT;
ALTER TABLE books ADD COLUMN status TEXT;
ALTER TABLE books ADD COLUMN author TEXT;
ALTER TABLE books ADD COLUMN ogImage TEXT;
-- Remove deprecated amazonUrl if present (manual step may be required for SQLite/D1)
-- ALTER TABLE does not support DROP COLUMN in SQLite, so this is a comment for manual migration if needed.
