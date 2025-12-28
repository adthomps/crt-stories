
import { books } from '../../../content';

export function onBeforePrerenderStart() {
  const urls = books.map((book) => `/books/${book.slug}`);
  return urls;
}
