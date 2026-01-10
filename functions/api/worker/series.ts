import { z } from 'zod';
import type { PagesFunction } from '@cloudflare/workers-types';

const SeriesSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().optional(),
  bookSlugs: z.array(z.string()).optional(),
  worldSlugs: z.array(z.string()).optional(),
  characterSlugs: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export const onRequest: PagesFunction = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  try {
    if (method === 'POST') {
      const body = await request.json();
      const parse = SeriesSchema.safeParse(body);
      if (!parse.success) {
        return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.issues }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const { slug, title, description, bookSlugs, worldSlugs, characterSlugs, published } = parse.data;
      const existing = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM series WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
      if (existing) {
        return new Response(JSON.stringify({ error: 'Slug already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }
      await env.CRT_STORIES_CONTENT.prepare(
        'INSERT INTO series (slug, title, description, published, created_at, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))'
      ).bind(slug, title, description ?? '', published ? 1 : 0).run();
      const series = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM series WHERE slug = ?').bind(slug).first();
      // Insert join tables
      if (Array.isArray(bookSlugs)) {
        for (const b of bookSlugs) {
          const book = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM books WHERE slug = ?').bind(b).first();
          if (book) {
            await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO book_series (book_id, series_id) VALUES (?, ?)').bind(book.id, series.id).run();
          }
        }
      }
      if (Array.isArray(worldSlugs)) {
        for (const w of worldSlugs) {
          const world = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM worlds WHERE slug = ?').bind(w).first();
          if (world) {
            await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO world_series (world_id, series_id) VALUES (?, ?)').bind(world.id, series.id).run();
          }
        }
      }
      if (Array.isArray(characterSlugs)) {
        for (const c of characterSlugs) {
          const character = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM characters WHERE slug = ?').bind(c).first();
          if (character) {
            await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO character_series (character_id, series_id) VALUES (?, ?)').bind(character.id, series.id).run();
          }
        }
      }
      await env.CRT_STORIES_CONTENT.prepare(
        'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
      ).run();
      return new Response(JSON.stringify({ ok: true }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    }

    if (method === 'GET') {
      const slug = url.searchParams.get('slug');
      if (slug) {
        const series = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM series WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
        if (!series) {
          return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }
        // Fetch related arrays
        const [bookRows, worldRows, characterRows] = await Promise.all([
          env.CRT_STORIES_CONTENT.prepare('SELECT b.slug FROM book_series bs JOIN books b ON bs.book_id = b.id WHERE bs.series_id = ?').bind(series.id).all(),
          env.CRT_STORIES_CONTENT.prepare('SELECT w.slug FROM world_series ws JOIN worlds w ON ws.world_id = w.id WHERE ws.series_id = ?').bind(series.id).all(),
          env.CRT_STORIES_CONTENT.prepare('SELECT c.slug FROM character_series cs JOIN characters c ON cs.character_id = c.id WHERE cs.series_id = ?').bind(series.id).all(),
        ]);
        series.bookSlugs = bookRows.results.map((r: { slug: string }) => r.slug);
        series.worldSlugs = worldRows.results.map((r: { slug: string }) => r.slug);
        series.characterSlugs = characterRows.results.map((r: { slug: string }) => r.slug);
        return new Response(JSON.stringify(series), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } else {
        const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM series WHERE deleted_at IS NULL').all();
        // For each series, fetch related arrays
        const results = await Promise.all(rows.results.map(async (series: any) => {
          const [bookRows, worldRows, characterRows] = await Promise.all([
            env.CRT_STORIES_CONTENT.prepare('SELECT b.slug FROM book_series bs JOIN books b ON bs.book_id = b.id WHERE bs.series_id = ?').bind(series.id).all(),
            env.CRT_STORIES_CONTENT.prepare('SELECT w.slug FROM world_series ws JOIN worlds w ON ws.world_id = w.id WHERE ws.series_id = ?').bind(series.id).all(),
            env.CRT_STORIES_CONTENT.prepare('SELECT c.slug FROM character_series cs JOIN characters c ON cs.character_id = c.id WHERE cs.series_id = ?').bind(series.id).all(),
          ]);
          series.bookSlugs = bookRows.results.map((r: { slug: string }) => r.slug);
          series.worldSlugs = worldRows.results.map((r: { slug: string }) => r.slug);
          series.characterSlugs = characterRows.results.map((r: { slug: string }) => r.slug);
          return series;
        }));
        return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (method === 'PUT') {
      const body = await request.json();
      const parse = SeriesSchema.partial().extend({ slug: z.string() }).safeParse(body);
      if (!parse.success) {
        return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.issues }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const { slug, title, description, bookSlugs, worldSlugs, characterSlugs, published } = parse.data;
      const series = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM series WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
      if (!series) {
        return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      await env.CRT_STORIES_CONTENT.prepare(
        'UPDATE series SET title = COALESCE(?, title), description = COALESCE(?, description), published = COALESCE(?, published), updated_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
      ).bind(title, description, typeof published === 'boolean' ? (published ? 1 : 0) : undefined, slug).run();
      // Update join tables: remove all, then re-insert
      await env.CRT_STORIES_CONTENT.prepare('DELETE FROM book_series WHERE series_id = ?').bind(series.id).run();
      await env.CRT_STORIES_CONTENT.prepare('DELETE FROM world_series WHERE series_id = ?').bind(series.id).run();
      await env.CRT_STORIES_CONTENT.prepare('DELETE FROM character_series WHERE series_id = ?').bind(series.id).run();
      if (Array.isArray(bookSlugs)) {
        for (const b of bookSlugs) {
          const book = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM books WHERE slug = ?').bind(b).first();
          if (book) {
            await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO book_series (book_id, series_id) VALUES (?, ?)').bind(book.id, series.id).run();
          }
        }
      }
      if (Array.isArray(worldSlugs)) {
        for (const w of worldSlugs) {
          const world = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM worlds WHERE slug = ?').bind(w).first();
          if (world) {
            await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO world_series (world_id, series_id) VALUES (?, ?)').bind(world.id, series.id).run();
          }
        }
      }
      if (Array.isArray(characterSlugs)) {
        for (const c of characterSlugs) {
          const character = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM characters WHERE slug = ?').bind(c).first();
          if (character) {
            await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO character_series (character_id, series_id) VALUES (?, ?)').bind(character.id, series.id).run();
          }
        }
      }
      await env.CRT_STORIES_CONTENT.prepare(
        'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
      ).run();
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (method === 'DELETE') {
      const body = await request.json();
      const { slug } = body;
      if (!slug) {
        return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const series = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM series WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
      if (!series) {
        return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      await env.CRT_STORIES_CONTENT.prepare(
        'UPDATE series SET deleted_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
      ).bind(slug).run();
      // Remove join table entries
      await env.CRT_STORIES_CONTENT.prepare('DELETE FROM book_series WHERE series_id = ?').bind(series.id).run();
      await env.CRT_STORIES_CONTENT.prepare('DELETE FROM world_series WHERE series_id = ?').bind(series.id).run();
      await env.CRT_STORIES_CONTENT.prepare('DELETE FROM character_series WHERE series_id = ?').bind(series.id).run();
      await env.CRT_STORIES_CONTENT.prepare(
        'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
      ).run();
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Series API error:', err);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
