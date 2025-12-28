
import { fetchBooks } from '../../../content';

export async function onBeforePrerenderStart() {
  const books = await fetchBooks();
  const urls = books.map((book) => `/books/${book.slug}`);
  return urls;
}
