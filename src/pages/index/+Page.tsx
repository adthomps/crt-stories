export { Page };

// import { books, worlds, characters } from '../../content'; // Legacy static import (commented for safety)
// import { books, worlds, characters, series } from "../../content";
import { CharacterCard } from "src/components/CharacterCard";
import { WorldCard } from "src/components/WorldCard";
import { BookCard } from "src/components/BookCard";
import { SeriesCard } from "src/components/SeriesCard";
import { siteConfig } from "../../config";

import React from "react";

  const [books, setBooks] = React.useState<any[]>([]);
  const [worlds, setWorlds] = React.useState<any[]>([]);
  const [series, setSeries] = React.useState<any[]>([]);
  const [characters, setCharacters] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('/api/worker/books').then(r => r.json()),
      fetch('/api/worker/worlds').then(r => r.json()),
      fetch('/api/worker/series').then(r => r.json()),
      fetch('/api/worker/characters').then(r => r.json()),
    ])
      .then(([books, worlds, series, characters]) => {
        setBooks(books);
        setWorlds(worlds);
        setSeries(series);
        setCharacters(characters);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">
          Welcome to {siteConfig.author}'s Universe
        </h1>
        <p className="page-description">
          Explore epic tales, immersive worlds, and unforgettable characters.
        </p>
        <div style={{ marginTop: "1.2rem" }}>
          <a href="/about" className="button button-secondary">
            About the Author
          </a>
        </div>
      </div>

      {/* Worlds Section FIRST */}
      <section className="section">
        <h2>Explore Worlds</h2>
        <div className="grid">
          {worlds.slice(0, 5).map((world: any) => (
            <WorldCard key={world.slug} world={world} />
          ))}
        </div>
        {worlds.length > 3 && (
          <div style={{ marginTop: "2rem" }}>
            <a href="/worlds" className="button">
              View All Worlds
            </a>
          </div>
        )}
      </section>

      {/* Series Section */}
      <section className="section">
        <h2>Book Series</h2>
        <div className="grid">
          {series.slice(0, 5).map((s: any) => {
            const seriesBooks = Array.from(
              new Set(
                (s.bookSlugs || [])
                  .map((slug: string) =>
                    books.find((b: any) => b.slug === slug)
                  )
                  .filter(Boolean)
              )
            );
            const firstBook = seriesBooks[0];
            return <SeriesCard key={s.slug} series={s} firstBook={firstBook} />;
          })}
        </div>
        {series.length > 3 && (
          <div style={{ marginTop: "2rem" }}>
            <a href="/series" className="button">
              View All Series
            </a>
          </div>
        )}
      </section>

      {/* Books Section */}
      <section className="section">
        <h2>Books</h2>
        <div className="grid">
          {books.slice(0, 5).map((book: any) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
        {books.length > 3 && (
          <div style={{ marginTop: "2rem" }}>
            <a href="/books" className="button">
              View All Books
            </a>
          </div>
        )}
      </section>

      {/* Characters Section LAST */}
      <section className="section">
        <h2>Meet the Characters</h2>
        <div className="grid">
          {characters.slice(0, 5).map((character: any) => (
            <CharacterCard
              key={character.slug}
              character={{
                ...character,
                // Truncate bio for summary view
                description:
                  character.bio && character.bio.length > 120
                    ? character.bio.slice(0, 120) + "..."
                    : character.bio || "",
              }}
            />
          ))}
        </div>
        {characters.length > 3 && (
          <div style={{ marginTop: "2rem" }}>
            <a href="/characters" className="button">
              View All Characters
            </a>
          </div>
        )}
      </section>
    </>
  );
}
