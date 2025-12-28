// Cloudflare Pages Function: /api/admin/series
import { z } from 'zod';

const SeriesSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().optional(),
  published: z.boolean().optional(),
});

async function verifyAccess(request: Request): Promise<string | null> {
  // Cloudflare Access JWT verification (pseudo-code)
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) return null;
  // TODO: Validate JWT and extract admin email
  // For now, return a placeholder
  return 'admin@example.com';
}

export const onRequest: PagesFunction = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  const adminEmail = await verifyAccess(request);
  if (!adminEmail) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  // CRUD: Create (POST), Read (GET), Update (PUT), Delete (DELETE)
  if (method === 'POST') {
    const body = await request.json();
    const parse = SeriesSchema.safeParse(body);
    if (!parse.success) {
      return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.errors }), { status: 400 });
    }
    const { slug, title, description, published } = parse.data;
    // Unique slug check
    const existing = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM series WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
    if (existing) {
      return new Response(JSON.stringify({ error: 'Slug already exists' }), { status: 409 });
    }
    // Insert series
    await env.CRT_STORIES_CONTENT.prepare(
      'INSERT INTO series (slug, title, description, published, created_at, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))'
    ).bind(slug, title, description ?? '', published ? 1 : 0).run();
    // Audit log
    await env.CRT_STORIES_CONTENT.prepare(
      'INSERT INTO audit_log (admin_email, action, entity_type, details) VALUES (?, ?, ?, ?)' 
    ).bind(adminEmail, 'create', 'series', JSON.stringify({ slug, title })).run();
    // Set export_state.needs_export = 1
    await env.CRT_STORIES_CONTENT.prepare(
      'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
    ).run();
    return new Response(JSON.stringify({ ok: true }), { status: 201 });
  }

  if (method === 'GET') {
    // List all (not deleted)
    const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM series WHERE deleted_at IS NULL').all();
    return new Response(JSON.stringify(rows.results), { status: 200 });
  }

  if (method === 'PUT') {
    // Update by slug (require slug in body)
    const body = await request.json();
    const parse = SeriesSchema.partial().extend({ slug: z.string() }).safeParse(body);
    if (!parse.success) {
      return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.errors }), { status: 400 });
    }
    const { slug, title, description, published } = parse.data;
    // Update
    const result = await env.CRT_STORIES_CONTENT.prepare(
      'UPDATE series SET title = COALESCE(?, title), description = COALESCE(?, description), published = COALESCE(?, published), updated_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
    ).bind(title, description, typeof published === 'boolean' ? (published ? 1 : 0) : undefined, slug).run();
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404 });
    }
    // Audit log
    await env.CRT_STORIES_CONTENT.prepare(
      'INSERT INTO audit_log (admin_email, action, entity_type, details) VALUES (?, ?, ?, ?)' 
    ).bind(adminEmail, 'update', 'series', JSON.stringify({ slug, title })).run();
    // Set export_state.needs_export = 1
    await env.CRT_STORIES_CONTENT.prepare(
      'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
    ).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  if (method === 'DELETE') {
    // Soft delete by slug (require slug in body)
    const body = await request.json();
    const { slug } = body;
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
    }
    const result = await env.CRT_STORIES_CONTENT.prepare(
      'UPDATE series SET deleted_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
    ).bind(slug).run();
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404 });
    }
    // Audit log
    await env.CRT_STORIES_CONTENT.prepare(
      'INSERT INTO audit_log (admin_email, action, entity_type, details) VALUES (?, ?, ?, ?)' 
    ).bind(adminEmail, 'delete', 'series', JSON.stringify({ slug })).run();
    // Set export_state.needs_export = 1
    await env.CRT_STORIES_CONTENT.prepare(
      'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
    ).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  // Not allowed
  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
};
