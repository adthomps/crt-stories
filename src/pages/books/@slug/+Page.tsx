export { Page };

import React from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { getBookBySlug, getWorldBySlug, getCharactersByBook } from '../../../content';

function Page() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  const book = getBookBySlug(slug);

  if (!book) {
    return <div>Book not found</div>;
  }

  const world = book.worldSlug ? getWorldBySlug(book.worldSlug) : null;
  const characters = getCharactersByBook(book.slug);

  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">{book.title}</h1>
        <p className="page-description">{book.description}</p>
      </div>

      <div className="detail-content">
        <img src={book.coverImage} alt={book.title} className="detail-image" />

        <div className="section">
          <h2>About the Book</h2>
          <p>{book.excerpt}</p>
          <p style={{ marginTop: '1rem', color: '#666' }}>
            Published: {new Date(book.publishDate).toLocaleDateString()}
          </p>
        </div>

        <div className="section">
          <h2>Get Your Copy</h2>
          <div className="cta-container">
            <a href={book.amazonUrl} target="_blank" rel="noopener noreferrer" className="button">
              Buy on Amazon
            </a>
            <a href={book.kindleUrl} target="_blank" rel="noopener noreferrer" className="button button-secondary">
              Get on Kindle
            </a>
          </div>
        </div>

        {world && (
          <div className="section">
            <h2>World</h2>
            <p>
              This book takes place in{' '}
              <a href={`/worlds/${world.slug}`} className="link">
                {world.title}
              </a>
              .
            </p>
          </div>
        )}

        {characters.length > 0 && (
          <div className="section">
            <h2>Featured Characters</h2>
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
