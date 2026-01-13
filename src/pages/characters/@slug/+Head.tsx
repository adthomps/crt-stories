import type { HeadConfig } from "vike/types";
import type { Character } from "../../../components/CharacterPage";

// This Head config expects the page to provide the character object
export default function Head({ character }: { character: Character }) {
  if (!character) {
    return {
      title: "Character Not Found",
      meta: [{ name: "robots", content: "noindex" }],
    };
  }
  return {
    title: `${character.displayName} | CRT Stories Character`,
    meta: [
      {
        name: "description",
        content:
          character.bio?.notes?.join(" ") ||
          character.role ||
          "Character in CRT Stories",
      },
      { property: "og:title", content: character.displayName },
      {
        property: "og:description",
        content: character.bio?.notes?.join(" ") || character.role || "",
      },
      character.portraitImage
        ? { property: "og:image", content: character.portraitImage }
        : null,
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: character.displayName },
      character.portraitImage
        ? { name: "twitter:image", content: character.portraitImage }
        : null,
    ].filter(Boolean),
  };
}
