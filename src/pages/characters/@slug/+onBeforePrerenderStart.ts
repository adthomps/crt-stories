
import { characters } from '../../../content';

export function onBeforePrerenderStart() {
  const urls = characters.map((character) => `/characters/${character.slug}`);
  return urls;
}
