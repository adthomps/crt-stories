export { Page };

import { useState } from 'react';
// import { characters, worlds } from '../../../content'; // Legacy static import (commented for safety)
import { characters, worlds, books } from '../../../content';

import type { Character } from '../../../content';

function getAllTags(characters: Character[]): string[] {
  const tagSet = new Set<string>();
  characters.forEach((c) => {
    if (c.tags) c.tags.forEach((t: string) => tagSet.add(t));
  });
  return Array.from(tagSet).sort();
}

function Page() {

  // Use static characters and worlds for build
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Group characters by worldSlug
  const worldMap = worlds.reduce((acc: any, world: any) => {
    acc[world.slug] = world;
    return acc;
  }, {} as Record<string, any>);

  const charactersByWorld: Record<string, any[]> = {};
  characters.forEach((character: any) => {
    const slug = character.worldSlug || 'unknown';
    if (!charactersByWorld[slug]) charactersByWorld[slug] = [];
    charactersByWorld[slug].push(character);
  });

  // Filtering
  const filteredCharactersByWorld: typeof charactersByWorld = {};
  Object.entries(charactersByWorld).forEach(([worldSlug, chars]) => {
    filteredCharactersByWorld[worldSlug] = activeTag
      ? chars.filter((c: any) => c.tags && c.tags.includes(activeTag))
      : chars;
  });

  function getAllTags(characters: any[]): string[] {
    const tagSet = new Set<string>();
    characters.forEach((c) => {
      if (c.tags) c.tags.forEach((t: string) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }
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

      {Object.entries(filteredCharactersByWorld).map(([worldSlug, chars]: [string, any[]]) => {
        if (chars.length === 0) return null;
        const world = worldMap[worldSlug];
        const maxChars = 5;
        const maxTags = 3;
        const showAll = chars.length > maxChars;
        return (
          <div key={worldSlug} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>
              {world ? world.title : 'Other'}
            </h2>
            <div className="grid">
              {chars.slice(0, maxChars).map((character: any) => {
                const relatedBooks = Array.from(new Set((character.appearsInBookSlugs || [])
                  .map((slug: string) => books.find((b: any) => b.slug === slug))
                  .filter(Boolean)));
                const relatedWorlds = Array.from(new Set((character.worldSlugs || [])
                  .map((slug: string) => worlds.find((w: any) => w.slug === slug))
                  .filter(Boolean)));
                return (
                  <div key={character.slug} className="card">
                    <img src={character.portraitImage} alt={character.name} />
                    <div className="card-content">
                      <h3 className="card-title">{character.name}</h3>
                      {character.roleTag && (
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{character.roleTag}</p>
                      )}
                      <p className="card-description">{character.bio}</p>
                      {relatedBooks.length > 0 && (
                        <div className="tag-list" style={{ margin: '0.5rem 0' }}>
                          {relatedBooks.slice(0, maxTags).map((book: any) => (
                            <a key={book.slug} href={`/books/${book.slug}`} className="badge">
                              {book.title}
                            </a>
                          ))}
                          {relatedBooks.length > maxTags && (
                            <span className="badge">+{relatedBooks.length - maxTags} more</span>
                          )}
                        </div>
                      )}
                      {relatedWorlds.length > 0 && (
                        <div className="tag-list" style={{ margin: '0.5rem 0' }}>
                          {relatedWorlds.slice(0, maxTags).map((w: any) => (
                            <a key={w.slug} href={`/worlds/${w.slug}`} className="badge">
                              {w.title}
                            </a>
                          ))}
                          {relatedWorlds.length > maxTags && (
                            <span className="badge">+{relatedWorlds.length - maxTags} more</span>
                          )}
                        </div>
                      )}
                      {character.tags && character.tags.length > 0 && (
                        <div className="tag-list" style={{ margin: '0.5rem 0' }}>
                          {Array.from(new Set(character.tags)).map((tag: string, i: number) => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      <a href={`/characters/${character.slug}`} className="button">View Profile</a>
                    </div>
                  </div>
                );
              })}
            </div>
            {showAll && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <a href="/characters" className="button">View All Characters</a>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
