// Script: import-series-json-to-d1.ts
// Usage: Run with Node.js to import src/content/series.json into the D1 database

import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const dbPath = path.resolve(__dirname, '../data/crt-stories.d1'); // Adjust path as needed
const seriesJsonPath = path.resolve(__dirname, '../src/content/series.json');

const db = new Database(dbPath);
const seriesData = JSON.parse(fs.readFileSync(seriesJsonPath, 'utf-8'));

const insert = db.prepare(`
  INSERT OR IGNORE INTO series (
    slug, title, subtitle, description, longDescription, badges, tags, ogImage, heroImage, formats, published, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

for (const s of seriesData) {
  insert.run(
    s.slug,
    s.title,
    s.subtitle || '',
    s.description || '',
    s.longDescription || '',
    JSON.stringify(s.badges || []),
    JSON.stringify(s.tags || []),
    s.ogImage || null,
    s.heroImage || null,
    JSON.stringify(s.formats || []),
    s.published ? 1 : 0
  );
  console.log(`Imported series: ${s.slug}`);
}

db.close();
console.log('Series import complete.');
