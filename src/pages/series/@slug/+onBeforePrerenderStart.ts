import { series } from '../../../content';

export default function onBeforePrerenderStart() {
  return series.map((s: any) => `/series/${s.slug}`);
}
