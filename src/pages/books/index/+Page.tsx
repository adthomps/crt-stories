export { Page };

import React from 'react';
// import { books } from '../../../content'; // Legacy static import (commented for safety)
import { fetchBooks } from '../../../content';
import React from 'react';

function Page() {
  const [books, setBooks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    fetchBooks()
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load books');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading books...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

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
