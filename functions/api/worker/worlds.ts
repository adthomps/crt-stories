import type { PagesFunction } from 'vite-plugin-cloudflare-pages';

function parseJsonArray<T>(value: unknown): T[] {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function toWorldDto(world: any) {
  return {
    ...world,
    themeTags: parseJsonArray<string>(world.themeTags),
    bookSlugs: parseJsonArray<string>(world.bookSlugs),
    characterSlugs: parseJsonArray<string>(world.characterSlugs),
  };
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
        const world = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
        if (!world) {
          return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify(toWorldDto(world)), { headers: { 'Content-Type': 'application/json' } });
      }

      const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM worlds WHERE deleted_at IS NULL').all();
      const results = rows.results.map((world: any) => toWorldDto(world));
      return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
    }

    const { requireWorkerAdminAuth } = await import('./requireAuth.ts');
    const authResponse = await requireWorkerAdminAuth(request);
    if (authResponse) return authResponse;

    const body = await request.json();

    if (method === 'POST') {
      const { slug, title, description = '', published = false } = body as { slug?: string; title?: string; description?: string; published?: boolean };
      if (!slug || !title) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
      if (exists) {
        return new Response(JSON.stringify({ error: 'World with this slug already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }
      await env.CRT_STORIES_CONTENT.prepare('INSERT INTO worlds (slug, title, description, published, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))')
        .bind(slug, title, description, published ? 1 : 0).run();
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (method === 'PUT') {
      const { slug, title, description = '', published = false } = body as { slug?: string; title?: string; description?: string; published?: boolean };
      if (!slug || !title) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
      if (!exists) {
        return new Response(JSON.stringify({ error: 'World not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      await env.CRT_STORIES_CONTENT.prepare('UPDATE worlds SET title = ?, description = ?, published = ?, updated_at = datetime("now") WHERE slug = ? AND deleted_at IS NULL')
        .bind(title, description, published ? 1 : 0, slug).run();
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (method === 'DELETE') {
      const { slug } = body as { slug?: string };
      if (!slug) {
        return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
      if (!exists) {
        return new Response(JSON.stringify({ error: 'World not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      const linkedBook = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM books WHERE world_slug = ? AND deleted_at IS NULL LIMIT 1').bind(slug).first();
      if (linkedBook) {
        return new Response(JSON.stringify({ error: 'Cannot delete world while books still reference it' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }
      await env.CRT_STORIES_CONTENT.prepare('UPDATE worlds SET deleted_at = datetime("now") WHERE slug = ? AND deleted_at IS NULL').bind(slug).run();
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Worlds API error:', err);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
