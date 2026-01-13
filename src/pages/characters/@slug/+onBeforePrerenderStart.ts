
import { characters } from '../../../content';

export default function onBeforePrerenderStart() {
  const urls = characters.map((character) => `/characters/${character.slug}`);
  // Deduplicate URLs in case of accidental duplicates
  const uniqueUrls = Array.from(new Set(urls));
  return uniqueUrls;
}
