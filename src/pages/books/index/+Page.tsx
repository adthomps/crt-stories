export { Page };

import React from 'react';
import { books, worlds, characters } from '../../../content';

function Page() {
  const maxBooks = 5;
  const maxTags = 3;
  const showAll = books.length > maxBooks;
  return (
    <>
      <h1 className="page-title">Books</h1>
      <p className="page-description">Discover all the books in our collection.</p>
      <div className="grid">
        {books.slice(0, maxBooks).map((book: any) => {
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
          const relatedWorlds = (book.worldSlugs || [])
            .map((slug: string) => worlds.find((w: any) => w.slug === slug))
            .filter(Boolean);
          const relatedCharacters = (book.characterSlugs || [])
            .map((slug: string) => characters.find((c: any) => c.slug === slug))
            .filter(Boolean);
          return (
            <div key={book.slug} className="card">
              <img src={book.coverImage} alt={book.title} />
              <div className="card-content">
                <h3 className="card-title">{book.title}</h3>
                <p className="card-description">{expanded}</p>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  Published: {(() => {
                    const d = new Date(book.publishDate);
                    // Check for valid date and not 'TBD' or blank
                    if (!book.publishDate || book.publishDate === 'TBD' || isNaN(d.getTime())) {
                      return book.publishDate || 'TBD';
                    }
                    return d.toLocaleDateString();
                  })()}
                </p>
                {relatedWorlds.length > 0 && (
                  <div className="tag-list" style={{ margin: '0.5rem 0' }}>
                    {relatedWorlds.slice(0, maxTags).map((world: any) => (
                      <a key={world.slug} href={`/worlds/${world.slug}`} className="badge">
                        {world.title}
                      </a>
                    ))}
                    {relatedWorlds.length > maxTags && (
                      <span className="badge">+{relatedWorlds.length - maxTags} more</span>
                    )}
                  </div>
                )}
                {relatedCharacters.length > 0 && (
                  <div className="tag-list" style={{ margin: '0.5rem 0' }}>
                    {relatedCharacters.slice(0, maxTags).map((character: any) => (
                      <a key={character.slug} href={`/characters/${character.slug}`} className="badge">
                        {character.name}
                      </a>
                    ))}
                    {relatedCharacters.length > maxTags && (
                      <span className="badge">+{relatedCharacters.length - maxTags} more</span>
                    )}
                  </div>
                )}
                <a href={`/books/${book.slug}`} className="button">Learn More</a>
              </div>
            </div>
          );
        })}
      </div>
      {showAll && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="/books" className="button">View All Books</a>
        </div>
      )}
    </>
  );
}
