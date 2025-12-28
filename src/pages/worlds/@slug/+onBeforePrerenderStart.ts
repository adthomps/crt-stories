
import { fetchWorlds } from '../../../content';

export async function onBeforePrerenderStart() {
  const worlds = await fetchWorlds();
  const urls = worlds.map((world) => `/worlds/${world.slug}`);
  return urls;
}
