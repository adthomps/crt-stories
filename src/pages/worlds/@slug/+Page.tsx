export { Page };

import React, { useEffect, useState } from "react";
import { CharacterCard } from "../components/CharacterCard";
import { usePageContext } from "vike-react/usePageContext";

function Page() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  const [world, setWorld] = useState<any | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
  const [relatedCharacters, setRelatedCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalImg, setModalImg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/worker/worlds?slug=${encodeURIComponent(slug)}`, {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
      fetch("/api/worker/books", {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
      fetch("/api/worker/characters", {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
    ])
      .then(([worldData, booksData, charactersData]) => {
        if (!worldData || worldData.error) throw new Error("World not found");
        setWorld(worldData);
        // Find related books
        const bookSlugs = Array.isArray(worldData.bookSlugs)
          ? worldData.bookSlugs
          : [];
        setRelatedBooks(
          booksData.filter((b: any) => bookSlugs.includes(b.slug))
        );
        // Find related characters
        const characterSlugs = Array.isArray(worldData.characterSlugs)
          ? worldData.characterSlugs
          : [];
        setRelatedCharacters(
          charactersData.filter((c: any) => characterSlugs.includes(c.slug))
        );
      })
      .catch((e) => setError(e.message || "Failed to load world"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error || !world)
    return <div style={{ color: "red" }}>{error || "World not found"}</div>;

  // Collect all images for this world: heroImage, image1, image2, ...
  const images: { src: string; alt: string; caption?: string }[] = [
    { src: world.heroImage, alt: world.title, caption: world.heroImageCaption },
    ...(Array.from({ length: 20 })
      .map((_, i) => {
        const idx = i + 1;
        const key = `image${idx}`;
        const captionKey = `image${idx}Caption`;
        const src = (world as any)[key];
        if (src) {
          return {
            src,
            alt: `${world.title} image ${idx}`,
            caption: (world as any)[captionKey],
          };
        }
        return null;
      })
      .filter(Boolean) as { src: string; alt: string; caption?: string }[]),
  ];

  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">{world.title}</h1>
        {world.badges && world.badges.length > 0 && (
          <div className="badge-list">
            {Array.from(new Set(world.badges)).map((badge: any, i: number) => (
              <span key={i} className="badge">
                {badge}
              </span>
            ))}
          </div>
        )}
        <p className="page-description">{world.description}</p>
      </div>

      <div className="detail-content world-detail-flex">
        <div className="world-hero-col world-image-col">
          {images.map((img, i) => (
            <div
              key={i}
              style={{ marginBottom: i < images.length - 1 ? "1.2rem" : 0 }}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="detail-image world-detail-hero world-gallery-img"
                onClick={() => setModalImg(img.src)}
              />
              {img.caption && (
                <div className="image-caption">{img.caption}</div>
              )}
            </div>
          ))}
        </div>
        <div className="world-info-col">
          {world.summary && (
            <div className="section">
              <h2>Summary</h2>
              <p>{world.summary}</p>
            </div>
          )}

          {world.themeTags && world.themeTags.length > 0 && (
            <div className="section">
              <h2>Themes</h2>
              <div className="tag-list">
                {world.themeTags.map((tag: any, index: number) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {relatedBooks.length > 0 && (
            <div className="section">
              <h2>Books Set in {world.title}</h2>
              <div
                className={
                  relatedBooks.length === 1 ? "single-card-grid" : "grid"
                }
              >
                {relatedBooks.slice(0, 5).map((book: any) => (
                  <div
                    key={book.slug}
                    className={
                      relatedBooks.length === 1 ? "card card-large" : "card"
                    }
                  >
                    <img src={book.coverImage} alt={book.title} />
                    <div className="card-content">
                      <h3 className="card-title">{book.title}</h3>
                      <p className="card-description">
                        {(() => {
                          const text = book.longDescription || book.description;
                          if (!text) return null;
                          return text.length > 220
                            ? text.slice(0, 217) + "..."
                            : text;
                        })()}
                      </p>
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

          {relatedCharacters.length > 0 && (
            <div className="section">
              <h2>Characters from {world.title}</h2>
              <div className="grid">
                {relatedCharacters.slice(0, 5).map((character: any) => (
                  <CharacterCard key={character.slug} character={character} />
                ))}
                {relatedCharacters.length > 5 && (
                  <div
                    style={{
                      gridColumn: "1/-1",
                      marginTop: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <a href="/characters" className="button">
                      +{relatedCharacters.length - 5} more characters
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for enlarged image */}
      {modalImg && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setModalImg(null)}
        >
          <img
            src={modalImg}
            alt="World preview"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: "1rem",
              boxShadow: "0 4px 32px rgba(0,0,0,0.3)",
              background: "#fff",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
