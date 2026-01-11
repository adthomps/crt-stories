export { Page };

import React from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { getBookBySlug, books, worlds, characters } from '../../../content';

function Page() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  const book = getBookBySlug(slug);

  if (!book) {
    return <div>Book not found</div>;
  }

  const relatedWorlds = (book.worldSlugs || [])
    .map((slug: string) => worlds.find((w: any) => w.slug === slug))
    .filter(Boolean);
  const relatedCharacters = (book.characterSlugs || [])
    .map((slug: string) => characters.find((c: any) => c.slug === slug))
    .filter(Boolean);

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
              {book.formats && book.formats.length > 0 &&
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
              }
            </div>
          </div>

          {book.publishDate && book.publishDate !== "TBD" && (
            <div className="section">
              <p style={{ marginTop: '1rem', color: '#666' }}>
                <b>Published:</b> {new Date(book.publishDate).toLocaleDateString()}
              </p>
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
        </div>
      </div>

      {relatedCharacters.length > 0 && (
        <div className="section">
          <h2>Featured Characters</h2>
          <div className="grid">
            {relatedCharacters.slice(0, 5).map((character: any) => (
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
            {relatedCharacters.length > 5 && (
              <div style={{ gridColumn: '1/-1', marginTop: '1rem', textAlign: 'center' }}>
                <a href="/characters" className="button">+{relatedCharacters.length - 5} more characters</a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
