export { Page };

import React from 'react';
// import { worlds } from '../../../content'; // Legacy static import (commented for safety)
import { worlds, books, characters } from '../../../content';

function Page() {

  // Use static worlds for build
  // Remove loading/error states for static data

  return (
    <>
      <h1 className="page-title">Worlds</h1>
      <p className="page-description">Explore the vast and immersive worlds where our stories take place.</p>
      <div className="grid">
        {worlds.slice(0, 5).map((world: any) => {
          // Relationship tags
          const bookTags = Array.from(new Set((world.bookSlugs || []).map((slug: string) => {
            const b = books.find((b: any) => b.slug === slug);
            return b ? b.title : slug;
          })));
          const characterTags = Array.from(new Set((world.characterSlugs || []).map((slug: string) => {
            const c = characters.find((c: any) => c.slug === slug);
            return c ? c.name : slug;
          })));
          return (
            <div key={world.slug} className="card">
              <img src={world.heroImage} alt={world.title} />
              <div className="card-content">
                <h3 className="card-title">{world.title}</h3>
                {world.themeTags && world.themeTags.length > 0 && (
                  <div className="tag-list" style={{ marginBottom: '0.5rem' }}>
                    {world.themeTags.map((tag: any, i: number) => (
                      <span key={i} className="badge">{tag}</span>
                    ))}
                  </div>
                )}
                <div style={{ margin: '0.5rem 0' }}>
                  {bookTags.length > 0 && bookTags.slice(0, 3).map(title => (
                    <span key={title} style={{ background: '#e0e7ff', color: '#3730a3', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{title}</span>
                  ))}
                  {bookTags.length > 3 && <span style={{ color: '#888', marginLeft: 4 }}>+{bookTags.length - 3} more</span>}
                  {characterTags.length > 0 && characterTags.slice(0, 3).map(name => (
                    <span key={name} style={{ background: '#d1fae5', color: '#065f46', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{name}</span>
                  ))}
                  {characterTags.length > 3 && <span style={{ color: '#888', marginLeft: 4 }}>+{characterTags.length - 3} more</span>}
                </div>
                <p className="card-description">{world.description}</p>
                {world.summary && (
                  <p style={{ fontSize: '0.95rem', color: '#555', margin: '0.5rem 0 0.5rem 0' }}>{world.summary}</p>
                )}
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
    </>
  );
}
