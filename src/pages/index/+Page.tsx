export { Page };


// import { books, worlds, characters } from '../../content'; // Legacy static import (commented for safety)
import { fetchBooks, fetchWorlds, fetchCharacters } from '../../content';
import { siteConfig } from '../../config';

import React from 'react';

function Page() {
  const [books, setBooks] = React.useState([]);
  const [worlds, setWorlds] = React.useState([]);
  const [characters, setCharacters] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([fetchBooks(), fetchWorlds(), fetchCharacters()])
      .then(([booksData, worldsData, charactersData]) => {
        setBooks(booksData);
        setWorlds(worldsData);
        setCharacters(charactersData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load content');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading content...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">Welcome to {siteConfig.author}'s Universe</h1>
        <p className="page-description">
          Explore epic tales, immersive worlds, and unforgettable characters.
        </p>
        <div style={{ marginTop: '1.2rem' }}>
          <a href="/about" className="button button-secondary">About the Author</a>
        </div>
      </div>

      {/* Series Section FIRST */}
      <section className="section">
        <h2>Book Series</h2>
        <div className="grid">
          {Array.from(new Set(books.filter((b: any) => b.series).map((b: any) => b.series.id))).map(seriesId => {
            const seriesBooks = books.filter((b: any) => b.series && b.series.id === seriesId);
            const firstBook = seriesBooks[0];
            return (
              <div key={seriesId} className="card">
                <img src={firstBook.coverImage} alt={firstBook.series?.name || seriesId} />
                <div className="card-content">
                  <h3 className="card-title">{firstBook.series?.name || seriesId}</h3>
                  <p className="card-description">{firstBook.longDescription || firstBook.description}</p>
                  <a href={`/series/${seriesId}`} className="button">View Series</a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2>Featured Books</h2>
        <div className="grid">
          {books.slice(0, 3).map((book: any) => {
            const desc = book.longDescription || book.description || '';
            let expanded = desc;
            if (desc.length > 320) {
              const periodIdx = desc.lastIndexOf('.', 320);
              if (periodIdx > 0) {
                expanded = desc.slice(0, periodIdx + 1);
              } else {
                expanded = desc.slice(0, 317) + '...';
              }
            }
            return (
              <div key={book.slug} className="card">
                <img src={book.coverImage} alt={book.title} />
                <div className="card-content">
                  <h3 className="card-title">{book.title}</h3>
                  <p className="card-description">{expanded}</p>
                  <a href={`/books/${book.slug}`} className="button">Learn More</a>
                </div>
              </div>
            );
          })}
        </div>
        {books.length > 3 && (
          <div style={{ marginTop: '2rem' }}>
            <a href="/books" className="button">View All Books</a>
          </div>
        )}
      </section>

      <section className="section">
        <h2>Explore Worlds</h2>
        <div className="grid">
          {worlds.slice(0, 3).map((world: any) => (
            <div key={world.slug} className="card">
              <img src={world.heroImage} alt={world.title} />
              <div className="card-content">
                <h3 className="card-title">{world.title}</h3>
                <p className="card-description">{world.description}</p>
                <a href={`/worlds/${world.slug}`} className="button">Explore</a>
              </div>
            </div>
          ))}
        </div>
        {worlds.length > 3 && (
          <div style={{ marginTop: '2rem' }}>
            <a href="/worlds" className="button">View All Worlds</a>
          </div>
        )}
      </section>

      <section className="section">
        <h2>Meet the Characters</h2>
        <div className="grid">
          {characters.slice(0, 3).map((character: any) => (
            <div key={character.slug} className="card">
              <img src={character.portraitImage} alt={character.name} />
              <div className="card-content">
                <h3 className="card-title">{character.name}</h3>
                <p className="card-description">{character.bio ? character.bio.slice(0, 120) + (character.bio.length > 120 ? '...' : '') : ''}</p>
                <a href={`/characters/${character.slug}`} className="button">View Profile</a>
              </div>
            </div>
          ))}
        </div>
        {characters.length > 3 && (
          <div style={{ marginTop: '2rem' }}>
            <a href="/characters" className="button">View All Characters</a>
          </div>
        )}
      </section>
    </>
  );
}
