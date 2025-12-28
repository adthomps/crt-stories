
// --- Legacy JSON import method (commented for safety) ---
// import booksData from './books.json';
// import charactersData from './characters.json';
// import worldsData from './worlds.json';
// import {
//   Book,
//   Character,
//   World,
//   validateBooks,
//   validateCharacters,
//   validateWorlds,
// } from './validation';
// // Validate on import to fail build early
// validateBooks(booksData as Book[]);
// validateWorlds(worldsData as World[]);
// validateCharacters(charactersData as Character[]);
// export const books: Book[] = booksData as Book[];
// export const worlds: World[] = worldsData as World[];
// export const characters: Character[] = charactersData as Character[];

// --- New: Fetch from production API ---
import type { Book, Character, World } from './validation';

const API_BASE = 'https://www.crthompson.net/api/public'; // Production API endpoint

export async function fetchBooks(): Promise<Book[]> {
  const res = await fetch(`${API_BASE}/books`);
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}

export async function fetchWorlds(): Promise<World[]> {
  const res = await fetch(`${API_BASE}/worlds`);
  if (!res.ok) throw new Error('Failed to fetch worlds');
  return res.json();
}

export async function fetchCharacters(): Promise<Character[]> {
  const res = await fetch(`${API_BASE}/characters`);
  if (!res.ok) throw new Error('Failed to fetch characters');
  return res.json();
}


// --- New: Async helpers for API data ---
export async function getBookBySlug(slug: string): Promise<Book | undefined> {
  const books = await fetchBooks();
  return books.find((book) => book.slug === slug);
}

export async function getWorldBySlug(slug: string): Promise<World | undefined> {
  const worlds = await fetchWorlds();
  return worlds.find((world) => world.slug === slug);
}

export async function getCharacterBySlug(slug: string): Promise<Character | undefined> {
  const characters = await fetchCharacters();
  return characters.find((character) => character.slug === slug);
}

export async function getBooksByWorld(worldSlug: string): Promise<Book[]> {
  const books = await fetchBooks();
  return books.filter((book) => book.worldSlug === worldSlug);
}

export async function getCharactersByWorld(worldSlug: string): Promise<Character[]> {
  const characters = await fetchCharacters();
  return characters.filter((character) => character.worldSlug === worldSlug);
}

export async function getCharactersByBook(bookSlug: string): Promise<Character[]> {
  const characters = await fetchCharacters();
  return characters.filter(
    (character) =>
      character.bookSlugs && character.bookSlugs.includes(bookSlug)
  );
}
