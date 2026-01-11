import { z } from 'zod';

// Schema for validation (adjust as needed to match DB)
const WorldSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  published: z.boolean().optional(),
  bookSlugs: z.array(z.string()).optional(),
  characterSlugs: z.array(z.string()).optional(),
});

export const onRequest: PagesFunction = async (context) => {
  const { request, env } = context;
  const method = request.method.toUpperCase();

  if (method === 'POST' || method === 'PUT') {
    let data;
    try {
      data = await request.json();
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const result = WorldSchema.safeParse(data);
    if (!result.success) {
      return new Response(JSON.stringify({ error: 'Validation failed', details: result.error.errors }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const { slug, title, description, published, bookSlugs, characterSlugs } = result.data;
    const now = new Date().toISOString();
    if (method === 'POST') {
      // Create new world
      await env.CRT_STORIES_CONTENT.prepare(
        `INSERT INTO worlds (slug, title, description, published, bookSlugs, characterSlugs, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`
      ).bind(
        slug,
        title,
        description || '',
        published ? 1 : 0,
        JSON.stringify(bookSlugs || []),
        JSON.stringify(characterSlugs || []),
        now,
        now
      ).run();
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    } else {
      // Update existing world
      await env.CRT_STORIES_CONTENT.prepare(
        `UPDATE worlds SET title = ?, description = ?, published = ?, bookSlugs = ?, characterSlugs = ?, updated_at = ? WHERE slug = ? AND deleted_at IS NULL`
      ).bind(
        title,
        description || '',
        published ? 1 : 0,
        JSON.stringify(bookSlugs || []),
        JSON.stringify(characterSlugs || []),
        now,
        slug
      ).run();
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (method === 'DELETE') {
    let data;
    try {
      data = await request.json();
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const { slug } = data;
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const now = new Date().toISOString();
    await env.CRT_STORIES_CONTENT.prepare(
      `UPDATE worlds SET deleted_at = ? WHERE slug = ? AND deleted_at IS NULL`
    ).bind(now, slug).run();
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
};

/**
 * API Documentation
 *
 * POST /api/admin/worlds
 *   - Create a new world
 *   - Body: { slug, title, description?, published?, bookSlugs?, characterSlugs? }
 *   - Returns: { success: true } or { error }
 *
 * PUT /api/admin/worlds
 *   - Update an existing world (by slug)
 *   - Body: { slug, title, description?, published?, bookSlugs?, characterSlugs? }
 *   - Returns: { success: true } or { error }
 *
 * DELETE /api/admin/worlds
 *   - Soft-delete a world (by slug)
 *   - Body: { slug }
 *   - Returns: { success: true } or { error }
 *
 * All fields are validated. Arrays are stored as JSON. Timestamps are updated. Deleted worlds are not returned by public endpoints.
 */
