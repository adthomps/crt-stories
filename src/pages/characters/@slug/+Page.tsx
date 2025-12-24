export { Page };

import React from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { getCharacterBySlug, getWorldBySlug, books } from '../../../content';

function Page() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  const character = getCharacterBySlug(slug);

  if (!character) {
    return <div>Character not found</div>;
  }

  const world = character.worldSlug ? getWorldBySlug(character.worldSlug) : null;
  const characterBooks = character.bookSlugs
    ? books.filter((book) => character.bookSlugs!.includes(book.slug))
    : [];

  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">{character.name}</h1>
        <p className="page-description">{character.title}</p>
      </div>

      <div className="detail-content">
        <img src={character.image} alt={character.name} className="detail-image" />

        <div className="section">
          <h2>About</h2>
          <p>{character.description}</p>
        </div>

        <div className="section">
          <h2>Backstory</h2>
          <p>{character.backstory}</p>
        </div>

        <div className="section">
          <h2>Abilities</h2>
          <div className="tag-list">
            {character.abilities.map((ability, index) => (
              <span key={index} className="tag">
                {ability}
              </span>
            ))}
          </div>
        </div>

        {world && (
          <div className="section">
            <h2>World</h2>
            <p>
              {character.name} hails from{' '}
              <a href={`/worlds/${world.slug}`} className="link">
                {world.title}
              </a>
              .
            </p>
          </div>
        )}

        {characterBooks.length > 0 && (
          <div className="section">
            <h2>Appears In</h2>
            <div className="grid">
              {characterBooks.map((book) => (
                <div key={book.slug} className="card">
                  <img src={book.coverImage} alt={book.title} />
                  <div className="card-content">
                    <h3 className="card-title">{book.title}</h3>
                    <p className="card-description">{book.description}</p>
                    <a href={`/books/${book.slug}`} className="button">
                      Learn More
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
