export { Page };

// import { books, worlds, characters } from '../../content'; // Legacy static import (commented for safety)
import { books, worlds, characters, series } from "../../content";
import { CharacterCard } from "src/components/CharacterCard";
import { WorldCard } from "src/components/WorldCard";
import { BookCard } from "src/components/BookCard";
import { SeriesCard } from "src/components/SeriesCard";
import { siteConfig } from "../../config";

import React from "react";

function Page() {
  // Use static books, worlds, characters for build

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
        <div className="grid">
          {books.slice(0, 5).map((book: any) => (
            <BookCard key={book.slug} book={book} />
          ))}
              View All Series
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
                    : character.bio || ""
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
            }
            // Relationship tags (deduplicate by slug, then by title)
            const seriesTags = Array.from(
              new Map(
                (book.seriesSlugs || [])
                  .map((slug: string) => {
                    const s = series.find((s: any) => s.slug === slug);
                    return s ? [s.slug, s.title] : null;
                  })
                  .filter(Boolean)
              ).values()
            );
            const worldTags = Array.from(
              new Map(
                (book.worldSlugs || [])
                  .map((slug: string) => {
                    const w = worlds.find((w: any) => w.slug === slug);
                    return w ? [w.slug, w.title] : null;
                  })
                  .filter(Boolean)
              ).values()
            );
            return (
              <div key={book.slug} className="card">
                <img src={book.coverImage} alt={book.title} />
                <div className="card-content">
                  <h3 className="card-title">{book.title}</h3>
                  <p className="card-description">{expanded}</p>
                  {/* Removed series and world badges from books section */}
                  <a href={`/books/${book.slug}`} className="button">
                    Learn More
                  </a>
                </div>
              </div>
            );
          })}
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
          {characters.slice(0, 5).map((character: any) => {
            // Relationship tags (deduplicate by slug, then by title)
            const worldTags = Array.from(
              new Map(
                (character.worldSlugs || [])
                  .map((slug: string) => {
                    const w = worlds.find((w: any) => w.slug === slug);
                    return w ? [w.slug, w.title] : null;
                  })
                  .filter(Boolean)
              ).values()
            );
            const bookTags = Array.from(
              new Map(
                (character.appearsInBookSlugs || [])
                  .map((slug: string) => {
                    const b = books.find((b: any) => b.slug === slug);
                    return b ? [b.slug, b.title] : null;
                  })
                  .filter(Boolean)
              ).values()
            );
            const seriesTags = Array.from(
              new Map(
                (character.seriesSlugs || [])
                  .map((slug: string) => {
                    const s = series.find((s: any) => s.slug === slug);
                    return s ? [s.slug, s.title] : null;
                  })
                  .filter(Boolean)
              ).values()
            );
            return (
              <div key={character.slug} className="card">
                <img src={character.portraitImage} alt={character.name} />
                <div className="card-content">
                  <h3 className="card-title">{character.name}</h3>
                  <p className="card-description">
                    {character.bio
                      ? character.bio.slice(0, 120) +
                        (character.bio.length > 120 ? "..." : "")
                      : ""}
                  </p>
                  {/* Removed world, book, and series badges from characters section */}
                  <a href={`/characters/${character.slug}`} className="button">
                    View Profile
                  </a>
                </div>
              </div>
            );
          })}
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
