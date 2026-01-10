-- Migration: Fix and normalize the series table for CRT Stories
-- This script will ensure all required columns exist, types are correct, and add missing fields for schema alignment

-- 1. Add missing columns if not present
ALTER TABLE series ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE series ADD COLUMN IF NOT EXISTS longDescription TEXT;
ALTER TABLE series ADD COLUMN IF NOT EXISTS badges TEXT; -- JSON array as string
ALTER TABLE series ADD COLUMN IF NOT EXISTS tags TEXT;   -- JSON array as string
ALTER TABLE series ADD COLUMN IF NOT EXISTS ogImage TEXT;
ALTER TABLE series ADD COLUMN IF NOT EXISTS heroImage TEXT;
ALTER TABLE series ADD COLUMN IF NOT EXISTS formats TEXT; -- JSON array as string

-- 2. Ensure published is INTEGER (0/1)
ALTER TABLE series ADD COLUMN IF NOT EXISTS published INTEGER DEFAULT 1;

-- 3. Set default values for new columns if needed
UPDATE series SET subtitle = '' WHERE subtitle IS NULL;
UPDATE series SET longDescription = '' WHERE longDescription IS NULL;
UPDATE series SET badges = '[]' WHERE badges IS NULL;
UPDATE series SET tags = '[]' WHERE tags IS NULL;
UPDATE series SET ogImage = NULL WHERE ogImage IS NULL;
UPDATE series SET heroImage = NULL WHERE heroImage IS NULL;
UPDATE series SET formats = '[]' WHERE formats IS NULL;
UPDATE series SET published = 1 WHERE published IS NULL;

-- 4. (Optional) Remove duplicate or orphaned series
-- DELETE FROM series WHERE slug NOT IN (SELECT DISTINCT series_id FROM books);

-- 5. (Optional) Add unique constraint on slug
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_series_slug ON series(slug);

-- 6. (Optional) Add created_at, updated_at, deleted_at columns if missing
ALTER TABLE series ADD COLUMN IF NOT EXISTS created_at TEXT;
ALTER TABLE series ADD COLUMN IF NOT EXISTS updated_at TEXT;
ALTER TABLE series ADD COLUMN IF NOT EXISTS deleted_at TEXT;

-- 7. (Optional) Backfill timestamps
UPDATE series SET created_at = COALESCE(created_at, datetime('now'));
UPDATE series SET updated_at = COALESCE(updated_at, datetime('now'));

-- End of migration
