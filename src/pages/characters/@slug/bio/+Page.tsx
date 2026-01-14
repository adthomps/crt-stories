import React, { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { CharacterPage } from "../../../../components/CharacterPage";

export default function CharacterBioPage() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  const [canon, setCanon] = useState<any | null>(null);
  const [bioMarkdown, setBioMarkdown] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/wiki/canon.bundle.json").then((r) => r.json()),
      fetch(`/bios/${slug}.md`).then((r) => r.text()),
    ])
      .then(([canonData, bioMd]) => {
        setCanon(canonData);
        setBioMarkdown(bioMd);
      })
      .catch((e) => setError(e.message || "Failed to load bio/wiki"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Loading bio/wiki...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!canon) return <div>Character canon data not found.</div>;

  // Find characterId from canon bundle
  const character = canon.characters.find((c: any) => c.slug === slug);
  if (!character) return <div>Character not found in canon bundle.</div>;

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "2rem" }}>
      <CharacterPage
        characterId={character.id}
        canon={canon}
        bioMarkdown={bioMarkdown}
      />
    </div>
  );
}
