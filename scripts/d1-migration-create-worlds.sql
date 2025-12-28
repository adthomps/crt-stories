-- Migration: Create worlds table for D1 content import
CREATE TABLE IF NOT EXISTS worlds (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  longDescription TEXT,
  badges TEXT,
  tags TEXT,
  ogImage TEXT,
  heroImage TEXT,
  published INTEGER,
  createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updatedAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
