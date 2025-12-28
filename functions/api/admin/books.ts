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

import { getAdminEmailFromRequest } from './utils/auth';

export const onRequest: PagesFunction = async (context) => {
	const { request, env } = context;
	const url = new URL(request.url);
	const method = request.method.toUpperCase();
	// Authenticate admin
	let adminEmail;
	// Try both auth helpers for compatibility
	try {
		if (typeof getAdminEmailFromRequest === 'function') {
			adminEmail = await getAdminEmailFromRequest(request);
		} else if (typeof verifyAccess === 'function') {
			adminEmail = await verifyAccess(request);
		}
	} catch (err) {
		return err instanceof Response
			? err
			: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
	}
	if (!adminEmail) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

	try {
		if (method === 'GET') {
			// GET /books or /books?slug=foo
			const slug = url.searchParams.get('slug');
			if (slug) {
				// Fetch single book
				const book = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				if (!book) {
					return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				}
				return new Response(JSON.stringify(book), { headers: { 'Content-Type': 'application/json' } });
			} else {
				// List all books
				const books = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM books WHERE deleted_at IS NULL ORDER BY publish_date DESC, id DESC').all();
				return new Response(JSON.stringify(books.results), { headers: { 'Content-Type': 'application/json' } });
			}
		}

		if (method === 'POST') {
			// Create book
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
			const { slug, title, description, cover_image, publish_date, amazon_url, kindle_url, excerpt, world_slug, series_id, published } = parse.data;
			// Check for duplicate slug
			const existing = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
			if (existing) {
				return new Response(JSON.stringify({ error: 'Slug already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
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
			return new Response(JSON.stringify({ ok: true }), { status: 201, headers: { 'Content-Type': 'application/json' } });
		}

		if (method === 'PUT') {
			// Update book (by slug)
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
			const { slug, title, description, cover_image, publish_date, amazon_url, kindle_url, excerpt, world_slug, series_id, published } = parse.data;
			// Check if book exists
			const existing = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
			if (!existing) {
				return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
			}
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE books SET title = ?, description = ?, cover_image = ?, publish_date = ?, amazon_url = ?, kindle_url = ?, excerpt = ?, world_slug = ?, series_id = ?, published = ?, updated_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
			).bind(title, description ?? '', cover_image ?? '', publish_date ?? '', amazon_url ?? '', kindle_url ?? '', excerpt ?? '', world_slug ?? '', series_id ?? null, published ? 1 : 0, slug).run();
			await env.CRT_STORIES_CONTENT.prepare(
				'INSERT INTO audit_log (admin_email, action, entity_type, details) VALUES (?, ?, ?, ?)'
			).bind(adminEmail, 'update', 'books', JSON.stringify({ slug, title })).run();
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
			).run();
			return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
		}

		if (method === 'DELETE') {
			// Soft-delete book (by slug)
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
				'INSERT INTO audit_log (admin_email, action, entity_type, details) VALUES (?, ?, ?, ?)'
			).bind(adminEmail, 'delete', 'books', JSON.stringify({ slug, title: existing.title })).run();
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
			).run();
			return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
		}

		return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
	} catch (err) {
		// Catch-all error handler
		return new Response(JSON.stringify({ error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
	}
};
// Cloudflare Pages Function: /api/admin/books
// Scaffold for CRUD and publish/unpublish endpoints for books
export {};
