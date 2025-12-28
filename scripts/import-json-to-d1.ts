// Import JSON content files into D1, including all metadata fields
import * as fs from 'fs/promises';
import * as path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Project root is two levels up from scripts/dist or one from scripts/
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const CONTENT_DIR = path.join(PROJECT_ROOT, 'src', 'content');

// (removed duplicate, see below)
const TABLES = [
  { name: 'series', file: 'series.json' },
  { name: 'books', file: 'books.json' },
  { name: 'worlds', file: 'worlds.json' },
  { name: 'characters', file: 'characters.json' },
];

// getEnv is now only defined inside d1Exec for remote mode

async function d1Exec(sql: string, params: any[] = []) {
  const isLocal = process.env.LOCAL_D1 === '1' || process.argv.includes('--local');
  let url: string;
  let headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let body: any;
  if (isLocal) {
    // Local D1 HTTP API endpoint (requires wrangler dev or d1 dev running)
    const DB_NAME = process.env.D1_DATABASE_NAME || 'DB';
    url = `http://127.0.0.1:8787/.wrangler/state/v3/d1/${DB_NAME}/query`;
    body = { sql, params };
  } else {
    // Only get Cloudflare env vars in remote mode
    const getEnv = (name: string): string => {
      const val = process.env[name];
      if (!val) throw new Error(`Missing required env: ${name}`);
      return val;
    };
    const CF_API_TOKEN = getEnv('CLOUDFLARE_API_TOKEN');
    const CF_ACCOUNT_ID = getEnv('CLOUDFLARE_ACCOUNT_ID');
    const D1_DATABASE_ID = getEnv('D1_DATABASE_ID');
    url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`;
    headers['Authorization'] = `Bearer ${CF_API_TOKEN}`;
    body = { sql, params };
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  let text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    console.error('D1 API error response:', data);
    throw new Error(`D1 query failed: ${res.status} ${res.statusText}`);
  }
  if (!data.success) {
    console.error('D1 API error response:', data);
    throw new Error('D1 error: ' + JSON.stringify(data));
  }
  return data.result;
}

async function importTable(table: string, file: string) {
  const filePath = path.join(CONTENT_DIR, file);
  const raw = await fs.readFile(filePath, 'utf8');
  const items = JSON.parse(raw);
  // Delete all existing rows
  await d1Exec(`DELETE FROM ${table}`);
  for (const item of items) {
    const keys = Object.keys(item);
    const cols = keys.map(k => k).join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(k => {
      const v = item[k];
      if (Array.isArray(v) || typeof v === 'object') {
        return v === null ? null : JSON.stringify(v);
      }
      return v;
    });
    await d1Exec(`INSERT INTO ${table} (${cols}) VALUES (${placeholders})`, values);
  }
  console.log(`Imported ${items.length} rows into ${table}`);
}

async function main() {
  for (const { name, file } of TABLES) {
    await importTable(name, file);
  }
  console.log('All content imported to D1.');
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});

// Usage:
//   LOCAL_D1=1 node scripts/dist/import-json-to-d1.js   (for local)
//   node scripts/dist/import-json-to-d1.js --local      (for local)
//   node scripts/dist/import-json-to-d1.js              (for remote)
