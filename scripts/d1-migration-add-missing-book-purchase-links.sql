-- Migration: Add optional purchase link columns to books table if not present
ALTER TABLE books
ADD COLUMN kindle_url TEXT;

ALTER TABLE books
ADD COLUMN audio_url TEXT;

ALTER TABLE books
ADD COLUMN paperback_url TEXT;

-- Drop the amazon_url column
ALTER TABLE books
DROP COLUMN amazon_url;