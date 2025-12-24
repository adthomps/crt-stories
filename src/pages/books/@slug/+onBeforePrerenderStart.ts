export { onBeforePrerenderStart };

import { books } from '../../../content';

function onBeforePrerenderStart() {
  const urls = books.map((book) => `/books/${book.slug}`);
  return urls;
}
