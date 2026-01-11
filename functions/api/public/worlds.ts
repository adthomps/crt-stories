// Cloudflare Pages Function: /api/public/worlds
export const onRequest: PagesFunction = async ({ env }) => {
	const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM worlds WHERE published = 1 AND deleted_at IS NULL').all();
	const parsed = rows.results.map(world => ({
		...world,
		themeTags: JSON.parse(world.themeTags || '[]'),
		bookSlugs: JSON.parse(world.bookSlugs || '[]'),
		characterSlugs: JSON.parse(world.characterSlugs || '[]')
	}));
	return new Response(JSON.stringify(parsed), { status: 200 });
};
// Cloudflare Pages Function: /api/public/worlds
// Read-only endpoint for published worlds
export {};
