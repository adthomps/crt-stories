import test from 'node:test';
import assert from 'node:assert/strict';

import { onRequest as booksHandler } from '../functions/api/worker/books.ts';
import { onRequest as worldsHandler } from '../functions/api/worker/worlds.ts';
import { onRequest as seriesHandler } from '../functions/api/worker/series.ts';
import { onRequest as charactersHandler } from '../functions/api/worker/characters.ts';
import { onRequest as publicBooksHandler } from '../functions/api/public/books.ts';
import { onRequest as publicWorldsHandler } from '../functions/api/public/worlds.ts';
import { onRequest as publicSeriesHandler } from '../functions/api/public/series.ts';
import { onRequest as publicCharactersHandler } from '../functions/api/public/characters.ts';

class MockStatement {
  db: MockDb;
  sql: string;
  args: any[];

  constructor(db: MockDb, sql: string) {
    this.db = db;
    this.sql = sql;
    this.args = [];
  }

  bind(...args: any[]) {
    this.args = args;
    return this;
  }

  first() {
    return Promise.resolve(this.db.exec(this.sql, this.args, false, true));
  }

  all() {
    return Promise.resolve({ results: this.db.exec(this.sql, this.args, true, false) });
  }

  run() {
    this.db.exec(this.sql, this.args, false, false);
    return Promise.resolve({ success: true });
  }
}

class MockDb {
  tables: Record<string, any[]>;

  constructor() {
    this.tables = { books: [], worlds: [], series: [], characters: [] };
  }

  prepare(sql: string) {
    return new MockStatement(this, sql);
  }

  exec(sql: string, args: any[], expectAll = false, expectFirst = false) {
    const entity = ['books', 'worlds', 'series', 'characters'].find((t) => sql.includes(` ${t} `));
    if (!entity) throw new Error(`Unknown table: ${sql}`);

    if (sql.startsWith('SELECT * FROM books WHERE slug = ?')) {
      return this.tables.books.find((r) => r.slug === args[0] && !r.deleted_at) || null;
    }
    if (sql.startsWith('SELECT * FROM worlds WHERE slug = ?')) {
      return this.tables.worlds.find((r) => r.slug === args[0] && !r.deleted_at) || null;
    }
    if (sql.startsWith('SELECT * FROM series WHERE slug = ?')) {
      return this.tables.series.find((r) => r.slug === args[0] && !r.deleted_at) || null;
    }
    if (sql.startsWith('SELECT * FROM characters WHERE slug = ?')) {
      return this.tables.characters.find((r) => r.slug === args[0] && !r.deleted_at) || null;
    }

    if (sql.startsWith('SELECT * FROM books WHERE published = 1')) {
      return this.tables.books.filter((r) => !r.deleted_at && r.published === 1);
    }
    if (sql.startsWith('SELECT * FROM worlds WHERE published = 1')) {
      return this.tables.worlds.filter((r) => !r.deleted_at && r.published === 1);
    }
    if (sql.startsWith('SELECT * FROM series WHERE published = 1')) {
      return this.tables.series.filter((r) => !r.deleted_at && r.published === 1);
    }
    if (sql.startsWith('SELECT * FROM characters WHERE published = 1')) {
      return this.tables.characters.filter((r) => !r.deleted_at && r.published === 1);
    }

    if (sql.startsWith('SELECT * FROM books WHERE deleted_at IS NULL ORDER BY')) {
      return this.tables.books.filter((r) => !r.deleted_at);
    }
    if (sql.startsWith('SELECT * FROM worlds WHERE deleted_at IS NULL')) {
      return this.tables.worlds.filter((r) => !r.deleted_at);
    }
    if (sql.startsWith('SELECT * FROM series WHERE deleted_at IS NULL')) {
      return this.tables.series.filter((r) => !r.deleted_at);
    }
    if (sql.startsWith('SELECT * FROM characters WHERE deleted_at IS NULL')) {
      return this.tables.characters.filter((r) => !r.deleted_at);
    }

    if (sql.startsWith('SELECT slug FROM books WHERE world_slug = ?')) {
      const hit = this.tables.books.find((r) => r.world_slug === args[0] && !r.deleted_at);
      return hit ? { slug: hit.slug } : null;
    }
    if (sql.startsWith('SELECT slug FROM books WHERE series_slug = ?')) {
      const hit = this.tables.books.find((r) => r.series_slug === args[0] && !r.deleted_at);
      return hit ? { slug: hit.slug } : null;
    }
    if (sql.startsWith('SELECT slug FROM books WHERE characterSlugs LIKE ?')) {
      const pattern = String(args[0] || '').replaceAll('%', '');
      const hit = this.tables.books.find((r) => String(r.characterSlugs || '').includes(pattern) && !r.deleted_at);
      return hit ? { slug: hit.slug } : null;
    }
    if (sql.startsWith('SELECT slug, characterSlugs FROM books WHERE characterSlugs LIKE ?')) {
      const pattern = String(args[0] || '').replaceAll('%', '');
      return this.tables.books
        .filter((r) => String(r.characterSlugs || '').includes(pattern) && !r.deleted_at)
        .map((r) => ({ slug: r.slug, characterSlugs: r.characterSlugs }));
    }

    if (sql.startsWith('SELECT slug FROM worlds WHERE slug = ?')) {
      const hit = this.tables.worlds.find((r) => r.slug === args[0] && !r.deleted_at);
      return hit ? { slug: hit.slug } : null;
    }
    if (sql.startsWith('SELECT slug FROM series WHERE slug = ?')) {
      const hit = this.tables.series.find((r) => r.slug === args[0] && !r.deleted_at);
      return hit ? { slug: hit.slug } : null;
    }
    if (sql.startsWith('SELECT slug FROM books WHERE slug = ?')) {
      const hit = this.tables.books.find((r) => r.slug === args[0] && !r.deleted_at);
      return hit ? { slug: hit.slug } : null;
    }
    if (sql.startsWith('SELECT slug FROM characters WHERE slug = ?')) {
      const hit = this.tables.characters.find((r) => r.slug === args[0] && !r.deleted_at);
      return hit ? { slug: hit.slug } : null;
    }

    if (entity === 'books') return this.execBooks(sql, args);
    if (entity === 'worlds') return this.execWorlds(sql, args);
    if (entity === 'series') return this.execSeries(sql, args);
    if (entity === 'characters') return this.execCharacters(sql, args);

    throw new Error(`Unhandled SQL: ${sql}`);
  }

