export { Page };

import React from "react";
// import { worlds } from '../../../content'; // Legacy static import (commented for safety)

import { useEffect, useState } from "react";

function Page() {
  const [worlds, setWorlds] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(20);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/worker/worlds", {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
      fetch("/api/worker/books", {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
      fetch("/api/worker/characters", {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
    ])
      .then(([worldsData, booksData, charactersData]) => {
        setWorlds(Array.isArray(worldsData) ? worldsData : []);
        setBooks(Array.isArray(booksData) ? booksData : []);
        setCharacters(Array.isArray(charactersData) ? charactersData : []);
      })
      .catch((err) => setError("Failed to load worlds"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!worlds || worlds.length === 0) return <div>No worlds found.</div>;

  return (
    <>
      <h1 className="page-title">Worlds</h1>
      <p className="page-description">
        Explore the vast and immersive worlds where our stories take place.
      </p>
      <div className="grid">
        {worlds.slice(0, showCount).map((world: any) => {
          // Relationship tags
          const bookTags = Array.from(
            new Set(
              (world.bookSlugs || []).map((slug: string) => {
                const b = books.find((b: any) => b.slug === slug);
                return b ? b.title : slug;
              })
            )
          );
          const characterTags = Array.from(
            new Set(
              (world.characterSlugs || []).map((slug: string) => {
                const c = characters.find((c: any) => c.slug === slug);
                return c ? c.name : slug;
              })
            )
          );
          return (
            <div key={world.slug} className="card">
              <img src={world.heroImage} alt={world.title} />
              <div className="card-content">
                <h3 className="card-title">{world.title}</h3>
                {world.themeTags && world.themeTags.length > 0 && (
                  <div className="tag-list" style={{ marginBottom: "0.5rem" }}>
                    {world.themeTags.map((tag: any, i: number) => (
                      <span key={i} className="badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ margin: "0.5rem 0" }}>
                  {bookTags.length > 0 &&
                    bookTags.slice(0, 3).map((title) => (
                      <span
                        key={title}
                        style={{
                          background: "#e0e7ff",
                          color: "#3730a3",
                          borderRadius: 6,
                          padding: "2px 8px",
                          marginRight: 4,
                          fontSize: 13,
                        }}
                      >
                        {title}
                      </span>
                    ))}
                  {bookTags.length > 3 && (
                    <span style={{ color: "#888", marginLeft: 4 }}>
                      +{bookTags.length - 3} more
                    </span>
                  )}
                  {characterTags.length > 0 &&
                    characterTags.slice(0, 3).map((name) => (
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
                  {characterTags.length > 3 && (
                    <span style={{ color: "#888", marginLeft: 4 }}>
                      +{characterTags.length - 3} more
                    </span>
                  )}
                </div>
                <p className="card-description">{world.description}</p>
                {world.summary && (
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: "#555",
                      margin: "0.5rem 0 0.5rem 0",
                    }}
                  >
                    {world.summary}
                  </p>
                )}
                <a href={`/worlds/${world.slug}`} className="button">
                  Explore
                </a>
              </div>
            </div>
          );
        })}
      </div>
      {worlds.length > showCount && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            style={{
              background: "#222b3a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: "1.1rem",
              cursor: "pointer",
              boxShadow: "0 1px 4px #0001",
              transition: "background 0.2s",
              outline: "none",
              letterSpacing: 0.5,
            }}
            onClick={() => setShowCount((c) => c + 20)}
          >
            Show More
          </button>
        </div>
      )}
    </>
  );
}
