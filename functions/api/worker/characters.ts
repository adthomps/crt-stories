export const onRequest: PagesFunction = async (context) => {
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
				   const results = rows.results.map((character) => ({
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

		// POST, PUT, DELETE: implement as needed for admin/editor flows, using direct fields only
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
