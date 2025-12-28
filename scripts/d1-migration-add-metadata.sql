-- Migration: Add missing metadata fields to match frontend schema

-- Books
ALTER TABLE books ADD COLUMN subtitle TEXT;
ALTER TABLE books ADD COLUMN long_description TEXT;
ALTER TABLE books ADD COLUMN status TEXT;
ALTER TABLE books ADD COLUMN author TEXT;
ALTER TABLE books ADD COLUMN formats TEXT; -- JSON array
ALTER TABLE books ADD COLUMN links TEXT;   -- JSON object
ALTER TABLE books ADD COLUMN audio_excerpt TEXT;
ALTER TABLE books ADD COLUMN badges TEXT;  -- JSON array
ALTER TABLE books ADD COLUMN tags TEXT;    -- JSON array
ALTER TABLE books ADD COLUMN og_image TEXT;
ALTER TABLE books ADD COLUMN prequel_slug TEXT;
ALTER TABLE books ADD COLUMN next_slug TEXT;
ALTER TABLE books ADD COLUMN previous_slug TEXT;

-- Worlds
ALTER TABLE worlds ADD COLUMN summary TEXT;
ALTER TABLE worlds ADD COLUMN hero_image TEXT;
ALTER TABLE worlds ADD COLUMN hero_image_caption TEXT;
ALTER TABLE worlds ADD COLUMN image1 TEXT;
ALTER TABLE worlds ADD COLUMN image1_caption TEXT;
ALTER TABLE worlds ADD COLUMN image2 TEXT;
ALTER TABLE worlds ADD COLUMN image2_caption TEXT;
ALTER TABLE worlds ADD COLUMN image3 TEXT;
ALTER TABLE worlds ADD COLUMN image3_caption TEXT;
ALTER TABLE worlds ADD COLUMN image4 TEXT;
ALTER TABLE worlds ADD COLUMN image4_caption TEXT;
ALTER TABLE worlds ADD COLUMN theme_tags TEXT; -- JSON array
ALTER TABLE worlds ADD COLUMN book_slugs TEXT; -- JSON array
ALTER TABLE worlds ADD COLUMN start_here_book_slug TEXT;

-- Characters
ALTER TABLE characters ADD COLUMN role_tag TEXT;
ALTER TABLE characters ADD COLUMN bio TEXT;
ALTER TABLE characters ADD COLUMN appears_in_book_slugs TEXT; -- JSON array
ALTER TABLE characters ADD COLUMN portrait_image TEXT;
ALTER TABLE characters ADD COLUMN tags TEXT; -- JSON array
ALTER TABLE characters ADD COLUMN audio_excerpt TEXT;

-- Series
ALTER TABLE series ADD COLUMN og_image TEXT;
ALTER TABLE series ADD COLUMN badges TEXT; -- JSON array
ALTER TABLE series ADD COLUMN tags TEXT; -- JSON array
