export { Page };

import React, { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";

function Page() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  const [series, setSeries] = useState<any | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [worlds, setWorlds] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/worker/series?slug=${encodeURIComponent(slug)}`, {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
      fetch("/api/worker/books", {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
      fetch("/api/worker/worlds", {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
      fetch("/api/worker/characters", {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
    ])
      .then(([seriesData, booksData, worldsData, charactersData]) => {
        if (!seriesData || seriesData.error)
          throw new Error("Series not found");
        setSeries(seriesData);
        setBooks(Array.isArray(booksData) ? booksData : []);
        setWorlds(Array.isArray(worldsData) ? worldsData : []);
        setCharacters(Array.isArray(charactersData) ? charactersData : []);
      })
      .catch((e) => setError(e.message || "Failed to load series"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error || !series)
    return <div style={{ color: "red" }}>{error || "Series not found."}</div>;

  const seriesBooks = (series.bookSlugs || [])
    .map((slug: string) => books.find((b: any) => b.slug === slug))
    .filter(Boolean);
  if (seriesBooks.length === 0) return <div>No books in this series.</div>;
  const seriesName = series.title || slug;
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
          {seriesBooks.map((book: any, idx: number) => {
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
            // Relationship tags
            const worldTags = Array.from(
              new Set(
                (book.worldSlugs || []).map((slug: string) => {
                  const w = worlds.find((w: any) => w.slug === slug);
                  return w ? w.title : slug;
                })
              )
            );
            const characterTags = Array.from(
              new Set(
                (book.characterSlugs || []).map((slug: string) => {
                  const c = characters.find((c: any) => c.slug === slug);
                  return c ? c.name : slug;
                })
              )
            );
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
                  <div style={{ margin: "0.5rem 0" }}>
                    {worldTags.length > 0 &&
                      worldTags.map((title) => (
                        <span
                          key={title}
                          style={{
                            background: "#fef9c3",
                            color: "#92400e",
                            borderRadius: 6,
                            padding: "2px 8px",
                            marginRight: 4,
                            fontSize: 13,
                          }}
                        >
                          {title}
                        </span>
                      ))}
                    {characterTags.length > 0 &&
                      characterTags.map((name) => (
                        <span
                          key={name}
                          style={{
                            background: "#d1fae5",
                            color: "#065f46",
                            borderRadius: 6,
                            padding: "2px 8px",
                            marginRight: 4,
                            fontSize: 13,
                          }}
                        >
                          {name}
                        </span>
                      ))}
                  </div>
                  {book.badges && book.badges.length > 0 && (
                    <div className="badge-list">
                      {book.badges.map((badge: any, i: number) => (
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
          })}
        </div>
      </div>
    </>
  );
}
