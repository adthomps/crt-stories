import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const CONTENT_FILES = [
  {
    table: 'series',
    file: 'series.json',
    map: (rows: any[]) => rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      description: row.description,
      published: !!row.published,
      // Add more fields as needed
    })),
  },
  {
    table: 'books',
    file: 'books.json',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // @ts-ignore
    map: (rows: any[], { seriesMap, bookCharactersMap, booksByWorld, relatedBooks }: {
      seriesMap: Record<string, any>,
      bookCharactersMap?: any,
      booksByWorld: Record<string, string[]>,
      relatedBooks: Record<string, any>
    }) => rows.map((row: any) => ({
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle || null,
      description: row.description,
      longDescription: row.longDescription || null,
      coverImage: row.cover_image,
      publishDate: row.publish_date,
      status: row.status || null,
      author: row.author || null,
      worldSlug: row.world_slug || null,
      series: seriesMap[row.series_id] || null,
      formats: row.formats ? JSON.parse(row.formats) : [],
      links: row.links ? JSON.parse(row.links) : {},
      excerpt: row.excerpt || null,
      audioExcerpt: row.audio_excerpt || null,
      related: relatedBooks[row.slug] || {},
      badges: row.badges ? JSON.parse(row.badges) : [],
      tags: row.tags ? JSON.parse(row.tags) : [],
      ogImage: row.og_image || null,
      amazonUrl: row.amazon_url || null,
      kindleUrl: row.kindle_url || null,
    })),
  },
  {
    table: 'worlds',
    file: 'worlds.json',
    map: (rows: any[], { booksByWorld }: { booksByWorld: Record<string, string[]> }) => rows.map((row: any) => ({
      slug: row.slug,
      title: row.title,
      description: row.description,
      summary: row.summary || null,
      heroImage: row.hero_image,
      heroImageCaption: row.hero_image_caption || null,
      image1: row.image1 || null,
      image1Caption: row.image1_caption || null,
      image2: row.image2 || null,
      image2Caption: row.image2_caption || null,
      image3: row.image3 || null,
      image3Caption: row.image3_caption || null,
      themeTags: row.theme_tags ? JSON.parse(row.theme_tags) : [],
      bookSlugs: booksByWorld[row.slug] || [],
      startHereBookSlug: row.start_here_book_slug || null,
    })),
  },
  {
    table: 'characters',
    file: 'characters.json',
    map: (rows: any[], { appearsInBookSlugsMap }: { appearsInBookSlugsMap: Record<string, string[]> }) => rows.map((row: any) => ({
      slug: row.slug,
      name: row.name,
      roleTag: row.role_tag || null,
      bio: row.bio || null,
      worldSlug: row.world_slug || null,
      appearsInBookSlugs: appearsInBookSlugsMap[row.slug] || [],
      portraitImage: row.portrait_image,
      tags: row.tags ? JSON.parse(row.tags) : [],
      audioExcerpt: row.audio_excerpt || null,
    })),
  },
  { table: 'book_characters', file: 'book_characters.json', map: (rows: any[]) => rows.map(({ book_id, character_id }: any) => ({ book_id, character_id })) },
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
  const CF_API_TOKEN = getEnv('CLOUDFLARE_API_TOKEN');
  const CF_ACCOUNT_ID = getEnv('CLOUDFLARE_ACCOUNT_ID');
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
  const typedData = data as { result: any };
  if (!typedData.result) throw new Error('No result from D1');
  return typedData.result;
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

// @ts-ignore
async function fetchPublished(table: string) {
  if (table === 'book_characters') {
    // Export all relationships, not just published
    return await d1Query('SELECT book_id, character_id FROM book_characters');
  }
  // Only fetch published records
  return await d1Query(`SELECT * FROM ${table} WHERE published = 1 AND deleted_at IS NULL`);
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
  // Fetch all data needed for mapping
  const [seriesRows, booksRows, worldsRows, charactersRows, bookCharactersRows] = await Promise.all([
    d1Query('SELECT * FROM series WHERE published = 1 AND deleted_at IS NULL'),
    d1Query('SELECT * FROM books WHERE published = 1 AND deleted_at IS NULL'),
    d1Query('SELECT * FROM worlds WHERE published = 1 AND deleted_at IS NULL'),
    d1Query('SELECT * FROM characters WHERE published = 1 AND deleted_at IS NULL'),
    d1Query('SELECT * FROM book_characters'),
  ]);

  // Build relationship maps
  const seriesMap: Record<string, any> = Object.fromEntries(seriesRows.map((s: any) => [s.id, { id: s.slug, name: s.title, bookNumber: null }]));
  const booksByWorld: Record<string, string[]> = {};
  booksRows.forEach((b: any) => {
    if (b.world_slug) {
      if (!booksByWorld[b.world_slug]) booksByWorld[b.world_slug] = [];
      booksByWorld[b.world_slug].push(b.slug);
    }
  });
  Object.keys(booksByWorld).forEach((k) => booksByWorld[k].sort());

  // Related books (prequel/next/previous)
  const relatedBooks: Record<string, any> = {};
  booksRows.forEach((b: any) => {
    relatedBooks[b.slug] = {
      prequelSlug: b.prequel_slug || null,
      nextSlug: b.next_slug || null,
      previousSlug: b.previous_slug || null,
    };
  });

  // Characters: appearsInBookSlugs
  const appearsInBookSlugsMap: Record<string, string[]> = {};
  bookCharactersRows.forEach((rel: any) => {
    if (!appearsInBookSlugsMap[rel.character_id]) appearsInBookSlugsMap[rel.character_id] = [];
    appearsInBookSlugsMap[rel.character_id].push(rel.book_id);
  });
  Object.keys(appearsInBookSlugsMap).forEach((k) => appearsInBookSlugsMap[k].sort());

  // Compose export data
  const exportContext = { seriesMap, booksByWorld, relatedBooks, appearsInBookSlugsMap };

  for (const { table, file, map } of CONTENT_FILES) {
    log(`Exporting ${table}...`);
    let rows;
    switch (table) {
      case 'series': rows = seriesRows; break;
      case 'books': rows = booksRows; break;
      case 'worlds': rows = worldsRows; break;
      case 'characters': rows = charactersRows; break;
      case 'book_characters': rows = bookCharactersRows; break;
      default: rows = [];
    }
    const mapped = map ? map(rows, exportContext) : rows;
    const json = stableStringify(mapped);
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
