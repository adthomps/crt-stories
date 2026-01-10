export { Page };

import React from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import React, { useEffect, useState } from 'react';

function Page() {
  const pageContext = usePageContext();
  const { seriesId } = pageContext.routeParams;
  const [series, setSeries] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      fetch(`/api/worker/series?slug=${seriesId}`).then(res => res.json()),
      fetch('/api/worker/books').then(res => res.json())
    ]).then(([seriesData, booksData]) => {
      setSeries(seriesData);
      const seriesBooks = booksData
        .filter((book) => book.series && book.series.id === seriesId)
        .sort((a, b) => (a.series.bookNumber - b.series.bookNumber));
      setBooks(seriesBooks);
      setLoading(false);
    });
  }, [seriesId]);

  if (loading) return <div>Loading series...</div>;
  if (!series || books.length === 0) return <div>Series not found or no books in this series.</div>;

  const seriesName = series.title || seriesId;
  const seriesDescription = series.longDescription || series.description;

  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">{seriesName}</h1>
        <p className="page-description">{seriesDescription}</p>
      </div>
      <div className="section">
        <h2>Reading Order</h2>
        <div className="grid">
          {books.map((book) => {
            const desc = book.longDescription || book.description || '';
            let shortDesc = desc;
            if (desc.length > 140) {
              const periodIdx = desc.lastIndexOf('.', 140);
              if (periodIdx > 0) {
                shortDesc = desc.slice(0, periodIdx + 1);
              } else {
                shortDesc = desc.slice(0, 137) + '...';
              }
            }
            return (
              <div key={book.slug} className="card">
                <img src={book.coverImage} alt={book.title} />
                <div className="card-content">
                  <h3 className="card-title">{book.title}</h3>
                  <p className="card-description">Volume {book.series?.bookNumber}</p>
                  <p className="card-description" style={{ fontSize: '0.97rem', margin: '0.5rem 0 0.7rem 0', color: '#555' }}>{shortDesc}</p>
                  {book.badges && book.badges.length > 0 && (
                    <div className="badge-list">
                      {book.badges.map((badge, i) => (
                        <span key={i} className="badge">{badge}</span>
                      ))}
                    </div>
                  )}
                  <a href={`/books/${book.slug}`} className="button">
                    View Book
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
