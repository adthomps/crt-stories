
import { fetchCharacters } from '../../../content';

export async function onBeforePrerenderStart() {
  const characters = await fetchCharacters();
  const urls = characters.map((character) => `/characters/${character.slug}`);
  return urls;
}
