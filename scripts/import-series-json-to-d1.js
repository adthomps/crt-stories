import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../data/crt-stories.d1'); // Update path if needed
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