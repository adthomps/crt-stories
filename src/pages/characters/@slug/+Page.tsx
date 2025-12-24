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
  const characterBooks = character.appearsInBookSlugs
    ? books.filter((book) => character.appearsInBookSlugs!.includes(book.slug))
    : [];

  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">{character.name}</h1>
        {character.badges && character.badges.length > 0 && (
          <div className="badge-list">
            {character.badges.map((badge, i) => (
              <span key={i} className="badge">{badge}</span>
            ))}
          </div>
        )}
        {character.roleTag && <p className="page-description">{character.roleTag}</p>}
      </div>

      <div className="detail-content character-detail-flex">
        <div className="character-portrait-col">
          <img src={character.portraitImage} alt={character.name} className="detail-image character-detail-portrait" />
        </div>
        <div className="character-info-col">
          {character.bio && (
            <div className="section">
              <h2>About</h2>
              <p>{character.bio}</p>
            </div>
          )}

          {character.audioExcerpt && (
            <div className="section">
              <h2>Voice Preview</h2>
              <audio controls src={character.audioExcerpt} style={{ width: '100%' }}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

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

          {character.tags && character.tags.length > 0 && (
            <div className="section">
              <h2>Tags</h2>
              <div className="tag-list">
                {character.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
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
                      <div style={{ marginBottom: '0.5rem' }}>
                        {book.badges && book.badges.map((badge, i) => (
                          <span key={i} className="badge">{badge}</span>
                        ))}
                      </div>
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
      </div>
    </>
  );
}
