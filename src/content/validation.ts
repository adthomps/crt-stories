export interface Book {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  publishDate: string;
  amazonUrl: string;
  kindleUrl: string;
  excerpt: string;
  worldSlug?: string;
}

export interface World {
  slug: string;
  title: string;
  description: string;
  image: string;
  history: string;
  geography: string;
}

export interface Character {
  slug: string;
  name: string;
  title: string;
  description: string;
  image: string;
  backstory: string;
  abilities: string[];
  worldSlug?: string;
  bookSlugs?: string[];
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
  if (!book.publishDate || !validateDate(book.publishDate)) {
    throw new Error(`Book "${book.slug}" has invalid publishDate: "${book.publishDate}"`);
  }
  if (!book.amazonUrl || !validateUrl(book.amazonUrl)) {
    throw new Error(`Book "${book.slug}" has invalid amazonUrl: "${book.amazonUrl}"`);
  }
  if (!book.kindleUrl || !validateUrl(book.kindleUrl)) {
    throw new Error(`Book "${book.slug}" has invalid kindleUrl: "${book.kindleUrl}"`);
  }
  if (!book.excerpt || book.excerpt.trim().length === 0) {
    throw new Error(`Book "${book.slug}" missing required field: excerpt`);
  }
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
  if (!world.image) {
    throw new Error(`World "${world.slug}" missing required field: image`);
  }
  if (!world.history || world.history.trim().length === 0) {
    throw new Error(`World "${world.slug}" missing required field: history`);
  }
  if (!world.geography || world.geography.trim().length === 0) {
    throw new Error(`World "${world.slug}" missing required field: geography`);
  }
}

export function validateCharacter(character: Character): void {
  if (!character.slug || !validateSlug(character.slug)) {
    throw new Error(`Invalid slug in character: "${character.slug}". Slugs must be lowercase alphanumeric with hyphens.`);
  }
  if (!character.name || character.name.trim().length === 0) {
    throw new Error(`Character "${character.slug}" missing required field: name`);
  }
  if (!character.title || character.title.trim().length === 0) {
    throw new Error(`Character "${character.slug}" missing required field: title`);
  }
  if (!character.description || character.description.trim().length === 0) {
    throw new Error(`Character "${character.slug}" missing required field: description`);
  }
  if (!character.image) {
    throw new Error(`Character "${character.slug}" missing required field: image`);
  }
  if (!character.backstory || character.backstory.trim().length === 0) {
    throw new Error(`Character "${character.slug}" missing required field: backstory`);
  }
  if (!Array.isArray(character.abilities) || character.abilities.length === 0) {
    throw new Error(`Character "${character.slug}" missing or invalid abilities array`);
  }
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
