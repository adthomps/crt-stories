// Cloudflare Pages Function: /api/admin/publish
import { z } from 'zod';

const PublishSchema = z.object({
	entity: z.enum(['series', 'books', 'worlds', 'characters']),
	slug: z.string().regex(/^[a-z0-9-]+$/),
});

async function verifyAccess(request: Request): Promise<string | null> {
	const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
	if (!jwt) return null;
	return 'admin@example.com';
}

export const onRequest: PagesFunction = async (context) => {
	const { request, env } = context;
	const adminEmail = await verifyAccess(request);
	if (!adminEmail) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

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

	// Audit log
	await env.CRT_STORIES_CONTENT.prepare(
		'INSERT INTO audit_log (admin_email, action, entity_type, details) VALUES (?, ?, ?, ?)' 
	).bind(adminEmail, 'publish', entity, JSON.stringify({ slug })).run();

	// Set export_state.needs_export = 1
	await env.CRT_STORIES_CONTENT.prepare(
		'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
	).run();

	return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
// Cloudflare Pages Function: /api/admin/publish
// Scaffold for publish endpoint (generic)
export {};
