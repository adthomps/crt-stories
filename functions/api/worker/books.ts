// Cloudflare Pages Function: /api/worker/books
import { z } from 'zod';

const BookSchema = z.object({
	slug: z.string().regex(/^[a-z0-9-]+$/),
	title: z.string().min(1),
	description: z.string().optional(),
	cover_image: z.string().optional(),
	publish_date: z.string().optional(),
	kindle_url: z.string().optional(),
	audio_url: z.string().optional(),
	paperback_url: z.string().optional(),
	excerpt: z.string().optional(),
	world_slug: z.string().optional(),
	series_id: z.number().optional(),
	published: z.boolean().optional(),
});

export const onRequest: PagesFunction = async (context) => {
	const { request, env } = context;
	const url = new URL(request.url);
	const method = request.method.toUpperCase();

	try {
		if (method === 'GET') {
			const slug = url.searchParams.get('slug');
			if (slug) {
				const book = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				if (!book) {
					return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				}
				return new Response(JSON.stringify(book), { headers: { 'Content-Type': 'application/json' } });
			} else {
				const books = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM books WHERE deleted_at IS NULL ORDER BY publish_date DESC, id DESC').all();
				return new Response(JSON.stringify(books.results), { headers: { 'Content-Type': 'application/json' } });
			}
		}

		if (method === 'POST') {
			let body;
			try {
				body = await request.json();
			} catch {
				return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const parse = BookSchema.safeParse(body);
			if (!parse.success) {
				return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.errors }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const { slug, title, description, cover_image, publish_date, kindle_url, audio_url, paperback_url, excerpt, world_slug, series_id, published } = parse.data;
			const existing = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
			if (existing) {
				return new Response(JSON.stringify({ error: 'Slug already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
			}
			if (world_slug) {
				const world = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(world_slug).first();
				if (!world) {
					return new Response(JSON.stringify({ error: 'Invalid world_slug: no such world' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				}
			}
			if (series_id !== undefined && series_id !== null) {
				const series = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM series WHERE id = ? AND deleted_at IS NULL').bind(series_id).first();
				if (!series) {
					return new Response(JSON.stringify({ error: 'Invalid series_id: no such series' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				}
			}
			await env.CRT_STORIES_CONTENT.prepare(
				'INSERT INTO books (slug, title, description, cover_image, publish_date, kindle_url, audio_url, paperback_url, excerpt, world_slug, series_id, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))'
			).bind(slug, title, description ?? '', cover_image ?? '', publish_date ?? '', kindle_url ?? '', audio_url ?? '', paperback_url ?? '', excerpt ?? '', world_slug ?? '', series_id ?? null, published ? 1 : 0).run();
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
			).run();
			return new Response(JSON.stringify({ ok: true }), { status: 201, headers: { 'Content-Type': 'application/json' } });
		}

		if (method === 'PUT') {
			let body;
			try {
				body = await request.json();
			} catch {
				return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const parse = BookSchema.safeParse(body);
			if (!parse.success) {
				return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.errors }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const { slug, title, description, cover_image, publish_date, kindle_url, audio_url, paperback_url, excerpt, world_slug, series_id, published } = parse.data;
			const existing = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
			if (!existing) {
				return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
			}
			if (world_slug) {
				const world = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(world_slug).first();
				if (!world) {
					return new Response(JSON.stringify({ error: 'Invalid world_slug: no such world' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				}
			}
			if (series_id !== undefined && series_id !== null) {
				const series = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM series WHERE id = ? AND deleted_at IS NULL').bind(series_id).first();
				if (!series) {
					return new Response(JSON.stringify({ error: 'Invalid series_id: no such series' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				}
			}
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE books SET title = ?, description = ?, cover_image = ?, publish_date = ?, kindle_url = ?, audio_url = ?, paperback_url = ?, excerpt = ?, world_slug = ?, series_id = ?, published = ?, updated_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
			).bind(title, description ?? '', cover_image ?? '', publish_date ?? '', kindle_url ?? '', audio_url ?? '', paperback_url ?? '', excerpt ?? '', world_slug ?? '', series_id ?? null, published ? 1 : 0, slug).run();
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
			).run();
			return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
		}

		if (method === 'DELETE') {
			let body;
			try {
				body = await request.json();
			} catch {
				return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const { slug } = body;
			if (!slug || typeof slug !== 'string') {
				return new Response(JSON.stringify({ error: 'Missing or invalid slug' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const existing = await env.CRT_STORIES_CONTENT.prepare('SELECT id, title FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
			if (!existing) {
				return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
			}
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE books SET deleted_at = datetime(\'now\'), updated_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
			).bind(slug).run();
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
			).run();
			return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
		}

		return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
	} catch (err) {
		console.error('Books API error:', err);
		return new Response(
			JSON.stringify({
				error: 'Internal Server Error',
				details: err instanceof Error ? err.message : String(err),
				stack: err instanceof Error ? err.stack : undefined
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};
