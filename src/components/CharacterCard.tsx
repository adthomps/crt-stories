import React from "react";

export function CharacterCard({
  character,
  books,
}: {
  character: any;
  books?: any[];
}) {
  // Find books this character appears in
  const bookList = books
    ? books.filter(
        (b: any) =>
          Array.isArray(b.characterSlugs) &&
          b.characterSlugs.includes(character.slug)
      )
    : [];
  return (
    <div className="card character-card">
      {character.portraitImage && (
        <img
          src={character.portraitImage}
          alt={character.name}
          className="card-image character-card-image"
        />
      )}
      <h3 className="card-title">{character.name}</h3>
      {character.roleTag &&
        Array.isArray(character.roleTag) &&
        character.roleTag.length > 0 && (
          <div style={{ fontWeight: 500, color: "#555", marginBottom: 6 }}>
            {character.roleTag.map((role: string, i: number) => (
              <span key={i} style={{ marginRight: 6 }}>
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
          <div style={{ margin: "0.5rem 0" }}>
            {character.tags.map((tag: string, i: number) => (
              <span
                key={i}
                style={{
                  background: "#e0e7ff",
                  color: "#3730a3",
                  borderRadius: 6,
                  padding: "2px 8px",
                  marginRight: 4,
                  fontSize: 13,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      {bookList.length > 0 && (
        <div style={{ margin: "0.5rem 0" }}>
          <strong>Appears in:</strong>
          {bookList.map((b: any, i: number) => (
            <span key={b.slug} style={{ marginLeft: 6 }}>
              {b.title}
              {i < bookList.length - 1 ? "," : ""}
            </span>
          ))}
        </div>
      )}
      <a href={`/characters/${character.slug}`} className="button">
        View Profile
      </a>
    </div>
  );
}
