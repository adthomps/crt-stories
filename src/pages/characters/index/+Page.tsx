import { useEffect, useState } from "react";

// Helper to fetch books for character cards
async function fetchBooks() {
  const res = await fetch("/api/worker/books", {
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function CharacterCard({ character, books }: { character: any; books: any[] }) {
  // Find books this character appears in
  const appearsIn = books.filter(
    (b) =>
      Array.isArray(b.characterSlugs) &&
      b.characterSlugs.includes(character.slug)
  );
  return (
    <div className="card character-card">
      {character.portraitImage && (
        <img
          src={character.portraitImage}
          alt={character.name}
          className="card-image character-card-image"
        />
      )}
      <div className="card-content">
        <h3 className="card-title">{character.name}</h3>
        {character.roleTag &&
          Array.isArray(character.roleTag) &&
          character.roleTag.length > 0 && (
            <div className="badge-list">
              {character.roleTag.map((role: string, i: number) => (
                <span key={i} className="badge">
                  {role}
                </span>
              ))}
            </div>
          )}
        <p className="card-description">
          {character.description || character.bio}
        </p>
        {character.tags &&
          Array.isArray(character.tags) &&
          character.tags.length > 0 && (
            <div className="tag-list">
              {character.tags.map((tag: string, i: number) => (
                <span key={i} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        {appearsIn.length > 0 && (
          <div className="appears-in-books">
            <div style={{ fontWeight: 600, margin: "0.5rem 0 0.25rem 0" }}>
              Appears In:
            </div>
            <div
              className="book-cover-list"
              style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
            >
              {appearsIn.slice(0, 3).map((book) => (
                <a
                  key={book.slug}
                  href={`/books/${book.slug}`}
                  title={book.title}
                  style={{ display: "inline-block" }}
                >
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    style={{
                      width: 40,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 4,
                      boxShadow: "0 1px 4px #0002",
                    }}
                  />
                </a>
              ))}
              {appearsIn.length > 3 && (
                <span
                  style={{ alignSelf: "center", fontSize: 14, color: "#666" }}
                >
                  +{appearsIn.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        <a
          href={`/characters/${character.slug}`}
          className="button"
          style={{ marginTop: 12 }}
        >
          Learn More
        </a>
      </div>
    </div>
  );
}

function Page() {
  const [characters, setCharacters] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(20);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/worker/characters", {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),
      fetchBooks(),
    ])
      .then(([charData, bookData]) => {
        setCharacters(Array.isArray(charData) ? charData : []);
        setBooks(Array.isArray(bookData) ? bookData : []);
      })
      .catch(() => setError("Failed to load characters or books"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!characters || characters.length === 0)
    return <div>No characters found.</div>;

  return (
    <>
      <h1 className="page-title">Characters</h1>
      <p className="page-description">
        Meet the unforgettable characters that bring our stories to life.
      </p>

      <div className="grid">
        {characters.slice(0, showCount).map((character: any) => (
          <CharacterCard
            key={character.slug}
            character={character}
            books={books}
          />
        ))}
      </div>
      {characters.length > showCount && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            style={{
              background: "#222b3a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: "1.1rem",
              cursor: "pointer",
              boxShadow: "0 1px 4px #0001",
              transition: "background 0.2s",
              outline: "none",
              letterSpacing: 0.5,
            }}
            onClick={() => setShowCount((c) => c + 20)}
          >
            Show More
          </button>
        </div>
      )}
    </>
  );
}

export { Page };
