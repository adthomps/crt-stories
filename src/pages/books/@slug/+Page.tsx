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

  // Helper to get book by slug for related/prequel/previous
  const getBookTitleBySlug = (slug: string | null | undefined) => {
    if (!slug) return null;
    const b = getBookBySlug(slug);
    return b ? b.title : slug;
  };

  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">{book.title}</h1>
        {book.badges && book.badges.length > 0 && (
          <div className="badge-list">
            {book.badges.map((badge, i) => (
              <span key={i} className="badge">{badge}</span>
            ))}
          </div>
        )}
        {book.subtitle && <p className="page-description">{book.subtitle}</p>}
      </div>

      <div className="detail-content book-detail-flex">
        <div className="book-cover-col">
          <img src={book.coverImage} alt={book.title} className="detail-image book-detail-cover" />
        </div>
        <div className="book-info-col">
          {/* Call out prequel, previous, next, series (in that order) */}
          {(book.related?.prequelSlug || book.related?.previousSlug || book.related?.nextSlug || (book.series && book.series.bookNumber > 1)) && (
            <div className="section">
              <h2>Reading Order</h2>
              <div>
                {book.related?.prequelSlug && (
                  <p>
                    <strong>Prequel:</strong>{' '}
                    <a href={`/books/${book.related.prequelSlug}`} className="link">
                      {getBookTitleBySlug(book.related.prequelSlug)}
                    </a>
                  </p>
                )}
                {book.related?.previousSlug && (
                  <p>
                    <strong>Previous Book:</strong>{' '}
                    <a href={`/books/${book.related.previousSlug}`} className="link">
                      {getBookTitleBySlug(book.related.previousSlug)}
                    </a>
                  </p>
                )}
                {book.related?.nextSlug && (
                  <p>
                    <strong>Next Book:</strong>{' '}
                    <a href={`/books/${book.related.nextSlug}`} className="link">
                      {getBookTitleBySlug(book.related.nextSlug)}
                    </a>
                  </p>
                )}
                {book.series && book.series.bookNumber > 1 && (
                  <p>
                    <strong>Series:</strong>{' '}
                    <a href={`/books/${book.series.id}-volume-1`} className="link">
                      {book.series.name} Vol. 1
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {book.tags && book.tags.length > 0 && (
            <div className="section">
              <h2>Tags</h2>
              <div className="tag-list">
                {book.tags.map((tag, i) => (
                  <span key={i} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {book.longDescription && (
            <div className="section">
              <h2>About the Book</h2>
              <p>{book.longDescription}</p>
            </div>
          )}

          {book.excerpt && (
            <div className="section">
              <h2>Excerpt</h2>
              <p>{book.excerpt}</p>
            </div>
          )}

          {book.audioExcerpt && (
            <div className="section">
              <h2>Audio Preview</h2>
              <audio controls src={book.audioExcerpt} style={{ width: '100%' }}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          <div className="section">
            <h2>Get Your Copy</h2>
            <div className="cta-container" style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
              {book.formats && book.formats.length > 0 ? (
                book.formats.map((fmt, i) => (
                  <a
                    key={i}
                    href={fmt.url}
                    className={`button${i > 0 ? ' button-secondary' : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {fmt.label}
                  </a>
                ))
              ) : (
                book.amazonUrl && (
                  <a href={book.amazonUrl} target="_blank" rel="noopener noreferrer" className="button">
                    Buy on Amazon
                  </a>
                )
              )}
            </div>
          </div>

          {book.publishDate && book.publishDate !== "TBD" && (
            <div className="section">
              <p style={{ marginTop: '1rem', color: '#666' }}>
                Published: {new Date(book.publishDate).toLocaleDateString()}
              </p>
            </div>
          )}

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
        </div>
      </div>

      {characters.length > 0 && (
        <div className="section">
          <h2>Featured Characters</h2>
          <div className="grid">
            {characters.map((character) => (
              <div key={character.slug} className="card">
                <img src={character.portraitImage} alt={character.name} />
                <div className="card-content">
                  <h3 className="card-title">{character.name}</h3>
                  {character.roleTag && <p className="card-description">{character.roleTag}</p>}
                  <a href={`/characters/${character.slug}`} className="button">
                    View Profile
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
