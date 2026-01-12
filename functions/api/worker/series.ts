import type { PagesFunction } from 'vite-plugin-cloudflare-pages';

export const onRequest: PagesFunction = async (context: any) => {
	const { request, env } = context;
	const url = new URL(request.url);
	const method = request.method.toUpperCase();

	try {
		if (method === 'GET') {
			const slug = url.searchParams.get('slug');
			console.log(`[SERIES API] Requested slug:`, slug);
			if (slug) {
				const series = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM series WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				console.log(`[SERIES API] DB result for slug '${slug}':`, series);
				if (!series) {
					console.log(`[SERIES API] Series not found for slug:`, slug);
					return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				}
				series.badges = JSON.parse(series.badges || '[]');
				series.tags = JSON.parse(series.tags || '[]');
				series.bookSlugs = JSON.parse(series.bookSlugs || '[]');
				console.log(`[SERIES API] Final series object:`, series);
				return new Response(JSON.stringify(series), { headers: { 'Content-Type': 'application/json' } });
			} else {
				const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM series WHERE deleted_at IS NULL').all();
				console.log(`[SERIES API] DB result for all series:`, rows.results);
				const results = rows.results.map((series: any) => ({
					...series,
					badges: JSON.parse(series.badges || '[]'),
					bookSlugs: JSON.parse(series.bookSlugs || '[]'),
				}));
				console.log(`[SERIES API] Final series list:`, results);
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
				 const { slug, title, description = '', longDescription = '', badges = [], tags = [], bookSlugs = [], published = false } = body;
				 if (!slug || !title) {
					 return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				 }
				 // Check for duplicate slug
				 const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM series WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				 if (exists) {
					 return new Response(JSON.stringify({ error: 'Series with this slug already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
				 }
				 await env.CRT_STORIES_CONTENT.prepare('INSERT INTO series (slug, title, description, longDescription, badges, tags, bookSlugs, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))')
					 .bind(slug, title, description, longDescription, JSON.stringify(badges), JSON.stringify(tags), JSON.stringify(bookSlugs), published ? 1 : 0).run();
				 return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
			 }
			 if (method === 'PUT') {
				 const { slug, title, description = '', longDescription = '', badges = [], tags = [], bookSlugs = [], published = false } = body;
				 if (!slug || !title) {
					 return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				 }
				 const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM series WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				 if (!exists) {
					 return new Response(JSON.stringify({ error: 'Series not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				 }
				 await env.CRT_STORIES_CONTENT.prepare('UPDATE series SET title = ?, description = ?, longDescription = ?, badges = ?, tags = ?, bookSlugs = ?, published = ?, updated_at = datetime("now") WHERE slug = ? AND deleted_at IS NULL')
					 .bind(title, description, longDescription, JSON.stringify(badges), JSON.stringify(tags), JSON.stringify(bookSlugs), published ? 1 : 0, slug).run();
				 return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
			 }
			 if (method === 'DELETE') {
				 const { slug } = body;
				 if (!slug) {
					 return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				 }
				 const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM series WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				 if (!exists) {
					 return new Response(JSON.stringify({ error: 'Series not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				 }
				 await env.CRT_STORIES_CONTENT.prepare('UPDATE series SET deleted_at = datetime("now") WHERE slug = ? AND deleted_at IS NULL').bind(slug).run();
				 return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
			 }
			 return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
	} catch (err) {
		console.error('Series API error:', err);
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
