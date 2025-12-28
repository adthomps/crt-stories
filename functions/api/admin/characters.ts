// Cloudflare Pages Function: /api/admin/characters
import { z } from 'zod';

const CharacterSchema = z.object({
	slug: z.string().regex(/^[a-z0-9-]+$/),
	name: z.string().min(1),
	title: z.string().optional(),
	description: z.string().optional(),
	image: z.string().optional(),
	backstory: z.string().optional(),
	abilities: z.string().optional(),
	world_slug: z.string().optional(),
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
		const parse = CharacterSchema.safeParse(body);
		if (!parse.success) {
			return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.errors }), { status: 400 });
		}
		const { slug, name, title, description, image, backstory, abilities, world_slug, published } = parse.data;
		const existing = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM characters WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
		if (existing) {
			return new Response(JSON.stringify({ error: 'Slug already exists' }), { status: 409 });
		}
		await env.CRT_STORIES_CONTENT.prepare(
			'INSERT INTO characters (slug, name, title, description, image, backstory, abilities, world_slug, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))'
		).bind(slug, name, title ?? '', description ?? '', image ?? '', backstory ?? '', abilities ?? '', world_slug ?? '', published ? 1 : 0).run();
		await env.CRT_STORIES_CONTENT.prepare(
			'INSERT INTO audit_log (admin_email, action, entity_type, details) VALUES (?, ?, ?, ?)' 
		).bind(adminEmail, 'create', 'characters', JSON.stringify({ slug, name })).run();
		await env.CRT_STORIES_CONTENT.prepare(
			'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
		).run();
		return new Response(JSON.stringify({ ok: true }), { status: 201 });
	}

	if (method === 'GET') {
		const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM characters WHERE deleted_at IS NULL').all();
		return new Response(JSON.stringify(rows.results), { status: 200 });
	}

	if (method === 'PUT') {
		const body = await request.json();
		const parse = CharacterSchema.partial().extend({ slug: z.string() }).safeParse(body);
		if (!parse.success) {
			return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.errors }), { status: 400 });
		}
		const { slug, name, title, description, image, backstory, abilities, world_slug, published } = parse.data;
		const result = await env.CRT_STORIES_CONTENT.prepare(
			'UPDATE characters SET name = COALESCE(?, name), title = COALESCE(?, title), description = COALESCE(?, description), image = COALESCE(?, image), backstory = COALESCE(?, backstory), abilities = COALESCE(?, abilities), world_slug = COALESCE(?, world_slug), published = COALESCE(?, published), updated_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
		).bind(name, title, description, image, backstory, abilities, world_slug, typeof published === 'boolean' ? (published ? 1 : 0) : undefined, slug).run();
		if (result.changes === 0) {
			return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404 });
		}
		await env.CRT_STORIES_CONTENT.prepare(
			'INSERT INTO audit_log (admin_email, action, entity_type, details) VALUES (?, ?, ?, ?)' 
		).bind(adminEmail, 'update', 'characters', JSON.stringify({ slug, name })).run();
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
			'UPDATE characters SET deleted_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
		).bind(slug).run();
		if (result.changes === 0) {
			return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404 });
		}
		await env.CRT_STORIES_CONTENT.prepare(
			'INSERT INTO audit_log (admin_email, action, entity_type, details) VALUES (?, ?, ?, ?)' 
		).bind(adminEmail, 'delete', 'characters', JSON.stringify({ slug })).run();
		await env.CRT_STORIES_CONTENT.prepare(
			'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
		).run();
		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	}

	return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
};
// Cloudflare Pages Function: /api/admin/characters
// Scaffold for CRUD and publish/unpublish endpoints for characters
export {};
