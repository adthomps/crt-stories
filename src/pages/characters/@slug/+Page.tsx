export { Page };

import React from 'react';
import { usePageContext } from 'vike-react/usePageContext';
// import { getCharacterBySlug, getWorldBySlug, books } from '../../../content'; // Legacy static import (commented for safety)
import { characters, worlds, books } from '../../../content';

function Page() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  // SSG build: use static content
  const character = characters.find((c: any) => c.slug === slug);
  const relatedWorlds = (character.worldSlugs || [])
    .map((slug: string) => worlds.find((w: any) => w.slug === slug))
    .filter(Boolean);
  const relatedBooks = (character.appearsInBookSlugs || [])
    .map((slug: string) => books.find((b: any) => b.slug === slug))
    .filter(Boolean);

  if (!character) {
    return <div>Character not found</div>;
  }

  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">{character.name}</h1>
        {character.badges && character.badges.length > 0 && (
          <div className="badge-list">
            {character.badges.map((badge: any, i: number) => (
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

          {relatedWorlds.length > 0 && (
            <div className="section">
              <h2>World{relatedWorlds.length > 1 ? 's' : ''}</h2>
              <div className={relatedWorlds.length === 1 ? 'single-card-grid' : 'grid'}>
                {relatedWorlds.slice(0, 5).map((world: any) => (
                  <div key={world.slug} className={relatedWorlds.length === 1 ? 'card card-large' : 'card'}>
                    <img src={world.heroImage || world.image1} alt={world.title} />
                    <div className="card-content">
                      <h3 className="card-title">{world.title}</h3>
                      <p className="card-description">{world.description}</p>
                      <a href={`/worlds/${world.slug}`} className="button">Learn More</a>
                    </div>
                  </div>
                ))}
                {relatedWorlds.length > 5 && (
                  <div style={{ gridColumn: '1/-1', marginTop: '1rem', textAlign: 'center' }}>
                    <a href="/worlds" className="button">+{relatedWorlds.length - 5} more worlds</a>
                  </div>
                )}
              </div>
            </div>
          )}

          {character.tags && character.tags.length > 0 && (
            <div className="section">
              <h2>Tags</h2>
              <div className="tag-list">
                {character.tags.map((tag: any, index: number) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {relatedBooks.length > 0 && (
            <div className="section">
              <h2>Appears In</h2>
              <div className="grid">
                {relatedBooks.slice(0, 5).map((book: any) => (
                  <div key={book.slug} className="card">
                    <img src={book.coverImage} alt={book.title} />
                    <div className="card-content">
                      <div style={{ marginBottom: '0.5rem' }}>
                        {book.badges && book.badges.map((badge: any, i: number) => (
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
                {relatedBooks.length > 5 && (
                  <div style={{ gridColumn: '1/-1', marginTop: '1rem', textAlign: 'center' }}>
                    <a href="/books" className="button">+{relatedBooks.length - 5} more books</a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
