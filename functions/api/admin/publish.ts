// Cloudflare Pages Function: /api/admin/publish
import { z } from 'zod';

const PublishSchema = z.object({
	entity: z.enum(['series', 'books', 'worlds', 'characters']),
	slug: z.string().regex(/^[a-z0-9-]+$/),
});



export const onRequest: PagesFunction = async (context) => {
	const { request, env } = context;


	if (request.method !== 'POST') {
		return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
	}

	const body = await request.json();
	const parse = PublishSchema.safeParse(body);
	if (!parse.success) {
		return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.errors }), { status: 400 });
	}
	const { entity, slug } = parse.data;

	// Update published status
	const result = await env.CRT_STORIES_CONTENT.prepare(
		`UPDATE ${entity} SET published = 1, updated_at = datetime('now') WHERE slug = ? AND deleted_at IS NULL`
	).bind(slug).run();
	if (result.changes === 0) {
		return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404 });
	}

	// Optionally, remove audit log or set admin_email to NULL or a placeholder

	// Set export_state.needs_export = 1
	await env.CRT_STORIES_CONTENT.prepare(
		'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
	).run();

	return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
// Cloudflare Pages Function: /api/admin/publish
// Scaffold for publish endpoint (generic)
export {};
