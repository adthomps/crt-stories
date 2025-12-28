// Cloudflare Pages Function: /api/admin/books
import { z } from 'zod';

const BookSchema = z.object({
	slug: z.string().regex(/^[a-z0-9-]+$/),
	title: z.string().min(1),
	description: z.string().optional(),
	cover_image: z.string().optional(),
	publish_date: z.string().optional(),
	amazon_url: z.string().optional(),
	kindle_url: z.string().optional(),
	excerpt: z.string().optional(),
	world_slug: z.string().optional(),
	series_id: z.number().optional(),
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
		const parse = BookSchema.safeParse(body);
		if (!parse.success) {
			return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.errors }), { status: 400 });
		}
		const { slug, title, description, cover_image, publish_date, amazon_url, kindle_url, excerpt, world_slug, series_id, published } = parse.data;
		const existing = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
		if (existing) {
			return new Response(JSON.stringify({ error: 'Slug already exists' }), { status: 409 });
		}
		await env.CRT_STORIES_CONTENT.prepare(
			'INSERT INTO books (slug, title, description, cover_image, publish_date, amazon_url, kindle_url, excerpt, world_slug, series_id, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))'
		).bind(slug, title, description ?? '', cover_image ?? '', publish_date ?? '', amazon_url ?? '', kindle_url ?? '', excerpt ?? '', world_slug ?? '', series_id ?? null, published ? 1 : 0).run();
		await env.CRT_STORIES_CONTENT.prepare(
			'INSERT INTO audit_log (admin_email, action, entity_type, details) VALUES (?, ?, ?, ?)' 
		).bind(adminEmail, 'create', 'books', JSON.stringify({ slug, title })).run();
		await env.CRT_STORIES_CONTENT.prepare(
			'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
		).run();
		return new Response(JSON.stringify({ ok: true }), { status: 201 });
	}

	if (method === 'GET') {
		const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM books WHERE deleted_at IS NULL').all();
		return new Response(JSON.stringify(rows.results), { status: 200 });
	}

	if (method === 'PUT') {
		const body = await request.json();
		const parse = BookSchema.partial().extend({ slug: z.string() }).safeParse(body);
		if (!parse.success) {
			return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.errors }), { status: 400 });
		}
		const { slug, title, description, cover_image, publish_date, amazon_url, kindle_url, excerpt, world_slug, series_id, published } = parse.data;
		const result = await env.CRT_STORIES_CONTENT.prepare(
			'UPDATE books SET title = COALESCE(?, title), description = COALESCE(?, description), cover_image = COALESCE(?, cover_image), publish_date = COALESCE(?, publish_date), amazon_url = COALESCE(?, amazon_url), kindle_url = COALESCE(?, kindle_url), excerpt = COALESCE(?, excerpt), world_slug = COALESCE(?, world_slug), series_id = COALESCE(?, series_id), published = COALESCE(?, published), updated_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
		).bind(title, description, cover_image, publish_date, amazon_url, kindle_url, excerpt, world_slug, series_id, typeof published === 'boolean' ? (published ? 1 : 0) : undefined, slug).run();
		if (result.changes === 0) {
			return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404 });
		}
		await env.CRT_STORIES_CONTENT.prepare(
			'INSERT INTO audit_log (admin_email, action, entity_type, details) VALUES (?, ?, ?, ?)' 
		).bind(adminEmail, 'update', 'books', JSON.stringify({ slug, title })).run();
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
			'UPDATE books SET deleted_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
		).bind(slug).run();
		if (result.changes === 0) {
			return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404 });
		}
		await env.CRT_STORIES_CONTENT.prepare(
			'INSERT INTO audit_log (admin_email, action, entity_type, details) VALUES (?, ?, ?, ?)' 
		).bind(adminEmail, 'delete', 'books', JSON.stringify({ slug })).run();
		await env.CRT_STORIES_CONTENT.prepare(
			'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
		).run();
		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	}

	return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
};
// Cloudflare Pages Function: /api/admin/books
// Scaffold for CRUD and publish/unpublish endpoints for books
export {};
