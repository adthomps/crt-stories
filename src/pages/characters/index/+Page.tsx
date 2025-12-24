export { Page };

import React from 'react';
import { characters } from '../../../content';

function Page() {
  return (
    <>
      <h1 className="page-title">Characters</h1>
      <p className="page-description">Meet the unforgettable characters that bring our stories to life.</p>
      
      <div className="grid">
        {characters.map((character) => (
          <div key={character.slug} className="card">
            <img src={character.image} alt={character.name} />
            <div className="card-content">
              <h3 className="card-title">{character.name}</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                {character.title}
              </p>
              <p className="card-description">{character.description}</p>
              <a href={`/characters/${character.slug}`} className="button">View Profile</a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
