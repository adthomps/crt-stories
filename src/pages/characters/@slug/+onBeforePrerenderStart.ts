
console.log('[onBeforePrerenderStart] HOOK LOADED:', new Date().toISOString());
console.log('[onBeforePrerenderStart] __dirname:', typeof __dirname !== 'undefined' ? __dirname : '(undefined)');
console.log('[onBeforePrerenderStart] __filename:', typeof __filename !== 'undefined' ? __filename : '(undefined)');
import { characters } from '../../../content';

export default function onBeforePrerenderStart() {
  const urls = characters.map((character) => `/characters/${character.slug}`);
  // Log all slugs before deduplication
  if (typeof console !== 'undefined') {
    console.log('[onBeforePrerenderStart] RAW character slugs:', characters.map(c => c.slug));
    console.log('[onBeforePrerenderStart] RAW character URLs:', urls);
    console.log('[onBeforePrerenderStart] Source file:', typeof __filename !== 'undefined' ? __filename : '(undefined)');
  }
  // Find duplicates
  const slugCounts = urls.reduce((acc, url) => {
    acc[url] = (acc[url] || 0) + 1;
    return acc;
  }, {});
  const duplicates = Object.entries(slugCounts).filter(([url, count]) => count > 1);
  if (duplicates.length > 0) {
    // Fail the build with a clear error
    throw new Error('[onBeforePrerenderStart] Duplicate character URLs detected: ' + JSON.stringify(duplicates));
  }
  // Deduplicate URLs in case of accidental duplicates
  const uniqueUrls = Array.from(new Set(urls));
  if (typeof console !== 'undefined') {
    // This will show up in Node.js build logs
    console.log('[onBeforePrerenderStart] DEDUPED character URLs:', uniqueUrls);
  }
  return uniqueUrls;
}
