import { fetchBooks } from '../../../content';


export default async function onBeforePrerenderStart() {
  const books = await fetchBooks();
  // Get all unique series IDs from books
  const seriesIds = Array.from(
    new Set(
      books
        .filter(book => book.series && book.series.id)
        .map(book => book.series.id)
    )
  );
  // Return URLs for each series
  return seriesIds.map(id => `/series/${id}`);
}
