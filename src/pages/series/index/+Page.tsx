export { Page };

import React from "react";

import { useEffect, useState } from "react";

function Page() {
  const [series, setSeries] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/worker/series", {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
      fetch("/api/worker/books", {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
    ])
      .then(([seriesData, booksData]) => {
        setSeries(Array.isArray(seriesData) ? seriesData : []);
        setBooks(Array.isArray(booksData) ? booksData : []);
      })
      .catch((err) => setError("Failed to load series"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!series || series.length === 0) return <div>No series found.</div>;

  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">Book Series</h1>
        <p className="page-description">
          Explore all book series and their reading order.
        </p>
      </div>
      <div className="grid">
        {series.slice(0, 5).map((s) => {
          const desc = s.longDescription || s.description || "";
          const shortDesc =
            desc.length > 140 ? desc.slice(0, 137) + "..." : desc;
          const seriesBooks = (s.bookSlugs || [])
            .map((slug: string) => books.find((b) => b.slug === slug))
            .filter(Boolean);
          return (
            <div key={s.slug} className="card">
              <img
                src={
                  s.heroImage || (seriesBooks[0] && seriesBooks[0].coverImage)
                }
                alt={s.title}
              />
              <div className="card-content">
                <h3 className="card-title">{s.title}</h3>
                <p className="card-description">{shortDesc}</p>
                {seriesBooks.length > 0 && (
                  <div style={{ margin: "0.5rem 0 1rem 0" }}>
                    <strong>Books:</strong>{" "}
                    {seriesBooks.slice(0, 3).map((b: any, i: number) => (
                      <span
                        key={b.slug}
                        style={{
                          background: "#e0e7ff",
                          color: "#3730a3",
                          borderRadius: 6,
                          padding: "2px 8px",
                          marginRight: 4,
                          fontSize: 13,
                        }}
                      >
                        {b.title}
                        {i < seriesBooks.length - 1 && i < 2 ? "," : ""}
                      </span>
                    ))}
                    {seriesBooks.length > 3 && (
                      <span style={{ color: "#888", marginLeft: 4 }}>
                        +{seriesBooks.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                <a href={`/series/${s.slug}`} className="button">
                  View Series
                </a>
              </div>
            </div>
          );
        })}
      </div>
      {series.length > 5 && (
        <div style={{ marginTop: "2rem" }}>
          <a href="/series" className="button">
            View All Series
          </a>
        </div>
      )}
    </>
  );
}
