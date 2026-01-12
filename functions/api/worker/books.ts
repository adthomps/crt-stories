// Cloudflare Pages Function: /api/worker/books
import type { PagesFunction } from 'vite-plugin-cloudflare-pages';
export const onRequest: PagesFunction = async (context: any) => {
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
				const results = books.results.map((book: any) => ({
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

			 // POST, PUT, DELETE: mutation logic for worker admin
			 const { requireWorkerAdminAuth } = await import('./requireAuth');
			 const authResponse = await requireWorkerAdminAuth(request);
			 if (authResponse) {
				 return authResponse;
			 }
			 const body = await request.json();
			 if (method === 'POST') {
				 const { slug, title, description = '', coverImage = '', publishDate = '', badges = [], tags = [], formats = [], characterSlugs = [], worldSlugs = [], seriesSlugs = [], excerpt = '', published = false } = body;
				 if (!slug || !title) {
					 return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				 }
				 // Check for duplicate slug
				 const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				 if (exists) {
					 return new Response(JSON.stringify({ error: 'Book with this slug already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
				 }
				 await env.CRT_STORIES_CONTENT.prepare('INSERT INTO books (slug, title, description, cover_image, publish_date, badges, tags, formats, characterSlugs, worldSlugs, seriesSlugs, excerpt, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))')
					 .bind(slug, title, description, coverImage, publishDate, JSON.stringify(badges), JSON.stringify(tags), JSON.stringify(formats), JSON.stringify(characterSlugs), JSON.stringify(worldSlugs), JSON.stringify(seriesSlugs), excerpt, published ? 1 : 0).run();
				 return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
			 }
			 if (method === 'PUT') {
				 const { slug, title, description = '', coverImage = '', publishDate = '', badges = [], tags = [], formats = [], characterSlugs = [], worldSlugs = [], seriesSlugs = [], excerpt = '', published = false } = body;
				 if (!slug || !title) {
					 return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				 }
				 const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				 if (!exists) {
					 return new Response(JSON.stringify({ error: 'Book not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				 }
				 await env.CRT_STORIES_CONTENT.prepare('UPDATE books SET title = ?, description = ?, cover_image = ?, publish_date = ?, badges = ?, tags = ?, formats = ?, characterSlugs = ?, worldSlugs = ?, seriesSlugs = ?, excerpt = ?, published = ?, updated_at = datetime("now") WHERE slug = ? AND deleted_at IS NULL')
					 .bind(title, description, coverImage, publishDate, JSON.stringify(badges), JSON.stringify(tags), JSON.stringify(formats), JSON.stringify(characterSlugs), JSON.stringify(worldSlugs), JSON.stringify(seriesSlugs), excerpt, published ? 1 : 0, slug).run();
				 return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
			 }
			 if (method === 'DELETE') {
				 const { slug } = body;
				 if (!slug) {
					 return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
				 }
				 const exists = await env.CRT_STORIES_CONTENT.prepare('SELECT slug FROM books WHERE slug = ? AND deleted_at IS NULL').bind(slug).first();
				 if (!exists) {
					 return new Response(JSON.stringify({ error: 'Book not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
				 }
				 await env.CRT_STORIES_CONTENT.prepare('UPDATE books SET deleted_at = datetime("now") WHERE slug = ? AND deleted_at IS NULL').bind(slug).run();
				 return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
			 }
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
