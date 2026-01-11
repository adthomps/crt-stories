INSERT INTO
  characters (
    id,
    slug,
    name,
    roleTag,
    bio,
    worldSlugs,
    appearsInBookSlugs,
    seriesSlugs,
    portraitImage,
    tags,
    published
  )
VALUES
  -- Character 1
  (
    1,
    'alex-fox',
    'Alex Fox',
    'Astronaut · Pioneer',
    'A boyhood encounter with the alien C621 sets Alex on a path toward the stars. His choices—and sacrifices—shape the future of the Defense Alliance and the life of his daughter, Dorian.',
    '["tales-of-the-labyrinth-nebula"]',
    '["alex","dorian-volume-1","dorian-volume-2"]',
    '["tln"]',
    '/images/characters/tln/alex.png',
    '["Fox family","first contact","legacy"]',
    1
  ),
  -- Character 2
  (
    2,
    'dorian-fox',
    'Dorian Fox',
    'Officer · Explorer',
    'Driven by fragments of family history and unanswered questions, Dorian’s journey begins at Polaris and leads her into the secrets of the Earth Window and the Labyrinth Nebula.',
    '["tales-of-the-labyrinth-nebula"]',
    '["dorian-volume-1","dorian-volume-2","dorian-volume-3"]',
    '["tln"]',
    '/images/characters/tln/dorian.png',
    '["Fox family","earth window","destiny"]',
    1
  ),
  -- Character 3
  (
    3,
    'adam-casey',
    'Adam Casey',
    'Pilot · Anchor',
    'A skilled and confident pilot, Adam becomes an unexpected source of stability for Dorian as their lives collide with discoveries that change everything.',
    '["tales-of-the-labyrinth-nebula"]',
    '["dorian-volume-1","dorian-volume-2","dorian-volume-3"]',
    '["tln"]',
    '/images/characters/tln/adam.png',
    '["Defense Alliance","pilot","loyalty"]',
    1
  ),
  -- Character 4
  (
    4,
    'c621',
    'C621',
    'Alien · Catalyst',
    'A mysterious being whose brief encounter with Alex and Ryan triggers a lifelong pull toward the unknown—and a chain of events that reaches far beyond Earth.',
    '["tales-of-the-labyrinth-nebula"]',
    '["alex"]',
    '["tln"]',
    '/images/characters/tln/c621.png',
    '["first contact","mystery"]',
    1
  ),
  -- Character 5
  (
    5,
    'david-stone',
    'David Stone',
    'Investigator · Reluctant Hero',
    'Assigned to investigate catastrophic events with no clear cause, David Stone uncovers evidence that suggests the world is facing a threat it cannot explain—or control.',
    '["power-seven"]',
    '["power-seven"]',
    '["power-seven"]',
    '/images/characters/powerseven/david.png',
    '["investigation","conspiracy","global events"]',
    1
  ),
  -- Character 6
  (
    6,
    'george',
    'George',
    'Resident · Observer',
    'Living between the pull of history and the push of personal desire, George’s life in London and Ireland reveals that love and ambition can be as complicated as any famous battle.',
    '["trafalgar"]',
    '["true-story-of-trafalgar"]',
    '["trafalgar"]',
    '/images/characters/trafalgar/george.png',
    '["london","ireland","relationships"]',
    1
  ),
  -- Character 7
  (
    7,
    'riley',
    'Riley',
    'Partner · Counterpoint',
    'Riley navigates the same historical currents as George, showing how ordinary lives can carry extraordinary meaning alongside the events remembered by the world.',
    '["trafalgar"]',
    '["true-story-of-trafalgar"]',
    '["trafalgar"]',
    '/images/characters/trafalgar/riley.png',
    '["london","ireland","relationships"]',
    1
  ) ON CONFLICT (slug) DO
UPDATE
SET
  name = excluded.name,
  roleTag = excluded.roleTag,
  bio = excluded.bio,
  worldSlugs = excluded.worldSlugs,
  appearsInBookSlugs = excluded.appearsInBookSlugs,
  seriesSlugs = excluded.seriesSlugs,
  portraitImage = excluded.portraitImage,
  tags = excluded.tags,
  published = excluded.published;