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
  const charactersByWorld: Record<string, any[]> = {};
  import { useEffect, useState } from 'react';
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(20);

  useEffect(() => {
    setLoading(true);
    fetch('/api/worker/characters', { headers: { Accept: 'application/json' } })
      .then(r => r.json())
      .then((data) => setCharacters(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load characters'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!characters || characters.length === 0) return <div>No characters found.</div>;

  characters.forEach((character: any) => {
    const slug = character.worldSlug || 'unknown';
    if (!charactersByWorld[slug]) charactersByWorld[slug] = [];
    charactersByWorld[slug].push(character);
  });

        {characters.slice(0, showCount).map((character: any) => (
          <div key={character.slug} className="card">
            <div className="card-content">
              <h3 className="card-title">{character.name}</h3>
              <p className="card-description">{character.description}</p>
              <a href={`/characters/${character.slug}`} className="button">Learn More</a>
            </div>
          </div>
        ))}
      </div>
      {characters.length > showCount && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            style={{
              background: '#222b3a',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '10px 28px',
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 1px 4px #0001',
              transition: 'background 0.2s',
              outline: 'none',
              letterSpacing: 0.5,
            }}
            onClick={() => setShowCount((c) => c + 20)}
          >
            Show More
          </button>
        </div>
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
