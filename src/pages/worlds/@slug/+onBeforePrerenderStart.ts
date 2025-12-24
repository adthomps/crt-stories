export { onBeforePrerenderStart };

import { worlds } from '../../../content';

function onBeforePrerenderStart() {
  const urls = worlds.map((world) => `/worlds/${world.slug}`);
  return urls;
}
