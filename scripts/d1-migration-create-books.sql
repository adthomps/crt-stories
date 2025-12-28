-- Migration: Create books table for D1 content import
CREATE TABLE IF NOT EXISTS books (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  longDescription TEXT,
  badges TEXT,
  tags TEXT,
  ogImage TEXT,
  heroImage TEXT,
  formats TEXT,
  published INTEGER,
  series TEXT,
  world TEXT,
  createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updatedAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
