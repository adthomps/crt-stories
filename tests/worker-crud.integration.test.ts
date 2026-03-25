import test from 'node:test';
import assert from 'node:assert/strict';

import { onRequest as booksHandler } from '../functions/api/worker/books.ts';
import { onRequest as worldsHandler } from '../functions/api/worker/worlds.ts';
import { onRequest as seriesHandler } from '../functions/api/worker/series.ts';
import { onRequest as charactersHandler } from '../functions/api/worker/characters.ts';

class MockStatement {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql;
    this.args = [];
  }
  bind(...args) {
    this.args = args;
    return this;
  }
  first() {
    return Promise.resolve(this.db.exec(this.sql, this.args));
  }
  all() {
    return Promise.resolve({ results: this.db.exec(this.sql, this.args, true) });
  }
  run() {
    this.db.exec(this.sql, this.args, false);
    return Promise.resolve({ success: true });
  }
}

class MockDb {
  constructor() {
    this.tables = { books: [], worlds: [], series: [], characters: [] };
  }
  prepare(sql) {
    return new MockStatement(this, sql);
  }
  exec(sql, args, expectAll = false) {
    const entity = ['books', 'worlds', 'series', 'characters'].find((t) => sql.includes(` ${t} `));
    if (!entity) throw new Error(`Unknown table: ${sql}`);
    const table = this.tables[entity];

    if (sql.startsWith('SELECT *') && sql.includes('slug = ?')) return table.find((r) => r.slug === args[0] && !r.deleted_at) || null;
    if (sql.startsWith('SELECT *') && sql.includes('ORDER BY')) return table.filter((r) => !r.deleted_at);
    if (sql.startsWith('SELECT *')) return table.filter((r) => !r.deleted_at);
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
    if (sql.startsWith('SELECT slug')) {
      const hit = table.find((r) => r.slug === args[0] && !r.deleted_at);
      return hit ? { slug: hit.slug } : null;
    }

    if (entity === 'books') return this.execBooks(sql, args);
    if (entity === 'worlds') return this.execWorlds(sql, args);
    if (entity === 'series') return this.execSeries(sql, args);
    if (entity === 'characters') return this.execCharacters(sql, args);

    throw new Error(`Unhandled SQL: ${sql}`);
  }
  execBooks(sql, args) {
    const table = this.tables.books;
    if (sql.startsWith('INSERT INTO books')) {
      const [slug, title, description, longDescription, cover_image, publish_date, badges, tags, formats, characterSlugs, world_slug, series_slug, excerpt, related, published] = args;
      table.push({ slug, title, description, longDescription, cover_image, publish_date, badges, tags, formats, characterSlugs, world_slug, series_slug, excerpt, related, published, deleted_at: null });
      return null;
    }
    if (sql.startsWith('UPDATE books SET title')) {
      const [title, description, longDescription, cover_image, publish_date, badges, tags, formats, characterSlugs, world_slug, series_slug, excerpt, related, published, slug] = args;
      const row = table.find((r) => r.slug === slug && !r.deleted_at);
      Object.assign(row, { title, description, longDescription, cover_image, publish_date, badges, tags, formats, characterSlugs, world_slug, series_slug, excerpt, related, published });
      return null;
    }
    if (sql.startsWith('UPDATE books SET deleted_at')) {
      const row = table.find((r) => r.slug === args[0] && !r.deleted_at);
      if (row) row.deleted_at = 'now';
      return null;
    }
    throw new Error(`Unhandled books SQL: ${sql}`);
  }
  execWorlds(sql, args) {
    const table = this.tables.worlds;
    if (sql.startsWith('INSERT INTO worlds')) {
      const [slug, title, description, published] = args;
      table.push({ slug, title, description, published, themeTags: '[]', bookSlugs: '[]', characterSlugs: '[]', deleted_at: null });
      return null;
    }
    if (sql.startsWith('UPDATE worlds SET title')) {
      const [title, description, published, slug] = args;
      Object.assign(table.find((r) => r.slug === slug && !r.deleted_at), { title, description, published });
      return null;
    }
    if (sql.startsWith('UPDATE worlds SET deleted_at')) {
      const row = table.find((r) => r.slug === args[0] && !r.deleted_at);
      if (row) row.deleted_at = 'now';
      return null;
    }
    throw new Error(`Unhandled worlds SQL: ${sql}`);
  }
  execSeries(sql, args) {
    const table = this.tables.series;
    if (sql.startsWith('INSERT INTO series')) {
      const [slug, title, description, longDescription, badges, tags, bookSlugs, published] = args;
      table.push({ slug, title, description, longDescription, badges, tags, bookSlugs, published, deleted_at: null });
      return null;
    }
    if (sql.startsWith('UPDATE series SET title')) {
      const [title, description, longDescription, badges, tags, bookSlugs, published, slug] = args;
      Object.assign(table.find((r) => r.slug === slug && !r.deleted_at), { title, description, longDescription, badges, tags, bookSlugs, published });
      return null;
    }
    if (sql.startsWith('UPDATE series SET deleted_at')) {
      const row = table.find((r) => r.slug === args[0] && !r.deleted_at);
      if (row) row.deleted_at = 'now';
      return null;
    }
    throw new Error(`Unhandled series SQL: ${sql}`);
  }
  execCharacters(sql, args) {
    const table = this.tables.characters;
    if (sql.startsWith('INSERT INTO characters')) {
      const [slug, name, bio, worldSlugs, seriesSlugs, appearsInBookSlugs, tags, roleTag, published] = args;
      table.push({ slug, name, bio, worldSlugs, seriesSlugs, appearsInBookSlugs, tags, roleTag, published, deleted_at: null });
      return null;
    }
    if (sql.startsWith('UPDATE characters SET name')) {
      const [name, bio, worldSlugs, seriesSlugs, appearsInBookSlugs, tags, roleTag, published, slug] = args;
      Object.assign(table.find((r) => r.slug === slug && !r.deleted_at), { name, bio, worldSlugs, seriesSlugs, appearsInBookSlugs, tags, roleTag, published });
      return null;
    }
    if (sql.startsWith('UPDATE characters SET deleted_at')) {
      const row = table.find((r) => r.slug === args[0] && !r.deleted_at);
      if (row) row.deleted_at = 'now';
      return null;
    }
    throw new Error(`Unhandled characters SQL: ${sql}`);
  }
}

