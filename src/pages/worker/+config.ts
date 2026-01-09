import type { Config } from 'vike/types';

export default {
  route: '/worker',
  prerender: false,
  Layout: false, // Don't inherit global layout
} as Config;
