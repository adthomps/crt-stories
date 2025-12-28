export { Page };

import React from 'react';
// import { books } from '../../../content'; // Legacy static import (commented for safety)
import { books } from '../../../content';
import React from 'react';

function Page() {

  // Use static books for build
  // Remove loading/error states for static data

  return (
    <>
      <h1 className="page-title">Books</h1>
      <p className="page-description">Discover all the books in our collection.</p>
      <div className="grid">
        {books.map((book: any) => {
          const desc = book.longDescription || book.description || '';
          let expanded = desc;
          if (desc.length > 320) {
            const periodIdx = desc.lastIndexOf('.', 320);
            if (periodIdx > 0) {
              expanded = desc.slice(0, periodIdx + 1);
            } else {
              expanded = desc.slice(0, 317) + '...';
            }
          }
          return (
            <div key={book.slug} className="card">
              <img src={book.coverImage} alt={book.title} />
              <div className="card-content">
                <h3 className="card-title">{book.title}</h3>
                <p className="card-description">{expanded}</p>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  Published: {new Date(book.publishDate).toLocaleDateString()}
                </p>
                <a href={`/books/${book.slug}`} className="button">Learn More</a>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
