export { Page };

import React from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { getWorldBySlug, getBooksByWorld, getCharactersByWorld } from '../../../content';

function Page() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  const world = getWorldBySlug(slug);

  if (!world) {
    return <div>World not found</div>;
  }

  const books = getBooksByWorld(world.slug);
  const characters = getCharactersByWorld(world.slug);

  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">{world.title}</h1>
        <p className="page-description">{world.description}</p>
      </div>

      <div className="detail-content">
        <img src={world.image} alt={world.title} className="detail-image" />

        <div className="section">
          <h2>History</h2>
          <p>{world.history}</p>
        </div>

        <div className="section">
          <h2>Geography</h2>
          <p>{world.geography}</p>
        </div>

        {books.length > 0 && (
          <div className="section">
            <h2>Books Set in {world.title}</h2>
            <div className="grid">
              {books.map((book) => (
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

        {characters.length > 0 && (
          <div className="section">
            <h2>Characters from {world.title}</h2>
            <div className="grid">
              {characters.map((character) => (
                <div key={character.slug} className="card">
                  <img src={character.image} alt={character.name} />
                  <div className="card-content">
                    <h3 className="card-title">{character.name}</h3>
                    <p className="card-description">{character.title}</p>
                    <a href={`/characters/${character.slug}`} className="button">
                      View Profile
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
