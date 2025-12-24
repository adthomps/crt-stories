export { Page };

import React from 'react';
import { books } from '../../../content';

function Page() {
  return (
    <>
      <h1 className="page-title">Books</h1>
      <p className="page-description">Discover all the books in our collection.</p>
      
      <div className="grid">
        {books.map((book) => (
          <div key={book.slug} className="card">
            <img src={book.coverImage} alt={book.title} />
            <div className="card-content">
              <h3 className="card-title">{book.title}</h3>
              <p className="card-description">{book.description}</p>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                Published: {new Date(book.publishDate).toLocaleDateString()}
              </p>
              <a href={`/books/${book.slug}`} className="button">Learn More</a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
