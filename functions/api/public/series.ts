// Cloudflare Pages Function: /api/public/series
	const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM series WHERE published = 1 AND deleted_at IS NULL').all();
	return new Response(JSON.stringify(rows.results), { status: 200 });
};
export const onRequest: PagesFunction = async ({ env }) => {
	const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM series WHERE published = 1 AND deleted_at IS NULL').all();
	const parsed = rows.results.map(series => ({
		...series,
		badges: JSON.parse(series.badges || '[]'),
		tags: JSON.parse(series.tags || '[]')
	}));
	return new Response(JSON.stringify(parsed), { status: 200 });
};
// Cloudflare Pages Function: /api/public/series
// Read-only endpoint for published series
export {};
