import type { HeadConfig } from "vike/types";
import type { Character } from "../../../components/CharacterPage";

// This Head config expects the page to provide the character object
export default function Head({ character }: { character: Character }) {
  if (!character) {
    return (
      <>
        <title>Character Not Found | CRT Stories</title>
        <meta name="robots" content="noindex" />
      </>
    );
  }
  return (
    <>
      <title>{character.displayName} | CRT Stories Character</title>
      <meta
        name="description"
        content={
          character.bio?.notes?.join(" ") ||
          character.role ||
          "Character in CRT Stories"
        }
      />
      <meta property="og:title" content={character.displayName} />
      <meta
        property="og:description"
        content={character.bio?.notes?.join(" ") || character.role || ""}
      />
      {character.portraitImage && (
        <meta property="og:image" content={character.portraitImage} />
      )}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={character.displayName} />
      {character.portraitImage && (
        <meta name="twitter:image" content={character.portraitImage} />
      )}
    </>
  );
}
