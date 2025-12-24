export { Page };

import React from 'react';
import { worlds } from '../../../content';

function Page() {
  return (
    <>
      <h1 className="page-title">Worlds</h1>
      <p className="page-description">Explore the vast and immersive worlds where our stories take place.</p>
      
      <div className="grid">
        {worlds.map((world) => (
          <div key={world.slug} className="card">
            <img src={world.image} alt={world.title} />
            <div className="card-content">
              <h3 className="card-title">{world.title}</h3>
              <p className="card-description">{world.description}</p>
              <a href={`/worlds/${world.slug}`} className="button">Explore</a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
