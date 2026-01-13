
import { characters } from '../../../content';

export default function onBeforePrerenderStart() {
  const urls = characters.map((character) => `/characters/${character.slug}`);
  // Deduplicate URLs in case of accidental duplicates
  const uniqueUrls = Array.from(new Set(urls));
  if (typeof console !== 'undefined') {
    // This will show up in Node.js build logs
    console.log('[onBeforePrerenderStart] character URLs:', uniqueUrls);
  }
  return uniqueUrls;
}
