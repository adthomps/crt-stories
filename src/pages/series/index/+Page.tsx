export { Page };

import React from 'react';
import { books } from '../../../content';

function Page() {
  // Get all unique series IDs
  const seriesIds = Array.from(new Set(books.filter(b => b.series).map(b => b.series!.id)));
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
          const seriesBooks = books.filter(b => b.series && b.series.id === seriesId);
          const firstBook = seriesBooks[0];
          // Shorten description to 140 chars
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
