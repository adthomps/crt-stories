// Cloudflare Pages Function: /api/public/worlds
export const onRequest: PagesFunction = async ({ env }) => {
	const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM worlds WHERE published = 1 AND deleted_at IS NULL').all();
	return new Response(JSON.stringify(rows.results), { status: 200 });
};
// Cloudflare Pages Function: /api/public/worlds
// Read-only endpoint for published worlds
export {};
