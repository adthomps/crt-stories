export const onRequest: PagesFunction = async (context) => {
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
				const results = rows.results.map((world) => ({
					...world,
					themeTags: JSON.parse(world.themeTags || '[]'),
					bookSlugs: JSON.parse(world.bookSlugs || '[]'),
					characterSlugs: JSON.parse(world.characterSlugs || '[]')
				}));
				return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
			}
		}

		// POST, PUT, DELETE: implement as needed for admin/editor flows, using direct fields only
		return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
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
