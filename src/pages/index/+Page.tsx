export { Page };

// import { books, worlds, characters } from '../../content'; // Legacy static import (commented for safety)
import { books, worlds, characters, series } from "../../content";
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
      <section className="section">
        <h2>Explore Worlds</h2>
        <div className="grid">
          {worlds.slice(0, 5).map((world: any) => {
            // Relationship tags
            const bookTags = Array.from(
              new Set(
                (world.bookSlugs || [])
                  .map((slug: string) => {
                    const b = books.find((b: any) => b.slug === slug);
                    return b ? b.title : null;
                  })
                  .filter(Boolean)
              )
            );
            const characterTags = Array.from(
              new Set(
                (world.characterSlugs || [])
                  .map((slug: string) => {
                    const c = characters.find((c: any) => c.slug === slug);
                    return c ? c.name : null;
                  })
                  .filter(Boolean)
              )
            );
            return (
              <div key={world.slug} className="card">
                <img src={world.heroImage} alt={world.title} />
                <div className="card-content">
                  <h3 className="card-title">{world.title}</h3>
                  <p className="card-description">{world.description}</p>
                  {/* Removed book and character badges from worlds section */}
                  <a href={`/worlds/${world.slug}`} className="button">
                    Explore
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        {worlds.length > 3 && (
          <div style={{ marginTop: "2rem" }}>
            <a href="/worlds" className="button">
              View All Worlds
            </a>
          </div>
        )}
      </section>

      {/* Series Section SECOND */}
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
            return (
              <div key={s.slug} className="card">
                <img src={firstBook?.coverImage || s.heroImage} alt={s.title} />
                <div className="card-content">
                  <h3 className="card-title">{s.title}</h3>
                  <p className="card-description">{s.description}</p>
                  {/* Removed book badges from series section */}
                  <a href={`/series/${s.slug}`} className="button">
                    View Series
                  </a>
                </div>
              </div>
            );
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

      {/* Books Section THIRD */}
      <section className="section">
        <h2>Featured Books</h2>
        <div className="grid">
          {books.slice(0, 5).map((book: any) => {
            const desc = book.longDescription || book.description || "";
            let expanded = desc;
            if (desc.length > 320) {
              const periodIdx = desc.lastIndexOf(".", 320);
              if (periodIdx > 0) {
                expanded = desc.slice(0, periodIdx + 1);
              } else {
                expanded = desc.slice(0, 317) + "...";
              }
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
