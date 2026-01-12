import type { PagesFunction } from 'vite-plugin-cloudflare-pages';

export const onRequest: PagesFunction = async (context: any) => {
	const { request, env } = context;
	const url = new URL(request.url);
	const method = request.method.toUpperCase();

	try {
		if (method === 'GET') {
			const slug = url.searchParams.get('slug');
			if (slug) {
				const character = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM characters WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				if (!character) {
					return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				}
				   character.description = character.bio;
				   character.worldSlugs = JSON.parse(character.worldSlugs || '[]');
				   character.seriesSlugs = JSON.parse(character.seriesSlugs || '[]');
				   character.bookSlugs = JSON.parse(character.appearsInBookSlugs || '[]');
				   character.tags = JSON.parse(character.tags || '[]');
				   character.roleTag = JSON.parse(character.roleTag || '[]');
				   return new Response(JSON.stringify(character), { headers: { 'Content-Type': 'application/json' } });
			} else {
				const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM characters WHERE deleted_at IS NULL').all();
				const results = rows.results.map((character: any) => ({
					   ...character,
					   description: character.bio,
					   worldSlugs: JSON.parse(character.worldSlugs || '[]'),
					   seriesSlugs: JSON.parse(character.seriesSlugs || '[]'),
					   bookSlugs: JSON.parse(character.appearsInBookSlugs || '[]'),
					   tags: JSON.parse(character.tags || '[]'),
					   roleTag: JSON.parse(character.roleTag || '[]')
				   }));
				   return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
			}
		}

			 // POST, PUT, DELETE: mutation logic for worker admin
			 const { requireWorkerAdminAuth } = await import('./requireAuth');
			 const authResponse = await requireWorkerAdminAuth(request);
			 if (authResponse) {
				 return authResponse;
			 }
			 const body = await request.json();
			 if (method === 'POST') {
				 const { slug, name, bio = '', worldSlugs = [], seriesSlugs = [], appearsInBookSlugs = [], tags = [], roleTag = [], published = false } = body;
				 if (!slug || !name) {
					 return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				 }
				 // Check for duplicate slug
				 const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM characters WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				 if (exists) {
					 return new Response(JSON.stringify({ error: 'Character with this slug already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
				 }
				 await env.CRT_STORIES_CONTENT.prepare('INSERT INTO characters (slug, name, bio, worldSlugs, seriesSlugs, appearsInBookSlugs, tags, roleTag, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))')
					 .bind(slug, name, bio, JSON.stringify(worldSlugs), JSON.stringify(seriesSlugs), JSON.stringify(appearsInBookSlugs), JSON.stringify(tags), JSON.stringify(roleTag), published ? 1 : 0).run();
				 return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
			 }
			 if (method === 'PUT') {
				 const { slug, name, bio = '', worldSlugs = [], seriesSlugs = [], appearsInBookSlugs = [], tags = [], roleTag = [], published = false } = body;
				 if (!slug || !name) {
					 return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				 }
				 const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM characters WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				 if (!exists) {
					 return new Response(JSON.stringify({ error: 'Character not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				 }
				 await env.CRT_STORIES_CONTENT.prepare('UPDATE characters SET name = ?, bio = ?, worldSlugs = ?, seriesSlugs = ?, appearsInBookSlugs = ?, tags = ?, roleTag = ?, published = ?, updated_at = datetime("now") WHERE slug = ? AND deleted_at IS NULL')
					 .bind(name, bio, JSON.stringify(worldSlugs), JSON.stringify(seriesSlugs), JSON.stringify(appearsInBookSlugs), JSON.stringify(tags), JSON.stringify(roleTag), published ? 1 : 0, slug).run();
				 return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
			 }
			 if (method === 'DELETE') {
				 const { slug } = body;
				 if (!slug) {
					 return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				 }
				 const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM characters WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				 if (!exists) {
					 return new Response(JSON.stringify({ error: 'Character not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				 }
				 await env.CRT_STORIES_CONTENT.prepare('UPDATE characters SET deleted_at = datetime("now") WHERE slug = ? AND deleted_at IS NULL').bind(slug).run();
				 return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
			 }
			 return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
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
