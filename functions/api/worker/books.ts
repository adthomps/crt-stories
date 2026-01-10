// Cloudflare Pages Function: /api/worker/books
import { z } from 'zod';

const BookSchema = z.object({
	slug: z.string().regex(/^[a-z0-9-]+$/),
	title: z.string().min(1),
	description: z.string().optional(),
	coverImage: z.string().optional(),
	publishDate: z.string().optional(),
	kindleUrl: z.string().optional(),
	audioUrl: z.string().optional(),
	paperbackUrl: z.string().optional(),
	excerpt: z.string().optional(),
	worldSlugs: z.array(z.string()).optional(),
	seriesSlugs: z.array(z.string()).optional(),
	characterSlugs: z.array(z.string()).optional(),
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
				// Fetch related arrays
				const [seriesRows, worldRows, characterRows] = await Promise.all([
					env.CRT_STORIES_CONTENT.prepare('SELECT s.slug FROM book_series bs JOIN series s ON bs.series_id = s.id WHERE bs.book_id = ?').bind(book.id).all(),
					env.CRT_STORIES_CONTENT.prepare('SELECT w.slug FROM book_world bw JOIN worlds w ON bw.world_id = w.id WHERE bw.book_id = ?').bind(book.id).all(),
					env.CRT_STORIES_CONTENT.prepare('SELECT c.slug FROM book_character bc JOIN characters c ON bc.character_id = c.id WHERE bc.book_id = ?').bind(book.id).all(),
				]);
				book.seriesSlugs = seriesRows.results.map(r => r.slug);
				book.worldSlugs = worldRows.results.map(r => r.slug);
				book.characterSlugs = characterRows.results.map(r => r.slug);
				// Reconstruct formats array
				book.formats = [];
				if (book.kindleUrl) book.formats.push({ type: 'kindle', label: 'Kindle', url: book.kindleUrl });
				if (book.audioUrl) book.formats.push({ type: 'audiobook', label: 'Audiobook', url: book.audioUrl });
				if (book.paperbackUrl) book.formats.push({ type: 'paperback', label: 'Paperback', url: book.paperbackUrl });
				return new Response(JSON.stringify(book), { headers: { 'Content-Type': 'application/json' } });
			} else {
				const books = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM books WHERE deleted_at IS NULL ORDER BY publish_date DESC, id DESC').all();
				// For each book, fetch related arrays
				const results = await Promise.all(books.results.map(async (book) => {
					const [seriesRows, worldRows, characterRows] = await Promise.all([
						env.CRT_STORIES_CONTENT.prepare('SELECT s.slug FROM book_series bs JOIN series s ON bs.series_id = s.id WHERE bs.book_id = ?').bind(book.id).all(),
						env.CRT_STORIES_CONTENT.prepare('SELECT w.slug FROM book_world bw JOIN worlds w ON bw.world_id = w.id WHERE bw.book_id = ?').bind(book.id).all(),
						env.CRT_STORIES_CONTENT.prepare('SELECT c.slug FROM book_character bc JOIN characters c ON bc.character_id = c.id WHERE bc.book_id = ?').bind(book.id).all(),
					]);
					book.seriesSlugs = seriesRows.results.map(r => r.slug);
					book.worldSlugs = worldRows.results.map(r => r.slug);
					book.characterSlugs = characterRows.results.map(r => r.slug);
					// Reconstruct formats array
					book.formats = [];
					if (book.kindleUrl) book.formats.push({ type: 'kindle', label: 'Kindle', url: book.kindleUrl });
					if (book.audioUrl) book.formats.push({ type: 'audiobook', label: 'Audiobook', url: book.audioUrl });
					if (book.paperbackUrl) book.formats.push({ type: 'paperback', label: 'Paperback', url: book.paperbackUrl });
					return book;
				}));
				return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
			}
		}

		if (method === 'POST') {
			let body;
			try {
				body = await request.json();
			} catch (err) {
				console.error('Invalid JSON in POST /books:', err);
				return new Response(JSON.stringify({ error: 'Invalid JSON', details: err instanceof Error ? err.message : String(err) }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const parse = BookSchema.safeParse(body);
			if (!parse.success) {
				console.error('Validation failed in POST /books:', { body, errors: parse.error.errors });
				return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.errors }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const { slug, title, description, coverImage, publishDate, kindleUrl, audioUrl, paperbackUrl, excerpt, worldSlugs, seriesSlugs, characterSlugs, published } = parse.data;
			const existing = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
			if (existing) {
				console.error('Slug already exists in POST /books:', slug);
				return new Response(JSON.stringify({ error: 'Slug already exists', slug }), { status: 409, headers: { 'Content-Type': 'application/json' } });
			}
			// Insert book
			await env.CRT_STORIES_CONTENT.prepare(
				'INSERT INTO books (slug, title, description, cover_image, publish_date, kindle_url, audio_url, paperback_url, excerpt, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))'
			).bind(slug, title, description ?? '', coverImage ?? '', publishDate ?? '', kindleUrl ?? '', audioUrl ?? '', paperbackUrl ?? '', excerpt ?? '', published ? 1 : 0).run();
			// Get book id
			const book = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM books WHERE slug = ?').bind(slug).first();
			// Insert join tables
			if (Array.isArray(seriesSlugs)) {
				for (const s of seriesSlugs) {
					const series = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM series WHERE slug = ?').bind(s).first();
					if (series) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO book_series (book_id, series_id) VALUES (?, ?)').bind(book.id, series.id).run();
					}
				}
			}
			if (Array.isArray(worldSlugs)) {
				for (const w of worldSlugs) {
					const world = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM worlds WHERE slug = ?').bind(w).first();
					if (world) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO book_world (book_id, world_id) VALUES (?, ?)').bind(book.id, world.id).run();
					}
				}
			}
			if (Array.isArray(characterSlugs)) {
				for (const c of characterSlugs) {
					const character = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM characters WHERE slug = ?').bind(c).first();
					if (character) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO book_character (book_id, character_id) VALUES (?, ?)').bind(book.id, character.id).run();
					}
				}
			}
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
			).run();
			return new Response(JSON.stringify({ ok: true }), { status: 201, headers: { 'Content-Type': 'application/json' } });
		}

		if (method === 'PUT') {
			let body;
			try {
				body = await request.json();
			} catch (err) {
				console.error('Invalid JSON in PUT /books:', err);
				return new Response(JSON.stringify({ error: 'Invalid JSON', details: err instanceof Error ? err.message : String(err) }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const parse = BookSchema.safeParse(body);
			if (!parse.success) {
				console.error('Validation failed in PUT /books:', { body, errors: parse.error.errors });
				return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.errors }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const { slug, title, description, coverImage, publishDate, kindleUrl, audioUrl, paperbackUrl, excerpt, worldSlugs, seriesSlugs, characterSlugs, published } = parse.data;
			const book = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
			if (!book) {
				console.error('Book not found in PUT /books:', slug);
				return new Response(JSON.stringify({ error: 'Not found', slug }), { status: 404, headers: { 'Content-Type': 'application/json' } });
			}
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE books SET title = ?, description = ?, cover_image = ?, publish_date = ?, kindle_url = ?, audio_url = ?, paperback_url = ?, excerpt = ?, published = ?, updated_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
			).bind(title, description ?? '', coverImage ?? '', publishDate ?? '', kindleUrl ?? '', audioUrl ?? '', paperbackUrl ?? '', excerpt ?? '', published ? 1 : 0, slug).run();
			// Update join tables: remove all, then re-insert
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM book_series WHERE book_id = ?').bind(book.id).run();
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM book_world WHERE book_id = ?').bind(book.id).run();
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM book_character WHERE book_id = ?').bind(book.id).run();
			if (Array.isArray(seriesSlugs)) {
				for (const s of seriesSlugs) {
					const series = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM series WHERE slug = ?').bind(s).first();
					if (series) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO book_series (book_id, series_id) VALUES (?, ?)').bind(book.id, series.id).run();
					}
				}
			}
			if (Array.isArray(worldSlugs)) {
				for (const w of worldSlugs) {
					const world = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM worlds WHERE slug = ?').bind(w).first();
					if (world) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO book_world (book_id, world_id) VALUES (?, ?)').bind(book.id, world.id).run();
					}
				}
			}
			if (Array.isArray(characterSlugs)) {
				for (const c of characterSlugs) {
					const character = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM characters WHERE slug = ?').bind(c).first();
					if (character) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO book_character (book_id, character_id) VALUES (?, ?)').bind(book.id, character.id).run();
					}
				}
			}
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
			const book = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
			if (!book) {
				return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
			}
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE books SET deleted_at = datetime(\'now\'), updated_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
			).bind(slug).run();
			// Remove join table entries
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM book_series WHERE book_id = ?').bind(book.id).run();
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM book_world WHERE book_id = ?').bind(book.id).run();
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM book_character WHERE book_id = ?').bind(book.id).run();
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
