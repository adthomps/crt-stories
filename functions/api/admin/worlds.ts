
import { z } from 'zod';


const WorldSchema = z.object({
	slug: z.string().regex(/^[a-z0-9-]+$/),
	title: z.string().min(1),
	description: z.string().optional(),
	published: z.boolean().optional(),
});

export const onRequest: PagesFunction = async (context) => {
	const { request, env } = context;
	const url = new URL(request.url);
	const method = request.method.toUpperCase();


	try {
		if (method === 'POST') {
			const body = await request.json();
			const parse = WorldSchema.safeParse(body);
			if (!parse.success) {
				return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.errors }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const { slug, title, description, published } = parse.data;
			const existing = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
			if (existing) {
				return new Response(JSON.stringify({ error: 'Slug already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
			}
			await env.CRT_STORIES_CONTENT.prepare(
				'INSERT INTO worlds (slug, title, description, published, created_at, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))'
			).bind(slug, title, description ?? '', published ? 1 : 0).run();
			// Optionally, remove audit log or set admin_email to NULL or a placeholder
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
			).run();
			return new Response(JSON.stringify({ ok: true }), { status: 201, headers: { 'Content-Type': 'application/json' } });
		}

		if (method === 'GET') {
			const slug = url.searchParams.get('slug');
			if (slug) {
				const world = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				if (!world) {
					return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				}
				return new Response(JSON.stringify(world), { status: 200, headers: { 'Content-Type': 'application/json' } });
			} else {
				const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM worlds WHERE deleted_at IS NULL').all();
				return new Response(JSON.stringify(rows.results), { status: 200, headers: { 'Content-Type': 'application/json' } });
			}
		}

		if (method === 'PUT') {
			const body = await request.json();
			const parse = WorldSchema.partial().extend({ slug: z.string() }).safeParse(body);
			if (!parse.success) {
				return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.errors }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const { slug, title, description, published } = parse.data;
			const result = await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE worlds SET title = COALESCE(?, title), description = COALESCE(?, description), published = COALESCE(?, published), updated_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
			).bind(title, description, typeof published === 'boolean' ? (published ? 1 : 0) : undefined, slug).run();
			if (result.changes === 0) {
				return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
			}
			// Optionally, remove audit log or set admin_email to NULL or a placeholder
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
			).run();
			return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
		}

		if (method === 'DELETE') {
			const body = await request.json();
			const { slug } = body;
			if (!slug) {
				return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const result = await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE worlds SET deleted_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
			).bind(slug).run();
			if (result.changes === 0) {
				return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
			}
			// Optionally, remove audit log or set admin_email to NULL or a placeholder
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
			).run();
			return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
		}

		return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
	} catch (err) {
		console.error('Worlds API error:', err);
		return new Response(
			JSON.stringify({
				error: 'Internal Server Error',
				details: err instanceof Error ? err.message : String(err),
				stack: err instanceof Error ? err.stack : undefined
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
}
