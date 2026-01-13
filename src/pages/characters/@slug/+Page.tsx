export { Page };

import React, { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import ReactMarkdown from "react-markdown";

function Page() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  const [character, setCharacter] = useState<any | null>(null);
  const [bioMarkdown, setBioMarkdown] = useState<string | null>(null);
  const [relatedWorlds, setRelatedWorlds] = useState<any[]>([]);
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/worker/characters?slug=${encodeURIComponent(slug)}`, {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
      fetch("/api/worker/worlds", {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
      fetch("/api/worker/books", {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
      fetch(`/bios/${slug}.md`)
        .then((r) => (r.ok ? r.text() : null))
        .catch(() => null),
    ])
      .then(([charData, worldsData, booksData, bioMd]) => {
        if (!charData || charData.error) throw new Error("Character not found");
        setCharacter(charData);
        setBioMarkdown(bioMd);
        // Find related worlds
        const worldSlugs = Array.isArray(charData.worldSlugs)
          ? charData.worldSlugs
          : [];
        setRelatedWorlds(
          worldsData.filter((w: any) => worldSlugs.includes(w.slug))
        );
        // Find related books
        const bookSlugs = Array.isArray(charData.bookSlugs)
          ? charData.bookSlugs
          : [];
        setRelatedBooks(
          booksData.filter((b: any) => bookSlugs.includes(b.slug))
        );
      })
      .catch((e) => setError(e.message || "Failed to load character"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error || !character)
    return <div style={{ color: "red" }}>{error || "Character not found"}</div>;

  // Admin edit link
  const isAdmin =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin");
  const editUrl = `/admin/characters/${character.slug || slug}`;

  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">
          {character.name || character.displayName}
        </h1>
        {character.badges && character.badges.length > 0 && (
          <div className="badge-list">
            {character.badges.map((badge: any, i: number) => (
              <span key={i} className="badge">
                {badge}
              </span>
            ))}
          </div>
        )}
        {character.roleTag &&
          Array.isArray(character.roleTag) &&
          character.roleTag.length > 0 && (
            <p className="page-description">{character.roleTag.join(" · ")}</p>
          )}
        {isAdmin && (
          <a href={editUrl} className="button" style={{ marginLeft: 16 }}>
            Edit Character
          </a>
        )}
      </div>

      <div className="detail-content character-detail-flex">
        <div className="character-portrait-col">
          {character.portraitImage && (
            <img
              src={character.portraitImage}
              alt={character.name || character.displayName}
              className="detail-image character-detail-portrait"
            />
          )}
        </div>
        <div className="character-info-col">
          <div className="section">
            <h2>About</h2>
            {bioMarkdown ? (
              <ReactMarkdown>{bioMarkdown}</ReactMarkdown>
            ) : (
              <p style={{ opacity: 0.75 }}>
                No narrative bio loaded. (Optional) Load from /bios/{slug}.md
              </p>
            )}
          </div>

          {character.audioExcerpt && (
            <div className="section">
              <h2>Voice Preview</h2>
              <audio
                controls
                src={character.audioExcerpt}
                style={{ width: "100%" }}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {relatedWorlds.length > 0 && (
            <div className="section">
              <h2>World{relatedWorlds.length > 1 ? "s" : ""}</h2>
              <div
                className={
                  relatedWorlds.length === 1 ? "single-card-grid" : "grid"
                }
              >
                {relatedWorlds.slice(0, 5).map((world: any) => (
                  <div
                    key={world.slug}
                    className={
                      relatedWorlds.length === 1 ? "card card-large" : "card"
                    }
                  >
                    <img
                      src={world.heroImage || world.image1}
                      alt={world.title}
                    />
                    <div className="card-content">
                      <h3 className="card-title">{world.title}</h3>
                      <p className="card-description">{world.description}</p>
                      <a href={`/worlds/${world.slug}`} className="button">
                        Learn More
                      </a>
                    </div>
                  </div>
                ))}
                {relatedWorlds.length > 5 && (
                  <div
                    style={{
                      gridColumn: "1/-1",
                      marginTop: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <a href="/worlds" className="button">
                      +{relatedWorlds.length - 5} more worlds
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {character.tags && character.tags.length > 0 && (
            <div className="section">
              <h2>Tags</h2>
              <div className="tag-list">
                {character.tags.map((tag: any, index: number) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {relatedBooks.length > 0 && (
            <div className="section">
              <h2>Appears In</h2>
              <div className="grid">
                {relatedBooks.slice(0, 5).map((book: any) => (
                  <div key={book.slug} className="card">
                    <img src={book.coverImage} alt={book.title} />
                    <div className="card-content">
                      <div style={{ marginBottom: "0.5rem" }}>
                        {book.badges &&
                          book.badges.map((badge: any, i: number) => (
                            <span key={i} className="badge">
                              {badge}
                            </span>
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
                {relatedBooks.length > 5 && (
                  <div
                    style={{
                      gridColumn: "1/-1",
                      marginTop: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <a href="/books" className="button">
                      +{relatedBooks.length - 5} more books
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
