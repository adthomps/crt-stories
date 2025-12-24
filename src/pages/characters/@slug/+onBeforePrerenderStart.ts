export { onBeforePrerenderStart };

import { characters } from '../../../content';

function onBeforePrerenderStart() {
  const urls = characters.map((character) => `/characters/${character.slug}`);
  return urls;
}
