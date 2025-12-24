export interface Book {
  slug: string;
  title: string;
  subtitle?: string | null;
  description: string;
  longDescription?: string;
  coverImage: string;
  publishDate: string;
  status?: string;
  author?: string;
  worldSlug?: string;
  series?: {
    id: string;
    name: string;
    bookNumber: number;
  };
  formats?: Array<{
    type: string;
    label: string;
    url: string;
  }>;
  links?: Record<string, string>;
  excerpt?: string | null;
  audioExcerpt?: string | null;
  related?: Record<string, string | null>;
  badges?: string[];
  tags?: string[];
  ogImage?: string;
  amazonUrl?: string;
  kindleUrl?: string;
}

export interface World {
  slug: string;
  title: string;
  description: string;
  summary?: string;
  heroImage: string;
  heroImageCaption?: string;
  image2?: string;
  image2Caption?: string;
  image3?: string;
  image3Caption?: string;
  image4?: string;
  image4Caption?: string;
  themeTags?: string[];
  bookSlugs?: string[];
  startHereBookSlug?: string;
}

export interface Character {
  slug: string;
  name: string;
  roleTag?: string;
  bio?: string;
  worldSlug?: string;
  appearsInBookSlugs?: string[];
  portraitImage: string;
  tags?: string[];
  audioExcerpt?: string | null;
}

function validateSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validateDate(date: string): boolean {
  return !isNaN(Date.parse(date));
}

function checkDuplicateSlugs<T extends { slug: string }>(items: T[], type: string): void {
  const slugs = new Set<string>();
  for (const item of items) {
    if (slugs.has(item.slug)) {
      throw new Error(`Duplicate slug found in ${type}: "${item.slug}"`);
    }
    slugs.add(item.slug);
  }
}

export function validateBook(book: Book): void {
  if (!book.slug || !validateSlug(book.slug)) {
    throw new Error(`Invalid slug in book: "${book.slug}". Slugs must be lowercase alphanumeric with hyphens.`);
  }
  if (!book.title || book.title.trim().length === 0) {
    throw new Error(`Book "${book.slug}" missing required field: title`);
  }
  if (!book.description || book.description.trim().length === 0) {
    throw new Error(`Book "${book.slug}" missing required field: description`);
  }
  if (!book.coverImage) {
    throw new Error(`Book "${book.slug}" missing required field: coverImage`);
  }
  if (!book.publishDate || (book.publishDate !== "TBD" && !validateDate(book.publishDate))) {
    throw new Error(`Book "${book.slug}" has invalid publishDate: "${book.publishDate}"`);
  }
  if (book.amazonUrl && book.amazonUrl !== "" && !validateUrl(book.amazonUrl)) {
    throw new Error(`Book "${book.slug}" has invalid amazonUrl: "${book.amazonUrl}"`);
  }
  if (book.kindleUrl && book.kindleUrl !== "" && !validateUrl(book.kindleUrl)) {
    throw new Error(`Book "${book.slug}" has invalid kindleUrl: "${book.kindleUrl}"`);
  }
  // excerpt is now optional or can be null/empty
}

export function validateWorld(world: World): void {
  if (!world.slug || !validateSlug(world.slug)) {
    throw new Error(`Invalid slug in world: "${world.slug}". Slugs must be lowercase alphanumeric with hyphens.`);
  }
  if (!world.title || world.title.trim().length === 0) {
    throw new Error(`World "${world.slug}" missing required field: title`);
  }
  if (!world.description || world.description.trim().length === 0) {
    throw new Error(`World "${world.slug}" missing required field: description`);
  }
  if (!world.heroImage) {
    throw new Error(`World "${world.slug}" missing required field: heroImage`);
  }
  // summary, themeTags, bookSlugs, startHereBookSlug are optional
}

export function validateCharacter(character: Character): void {
  if (!character.slug || !validateSlug(character.slug)) {
    throw new Error(`Invalid slug in character: "${character.slug}". Slugs must be lowercase alphanumeric with hyphens.`);
  }
  if (!character.name || character.name.trim().length === 0) {
    throw new Error(`Character "${character.slug}" missing required field: name`);
  }
  if (!character.portraitImage) {
    throw new Error(`Character "${character.slug}" missing required field: portraitImage`);
  }
  // roleTag, bio, worldSlug, appearsInBookSlugs, tags are optional
}

export function validateBooks(books: Book[]): void {
  checkDuplicateSlugs(books, 'books');
  books.forEach(validateBook);
}

export function validateWorlds(worlds: World[]): void {
  checkDuplicateSlugs(worlds, 'worlds');
  worlds.forEach(validateWorld);
}

export function validateCharacters(characters: Character[]): void {
  checkDuplicateSlugs(characters, 'characters');
  characters.forEach(validateCharacter);
}