  execBooks(sql: string, args: any[]) {
    const table = this.tables.books;

    if (sql.startsWith('INSERT INTO books')) {
      const [slug, title, description, longDescription, cover_image, publish_date, badges, tags, formats, characterSlugs, world_slug, series_slug, excerpt, related, published] = args;
      table.push({
        slug,
        title,
        description,
        longDescription,
        cover_image,
        publish_date,
        badges,
        tags,
        formats,
        characterSlugs,
        world_slug,
        series_slug,
        excerpt,
        related,
        published,
        deleted_at: null,
      });
      return null;
    }

    if (sql.startsWith('UPDATE books SET title = ?')) {
      const [title, description, longDescription, cover_image, publish_date, badges, tags, formats, characterSlugs, world_slug, series_slug, excerpt, related, published, slug] = args;
      const row = table.find((r) => r.slug === slug && !r.deleted_at);
      if (row) {
        Object.assign(row, {
          title,
          description,
          longDescription,
          cover_image,
          publish_date,
          badges,
          tags,
          formats,
          characterSlugs,
          world_slug,
          series_slug,
          excerpt,
          related,
          published,
        });
      }
      return null;
    }

    if (sql.startsWith('UPDATE books SET world_slug = ""')) {
      table.filter((r) => r.world_slug === args[0] && !r.deleted_at).forEach((r) => (r.world_slug = ''));
      return null;
    }

    if (sql.startsWith('UPDATE books SET series_slug = ""')) {
      table.filter((r) => r.series_slug === args[0] && !r.deleted_at).forEach((r) => (r.series_slug = ''));
      return null;
    }

    if (sql.startsWith('UPDATE books SET characterSlugs = ?')) {
      const [characterSlugs, slug] = args;
      const row = table.find((r) => r.slug === slug && !r.deleted_at);
      if (row) row.characterSlugs = characterSlugs;
      return null;
    }

    if (sql.startsWith('UPDATE books SET deleted_at = datetime("now"), updated_at = datetime("now") WHERE world_slug = ?')) {
      table.filter((r) => r.world_slug === args[0] && !r.deleted_at).forEach((r) => (r.deleted_at = 'now'));
      return null;
    }

    if (sql.startsWith('UPDATE books SET deleted_at = datetime("now"), updated_at = datetime("now") WHERE series_slug = ?')) {
      table.filter((r) => r.series_slug === args[0] && !r.deleted_at).forEach((r) => (r.deleted_at = 'now'));
      return null;
    }

    if (sql.startsWith('UPDATE books SET deleted_at = datetime("now") WHERE slug = ?')) {
      const row = table.find((r) => r.slug === args[0] && !r.deleted_at);
      if (row) row.deleted_at = 'now';
      return null;
    }

    throw new Error(`Unhandled books SQL: ${sql}`);
  }

