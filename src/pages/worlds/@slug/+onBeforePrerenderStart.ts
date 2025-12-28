
import { worlds } from '../../../content';

export function onBeforePrerenderStart() {
  const urls = worlds.map((world) => `/worlds/${world.slug}`);
  return urls;
}
