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

  // Get all unique series IDs
  const seriesIds = Array.from(new Set(books.filter((b: any) => b.series).map((b: any) => b.series.id)));
  if (loading) return <div>Loading series...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (seriesIds.length === 0) {
    return <div>No series found.</div>;
  }
  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">Book Series</h1>
        <p className="page-description">Explore all book series and their reading order.</p>
      </div>
      <div className="grid">
        {seriesIds.map(seriesId => {
          const seriesBooks = books.filter((b: any) => b.series && b.series.id === seriesId);
          const firstBook = seriesBooks[0];
          const desc = firstBook.longDescription || firstBook.description || '';
          const shortDesc = desc.length > 140 ? desc.slice(0, 137) + '...' : desc;
          return (
            <div key={seriesId} className="card">
              <img src={firstBook.coverImage} alt={firstBook.series?.name || seriesId} />
              <div className="card-content">
                <h3 className="card-title">{firstBook.series?.name || seriesId}</h3>
                <p className="card-description">{shortDesc}</p>
                <a href={`/series/${seriesId}`} className="button">View Series</a>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
