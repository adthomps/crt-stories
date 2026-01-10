// SSG helper for character by slug
export function getCharacterBySlug(slug: string) {
  return characters.find((character) => character.slug === slug);
}

// --- TEMP: Use static JSON for build to unblock deployment ---
import booksData from './books.json';
import charactersData from './characters.json';
import worldsData from './worlds.json';
import seriesData from './series.json';
export const books = booksData;
export const characters = charactersData;
export const worlds = worldsData;
export const series = seriesData;

// Synchronous helpers for static data
export function getBookBySlug(slug: string) {
  return books.find((book) => book.slug === slug);
}
export function getWorldBySlug(slug: string) {
  return worlds.find((world) => world.slug === slug);
}

export function getCharactersByBook(bookSlug: string) {
  return characters.filter((character) =>
    character.appearsInBookSlugs && character.appearsInBookSlugs.includes(bookSlug)
  );
}

// SSG helpers for worlds
export function getBooksByWorld(worldSlug: string) {
  return books.filter((book) => book.worldSlug === worldSlug);
}

export function getCharactersByWorld(worldSlug: string) {
  return characters.filter((character) => character.worldSlug === worldSlug);
}
