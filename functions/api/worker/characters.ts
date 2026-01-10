import { z } from 'zod';

import type { PagesFunction } from '@cloudflare/workers-types';

const CharacterSchema = z.object({
	slug: z.string().regex(/^[a-z0-9-]+$/),
	name: z.string().min(1),
	description: z.string().optional(),
	worldSlugs: z.array(z.string()).optional(),
	seriesSlugs: z.array(z.string()).optional(),
	bookSlugs: z.array(z.string()).optional(),
	published: z.boolean().optional(),
});

export const onRequest: PagesFunction = async (context: any) => {
	const { request, env } = context;
	const url = new URL(request.url);
	const method = request.method.toUpperCase();

	try {
		if (method === 'POST') {
			const body = await request.json();
			const parse = CharacterSchema.safeParse(body);
			if (!parse.success) {
				return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.issues }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const { slug, name, description, worldSlugs, seriesSlugs, bookSlugs, published } = parse.data;
			const existing = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM characters WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
			if (existing) {
				return new Response(JSON.stringify({ error: 'Slug already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
			}
			await env.CRT_STORIES_CONTENT.prepare(
				'INSERT INTO characters (slug, name, description, published, created_at, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))'
			).bind(slug, name, description ?? '', published ? 1 : 0).run();
			const character = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM characters WHERE slug = ?').bind(slug).first();
			// Insert join tables
			if (Array.isArray(worldSlugs)) {
				for (const w of worldSlugs) {
					const world = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM worlds WHERE slug = ?').bind(w).first();
					if (world) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO character_world (character_id, world_id) VALUES (?, ?)').bind(character.id, world.id).run();
					}
				}
			}
			if (Array.isArray(seriesSlugs)) {
				for (const s of seriesSlugs) {
					const series = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM series WHERE slug = ?').bind(s).first();
					if (series) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO character_series (character_id, series_id) VALUES (?, ?)').bind(character.id, series.id).run();
					}
				}
			}
			if (Array.isArray(bookSlugs)) {
				for (const b of bookSlugs) {
					const book = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM books WHERE slug = ?').bind(b).first();
					if (book) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO book_character (book_id, character_id) VALUES (?, ?)').bind(book.id, character.id).run();
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
				const character = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM characters WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				if (!character) {
					return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				}
				// Fetch related arrays
				const [worldRows, seriesRows, bookRows] = await Promise.all([
					env.CRT_STORIES_CONTENT.prepare('SELECT w.slug FROM character_world cw JOIN worlds w ON cw.world_id = w.id WHERE cw.character_id = ?').bind(character.id).all(),
					env.CRT_STORIES_CONTENT.prepare('SELECT s.slug FROM character_series cs JOIN series s ON cs.series_id = s.id WHERE cs.character_id = ?').bind(character.id).all(),
					env.CRT_STORIES_CONTENT.prepare('SELECT b.slug FROM book_character bc JOIN books b ON bc.book_id = b.id WHERE bc.character_id = ?').bind(character.id).all(),
				]);
				character.worldSlugs = worldRows.results.map((r: { slug: string }) => r.slug);
				character.seriesSlugs = seriesRows.results.map((r: { slug: string }) => r.slug);
				character.bookSlugs = bookRows.results.map((r: { slug: string }) => r.slug);
				return new Response(JSON.stringify(character), { status: 200, headers: { 'Content-Type': 'application/json' } });
			} else {
				const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM characters WHERE deleted_at IS NULL').all();
				// For each character, fetch related arrays
				const results = await Promise.all(rows.results.map(async (character: any) => {
					const [worldRows, seriesRows, bookRows] = await Promise.all([
						env.CRT_STORIES_CONTENT.prepare('SELECT w.slug FROM character_world cw JOIN worlds w ON cw.world_id = w.id WHERE cw.character_id = ?').bind(character.id).all(),
						env.CRT_STORIES_CONTENT.prepare('SELECT s.slug FROM character_series cs JOIN series s ON cs.series_id = s.id WHERE cs.character_id = ?').bind(character.id).all(),
						env.CRT_STORIES_CONTENT.prepare('SELECT b.slug FROM book_character bc JOIN books b ON bc.book_id = b.id WHERE bc.character_id = ?').bind(character.id).all(),
					]);
					character.worldSlugs = worldRows.results.map((r: { slug: string }) => r.slug);
					character.seriesSlugs = seriesRows.results.map((r: { slug: string }) => r.slug);
					character.bookSlugs = bookRows.results.map((r: { slug: string }) => r.slug);
					return character;
				}));
				return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json' } });
			}
		}

		if (method === 'PUT') {
			const body = await request.json();
			const parse = CharacterSchema.partial().extend({ slug: z.string() }).safeParse(body);
			if (!parse.success) {
				return new Response(JSON.stringify({ error: 'Validation failed', details: parse.error.issues }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const { slug, name, description, worldSlugs, seriesSlugs, bookSlugs, published } = parse.data;
			const character = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM characters WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
			if (!character) {
				return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
			}
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE characters SET name = COALESCE(?, name), description = COALESCE(?, description), published = COALESCE(?, published), updated_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
			).bind(name, description, typeof published === 'boolean' ? (published ? 1 : 0) : undefined, slug).run();
			// Update join tables: remove all, then re-insert
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM character_world WHERE character_id = ?').bind(character.id).run();
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM character_series WHERE character_id = ?').bind(character.id).run();
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM book_character WHERE character_id = ?').bind(character.id).run();
			if (Array.isArray(worldSlugs)) {
				for (const w of worldSlugs) {
					const world = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM worlds WHERE slug = ?').bind(w).first();
					if (world) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO character_world (character_id, world_id) VALUES (?, ?)').bind(character.id, world.id).run();
					}
				}
			}
			if (Array.isArray(seriesSlugs)) {
				for (const s of seriesSlugs) {
					const series = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM series WHERE slug = ?').bind(s).first();
					if (series) {
						await env.CRT_STORIES_CONTENT.prepare('INSERT OR IGNORE INTO character_series (character_id, series_id) VALUES (?, ?)').bind(character.id, series.id).run();
					}
				}
			}
			if (Array.isArray(bookSlugs)) {
				for (const b of bookSlugs) {
					const book = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM books WHERE slug = ?').bind(b).first();
					if (book) {
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
			const body = await request.json();
			const { slug } = body;
			if (!slug) {
				return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const character = await env.CRT_STORIES_CONTENT.prepare('SELECT id FROM characters WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
			if (!character) {
				return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
			}
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE characters SET deleted_at = datetime(\'now\') WHERE slug = ? AND deleted_at IS NULL'
			).bind(slug).run();
			// Remove join table entries
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM character_world WHERE character_id = ?').bind(character.id).run();
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM character_series WHERE character_id = ?').bind(character.id).run();
			await env.CRT_STORIES_CONTENT.prepare('DELETE FROM book_character WHERE character_id = ?').bind(character.id).run();
			await env.CRT_STORIES_CONTENT.prepare(
				'UPDATE export_state SET needs_export = 1, updated_at = datetime(\'now\') WHERE id = 1'
			).run();
			return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
		}

		return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
	} catch (err) {
		console.error('Characters API error:', err);
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
