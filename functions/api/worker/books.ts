// Cloudflare Pages Function: /api/worker/books
export const onRequest: PagesFunction = async (context) => {
	const { request, env } = context;
	const url = new URL(request.url);
	const method = request.method.toUpperCase();

	try {
		if (method === 'GET') {
			const slug = url.searchParams.get('slug');
			if (slug) {
				   const book = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				   if (!book) {
					   return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				   }
				   book.coverImage = book.cover_image;
				   book.badges = JSON.parse(book.badges || '[]');
				   book.tags = JSON.parse(book.tags || '[]');
				   book.formats = JSON.parse(book.formats || '[]');
				   book.characterSlugs = JSON.parse(book.characterSlugs || '[]');
				   book.related = book.related ? JSON.parse(book.related) : null;
				   return new Response(JSON.stringify(book), { headers: { 'Content-Type': 'application/json' } });
			} else {
				   const books = await env.CRT_STORIES_CONTENT.prepare('SELECT * FROM books WHERE deleted_at IS NULL ORDER BY title COLLATE NOCASE ASC').all();
				   const results = books.results.map((book) => ({
					   ...book,
					   coverImage: book.cover_image,
					   badges: JSON.parse(book.badges || '[]'),
					   tags: JSON.parse(book.tags || '[]'),
					   formats: JSON.parse(book.formats || '[]'),
					   characterSlugs: JSON.parse(book.characterSlugs || '[]'),
					   related: book.related ? JSON.parse(book.related) : null
				   }));
				   return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
			}
		}

		// POST, PUT, DELETE: implement as needed for admin/editor flows, using direct fields only
		return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
	} catch (err) {
		console.error('Books API error:', err);
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
