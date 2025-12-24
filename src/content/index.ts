import booksData from './books.json';
import charactersData from './characters.json';
import worldsData from './worlds.json';
import {
  Book,
  Character,
  World,
  validateBooks,
  validateCharacters,
  validateWorlds,
} from './validation';

// Validate on import to fail build early
validateBooks(booksData as Book[]);
validateWorlds(worldsData as World[]);
validateCharacters(charactersData as Character[]);

export const books: Book[] = booksData as Book[];
export const worlds: World[] = worldsData as World[];
export const characters: Character[] = charactersData as Character[];

export function getBookBySlug(slug: string): Book | undefined {
  return books.find((book) => book.slug === slug);
}

export function getWorldBySlug(slug: string): World | undefined {
  return worlds.find((world) => world.slug === slug);
}

export function getCharacterBySlug(slug: string): Character | undefined {
  return characters.find((character) => character.slug === slug);
}

export function getBooksByWorld(worldSlug: string): Book[] {
  return books.filter((book) => book.worldSlug === worldSlug);
}

export function getCharactersByWorld(worldSlug: string): Character[] {
  return characters.filter((character) => character.worldSlug === worldSlug);
}

export function getCharactersByBook(bookSlug: string): Character[] {
  return characters.filter(
    (character) =>
      character.bookSlugs && character.bookSlugs.includes(bookSlug)
  );
}
