# CRT Stories: Project Architecture

## Overview

CRT Stories is a static author website built with Vite, React, TypeScript, and Vike (Static Site Generation). All content is managed via JSON and Cloudflare D1, with strict validation, robust admin UI, and seamless deployment to Cloudflare Pages.

---

## Architecture Summary

- **Framework:** Vite + React + TypeScript + Vike (Static Site Generation)
- **Content:** All books, worlds, series, characters, and author info managed via JSON in `src/content/` (exported from Cloudflare D1)
- **Pages:** Located in `src/pages/` using Vike conventions (`+Page.tsx`, `+Head.tsx`, etc.)
- **Assets:** Images in `public/images/{books,characters,worlds,author}/`
- **Config:** Global site config in `src/config.ts`
- **Validation:** Content validation in `src/content/validation.ts` (Zod schemas, strict type safety)
- **Deployment:** Static output for Cloudflare Pages
- **Admin UI:** `/worker` route, protected, CRUD for all entities
- **API:** All admin CRUD via `/api/worker/` (Cloudflare Pages Functions)
- **Automated Content Export:** D1 → JSON sync via scripts and GitHub Actions

---

## Entity Relationship Diagram

```
[Series] 1---* [Books] *---1 [Worlds]
                    |
                    * 
                [Characters]
```

- **Series:** 1–* Books
- **Worlds:** 1–* Books, 1–* Characters
- **Books:** *–* Characters (via world)
- **Strict validation and join tables in D1**

---

## Build & Deployment Flow

1. **Content Management:** Admin UI writes to Cloudflare D1
2. **Export:** Published D1 records exported to JSON (`src/content/`)
3. **Validation:** Build runs strict validation (missing fields, bad slugs, duplicates, etc.)
4. **Static Generation:** Vike prerenders all pages to HTML
5. **Deployment:** Static site deployed to Cloudflare Pages

---

## Reference Files

- `README.md`: Project overview, setup, and workflow
- `src/config.ts`: Site-wide settings (title, author, baseUrl, etc.)
- `src/content/validation.ts`: Content schema and validation logic
- `src/pages/Layout.css`: All layout, card, button, badge, and tag styles
- `src/pages/[entity]/index/+Page.tsx`: List pages for books, worlds, characters
- `src/pages/[entity]/@slug/+Page.tsx`: Detail pages for books, worlds, characters
- `src/pages/about/+Page.tsx`: About the Author page
- `src/content/author.json`: Author bio and metadata
- `src/content/books.json`, `worlds.json`, `series.json`, `characters.json`: Main content data

---

For more details, see the README and DESIGN-STYLE-GUIDE.md for conventions and workflows.
