// Script: export-series-from-books-to-json.ts
// Usage: Run with Node.js to generate series.json from books.json

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const booksPath = path.resolve(__dirname, '../src/content/books.json');
const outputPath = path.resolve(__dirname, '../src/content/series.json');

const books = JSON.parse(fs.readFileSync(booksPath, 'utf-8'));

// Collect unique series from books
const seriesMap = new Map();
for (const book of books) {
  if (book.series && book.series.id) {
    const id = book.series.id;
    if (!seriesMap.has(id)) {
      seriesMap.set(id, {
        slug: id,
        title: book.series.name,
        subtitle: book.subtitle || '',
        description: book.description || '',
        longDescription: book.longDescription || '',
        badges: book.badges || [],
        tags: book.tags || [],
        ogImage: book.ogImage || null,
        heroImage: book.coverImage || null,
        formats: book.formats || [],
        published: true
      });
    }
  }
}

const seriesArr = Array.from(seriesMap.values());
fs.writeFileSync(outputPath, JSON.stringify(seriesArr, null, 2));
console.log(`Exported ${seriesArr.length} series to series.json`);
