export { Page };

import React from 'react';
// import { books } from '../../../content'; // Legacy static import (commented for safety)
import React, { useEffect, useState } from 'react';

function Page() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/worker/series')
      .then(res => res.json())
      .then(data => {
        setSeries(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading series...</div>;
  if (!series || series.length === 0) return <div>No series found.</div>;

  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">Book Series</h1>
        <p className="page-description">Explore all book series and their reading order.</p>
      </div>
      <div className="grid">
        {series.map(s => {
          const desc = s.longDescription || s.description || '';
          const shortDesc = desc.length > 140 ? desc.slice(0, 137) + '...' : desc;
          return (
            <div key={s.slug} className="card">
              <img src={s.heroImage} alt={s.title} />
              <div className="card-content">
                <h3 className="card-title">{s.title}</h3>
                <p className="card-description">{shortDesc}</p>
                <a href={`/series/${s.slug}`} className="button">View Series</a>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
