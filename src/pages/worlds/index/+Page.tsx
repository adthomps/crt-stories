export { Page };

import React from 'react';
// import { worlds } from '../../../content'; // Legacy static import (commented for safety)
import { worlds } from '../../../content';
import React from 'react';

function Page() {

  // Use static worlds for build
  // Remove loading/error states for static data

  return (
    <>
      <h1 className="page-title">Worlds</h1>
      <p className="page-description">Explore the vast and immersive worlds where our stories take place.</p>
      <div className="grid">
        {worlds.map((world: any) => (
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
              <p className="card-description">{world.description}</p>
              {world.summary && (
                <p style={{ fontSize: '0.95rem', color: '#555', margin: '0.5rem 0 0.5rem 0' }}>{world.summary}</p>
              )}
              <a href={`/worlds/${world.slug}`} className="button">Explore</a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
