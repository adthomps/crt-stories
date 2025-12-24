export { Page };

import React from 'react';
import { books, worlds, characters } from '../../content';
import { siteConfig } from '../../config';

function Page() {
  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">Welcome to {siteConfig.author}'s Universe</h1>
        <p className="page-description">
          Explore epic tales, immersive worlds, and unforgettable characters.
        </p>
      </div>

      <section className="section">
        <h2>Featured Books</h2>
        <div className="grid">
          {books.slice(0, 3).map((book) => (
            <div key={book.slug} className="card">
              <img src={book.coverImage} alt={book.title} />
              <div className="card-content">
                <h3 className="card-title">{book.title}</h3>
                <p className="card-description">{book.description}</p>
                <a href={`/books/${book.slug}`} className="button">Learn More</a>
              </div>
            </div>
          ))}
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
          {worlds.slice(0, 3).map((world) => (
            <div key={world.slug} className="card">
              <img src={world.image} alt={world.title} />
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
          {characters.slice(0, 3).map((character) => (
            <div key={character.slug} className="card">
              <img src={character.image} alt={character.name} />
              <div className="card-content">
                <h3 className="card-title">{character.name}</h3>
                <p className="card-description">{character.description}</p>
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
