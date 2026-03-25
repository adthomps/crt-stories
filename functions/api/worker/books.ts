// Cloudflare Pages Function: /api/worker/books
import type { PagesFunction } from 'vite-plugin-cloudflare-pages';

type BookPayload = {
  slug?: string;
  title?: string;
  description?: string;
  longDescription?: string;
  coverImage?: string;
  publishDate?: string;
  badges?: string[];
  tags?: string[];
  formats?: Array<{ type: string; label: string; url: string }>;
  characterSlugs?: string[];
  worldSlugs?: string[];
  seriesSlugs?: string[];
  excerpt?: string;
  related?: Record<string, unknown> | null;
  published?: boolean;
};

function parseJsonArray<T>(value: unknown): T[] {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function parseJsonObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function toBookDto(book: any) {
  const worldSlugs = Array.isArray(book.worldSlugs)
    ? book.worldSlugs
    : book.world_slug
      ? [book.world_slug]
      : [];
  const seriesSlugs = Array.isArray(book.seriesSlugs)
    ? book.seriesSlugs
    : book.series_slug
      ? [book.series_slug]
      : [];

  return {
    ...book,
    coverImage: book.cover_image,
    publishDate: book.publish_date,
    badges: parseJsonArray<string>(book.badges),
    tags: parseJsonArray<string>(book.tags),
    formats: parseJsonArray<{ type: string; label: string; url: string }>(book.formats),
    characterSlugs: parseJsonArray<string>(book.characterSlugs),
    worldSlugs,
    seriesSlugs,
    related: parseJsonObject(book.related),
  };
}

function normalizeBookPayload(body: BookPayload) {
  const worldSlugs = Array.isArray(body.worldSlugs) ? body.worldSlugs.filter(Boolean) : [];
  const seriesSlugs = Array.isArray(body.seriesSlugs) ? body.seriesSlugs.filter(Boolean) : [];
  return {
    slug: body.slug || '',
    title: body.title || '',
    description: body.description || '',
    longDescription: body.longDescription || '',
    coverImage: body.coverImage || '',
    publishDate: body.publishDate || '',
    badges: Array.isArray(body.badges) ? body.badges : [],
    tags: Array.isArray(body.tags) ? body.tags : [],
    formats: Array.isArray(body.formats) ? body.formats : [],
    characterSlugs: Array.isArray(body.characterSlugs) ? body.characterSlugs : [],
    worldSlugs,
    seriesSlugs,
    excerpt: body.excerpt || '',
    related: body.related || null,
    published: !!body.published,
  };
}

async function ensureSlugExists(env: any, table: 'worlds' | 'series' | 'characters', slug: string): Promise<boolean> {
  const row = await env.CRT_STORIES_CONTENT.prepare(`SELECT slug FROM ${table} WHERE slug = ? AND deleted_at IS NULL`).bind(slug).first();
  return !!row;
}

async function validateBookRelations(env: any, payload: ReturnType<typeof normalizeBookPayload>): Promise<string | null> {
  for (const worldSlug of payload.worldSlugs) {
    const ok = await ensureSlugExists(env, 'worlds', worldSlug);
    if (!ok) return `Invalid world slug: ${worldSlug}`;
  }
  for (const seriesSlug of payload.seriesSlugs) {
    const ok = await ensureSlugExists(env, 'series', seriesSlug);
    if (!ok) return `Invalid series slug: ${seriesSlug}`;
  }
  for (const characterSlug of payload.characterSlugs) {
    const ok = await ensureSlugExists(env, 'characters', characterSlug);
    if (!ok) return `Invalid character slug: ${characterSlug}`;
  }
  return null;
}

export const onRequest: PagesFunction = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  try {
    if (method === 'GET') {
      const slug = url.searchParams.get('slug');
      if (slug) {
        const book = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
        if (!book) {
          return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify(toBookDto(book)), { headers: { 'Content-Type': 'application/json' } });
      }

      const books = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM books WHERE deleted_at IS NULL ORDER BY title COLLATE NOCASE ASC').all();
      const results = books.results.map((book: any) => toBookDto(book));
      return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
    }

    const { requireWorkerAdminAuth } = await import('./requireAuth.ts');
    const authResponse = await requireWorkerAdminAuth(request);
    if (authResponse) return authResponse;

    const body = await request.json();
    const payload = normalizeBookPayload(body as BookPayload);

    if (method === 'POST') {
      if (!payload.slug || !payload.title) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const relationError = await validateBookRelations(env, payload);
      if (relationError) {
        return new Response(JSON.stringify({ error: relationError }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM books WHERE slug = ? AND deleted_at IS NULL').bind(payload.slug).first();
      if (exists) {
        return new Response(JSON.stringify({ error: 'Book with this slug already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }
      await env.CRT_STORIES_CONTENT.prepare('INSERT INTO books (slug, title, description, longDescription, cover_image, publish_date, badges, tags, formats, characterSlugs, world_slug, series_slug, excerpt, related, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))')
        .bind(
          payload.slug,
          payload.title,
          payload.description,
          payload.longDescription,
          payload.coverImage,
          payload.publishDate,
          JSON.stringify(payload.badges),
          JSON.stringify(payload.tags),
          JSON.stringify(payload.formats),
          JSON.stringify(payload.characterSlugs),
          payload.worldSlugs[0] || '',
          payload.seriesSlugs[0] || '',
          payload.excerpt,
          payload.related ? JSON.stringify(payload.related) : null,
          payload.published ? 1 : 0
        ).run();
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (method === 'PUT') {
      if (!payload.slug || !payload.title) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const relationError = await validateBookRelations(env, payload);
      if (relationError) {
        return new Response(JSON.stringify({ error: relationError }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM books WHERE slug = ? AND deleted_at IS NULL').bind(payload.slug).first();
      if (!exists) {
        return new Response(JSON.stringify({ error: 'Book not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      await env.CRT_STORIES_CONTENT.prepare('UPDATE books SET title = ?, description = ?, longDescription = ?, cover_image = ?, publish_date = ?, badges = ?, tags = ?, formats = ?, characterSlugs = ?, world_slug = ?, series_slug = ?, excerpt = ?, related = ?, published = ?, updated_at = datetime("now") WHERE slug = ? AND deleted_at IS NULL')
        .bind(
          payload.title,
          payload.description,
          payload.longDescription,
          payload.coverImage,
          payload.publishDate,
          JSON.stringify(payload.badges),
          JSON.stringify(payload.tags),
          JSON.stringify(payload.formats),
          JSON.stringify(payload.characterSlugs),
          payload.worldSlugs[0] || '',
          payload.seriesSlugs[0] || '',
          payload.excerpt,
          payload.related ? JSON.stringify(payload.related) : null,
          payload.published ? 1 : 0,
          payload.slug
        ).run();
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (method === 'DELETE') {
      const { slug } = body as { slug?: string };
      if (!slug) {
        return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
      if (!exists) {
        return new Response(JSON.stringify({ error: 'Book not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      await env.CRT_STORIES_CONTENT.prepare('UPDATE books SET deleted_at = datetime("now") WHERE slug = ? AND deleted_at IS NULL').bind(slug).run();
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Books API error:', err);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
