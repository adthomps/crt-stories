// Cloudflare Pages Function: /api/admin/worlds
import { z } from 'zod';

const WorldSchema = z.object({
	slug: z.string().regex(/^[a-z0-9-]+$/),
	title: z.string().min(1),
	description: z.string().optional(),
	image: z.string().optional(),
	history: z.string().optional(),
	geography: z.string().optional(),
	published: z.boolean().optional(),
});

async function verifyAccess(request: Request): Promise<string | null> {
	const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
	if (!jwt) return null;
	return 'admin@example.com';
}

export const onRequest: PagesFunction = async (context) => {
	const { request, env } = context;
	const method = request.method.toUpperCase();
	const adminEmail = await verifyAccess(request);
	if (!adminEmail) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

	if (method === 'POST') {
		const body = await request.json();
		const parse = WorldSchema.safeParse(body);
		if (!parse.success) {
			return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.errors }), { status: 400 });
		}
		const { slug, title, description, image, history, geography, published } = parse.data;
		const existing = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
		if (existing) {
			return new Response(JSON.stringify({ error: 'Slug already exists' }), { status: 409 });
		}
		await env.CRT_STORIES_CONTENT.prepare(
			'INSERT INTO worlds (slug, title, description, image, history, geography, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))'
		).bind(slug, title, description ?? '', image ?? '', history ?? '', geography ?? '', published ? 1 : 0).run();
		await env.CRT_STORIES_CONTENT.prepare(
			'INSERT INTO audit_log (admin_email, action, entity_type, details) VALUES (?, ?, ?, ?)' 
		).bind(adminEmail, 'create', 'worlds', JSON.stringify({ slug, title })).run();
		await env.CRT_STORIES_CONTENT.prepare(
			'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
		).run();
		return new Response(JSON.stringify({ ok: true }), { status: 201 });
	}

	if (method === 'GET') {
		const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM worlds WHERE deleted_at IS NULL').all();
		return new Response(JSON.stringify(rows.results), { status: 200 });
	}

	if (method === 'PUT') {
		const body = await request.json();
		const parse = WorldSchema.partial().extend({ slug: z.string() }).safeParse(body);
		if (!parse.success) {
			return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.errors }), { status: 400 });
		}
		const { slug, title, description, image, history, geography, published } = parse.data;
		const result = await env.CRT_STORIES_CONTENT.prepare(
			'UPDATE worlds SET title = COALESCE(?, title), description = COALESCE(?, description), image = COALESCE(?, image), history = COALESCE(?, history), geography = COALESCE(?, geography), published = COALESCE(?, published), updated_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
		).bind(title, description, image, history, geography, typeof published === 'boolean' ? (published ? 1 : 0) : undefined, slug).run();
		if (result.changes === 0) {
			return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404 });
		}
		await env.CRT_STORIES_CONTENT.prepare(
			'INSERT INTO audit_log (admin_email, action, entity_type, details) VALUES (?, ?, ?, ?)' 
		).bind(adminEmail, 'update', 'worlds', JSON.stringify({ slug, title })).run();
		await env.CRT_STORIES_CONTENT.prepare(
			'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
		).run();
		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	}

	if (method === 'DELETE') {
		const body = await request.json();
		const { slug } = body;
		if (!slug) {
			return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
		}
		const result = await env.CRT_STORIES_CONTENT.prepare(
			'UPDATE worlds SET deleted_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
		).bind(slug).run();
		if (result.changes === 0) {
			return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404 });
		}
		await env.CRT_STORIES_CONTENT.prepare(
			'INSERT INTO audit_log (admin_email, action, entity_type, details) VALUES (?, ?, ?, ?)' 
		).bind(adminEmail, 'delete', 'worlds', JSON.stringify({ slug })).run();
		await env.CRT_STORIES_CONTENT.prepare(
			'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
		).run();
		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	}

	return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
};
// Cloudflare Pages Function: /api/admin/worlds
// Scaffold for CRUD and publish/unpublish endpoints for worlds
export {};
