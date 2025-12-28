export { Page };

import React from 'react';
import { usePageContext } from 'vike-react/usePageContext';
// import { getCharacterBySlug, getWorldBySlug, books } from '../../../content'; // Legacy static import (commented for safety)
import { fetchCharacters, fetchWorlds, fetchBooks } from '../../../content';
import React from 'react';

function Page() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  const [character, setCharacter] = React.useState<any>(null);
  const [world, setWorld] = React.useState<any>(null);
  const [characterBooks, setCharacterBooks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([fetchCharacters(), fetchWorlds(), fetchBooks()])
      .then(([characters, worlds, books]) => {
        const foundCharacter = characters.find((c: any) => c.slug === slug);
        setCharacter(foundCharacter);
        if (foundCharacter && foundCharacter.worldSlug) {
          setWorld(worlds.find((w: any) => w.slug === foundCharacter.worldSlug));
        }
        if (foundCharacter && foundCharacter.appearsInBookSlugs) {
          setCharacterBooks(books.filter((b: any) => foundCharacter.appearsInBookSlugs.includes(b.slug)));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load character/world/books');
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div>Loading character...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!character) {
    return <div>Character not found</div>;
  }

  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">{character.name}</h1>
        {character.badges && character.badges.length > 0 && (
          <div className="badge-list">
            {character.badges.map((badge: any, i: number) => (
              <span key={i} className="badge">{badge}</span>
            ))}
          </div>
        )}
        {character.roleTag && <p className="page-description">{character.roleTag}</p>}
      </div>

      <div className="detail-content character-detail-flex">
        <div className="character-portrait-col">
          <img src={character.portraitImage} alt={character.name} className="detail-image character-detail-portrait" />
        </div>
        <div className="character-info-col">
          {character.bio && (
            <div className="section">
              <h2>About</h2>
              <p>{character.bio}</p>
            </div>
          )}

          {character.audioExcerpt && (
            <div className="section">
              <h2>Voice Preview</h2>
              <audio controls src={character.audioExcerpt} style={{ width: '100%' }}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {world && (
            <div className="section">
              <h2>World</h2>
              <p>
                {character.name} hails from{' '}
                <a href={`/worlds/${world.slug}`} className="link">
                  {world.title}
                </a>
                .
              </p>
            </div>
          )}

          {character.tags && character.tags.length > 0 && (
            <div className="section">
              <h2>Tags</h2>
              <div className="tag-list">
                {character.tags.map((tag: any, index: number) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {characterBooks.length > 0 && (
            <div className="section">
              <h2>Appears In</h2>
              <div className="grid">
                {characterBooks.map((book) => (
                  <div key={book.slug} className="card">
                    <img src={book.coverImage} alt={book.title} />
                    <div className="card-content">
                      <div style={{ marginBottom: '0.5rem' }}>
                        {book.badges && book.badges.map((badge, i) => (
                          <span key={i} className="badge">{badge}</span>
                        ))}
                      </div>
                      <h3 className="card-title">{book.title}</h3>
                      <p className="card-description">{book.description}</p>
                      <a href={`/books/${book.slug}`} className="button">
                        Learn More
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
