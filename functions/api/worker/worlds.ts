import { z } from 'zod';
import type { PagesFunction } from '@cloudflare/workers-types';

const WorldSchema = z.object({
	slug: z.string().regex(/^[a-z0-9-]+$/),
	title: z.string().min(1),
	description: z.string().optional(),
	seriesSlugs: z.array(z.string()).optional(),
	bookSlugs: z.array(z.string()).optional(),
	characterSlugs: z.array(z.string()).optional(),
	published: z.boolean().optional(),
});

export const onRequest: PagesFunction = async (context: any): Promise<globalThis.Response> => {
	const { request, env } = context;
	const url = new URL(request.url);
	const method = request.method.toUpperCase();

	try {
		if (method === 'POST') {
			const body = await request.json();
			const parse = WorldSchema.safeParse(body);
			if (!parse.success) {
				return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.issues }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const { slug, title, description, seriesSlugs, bookSlugs, characterSlugs, published } = parse.data;
			const existing = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
			if (existing) {
				return new Response(JSON.stringify({ error: 'Slug already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
			}
			await env.CRT_STORIES_CONTENT.prepare(
				'INSERT INTO worlds (slug, title, description, published, created_at, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))'
			).bind(slug, title, description ?? '', published ? 1 : 0).run();
			const world = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM worlds WHERE slug = ?').bind(slug).first();
			// Insert join tables
			if (Array.isArray(seriesSlugs)) {
				for (const s of seriesSlugs) {
					const series = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM series WHERE slug = ?').bind(s).first();
					if (series) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO world_series (world_id, series_id) VALUES (?, ?)').bind(world.id, series.id).run();
					}
				}
			}
			if (Array.isArray(bookSlugs)) {
				for (const b of bookSlugs) {
					const book = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM books WHERE slug = ?').bind(b).first();
					if (book) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO book_world (book_id, world_id) VALUES (?, ?)').bind(book.id, world.id).run();
					}
				}
			}
			if (Array.isArray(characterSlugs)) {
				for (const c of characterSlugs) {
					const character = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM characters WHERE slug = ?').bind(c).first();
					if (character) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO character_world (character_id, world_id) VALUES (?, ?)').bind(character.id, world.id).run();
					}
				}
			}
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
				// Fetch related arrays
				const [seriesRows, bookRows, characterRows] = await Promise.all([
					env.CRT_STORIES_CONTENT.prepare('SELECT s.slug FROM world_series ws JOIN series s ON ws.series_id = s.id WHERE ws.world_id = ?').bind(world.id).all(),
					env.CRT_STORIES_CONTENT.prepare('SELECT b.slug FROM book_world bw JOIN books b ON bw.book_id = b.id WHERE bw.world_id = ?').bind(world.id).all(),
					env.CRT_STORIES_CONTENT.prepare('SELECT c.slug FROM character_world cw JOIN characters c ON cw.character_id = c.id WHERE cw.world_id = ?').bind(world.id).all(),
				]);
				world.seriesSlugs = seriesRows.results.map((r: { slug: string }) => r.slug);
				world.bookSlugs = bookRows.results.map((r: { slug: string }) => r.slug);
				world.characterSlugs = characterRows.results.map((r: { slug: string }) => r.slug);
				return new Response(JSON.stringify(world), { status: 200, headers: { 'Content-Type': 'application/json' } });
			} else {
				const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM worlds WHERE deleted_at IS NULL').all();
				// For each world, fetch related arrays
				const results = await Promise.all(rows.results.map(async (world: any) => {
					const [seriesRows, bookRows, characterRows] = await Promise.all([
						env.CRT_STORIES_CONTENT.prepare('SELECT s.slug FROM world_series ws JOIN series s ON ws.series_id = s.id WHERE ws.world_id = ?').bind(world.id).all(),
						env.CRT_STORIES_CONTENT.prepare('SELECT b.slug FROM book_world bw JOIN books b ON bw.book_id = b.id WHERE bw.world_id = ?').bind(world.id).all(),
						env.CRT_STORIES_CONTENT.prepare('SELECT c.slug FROM character_world cw JOIN characters c ON cw.character_id = c.id WHERE cw.world_id = ?').bind(world.id).all(),
					]);
					world.seriesSlugs = seriesRows.results.map((r: { slug: string }) => r.slug);
					world.bookSlugs = bookRows.results.map((r: { slug: string }) => r.slug);
					world.characterSlugs = characterRows.results.map((r: { slug: string }) => r.slug);
					return world;
				}));
				return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json' } });
			}
		}

		if (method === 'PUT') {
			const body = await request.json();
			const parse = WorldSchema.partial().extend({ slug: z.string() }).safeParse(body);
			if (!parse.success) {
				return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.issues }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const { slug, title, description, seriesSlugs, bookSlugs, characterSlugs, published } = parse.data;
			const world = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
			if (!world) {
				return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
			}
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE worlds SET title = COALESCE(?, title), description = COALESCE(?, description), published = COALESCE(?, published), updated_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
			).bind(title, description, typeof published === 'boolean' ? (published ? 1 : 0) : undefined, slug).run();
			// Update join tables: remove all, then re-insert
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM world_series WHERE world_id = ?').bind(world.id).run();
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM book_world WHERE world_id = ?').bind(world.id).run();
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM character_world WHERE world_id = ?').bind(world.id).run();
			if (Array.isArray(seriesSlugs)) {
				for (const s of seriesSlugs) {
					const series = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM series WHERE slug = ?').bind(s).first();
					if (series) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO world_series (world_id, series_id) VALUES (?, ?)').bind(world.id, series.id).run();
					}
				}
			}
			if (Array.isArray(bookSlugs)) {
				for (const b of bookSlugs) {
					const book = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM books WHERE slug = ?').bind(b).first();
					if (book) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO book_world (book_id, world_id) VALUES (?, ?)').bind(book.id, world.id).run();
					}
				}
			}
			if (Array.isArray(characterSlugs)) {
				for (const c of characterSlugs) {
					const character = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM characters WHERE slug = ?').bind(c).first();
					if (character) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO character_world (character_id, world_id) VALUES (?, ?)').bind(character.id, world.id).run();
					}
				}
			}
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
			const world = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
			if (!world) {
				return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
			}
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE worlds SET deleted_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
			).bind(slug).run();
			// Remove join table entries
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM world_series WHERE world_id = ?').bind(world.id).run();
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM book_world WHERE world_id = ?').bind(world.id).run();
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM character_world WHERE world_id = ?').bind(world.id).run();
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
