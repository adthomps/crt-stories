// Cloudflare Pages Function: /api/public/characters
export const onRequest: PagesFunction = async ({ env }) => {
	const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM characters WHERE published = 1 AND deleted_at IS NULL').all();
	const parsed = rows.results.map(character => ({
		...character,
		worldSlugs: JSON.parse(character.worldSlugs || '[]'),
		appearsInBookSlugs: JSON.parse(character.appearsInBookSlugs || '[]'),
		seriesSlugs: JSON.parse(character.seriesSlugs || '[]'),
		tags: JSON.parse(character.tags || '[]')
	}));
	return new Response(JSON.stringify(parsed), { status: 200 });
};
// Cloudflare Pages Function: /api/public/characters
// Read-only endpoint for published characters
export {};