function ctx(url, method = 'GET', body, db, withAuth = true) {
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

test('books CRUD round-trip', async () => {
  const db = new MockDb();
  db.tables.worlds.push({ slug: 'world-a', title: 'World A', themeTags: '[]', bookSlugs: '[]', characterSlugs: '[]', deleted_at: null });
  db.tables.worlds.push({ slug: 'world-b', title: 'World B', themeTags: '[]', bookSlugs: '[]', characterSlugs: '[]', deleted_at: null });
  db.tables.series.push({ slug: 'series-a', title: 'Series A', badges: '[]', tags: '[]', bookSlugs: '[]', deleted_at: null });
  db.tables.series.push({ slug: 'series-b', title: 'Series B', badges: '[]', tags: '[]', bookSlugs: '[]', deleted_at: null });
  assert.equal((await booksHandler(ctx('https://x/api/worker/books', 'POST', { slug: 'book-a', title: 'Book A', description: 'Short', longDescription: 'Long alpha', worldSlugs: ['world-a'], seriesSlugs: ['series-a'] }, db))).status, 200);
  const r1 = await (await booksHandler(ctx('https://x/api/worker/books?slug=book-a', 'GET', undefined, db))).json();
  assert.deepEqual(r1.worldSlugs, ['world-a']);
  assert.equal(r1.longDescription, 'Long alpha');
  assert.equal((await booksHandler(ctx('https://x/api/worker/books', 'PUT', { slug: 'book-a', title: 'Book B', longDescription: 'Long beta', worldSlugs: ['world-b'], seriesSlugs: ['series-b'] }, db))).status, 200);
  const r2 = await (await booksHandler(ctx('https://x/api/worker/books?slug=book-a', 'GET', undefined, db))).json();
  assert.equal(r2.title, 'Book B');
  assert.deepEqual(r2.worldSlugs, ['world-b']);
  assert.equal(r2.longDescription, 'Long beta');
  assert.equal((await booksHandler(ctx('https://x/api/worker/books', 'DELETE', { slug: 'book-a' }, db))).status, 200);
  assert.equal((await booksHandler(ctx('https://x/api/worker/books?slug=book-a', 'GET', undefined, db))).status, 404);
});

test('worlds CRUD round-trip', async () => {
  const db = new MockDb();
  assert.equal((await worldsHandler(ctx('https://x/api/worker/worlds', 'POST', { slug: 'world-a', title: 'World A' }, db))).status, 200);
  const r1 = await (await worldsHandler(ctx('https://x/api/worker/worlds?slug=world-a', 'GET', undefined, db))).json();
  assert.equal(r1.slug, 'world-a');
  assert.equal((await worldsHandler(ctx('https://x/api/worker/worlds', 'PUT', { slug: 'world-a', title: 'World B' }, db))).status, 200);
  const r2 = await (await worldsHandler(ctx('https://x/api/worker/worlds?slug=world-a', 'GET', undefined, db))).json();
  assert.equal(r2.title, 'World B');
  assert.equal((await worldsHandler(ctx('https://x/api/worker/worlds', 'DELETE', { slug: 'world-a' }, db))).status, 200);
  assert.equal((await worldsHandler(ctx('https://x/api/worker/worlds?slug=world-a', 'GET', undefined, db))).status, 404);
});

test('series CRUD round-trip', async () => {
  const db = new MockDb();
  db.tables.books.push({ slug: 'b1', title: 'Book 1', deleted_at: null });
  db.tables.books.push({ slug: 'b2', title: 'Book 2', deleted_at: null });
  assert.equal((await seriesHandler(ctx('https://x/api/worker/series', 'POST', { slug: 'series-a', title: 'Series A', bookSlugs: ['b1'] }, db))).status, 200);
  const r1 = await (await seriesHandler(ctx('https://x/api/worker/series?slug=series-a', 'GET', undefined, db))).json();
  assert.deepEqual(r1.bookSlugs, ['b1']);
  assert.equal((await seriesHandler(ctx('https://x/api/worker/series', 'PUT', { slug: 'series-a', title: 'Series B', bookSlugs: ['b2'] }, db))).status, 200);
  const r2 = await (await seriesHandler(ctx('https://x/api/worker/series?slug=series-a', 'GET', undefined, db))).json();
  assert.deepEqual(r2.bookSlugs, ['b2']);
  assert.equal((await seriesHandler(ctx('https://x/api/worker/series', 'DELETE', { slug: 'series-a' }, db))).status, 200);
  assert.equal((await seriesHandler(ctx('https://x/api/worker/series?slug=series-a', 'GET', undefined, db))).status, 404);
});

test('characters CRUD round-trip', async () => {
  const db = new MockDb();
  db.tables.worlds.push({ slug: 'world-a', title: 'World A', themeTags: '[]', bookSlugs: '[]', characterSlugs: '[]', deleted_at: null });
  db.tables.worlds.push({ slug: 'world-b', title: 'World B', themeTags: '[]', bookSlugs: '[]', characterSlugs: '[]', deleted_at: null });
  assert.equal((await charactersHandler(ctx('https://x/api/worker/characters', 'POST', { slug: 'char-a', name: 'A', bio: 'bio', worldSlugs: ['world-a'], roleTag: 'Hero' }, db))).status, 200);
  const r1 = await (await charactersHandler(ctx('https://x/api/worker/characters?slug=char-a', 'GET', undefined, db))).json();
  assert.equal(r1.bio, 'bio');
  assert.deepEqual(r1.worldSlugs, ['world-a']);
  assert.equal(r1.roleTag, 'Hero');
  assert.equal((await charactersHandler(ctx('https://x/api/worker/characters', 'PUT', { slug: 'char-a', name: 'B', bio: 'bio2', worldSlugs: ['world-b'], roleTag: 'Lead' }, db))).status, 200);
  const r2 = await (await charactersHandler(ctx('https://x/api/worker/characters?slug=char-a', 'GET', undefined, db))).json();
  assert.equal(r2.name, 'B');
  assert.deepEqual(r2.worldSlugs, ['world-b']);
  assert.equal((await charactersHandler(ctx('https://x/api/worker/characters', 'DELETE', { slug: 'char-a' }, db))).status, 200);
  assert.equal((await charactersHandler(ctx('https://x/api/worker/characters?slug=char-a', 'GET', undefined, db))).status, 404);
});


test('public GET endpoints remain readable without auth cookie', async () => {
  const db = new MockDb();
  db.tables.books.push({ slug: 'b', title: 'Book', longDescription: 'Long', badges: '[]', tags: '[]', formats: '[]', characterSlugs: '[]', world_slug: '', series_slug: '', deleted_at: null });
  db.tables.worlds.push({ slug: 'w', title: 'World', themeTags: '[]', bookSlugs: '[]', characterSlugs: '[]', deleted_at: null });
  db.tables.series.push({ slug: 's', title: 'Series', badges: '[]', tags: '[]', bookSlugs: '[]', deleted_at: null });
  db.tables.characters.push({ slug: 'c', name: 'Char', bio: '', worldSlugs: '[]', seriesSlugs: '[]', appearsInBookSlugs: '[]', tags: '[]', roleTag: 'Lead', deleted_at: null });

  assert.equal((await booksHandler(ctx('https://x/api/worker/books', 'GET', undefined, db, false))).status, 200);
  assert.equal((await worldsHandler(ctx('https://x/api/worker/worlds', 'GET', undefined, db, false))).status, 200);
  assert.equal((await seriesHandler(ctx('https://x/api/worker/series', 'GET', undefined, db, false))).status, 200);
  assert.equal((await charactersHandler(ctx('https://x/api/worker/characters', 'GET', undefined, db, false))).status, 200);
});

test('delete guards prevent removing linked world/series/character', async () => {
  const db = new MockDb();
  db.tables.worlds.push({ slug: 'w1', title: 'World 1', themeTags: '[]', bookSlugs: '[]', characterSlugs: '[]', deleted_at: null });
  db.tables.series.push({ slug: 's1', title: 'Series 1', badges: '[]', tags: '[]', bookSlugs: '[]', deleted_at: null });
  db.tables.characters.push({ slug: 'c1', name: 'Char 1', bio: '', worldSlugs: '[]', seriesSlugs: '[]', appearsInBookSlugs: '[]', tags: '[]', roleTag: '', deleted_at: null });
  db.tables.books.push({ slug: 'b1', title: 'Book 1', world_slug: 'w1', series_slug: 's1', characterSlugs: '[\"c1\"]', deleted_at: null });

  assert.equal((await worldsHandler(ctx('https://x/api/worker/worlds', 'DELETE', { slug: 'w1' }, db))).status, 409);
  assert.equal((await seriesHandler(ctx('https://x/api/worker/series', 'DELETE', { slug: 's1' }, db))).status, 409);
  assert.equal((await charactersHandler(ctx('https://x/api/worker/characters', 'DELETE', { slug: 'c1' }, db))).status, 409);
});
