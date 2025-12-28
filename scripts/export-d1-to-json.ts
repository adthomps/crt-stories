import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const CONTENT_FILES = [
  { table: 'series', file: 'series.json' },
  { table: 'books', file: 'books.json' },
  { table: 'worlds', file: 'worlds.json' },
  { table: 'characters', file: 'characters.json' },
];

const CONTENT_DIR = path.join(__dirname, '../src/content');

function log(msg: string) {
  // eslint-disable-next-line no-console
  console.log(`[export-d1-to-json] ${msg}`);
}

function getEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env: ${name}`);
  return val;
}

async function d1Query(sql: string, params: any[] = []) {
  const CF_API_TOKEN = getEnv('CF_API_TOKEN');
  const CF_ACCOUNT_ID = getEnv('CF_ACCOUNT_ID');
  const D1_DATABASE_ID = getEnv('D1_DATABASE_ID');
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  });
  if (!res.ok) {
    throw new Error(`D1 query failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!data.result) throw new Error('No result from D1');
  return data.result;
}

async function ensureExportStateRow() {
  // Try to select row; if missing, insert it
  const rows = await d1Query('SELECT * FROM export_state WHERE id=1');
  if (rows.length === 0) {
    log('export_state row missing, initializing...');
    await d1Query(
      "INSERT INTO export_state (id, needs_export, updated_at) VALUES (1, 0, datetime('now'))"
    );
    return { needs_export: 0 };
  }
  return rows[0];
}

async function getExportState() {
  const row = await ensureExportStateRow();
  return row;
}

async function setExportState(needsExport: number) {
  await d1Query(
    'UPDATE export_state SET needs_export = ?, updated_at = datetime(\'now\') WHERE id = 1',
    [needsExport]
  );
}

async function fetchPublished(table: string) {
  // Only fetch published records
  const rows = await d1Query(`SELECT * FROM ${table} WHERE published = 1`);
  return rows;
}

function stableStringify(obj: any) {
  // Sort arrays of objects by slug if present, else by id
  if (Array.isArray(obj)) {
    return JSON.stringify(
      obj.slice().sort((a, b) => {
        if (a.slug && b.slug) return a.slug.localeCompare(b.slug);
        if (a.id && b.id) return String(a.id).localeCompare(String(b.id));
        return 0;
      }),
      null,
      2
    );
  }
  return JSON.stringify(obj, null, 2);
}

function readFileIfExists(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

async function main() {
  log('Starting export...');
  let exportState;
  try {
    exportState = await getExportState();
  } catch (err) {
    log(`Error reading export_state: ${(err as Error).message}`);
    process.exit(1);
  }
  if (!exportState || exportState.needs_export === 0) {
    log('No export needed. Exiting.');
    return;
  }
  let anyChanged = false;
  for (const { table, file } of CONTENT_FILES) {
    log(`Exporting ${table}...`);
    const rows = await fetchPublished(table);
    // TODO: Map DB rows to JSON schema if needed
    const json = stableStringify(rows);
    const filePath = path.join(CONTENT_DIR, file);
    const prev = readFileIfExists(filePath);
    if (prev !== json) {
      fs.writeFileSync(filePath, json, 'utf8');
      log(`Wrote ${file}`);
      anyChanged = true;
    } else {
      log(`${file} unchanged.`);
    }
  }
  if (anyChanged) {
    await setExportState(0);
    log('Export complete. Reset needs_export to 0.');
  } else {
    log('No files changed. Leaving needs_export as-is.');
  }
}

main().catch((err) => {
  log(`Fatal error: ${(err as Error).stack}`);
  process.exit(1);
});