  execWorlds(sql: string, args: any[]) {
    const table = this.tables.worlds;

    if (sql.startsWith('INSERT INTO worlds')) {
      const [slug, title, description, published] = args;
      table.push({ slug, title, description, published, themeTags: '[]', bookSlugs: '[]', characterSlugs: '[]', deleted_at: null });
      return null;
    }

    if (sql.startsWith('UPDATE worlds SET title = ?')) {
      const [title, description, published, slug] = args;
      const row = table.find((r) => r.slug === slug && !r.deleted_at);
      if (row) Object.assign(row, { title, description, published });
      return null;
    }

    if (sql.startsWith('UPDATE worlds SET deleted_at = datetime("now") WHERE slug = ?')) {
      const row = table.find((r) => r.slug === args[0] && !r.deleted_at);
      if (row) row.deleted_at = 'now';
      return null;
    }

    throw new Error(`Unhandled worlds SQL: ${sql}`);
  }

  execSeries(sql: string, args: any[]) {
    const table = this.tables.series;

    if (sql.startsWith('INSERT INTO series')) {
      const [slug, title, description, longDescription, badges, tags, bookSlugs, published] = args;
      table.push({ slug, title, description, longDescription, badges, tags, bookSlugs, published, deleted_at: null });
      return null;
    }

    if (sql.startsWith('UPDATE series SET title = ?')) {
      const [title, description, longDescription, badges, tags, bookSlugs, published, slug] = args;
      const row = table.find((r) => r.slug === slug && !r.deleted_at);
      if (row) Object.assign(row, { title, description, longDescription, badges, tags, bookSlugs, published });
      return null;
    }

    if (sql.startsWith('UPDATE series SET deleted_at = datetime("now") WHERE slug = ?')) {
      const row = table.find((r) => r.slug === args[0] && !r.deleted_at);
      if (row) row.deleted_at = 'now';
      return null;
    }

    throw new Error(`Unhandled series SQL: ${sql}`);
  }

  execCharacters(sql: string, args: any[]) {
    const table = this.tables.characters;

    if (sql.startsWith('INSERT INTO characters')) {
      const [slug, name, bio, worldSlugs, seriesSlugs, appearsInBookSlugs, tags, roleTag, published] = args;
      table.push({ slug, name, bio, worldSlugs, seriesSlugs, appearsInBookSlugs, tags, roleTag, published, deleted_at: null });
      return null;
    }

    if (sql.startsWith('UPDATE characters SET name = ?')) {
      const [name, bio, worldSlugs, seriesSlugs, appearsInBookSlugs, tags, roleTag, published, slug] = args;
      const row = table.find((r) => r.slug === slug && !r.deleted_at);
      if (row) Object.assign(row, { name, bio, worldSlugs, seriesSlugs, appearsInBookSlugs, tags, roleTag, published });
      return null;
    }

    if (sql.startsWith('UPDATE characters SET deleted_at = datetime("now") WHERE slug = ?')) {
      const row = table.find((r) => r.slug === args[0] && !r.deleted_at);
      if (row) row.deleted_at = 'now';
      return null;
    }

    throw new Error(`Unhandled characters SQL: ${sql}`);
  }
}

