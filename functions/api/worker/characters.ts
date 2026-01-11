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
				   character.portraitImage = character.portrait_image;
				   character.bio = character.bio;
				   character.description = character.description;
				   character.worldSlugs = JSON.parse(character.worldSlugs || '[]');
				   character.seriesSlugs = JSON.parse(character.seriesSlugs || '[]');
				   character.bookSlugs = JSON.parse(character.appearsInBookSlugs || '[]');
				   character.tags = JSON.parse(character.tags || '[]');
				   return new Response(JSON.stringify(character), { headers: { 'Content-Type': 'application/json' } });
			} else {
				const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM characters WHERE deleted_at IS NULL').all();
				   const results = rows.results.map((character) => ({
					   ...character,
					   portraitImage: character.portrait_image,
					   bio: character.bio,
					   description: character.description,
					   worldSlugs: JSON.parse(character.worldSlugs || '[]'),
					   seriesSlugs: JSON.parse(character.seriesSlugs || '[]'),
					   bookSlugs: JSON.parse(character.appearsInBookSlugs || '[]'),
					   tags: JSON.parse(character.tags || '[]')
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
