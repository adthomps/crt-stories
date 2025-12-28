// Cloudflare Pages Function: /api/public/books
export const onRequest: PagesFunction = async ({ env }) => {
	const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM books WHERE published = 1 AND deleted_at IS NULL').all();
	return new Response(JSON.stringify(rows.results), { status: 200 });
};
// Cloudflare Pages Function: /api/public/books
// Read-only endpoint for published books
export {};
