// Zod schemas for all main content types (frontend validation)
import { z } from 'zod';

export const BookSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  publishDate: z.string().optional(),
  excerpt: z.string().optional(),
  worldSlugs: z.array(z.string()).optional(),
  seriesSlugs: z.array(z.string()).optional(),
  characterSlugs: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  formats: z
    .array(
      z.object({
        type: z.string(),
        label: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
  badges: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  ogImage: z.string().optional(),
  author: z.string().optional(),
});

export const WorldSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string(),
  summary: z.string().optional(),
  heroImage: z.string(),
  heroImageCaption: z.string().optional(),
  image2: z.string().optional(),
  image2Caption: z.string().optional(),
  image3: z.string().optional(),
  image3Caption: z.string().optional(),
  image4: z.string().optional(),
  image4Caption: z.string().optional(),
  themeTags: z.array(z.string()).optional(),
  bookSlugs: z.array(z.string()).optional(),
  startHereBookSlug: z.string().optional(),
});

export const SeriesSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().optional(),
  bookSlugs: z.array(z.string()).optional(),
  worldSlugs: z.array(z.string()).optional(),
  characterSlugs: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export const CharacterSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  roleTag: z.string().optional(),
  bio: z.string().optional(),
  worldSlug: z.string().optional(),
  appearsInBookSlugs: z.array(z.string()).optional(),
  portraitImage: z.string(),
  tags: z.array(z.string()).optional(),
  audioExcerpt: z.string().optional(),
});

export type BookInput = z.infer<typeof BookSchema>;
export type WorldInput = z.infer<typeof WorldSchema>;
export type SeriesInput = z.infer<typeof SeriesSchema>;
export type CharacterInput = z.infer<typeof CharacterSchema>;
