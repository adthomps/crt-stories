-- BOOK ↔ SERIES
CREATE TABLE book_series (
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  series_id INTEGER REFERENCES series(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, series_id)
);

-- BOOK ↔ WORLD
CREATE TABLE book_world (
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  world_id INTEGER REFERENCES worlds(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, world_id)
);

-- BOOK ↔ CHARACTER
CREATE TABLE book_character (
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, character_id)
);

-- CHARACTER ↔ SERIES
CREATE TABLE character_series (
  character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
  series_id INTEGER REFERENCES series(id) ON DELETE CASCADE,
  PRIMARY KEY (character_id, series_id)
);

-- CHARACTER ↔ WORLD
CREATE TABLE character_world (
  character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
  world_id INTEGER REFERENCES worlds(id) ON DELETE CASCADE,
  PRIMARY KEY (character_id, world_id)
);