import type { PagesFunction } from 'vite-plugin-cloudflare-pages';

type CharacterPayload = {
  slug?: string;
  name?: string;
  bio?: string;
  worldSlugs?: string[];
  seriesSlugs?: string[];
  appearsInBookSlugs?: string[];
  tags?: string[];
  roleTag?: string;
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

function toCharacterDto(character: any) {
  const worldSlugs = parseJsonArray<string>(character.worldSlugs);
  return {
    ...character,
    bio: character.bio || '',
    worldSlugs,
    seriesSlugs: parseJsonArray<string>(character.seriesSlugs),
    appearsInBookSlugs: parseJsonArray<string>(character.appearsInBookSlugs),
    tags: parseJsonArray<string>(character.tags),
    roleTag: typeof character.roleTag === 'string' ? character.roleTag : '',
  };
}

function normalizeCharacterPayload(body: CharacterPayload) {
  return {
    slug: body.slug || '',
    name: body.name || '',
    bio: body.bio || '',
    worldSlugs: Array.isArray(body.worldSlugs) ? body.worldSlugs.filter(Boolean) : [],
    seriesSlugs: Array.isArray(body.seriesSlugs) ? body.seriesSlugs.filter(Boolean) : [],
    appearsInBookSlugs: Array.isArray(body.appearsInBookSlugs) ? body.appearsInBookSlugs.filter(Boolean) : [],
    tags: Array.isArray(body.tags) ? body.tags : [],
    roleTag: body.roleTag || '',
    published: !!body.published,
  };
}

async function ensureEntitySlugExists(env: any, table: 'worlds' | 'series' | 'books', slug: string): Promise<boolean> {
  const row = await env.CRT_STORIES_CONTENT.prepare(`SELECT slug FROM ${table} WHERE slug = ? AND deleted_at IS NULL`).bind(slug).first();
  return !!row;
}

async function validateCharacterRelations(env: any, payload: ReturnType<typeof normalizeCharacterPayload>): Promise<string | null> {
  for (const worldSlug of payload.worldSlugs) {
    const ok = await ensureEntitySlugExists(env, 'worlds', worldSlug);
    if (!ok) return `Invalid world slug: ${worldSlug}`;
  }
  for (const seriesSlug of payload.seriesSlugs) {
    const ok = await ensureEntitySlugExists(env, 'series', seriesSlug);
    if (!ok) return `Invalid series slug: ${seriesSlug}`;
  }
  for (const bookSlug of payload.appearsInBookSlugs) {
    const ok = await ensureEntitySlugExists(env, 'books', bookSlug);
    if (!ok) return `Invalid book slug: ${bookSlug}`;
  }
  return null;
}

export const onRequest: PagesFunction = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  try {
    const { requireWorkerAdminAuth } = await import('./requireAuth.ts');
    const authResponse = await requireWorkerAdminAuth(request);
    if (authResponse) return authResponse;

    if (method === 'GET') {
      const slug = url.searchParams.get('slug');
      if (slug) {
        const character = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM characters WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
        if (!character) {
          return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify(toCharacterDto(character)), { headers: { 'Content-Type': 'application/json' } });
      }

      const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM characters WHERE deleted_at IS NULL').all();
      const results = rows.results.map((character: any) => toCharacterDto(character));
      return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
    }

    const { requireWorkerAdminAuth } = await import('./requireAuth.ts');
    const authResponse = await requireWorkerAdminAuth(request);
    if (authResponse) return authResponse;

    const body = await request.json();
    const payload = normalizeCharacterPayload(body as CharacterPayload);

    if (method === 'POST') {
      if (!payload.slug || !payload.name) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const relationError = await validateCharacterRelations(env, payload);
      if (relationError) {
        return new Response(JSON.stringify({ error: relationError }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM characters WHERE slug = ? AND deleted_at IS NULL').bind(payload.slug).first();
      if (exists) {
        return new Response(JSON.stringify({ error: 'Character with this slug already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }
      await env.CRT_STORIES_CONTENT.prepare('INSERT INTO characters (slug, name, bio, worldSlugs, seriesSlugs, appearsInBookSlugs, tags, roleTag, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))')
        .bind(
          payload.slug,
          payload.name,
          payload.bio,
          JSON.stringify(payload.worldSlugs),
          JSON.stringify(payload.seriesSlugs),
          JSON.stringify(payload.appearsInBookSlugs),
          JSON.stringify(payload.tags),
          payload.roleTag,
          payload.published ? 1 : 0
        ).run();
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (method === 'PUT') {
      if (!payload.slug || !payload.name) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const relationError = await validateCharacterRelations(env, payload);
      if (relationError) {
        return new Response(JSON.stringify({ error: relationError }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM characters WHERE slug = ? AND deleted_at IS NULL').bind(payload.slug).first();
      if (!exists) {
        return new Response(JSON.stringify({ error: 'Character not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      await env.CRT_STORIES_CONTENT.prepare('UPDATE characters SET name = ?, bio = ?, worldSlugs = ?, seriesSlugs = ?, appearsInBookSlugs = ?, tags = ?, roleTag = ?, published = ?, updated_at = datetime("now") WHERE slug = ? AND deleted_at IS NULL')
        .bind(
          payload.name,
          payload.bio,
          JSON.stringify(payload.worldSlugs),
          JSON.stringify(payload.seriesSlugs),
          JSON.stringify(payload.appearsInBookSlugs),
          JSON.stringify(payload.tags),
          payload.roleTag,
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
      const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM characters WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
      if (!exists) {
        return new Response(JSON.stringify({ error: 'Character not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      const linkedBook = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM books WHERE characterSlugs LIKE ? AND deleted_at IS NULL LIMIT 1').bind(`%\"${slug}\"%`).first();
      if (linkedBook) {
        return new Response(JSON.stringify({ error: 'Cannot delete character while books still reference it' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }
      await env.CRT_STORIES_CONTENT.prepare('UPDATE characters SET deleted_at = datetime("now") WHERE slug = ? AND deleted_at IS NULL').bind(slug).run();
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Characters API error:', err);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
