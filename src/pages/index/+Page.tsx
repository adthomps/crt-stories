export { Page };


// import { books, worlds, characters } from '../../content'; // Legacy static import (commented for safety)
import { books, worlds, characters, series } from '../../content';
import { siteConfig } from '../../config';

import React from 'react';

function Page() {

  // Use static books, worlds, characters for build

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

      {/* Series Section FIRST - new relational model */}
      <section className="section">
        <h2>Book Series</h2>
        <div className="grid">
          {series.slice(0, 5).map((s: any) => {
            const seriesBooks = (s.bookSlugs || []).map((slug: string) => books.find((b: any) => b.slug === slug)).filter(Boolean);
            const firstBook = seriesBooks[0];
            return (
              <div key={s.slug} className="card">
                <img src={firstBook?.coverImage || s.heroImage} alt={s.title} />
                <div className="card-content">
                  <h3 className="card-title">{s.title}</h3>
                  <p className="card-description">{s.description}</p>
                  {seriesBooks.length > 0 && (
                    <div style={{ margin: '0.5rem 0 1rem 0' }}>
                      <strong>Books:</strong> {seriesBooks.slice(0, 3).map((b: any, i: number) => (
                        <span key={b.slug} style={{ background: '#e0e7ff', color: '#3730a3', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{b.title}{i < seriesBooks.length - 1 && i < 2 ? ',' : ''}</span>
                      ))}
                      {seriesBooks.length > 3 && <span style={{ color: '#888', marginLeft: 4 }}>+{seriesBooks.length - 3} more</span>}
                    </div>
                  )}
                  <a href={`/series/${s.slug}`} className="button">View Series</a>
                </div>
              </div>
            );
          })}
        </div>
        {series.length > 5 && (
          <div style={{ marginTop: '2rem' }}>
            <a href="/series" className="button">View All Series</a>
          </div>
        )}
      </section>

      <section className="section">
        <h2>Featured Books</h2>
        <div className="grid">
          {books.slice(0, 5).map((book: any) => {
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
            // Relationship tags
            const seriesTags = (book.seriesSlugs || []).map((slug: string) => {
              const s = series.find((s: any) => s.slug === slug);
              return s ? s.title : slug;
            });
            const worldTags = (book.worldSlugs || []).map((slug: string) => {
              const w = worlds.find((w: any) => w.slug === slug);
              return w ? w.title : slug;
            });
            return (
              <div key={book.slug} className="card">
                <img src={book.coverImage} alt={book.title} />
                <div className="card-content">
                  <h3 className="card-title">{book.title}</h3>
                  <p className="card-description">{expanded}</p>
                  <div style={{ margin: '0.5rem 0' }}>
                    {seriesTags.length > 0 && seriesTags.map(title => (
                      <span key={title} style={{ background: '#f3e8ff', color: '#7c3aed', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{title}</span>
                    ))}
                    {worldTags.length > 0 && worldTags.map(title => (
                      <span key={title} style={{ background: '#fef9c3', color: '#92400e', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{title}</span>
                    ))}
                  </div>
                  <a href={`/books/${book.slug}`} className="button">Learn More</a>
                </div>
              </div>
            );
          })}
        </div>
        {books.length > 5 && (
          <div style={{ marginTop: '2rem' }}>
            <a href="/books" className="button">View All Books</a>
          </div>
        )}
      </section>

      <section className="section">
        <h2>Explore Worlds</h2>
        <div className="grid">
          {worlds.slice(0, 5).map((world: any) => {
            // Relationship tags
            const bookTags = (world.bookSlugs || []).map((slug: string) => {
              const b = books.find((b: any) => b.slug === slug);
              return b ? b.title : slug;
            });
            const characterTags = (world.characterSlugs || []).map((slug: string) => {
              const c = characters.find((c: any) => c.slug === slug);
              return c ? c.name : slug;
            });
            return (
              <div key={world.slug} className="card">
                <img src={world.heroImage} alt={world.title} />
                <div className="card-content">
                  <h3 className="card-title">{world.title}</h3>
                  <p className="card-description">{world.description}</p>
                  <div style={{ margin: '0.5rem 0' }}>
                    {bookTags.length > 0 && bookTags.map(title => (
                      <span key={title} style={{ background: '#e0e7ff', color: '#3730a3', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{title}</span>
                    ))}
                    {characterTags.length > 0 && characterTags.map(name => (
                      <span key={name} style={{ background: '#d1fae5', color: '#065f46', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{name}</span>
                    ))}
                  </div>
                  <a href={`/worlds/${world.slug}`} className="button">Explore</a>
                </div>
              </div>
            );
          })}
        </div>
        {worlds.length > 5 && (
          <div style={{ marginTop: '2rem' }}>
            <a href="/worlds" className="button">View All Worlds</a>
          </div>
        )}
      </section>

      <section className="section">
        <h2>Meet the Characters</h2>
        <div className="grid">
          {characters.slice(0, 5).map((character: any) => {
            // Relationship tags
            const worldTags = (character.worldSlugs || []).map((slug: string) => {
              const w = worlds.find((w: any) => w.slug === slug);
              return w ? w.title : slug;
            });
            const bookTags = (character.appearsInBookSlugs || []).map((slug: string) => {
              const b = books.find((b: any) => b.slug === slug);
              return b ? b.title : slug;
            });
            const seriesTags = (character.seriesSlugs || []).map((slug: string) => {
              const s = series.find((s: any) => s.slug === slug);
              return s ? s.title : slug;
            });
            return (
              <div key={character.slug} className="card">
                <img src={character.portraitImage} alt={character.name} />
                <div className="card-content">
                  <h3 className="card-title">{character.name}</h3>
                  <p className="card-description">{character.bio ? character.bio.slice(0, 120) + (character.bio.length > 120 ? '...' : '') : ''}</p>
                  <div style={{ margin: '0.5rem 0' }}>
                    {worldTags.length > 0 && worldTags.map(title => (
                      <span key={title} style={{ background: '#fef9c3', color: '#92400e', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{title}</span>
                    ))}
                    {bookTags.length > 0 && bookTags.map(title => (
                      <span key={title} style={{ background: '#e0e7ff', color: '#3730a3', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{title}</span>
                    ))}
                    {seriesTags.length > 0 && seriesTags.map(title => (
                      <span key={title} style={{ background: '#f3e8ff', color: '#7c3aed', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{title}</span>
                    ))}
                  </div>
                  <a href={`/characters/${character.slug}`} className="button">View Profile</a>
                </div>
              </div>
            );
          })}
        </div>
        {characters.length > 5 && (
          <div style={{ marginTop: '2rem' }}>
            <a href="/characters" className="button">View All Characters</a>
          </div>
        )}
      </section>
    </>
  );
}
