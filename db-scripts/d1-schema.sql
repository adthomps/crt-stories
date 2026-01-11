-- D1 schema for CRT Stories
CREATE TABLE
  IF NOT EXISTS series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    longDescription TEXT,
    badges TEXT, -- store as JSON string
    tags TEXT, -- store as JSON string
    ogImage TEXT,
    heroImage TEXT,
    published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime ('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime ('now')),
    deleted_at TEXT
  );

CREATE TABLE
  IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    series_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    publish_date TEXT,
    badges TEXT,
    tags TEXT,
    formats TEXT,
    subtitle TEXT,
    longDescription TEXT,
    status TEXT,
    author TEXT,
    ogImage TEXT,
    excerpt TEXT,
    world_slug TEXT,
    characterSlugs TEXT,
    related TEXT,
    published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime ('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime ('now')),
    deleted_at TEXT
  );

-- Worlds table
CREATE TABLE
  IF NOT EXISTS worlds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    heroImage TEXT,
    heroImageCaption TEXT,
    image1 TEXT,
    image1Caption TEXT,
    image2 TEXT,
    image2Caption TEXT,
    image3 TEXT,
    image3Caption TEXT,
    themeTags TEXT, -- store as JSON string
    bookSlugs TEXT, -- store as JSON string
    characterSlugs TEXT, -- store as JSON string
    startHereBookSlug TEXT,
    published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime ('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime ('now')),
    deleted_at TEXT
  );

-- Characters table
CREATE TABLE
  IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    roleTag TEXT,
    bio TEXT,
    worldSlugs TEXT,
    appearsInBookSlugs TEXT,
    seriesSlugs TEXT,
    portraitImage TEXT,
    tags TEXT,
    published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime ('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime ('now')),
    deleted_at TEXT
  );