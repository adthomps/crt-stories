export { Page };

import { useState } from 'react';
import { characters, worlds } from '../../../content';

import type { Character } from '../../../content';

function getAllTags(characters: Character[]): string[] {
  const tagSet = new Set<string>();
  characters.forEach((c) => {
    if (c.tags) c.tags.forEach((t: string) => tagSet.add(t));
  });
  return Array.from(tagSet).sort();
}

function Page() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Group characters by worldSlug
  const worldMap = worlds.reduce((acc, world) => {
    acc[world.slug] = world;
    return acc;
  }, {} as Record<string, typeof worlds[0]>);

  const charactersByWorld: Record<string, typeof characters> = {};
  characters.forEach((character) => {
    const slug = character.worldSlug || 'unknown';
    if (!charactersByWorld[slug]) charactersByWorld[slug] = [];
    charactersByWorld[slug].push(character);
  });

  // Filtering
  const filteredCharactersByWorld: typeof charactersByWorld = {};
  Object.entries(charactersByWorld).forEach(([worldSlug, chars]) => {
    filteredCharactersByWorld[worldSlug] = activeTag
      ? chars.filter((c) => c.tags && c.tags.includes(activeTag))
      : chars;
  });

  const allTags = getAllTags(characters);

  return (
    <>
      <h1 className="page-title">Characters</h1>
      <p className="page-description">Meet the unforgettable characters that bring our stories to life.</p>

      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontWeight: 500, marginRight: '0.5rem' }}>Filter by tag:</span>
        <span className="tag-list">
          <span
            className={`badge${!activeTag ? ' badge-active' : ''}`}
            style={{ cursor: 'pointer', marginRight: '0.5rem' }}
            onClick={() => setActiveTag(null)}
          >
            All
          </span>
          {allTags.map((tag: string) => (
            <span
              key={tag}
              className={`badge${activeTag === tag ? ' badge-active' : ''}`}
              style={{ cursor: 'pointer', marginRight: '0.5rem' }}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </span>
          ))}
        </span>
      </div>

      {Object.entries(filteredCharactersByWorld).map(([worldSlug, chars]: [string, Character[]]) => {
        if (chars.length === 0) return null;
        const world = worldMap[worldSlug];
        return (
          <div key={worldSlug} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>
              {world ? world.title : 'Other'}
            </h2>
            <div className="grid">
              {chars.map((character: Character) => (
                <div key={character.slug} className="card">
                  <img src={character.portraitImage} alt={character.name} />
                  <div className="card-content">
                    <h3 className="card-title">{character.name}</h3>
                    {character.roleTag && (
                      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{character.roleTag}</p>
                    )}
                    <p className="card-description">{character.bio}</p>
                    {character.tags && character.tags.length > 0 && (
                      <div className="tag-list" style={{ margin: '0.5rem 0' }}>
                        {character.tags.map((tag, i) => (
                          <span key={i} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    <a href={`/characters/${character.slug}`} className="button">View Profile</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