function ctx(url: string, method = 'GET', body?: unknown, db?: MockDb, withAuth = true) {
  return {
    request: new Request(url, {
      method,
      headers: {
        ...(withAuth ? { cookie: 'worker_admin=1' } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    }),
    env: { CRT_STORIES_CONTENT: db },
  };
}

function publicCtx(url: string, db: MockDb) {
  return {
    request: new Request(url, { method: 'GET' }),
    env: { CRT_STORIES_CONTENT: db },
  };
}

test('books CRUD enforces one world and one series', async () => {
  const db = new MockDb();
  db.tables.worlds.push({ slug: 'world-a', title: 'World A', deleted_at: null });
  db.tables.worlds.push({ slug: 'world-b', title: 'World B', deleted_at: null });
  db.tables.series.push({ slug: 'series-a', title: 'Series A', deleted_at: null });
  db.tables.series.push({ slug: 'series-b', title: 'Series B', deleted_at: null });

  const missingWorld = await booksHandler(ctx('https://x/api/worker/books', 'POST', { slug: 'book-missing-world', title: 'Book Missing', seriesSlug: 'series-a' }, db));
  assert.equal(missingWorld.status, 400);

  const createRes = await booksHandler(
    ctx(
      'https://x/api/worker/books',
      'POST',
      { slug: 'book-a', title: 'Book A', description: 'Short', longDescription: 'Long alpha', worldSlug: 'world-a', seriesSlug: 'series-a', published: true },
      db,
    ),
  );
  assert.equal(createRes.status, 200);

  const getRes = await booksHandler(ctx('https://x/api/worker/books?slug=book-a', 'GET', undefined, db));
  assert.equal(getRes.status, 200);
  const r1: any = await getRes.json();
  assert.equal(r1.worldSlug, 'world-a');
  assert.deepEqual(r1.worldSlugs, ['world-a']);
  assert.equal(r1.seriesSlug, 'series-a');

  const updateRes = await booksHandler(
    ctx('https://x/api/worker/books', 'PUT', { slug: 'book-a', title: 'Book B', worldSlug: 'world-b', seriesSlug: 'series-b' }, db),
  );
  assert.equal(updateRes.status, 200);

  const getUpdated = await booksHandler(ctx('https://x/api/worker/books?slug=book-a', 'GET', undefined, db));
  const r2: any = await getUpdated.json();
  assert.equal(r2.title, 'Book B');
  assert.equal(r2.worldSlug, 'world-b');
  assert.equal(r2.seriesSlug, 'series-b');
});

test('world delete modes support restrict, detach, cascade', async () => {
  const db = new MockDb();
  db.tables.worlds.push({ slug: 'w1', title: 'World 1', deleted_at: null });
  db.tables.series.push({ slug: 's1', title: 'Series 1', deleted_at: null });
  db.tables.books.push({ slug: 'b1', title: 'Book 1', world_slug: 'w1', series_slug: 's1', characterSlugs: '[]', deleted_at: null });

  const restrictRes = await worldsHandler(ctx('https://x/api/worker/worlds', 'DELETE', { slug: 'w1', deleteMode: 'restrict' }, db));
  assert.equal(restrictRes.status, 409);

  const detachRes = await worldsHandler(ctx('https://x/api/worker/worlds', 'DELETE', { slug: 'w1', deleteMode: 'detach' }, db));
  assert.equal(detachRes.status, 200);
  assert.equal(db.tables.books[0].world_slug, '');

  db.tables.worlds.push({ slug: 'w2', title: 'World 2', deleted_at: null });
  db.tables.books.push({ slug: 'b2', title: 'Book 2', world_slug: 'w2', series_slug: 's1', characterSlugs: '[]', deleted_at: null });
  const cascadeRes = await worldsHandler(ctx('https://x/api/worker/worlds', 'DELETE', { slug: 'w2', deleteMode: 'cascade' }, db));
  assert.equal(cascadeRes.status, 200);
  const b2 = db.tables.books.find((b) => b.slug === 'b2');
  assert.equal(b2?.deleted_at, 'now');
});

test('series delete modes support restrict, detach, cascade', async () => {
  const db = new MockDb();
  db.tables.worlds.push({ slug: 'w1', title: 'World 1', deleted_at: null });
  db.tables.series.push({ slug: 's1', title: 'Series 1', deleted_at: null });
  db.tables.books.push({ slug: 'b1', title: 'Book 1', world_slug: 'w1', series_slug: 's1', characterSlugs: '[]', deleted_at: null });

  const restrictRes = await seriesHandler(ctx('https://x/api/worker/series', 'DELETE', { slug: 's1', deleteMode: 'restrict' }, db));
  assert.equal(restrictRes.status, 409);

  const detachRes = await seriesHandler(ctx('https://x/api/worker/series', 'DELETE', { slug: 's1', deleteMode: 'detach' }, db));
  assert.equal(detachRes.status, 200);
  assert.equal(db.tables.books[0].series_slug, '');

  db.tables.series.push({ slug: 's2', title: 'Series 2', deleted_at: null });
  db.tables.books.push({ slug: 'b2', title: 'Book 2', world_slug: 'w1', series_slug: 's2', characterSlugs: '[]', deleted_at: null });
  const cascadeRes = await seriesHandler(ctx('https://x/api/worker/series', 'DELETE', { slug: 's2', deleteMode: 'cascade' }, db));
  assert.equal(cascadeRes.status, 200);
  const b2 = db.tables.books.find((b) => b.slug === 'b2');
  assert.equal(b2?.deleted_at, 'now');
});

test('character delete supports detach mode', async () => {
  const db = new MockDb();
  db.tables.characters.push({ slug: 'c1', name: 'Char 1', worldSlugs: '[]', seriesSlugs: '[]', appearsInBookSlugs: '[]', tags: '[]', roleTag: '', deleted_at: null });
  db.tables.books.push({ slug: 'b1', title: 'Book 1', world_slug: '', series_slug: '', characterSlugs: '["c1","c2"]', deleted_at: null });

  const restrictRes = await charactersHandler(ctx('https://x/api/worker/characters', 'DELETE', { slug: 'c1', deleteMode: 'restrict' }, db));
  assert.equal(restrictRes.status, 409);

  const detachRes = await charactersHandler(ctx('https://x/api/worker/characters', 'DELETE', { slug: 'c1', deleteMode: 'detach' }, db));
  assert.equal(detachRes.status, 200);
  assert.equal(db.tables.books[0].characterSlugs, '["c2"]');
});

test('worker endpoints require auth cookie', async () => {
  const db = new MockDb();
  const res = await booksHandler(ctx('https://x/api/worker/books', 'GET', undefined, db, false));
  assert.equal(res.status, 401);
});

test('public endpoints are readable without auth and only return published rows', async () => {
  const db = new MockDb();

  db.tables.books.push({ slug: 'b-pub', title: 'Book Pub', badges: '[]', tags: '[]', formats: '[]', characterSlugs: '[]', world_slug: 'w-pub', series_slug: 's-pub', related: null, published: 1, deleted_at: null });
  db.tables.books.push({ slug: 'b-draft', title: 'Book Draft', badges: '[]', tags: '[]', formats: '[]', characterSlugs: '[]', world_slug: 'w-pub', series_slug: 's-pub', related: null, published: 0, deleted_at: null });

  db.tables.worlds.push({ slug: 'w-pub', title: 'World Pub', themeTags: '[]', bookSlugs: '[]', characterSlugs: '[]', published: 1, deleted_at: null });
  db.tables.worlds.push({ slug: 'w-draft', title: 'World Draft', themeTags: '[]', bookSlugs: '[]', characterSlugs: '[]', published: 0, deleted_at: null });

  db.tables.series.push({ slug: 's-pub', title: 'Series Pub', badges: '[]', tags: '[]', bookSlugs: '[]', published: 1, deleted_at: null });
  db.tables.series.push({ slug: 's-draft', title: 'Series Draft', badges: '[]', tags: '[]', bookSlugs: '[]', published: 0, deleted_at: null });

  db.tables.characters.push({ slug: 'c-pub', name: 'Char Pub', worldSlugs: '[]', seriesSlugs: '[]', appearsInBookSlugs: '[]', tags: '[]', published: 1, deleted_at: null });
  db.tables.characters.push({ slug: 'c-draft', name: 'Char Draft', worldSlugs: '[]', seriesSlugs: '[]', appearsInBookSlugs: '[]', tags: '[]', published: 0, deleted_at: null });

  const booksRes = await publicBooksHandler(publicCtx('https://x/api/public/books', db) as any);
  const worldsRes = await publicWorldsHandler(publicCtx('https://x/api/public/worlds', db) as any);
  const seriesRes = await publicSeriesHandler(publicCtx('https://x/api/public/series', db) as any);
  const charactersRes = await publicCharactersHandler(publicCtx('https://x/api/public/characters', db) as any);

  assert.equal(booksRes.status, 200);
  assert.equal(worldsRes.status, 200);
  assert.equal(seriesRes.status, 200);
  assert.equal(charactersRes.status, 200);

  const books = await booksRes.json() as any[];
  const worlds = await worldsRes.json() as any[];
  const series = await seriesRes.json() as any[];
  const characters = await charactersRes.json() as any[];

  assert.equal(books.length, 1);
  assert.equal(worlds.length, 1);
  assert.equal(series.length, 1);
  assert.equal(characters.length, 1);

  assert.equal(books[0].slug, 'b-pub');
  assert.equal(worlds[0].slug, 'w-pub');
  assert.equal(series[0].slug, 's-pub');
  assert.equal(characters[0].slug, 'c-pub');
});
