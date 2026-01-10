# CRT Stories – Static Author Website

A modern static author website built with Vite, React, TypeScript, and Vike (Static Site Generation). All content is managed via JSON and Cloudflare D1, with strict validation, robust admin UI, and seamless deployment to Cloudflare Pages.

---

## Key Features

- **Static Site Generation (SSG):** All routes are prerendered to HTML at build time
- **No SSR Runtime:** Pure static files, ideal for Cloudflare Pages
- **Dynamic Routes:** `/books/:slug`, `/worlds/:slug`, `/characters/:slug`, `/series/:seriesId`
- **Content Validation:** Automatic, strict validation of JSON content at build time
- **Duplicate Slug Detection:** Prevents duplicate slugs across all content types
- **SEO Optimization:** Meta tags for every page (Open Graph, Twitter Cards)
- **Purchase Links:** All book formats/links editable and visible in admin/public UIs
- **Type Safety:** Full TypeScript support, strict interfaces for all content
- **Advanced Frontend Validation:** Field-level errors, real-time feedback, duplicate checks, accessibility
- **Admin UI:** Modal-based CRUD, helper text, responsive forms, protected by authentication
- **Cloudflare D1 Integration:** All admin CRUD and content management via D1
- **Automated Content Export:** Syncs published D1 records to frontend JSON

---

## Project Structure

```
crt-stories/
├── src/
│   ├── content/           # JSON content files (books, worlds, series, characters)
│   └── pages/             # Vike pages (public & admin)
├── public/                # Static assets (images, redirects)
├── functions/             # Cloudflare Pages Functions (API endpoints)
├── scripts/               # D1 migration & export scripts
├── dist/                  # Build output
└── docs/                  # Architecture, diagrams
```

---

## Content Management & Validation

- All content is stored in JSON under `src/content/`
- **Validation:** Enforced at build time (missing fields, bad slugs, duplicates, etc.)
- **Type Definitions:** TypeScript interfaces for all entities
- **Strict Slug Rules:** Lowercase, alphanumeric, hyphens only; must be unique
- **Purchase Links:** All book formats/links editable in admin UI, visible in public UI

---

## Site Configuration

Edit `src/config.ts` for global site settings:

```typescript
export const siteConfig = {
  title: 'CRT Stories',
  description: 'Epic tales, immersive worlds, unforgettable characters.',
  baseUrl: 'https://crt-stories.pages.dev',
  author: 'CRT',
};
```

---

## Data Model & Relationships

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

## Admin UI & API

- **Admin UI:** Located under `/worker` (protected, not public)
- **CRUD:** Modal-based forms for all entities
- **API Endpoints:** All admin CRUD via `/api/worker/` (Cloudflare Pages Functions)
- **Legacy `/api/admin/` endpoints are deprecated and removed**
- **Authentication:** Admin UI is protected

---

## Development Workflow

```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Build for production (runs content validation)
npm run preview    # Preview production build
```

---

## Build Validation

- Required fields enforced
- Slugs must be unique and valid
- URLs and dates validated
- **Build fails on any validation error**

---

## Deployment

- **Cloudflare Pages:** Static site output, pre-rendered
- **Cloudflare D1:** Admin CRUD and content management
- **Connect repo to Cloudflare Pages**
- **Build command:** `npm run build`
- **Export script:** Syncs published D1 records to frontend JSON
- **GitHub Actions:** Automates export and deployment

---

## Automated Content Export

- Only published content is exported
- Export script: [`scripts/export-d1-to-json.ts`](scripts/export-d1-to-json.ts)
- GitHub Action: [`export-content.yml`](.github/workflows/export-content.yml)
- Images managed in `/public/images/`
- Manual export available via GitHub Actions

---

## Troubleshooting

- If content is not exporting, check the `export_state` table in D1
- Reset `needs_export` flag if stuck
- Review GitHub Actions logs for errors

---

## Visual Diagram

![Entity Relationship Diagram](docs/entity-relationship.png)

---

## References & Further Reading

- See `src/content/validation.ts` and `src/content/index.ts` for validation logic
- See `src/pages/` for routing and page structure
- See `.github/copilot-instructions.md` for code conventions

---

CRT Stories is designed for modern static author sites: robust, fast, and easy to manage. For questions or contributions, open an issue or pull request!

