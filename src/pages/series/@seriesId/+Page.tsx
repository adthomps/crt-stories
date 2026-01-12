import React, { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";

export { Page };

function Page() {
  const pageContext = usePageContext();
  const { seriesId } = pageContext.routeParams;
  const [series, setSeries] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSeriesAndBooks() {
      setLoading(true);
      setError(null);
      try {
        // Fetch series details
        const res = await fetch(`/api/worker/series?slug=${seriesId}`);
        if (!res.ok) throw new Error("Failed to fetch series");
        const s = await res.json();
        setSeries(s);

        // Fetch all books (could optimize to fetch only needed)
        const booksRes = await fetch("/api/worker/books");
        if (!booksRes.ok) throw new Error("Failed to fetch books");
        const allBooks = await booksRes.json();
        // Map bookSlugs to book objects
        const seriesBooks = (s.bookSlugs || [])
          .map((slug) => allBooks.find((b) => b.slug === slug))
          .filter(Boolean);
        setBooks(seriesBooks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSeriesAndBooks();
  }, [seriesId]);

  if (loading) return <div>Loading series details...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!series) return <div>Series not found.</div>;

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
          {books.length === 0 ? (
            <div>No books in this series.</div>
          ) : (
            books.map((book, idx) => {
              const desc = book.longDescription || book.description || "";
              let shortDesc = desc;
              if (desc.length > 140) {
                const periodIdx = desc.lastIndexOf(".", 140);
                if (periodIdx > 0) {
                  shortDesc = desc.slice(0, periodIdx + 1);
                } else {
                  shortDesc = desc.slice(0, 137) + "...";
                }
              }
              return (
                <div key={book.slug} className="card">
                  <img src={book.coverImage} alt={book.title} />
                  <div className="card-content">
                    <h3 className="card-title">{book.title}</h3>
                    <p className="card-description">Book {idx + 1}</p>
                    <p
                      className="card-description"
                      style={{
                        fontSize: "0.97rem",
                        margin: "0.5rem 0 0.7rem 0",
                        color: "#555",
                      }}
                    >
                      {shortDesc}
                    </p>
                    {/* Relationship tags and badges could be added here if needed */}
                    {book.badges && book.badges.length > 0 && (
                      <div className="badge-list">
                        {book.badges.map((badge, i) => (
                          <span key={i} className="badge">
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                    <a href={`/books/${book.slug}`} className="button">
                      View Book
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
//
// import React from 'react';
// import { usePageContext } from 'vike-react/usePageContext';
// import { series, books, worlds, characters } from '../../../content';
//
// function Page() {
//   const pageContext = usePageContext();
//   const { seriesId } = pageContext.routeParams;
//   const s = series.find((s) => s.slug === seriesId);
//   if (!s) return <div>Series not found.</div>;
//   const seriesBooks = (s.bookSlugs || [])
//     .map((slug) => books.find((b) => b.slug === slug))
//     .filter(Boolean);
//   if (seriesBooks.length === 0) return <div>No books in this series.</div>;
//   const seriesName = s.title || seriesId;
//   const seriesDescription = s.longDescription || s.description;
//
//   return (
//     <>
//       <div className="detail-header">
//         <h1 className="page-title">{seriesName}</h1>
//         <p className="page-description">{seriesDescription}</p>
//       </div>
//       <div className="section">
//         <h2>Reading Order</h2>
//         <div className="grid">
//           {seriesBooks.map((book, idx) => {
//             const desc = book.longDescription || book.description || '';
//             let shortDesc = desc;
//             if (desc.length > 140) {
//               const periodIdx = desc.lastIndexOf('.', 140);
//               if (periodIdx > 0) {
//                 shortDesc = desc.slice(0, periodIdx + 1);
//               } else {
//                 shortDesc = desc.slice(0, 137) + '...';
//               }
//             }
//             // Relationship tags
//             const worldTags = Array.from(new Set((book.worldSlugs || []).map((slug) => {
//               const w = worlds.find((w) => w.slug === slug);
//               return w ? w.title : slug;
//             })));
//             const characterTags = Array.from(new Set((book.characterSlugs || []).map((slug) => {
//               const c = characters.find((c) => c.slug === slug);
//               return c ? c.name : slug;
//             })));
//             return (
//               <div key={book.slug} className="card">
//                 <img src={book.coverImage} alt={book.title} />
//                 <div className="card-content">
//                   <h3 className="card-title">{book.title}</h3>
//                   <p className="card-description">Book {idx + 1}</p>
//                   <p className="card-description" style={{ fontSize: '0.97rem', margin: '0.5rem 0 0.7rem 0', color: '#555' }}>{shortDesc}</p>
//                   <div style={{ margin: '0.5rem 0' }}>
//                     {worldTags.length > 0 && worldTags.map(title => (
//                       <span key={title} style={{ background: '#fef9c3', color: '#92400e', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{title}</span>
//                     ))}
//                     {characterTags.length > 0 && characterTags.map(name => (
//                       <span key={name} style={{ background: '#d1fae5', color: '#065f46', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{name}</span>
//                     ))}
//                   </div>
//                   {book.badges && book.badges.length > 0 && (
//                     <div className="badge-list">
//                       {book.badges.map((badge, i) => (
//                         <span key={i} className="badge">{badge}</span>
//                       ))}
//                     </div>
//                   )}
//                   <a href={`/books/${book.slug}`} className="button">
//                     View Book
//                   </a>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </>
//   );
// }
