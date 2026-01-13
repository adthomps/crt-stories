// components/CharacterPage.tsx
// Reusable Character Page schema for a React + Vike wiki.
// Assumes JSON canon files are loaded (e.g., canon.bundle.json).

export type Status = "Active" | "Deceased" | "Unknown" | "Transformed" | "Deprecated";
export type Importance = "Lead" | "Major" | "Supporting" | "Minor" | "Mention";
export type PovMode = "Primary" | "Secondary" | "Interlude" | "Epistolary" | "TBD";

export interface CharacterBioFacts {
  origin?: string;
  species?: string;
  titlesOrRanks?: string[];
  roles?: string[];
  eraActive?: string[];     // TLN-ERA ids (optional)
  notes?: string[];         // factual bullet notes only
}

export interface Character {
  id: string;               // TLN-CHAR-####
  slug: string;             // URL slug
  displayName: string;
  aliases: string[];
  type: string;
  role: string;
  affiliations: string[];
  status: Status;
  povEligible: boolean;
  bio?: CharacterBioFacts;
  portraitImage?: string;   // New: image URL
import ReactMarkdown from 'react-markdown';
}

export interface Book {
  id: string;               // TLN-BOOK-###
  slug: string;
  title: string;
  format?: string;
  status?: string;
}

export interface BookCharacterMapRow {
  bookId: string;
  characterId: string;
  inBook: "Yes" | "No" | "TBD";
  importance: Importance;
  povUsed: "Yes" | "No" | "TBD";
  povMode?: PovMode | null;
  notes?: string[];
}

export interface CanonBundle {
  characters: Character[];
  books: Book[];
  bookCharacterMap: BookCharacterMapRow[];
}

export interface CharacterPageProps {
  characterId: string;
  canon: CanonBundle;
  // Optional: narrative markdown body already loaded by route (e.g., /bios/:slug.md)
  bioMarkdown?: string;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 999,
      border: "1px solid #ccc",
      fontSize: 12
    }}>
      {children}
    </span>
  );
}

function FactsList({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontWeight: 600 }}>{label}</div>
      <ul style={{ margin: "6px 0 0 18px" }}>
        {items.map((x) => <li key={x}>{x}</li>)}
      </ul>
    </div>
  );
}

export function CharacterPage({ characterId, canon, bioMarkdown }: CharacterPageProps) {
  const character = canon.characters.find(c => c.id === characterId);
  if (!character) {
    return <div style={{ color: 'red', padding: 24 }}>Character not found: {characterId}</div>;
  }

  const appearances = canon.bookCharacterMap
    .filter(r => r.characterId === characterId && r.inBook !== "No")
    .map(r => ({
      row: r,
      book: canon.books.find(b => b.id === r.bookId)
    }))
    .filter(x => !!x.book);

  // Related wiki links
  const relatedBooks = appearances.map(a => a.book).filter(Boolean);
  // Example: worlds could be added if canon has world links

  // Admin edit link (assume /admin/characters/:slug)
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const editUrl = `/admin/characters/${character.slug}`;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {character.portraitImage && (
            <img src={character.portraitImage} alt={character.displayName} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, border: '1px solid #eee' }} />
          )}
          <div>
            <h1 style={{ margin: 0 }}>{character.displayName}</h1>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge>{character.status}</Badge>
              <Badge>{character.type}</Badge>
              <Badge>POV Eligible: {character.povEligible ? "Yes" : "No"}</Badge>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, opacity: 0.75 }}>
          <div>ID: {character.id}</div>
          <div>Slug: {character.slug}</div>
          {isAdmin && <a href={editUrl} className="button" style={{ marginTop: 8 }}>Edit Character</a>}
        </div>
      </header>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ marginBottom: 6 }}>Role</h2>
        <p style={{ marginTop: 0 }}>{character.role}</p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Facts</h3>
          <FactsList label="Affiliations" items={character.affiliations} />
          {character.aliases?.length ? <FactsList label="Aliases" items={character.aliases} /> : null}
          {character.bio?.origin ? <div style={{ marginTop: 8 }}><b>Origin:</b> {character.bio.origin}</div> : null}
          <FactsList label="Titles / Ranks" items={character.bio?.titlesOrRanks} />
          <FactsList label="Roles" items={character.bio?.roles} />
          <FactsList label="Notes" items={character.bio?.notes} />
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Books</h3>
          {appearances.length === 0 ? (
            <div>No appearances recorded.</div>
          ) : (
            <ul style={{ margin: "6px 0 0 18px" }}>
              {appearances.map(({ row, book }) => (
                <li key={`${row.bookId}:${row.characterId}`}>
                  <a href={`/books/${book!.slug}`}><b>{book!.title}</b></a> — {row.importance}
                  {row.povUsed === "Yes" ? ` (POV: ${row.povMode ?? "Yes"})` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2>Narrative Bio</h2>
        {bioMarkdown ? (
          <ReactMarkdown>{bioMarkdown}</ReactMarkdown>
        ) : (
          <div style={{ opacity: 0.75 }}>
            No narrative bio loaded. (Optional) Load from /bios/{character.slug}.md
          </div>
        )}
      </section>
    </div>
  );
}
