import { useEffect, useState } from "react";

function Page() {
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(20);

  useEffect(() => {
    setLoading(true);
    fetch("/api/worker/characters", { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((data) => setCharacters(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load characters"))
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
          <div key={character.slug} className="card">
            <div className="card-content">
              <h3 className="card-title">{character.name}</h3>
              <p className="card-description">{character.description}</p>
              <a href={`/characters/${character.slug}`} className="button">
                Learn More
              </a>
            </div>
          </div>
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
