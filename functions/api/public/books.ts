// Cloudflare Pages Function: /api/public/books
export const onRequest: PagesFunction = async ({ env }) => {
	const rows = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM books WHERE published = 1 AND deleted_at IS NULL').all();
	const parsed = rows.results.map(book => ({
		...book,
		badges: JSON.parse(book.badges || '[]'),
		tags: JSON.parse(book.tags || '[]'),
		formats: JSON.parse(book.formats || '[]'),
		characterSlugs: JSON.parse(book.characterSlugs || '[]'),
		related: book.related ? JSON.parse(book.related) : null
	}));
	return new Response(JSON.stringify(parsed), { status: 200 });
};
// Cloudflare Pages Function: /api/public/books
// Read-only endpoint for published books
export {};
