import type { PagesFunction } from 'vite-plugin-cloudflare-pages';

export const onRequest: PagesFunction = async (context: any) => {
	const { request, env } = context;
	const url = new URL(request.url);
	const method = request.method.toUpperCase();

	try {
		if (method === 'GET') {
			const slug = url.searchParams.get('slug');
			if (slug) {
				const world = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				if (!world) {
					return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				}
				world.themeTags = JSON.parse(world.themeTags || '[]');
				world.bookSlugs = JSON.parse(world.bookSlugs || '[]');
				world.characterSlugs = JSON.parse(world.characterSlugs || '[]');
				return new Response(JSON.stringify(world), { headers: { 'Content-Type': 'application/json' } });
			} else {
				const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM worlds WHERE deleted_at IS NULL').all();
				const results = rows.results.map((world: any) => ({
					...world,
					themeTags: JSON.parse(world.themeTags || '[]'),
					bookSlugs: JSON.parse(world.bookSlugs || '[]'),
					characterSlugs: JSON.parse(world.characterSlugs || '[]')
				}));
				return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
			}
		}

		// POST, PUT, DELETE: require admin authentication
		if (['POST', 'PUT', 'DELETE'].includes(method)) {
			const { requireWorkerAdminAuth } = await import('./requireAuth');
			const authResponse = await requireWorkerAdminAuth(request);
			if (authResponse) {
				return authResponse;
			}
			       // Parse request body
			       const body = await request.json();
			       if (method === 'POST') {
				       // Add new world
				       const { slug, title, description = '', published = false } = body;
				       if (!slug || !title) {
					       return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				       }
				       // Check for duplicate slug
				       const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				       if (exists) {
					       return new Response(JSON.stringify({ error: 'World with this slug already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
				       }
				       await env.CRT_STORIES_CONTENT.prepare('INSERT INTO worlds (slug, title, description, published, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))')
					       .bind(slug, title, description, published ? 1 : 0).run();
				       return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
			       }
			       if (method === 'PUT') {
				       // Update world
				       const { slug, title, description = '', published = false } = body;
				       if (!slug || !title) {
					       return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				       }
				       const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				       if (!exists) {
					       return new Response(JSON.stringify({ error: 'World not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				       }
				       await env.CRT_STORIES_CONTENT.prepare('UPDATE worlds SET title = ?, description = ?, published = ?, updated_at = datetime("now") WHERE slug = ? AND deleted_at IS NULL')
					       .bind(title, description, published ? 1 : 0, slug).run();
				       return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
			       }
			       if (method === 'DELETE') {
				       // Soft delete world
				       const { slug } = body;
				       if (!slug) {
					       return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				       }
				       const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM worlds WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				       if (!exists) {
					       return new Response(JSON.stringify({ error: 'World not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				       }
				       await env.CRT_STORIES_CONTENT.prepare('UPDATE worlds SET deleted_at = datetime("now") WHERE slug = ? AND deleted_at IS NULL').bind(slug).run();
				       return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
			       }
			       return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
		}
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
};
