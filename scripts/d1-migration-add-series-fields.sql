-- Migration: Add missing columns to series table for CRT Stories
-- Run this in your Cloudflare D1 SQL UI or via migration tooling

ALTER TABLE series ADD COLUMN subtitle TEXT;
ALTER TABLE series ADD COLUMN longDescription TEXT;
ALTER TABLE series ADD COLUMN badges TEXT;
ALTER TABLE series ADD COLUMN tags TEXT;
ALTER TABLE series ADD COLUMN ogImage TEXT;
ALTER TABLE series ADD COLUMN heroImage TEXT;
ALTER TABLE series ADD COLUMN formats TEXT;
ALTER TABLE series ADD COLUMN published INTEGER DEFAULT 1;
-- Add created_at and updated_at if not present
ALTER TABLE series ADD COLUMN created_at TEXT;
ALTER TABLE series ADD COLUMN updated_at TEXT;
-- Add deleted_at for soft deletes if needed
ALTER TABLE series ADD COLUMN deleted_at TEXT;
