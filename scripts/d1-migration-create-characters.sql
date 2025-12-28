-- Migration: Create characters table for D1 content import
CREATE TABLE IF NOT EXISTS characters (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  longDescription TEXT,
  roleTag TEXT,
  badges TEXT,
  tags TEXT,
  ogImage TEXT,
  heroImage TEXT,
  world TEXT,
  published INTEGER,
  createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updatedAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
