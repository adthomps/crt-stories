export const onRequest: PagesFunction = async (context: any) => {
	const { request, env } = context;
	const url = new URL(request.url);
	const method = request.method.toUpperCase();

	try {
		if (method === 'GET') {
			const slug = url.searchParams.get('slug');
			if (slug) {
				const series = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM series WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				import type { PagesFunction } from 'vite-plugin-cloudflare-pages';
				if (!series) {
					return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				}
				series.badges = JSON.parse(series.badges || '[]');
				series.tags = JSON.parse(series.tags || '[]');
				return new Response(JSON.stringify(series), { headers: { 'Content-Type': 'application/json' } });
			} else {
				const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM series WHERE deleted_at IS NULL').all();
				const results = rows.results.map((series: any) => ({
					...series,
					badges: JSON.parse(series.badges || '[]'),
					tags: JSON.parse(series.tags || '[]')
				}));
				return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
			}
		}

		// POST, PUT, DELETE: implement as needed for admin/editor flows, using direct fields only
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
		import type { PagesFunction } from 'vite-plugin-cloudflare-pages';
		);
	}
};
