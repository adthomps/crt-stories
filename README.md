# CRT Stories - Static Author Website

A static author website built with Vite + React + TypeScript + Vike, featuring Static Site Generation (SSG) for optimal performance on Cloudflare Pages.

## Features

- ✅ **Static Site Generation (SSG)**: All routes prerender to HTML at build time
- ✅ **No SSR Runtime**: Pure static files, perfect for Cloudflare Pages
- ✅ **Dynamic Routes**: `/books/:slug`, `/worlds/:slug`, `/characters/:slug`
- ✅ **Content Validation**: Automatic validation of JSON content with build-time error checking
- ✅ **Duplicate Slug Detection**: Prevents duplicate slugs across content types
- ✅ **SEO Optimization**: Meta tags for each page including Open Graph and Twitter Cards
- ✅ **Amazon/Kindle CTAs**: Call-to-action buttons on book pages
- ✅ **Type Safety**: Full TypeScript support with strict type checking

## Project Structure

```
crt-stories/
├── src/
│   ├── content/           # JSON content files
│   │   ├── books.json
│   │   ├── worlds.json
│   │   ├── characters.json
│   │   ├── validation.ts  # Content validation logic
│   │   └── index.ts       # Content loader with validation
│   └── pages/             # Vike pages
│       ├── +config.ts     # Vike configuration
│       ├── +Layout.tsx    # Global layout
│       ├── +Head.tsx      # Default SEO meta tags
│       ├── index/         # Home page
│       ├── books/         # Books pages
│       │   ├── index/     # Books list
│       │   └── @slug/     # Individual book pages
│       ├── worlds/        # Worlds pages
│       │   ├── index/     # Worlds list
│       │   └── @slug/     # Individual world pages
│       └── characters/    # Characters pages
│           ├── index/     # Characters list
│           └── @slug/     # Individual character pages
├── public/                # Static assets
└── dist/                  # Build output
```

## Content Management

All content is stored in JSON files under `src/content/`. Each content type has:

- **Validation**: Enforced at build time
- **Type Definitions**: TypeScript interfaces
- **Slug Validation**: Must be lowercase alphanumeric with hyphens

### Site Configuration

Edit `src/config.ts` to customize site-wide settings:

```typescript
export const siteConfig = {
  title: 'Your Site Title',
  description: 'Your site description',
  baseUrl: 'https://your-domain.pages.dev',
  author: 'Your Name',
};
```

### Adding Books

Edit `src/content/books.json`:

```json
{
  "slug": "my-book",
  "title": "My Book Title",
  "description": "Short description",
  "coverImage": "/images/books/my-book.jpg",
  "publishDate": "2024-01-15",
  "amazonUrl": "https://www.amazon.com/dp/...",
  "kindleUrl": "https://www.amazon.com/dp/...",
  "excerpt": "Book excerpt...",
  "worldSlug": "world-slug"
}
```

### Adding Worlds

Edit `src/content/worlds.json`:

```json
{
  "slug": "my-world",
  "title": "World Name",
  "description": "Short description",
  "image": "/images/worlds/my-world.jpg",
  "history": "World history...",
  "geography": "World geography..."
}
```

### Adding Characters

Edit `src/content/characters.json`:

```json
{
  "slug": "character-name",
  "name": "Character Name",
  "title": "Character Title",
  "description": "Short description",
  "image": "/images/characters/character-name.jpg",
  "backstory": "Character backstory...",
  "abilities": ["Ability 1", "Ability 2"],
  "worldSlug": "world-slug",
  "bookSlugs": ["book-slug-1", "book-slug-2"]
}
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Build Validation

The build process automatically validates all content:

- ✅ Required fields are present
- ✅ Slugs are properly formatted
- ✅ URLs are valid
- ✅ Dates are valid
- ✅ No duplicate slugs exist

**The build will fail if any validation errors are found.**

## Deployment
 ✅ **Admin/Worker Area**: Secure admin UI and API endpoints under `/worker` for managing content (books, worlds, series, characters)
1. Connect your repository to Cloudflare Pages
2. Set build command: `npm run build`
 ## Admin/Worker API Endpoints
 
 All admin CRUD operations are now handled via the `/api/worker/` endpoints:
 
 - `/api/worker/books` (CRUD for books)
 - `/api/worker/worlds` (CRUD for worlds)
 - `/api/worker/series` (CRUD for series)
 - `/api/worker/characters` (CRUD for characters)
 
 > **Note:** The legacy `/api/admin/` endpoints are deprecated and return a 410 Gone response. Update all integrations to use `/api/worker/`.
4. Deploy!

 ## Admin UI & Worker Area
 
 The admin UI is fully separated from public pages and lives under `/worker`. It is protected by authentication and only accessible to authorized users. All admin tools (books, worlds, series, characters) and their API endpoints are isolated from the public site.
 
 **Key points:**
 - All admin API calls must use `/api/worker/` endpoints
 - The `/api/admin/` endpoints are deprecated and will be removed in a future release
 - Admin UI is protected and not accessible to the public
Each page includes:

 ## Deployment
 
 ### Cloudflare Pages & Worker API
 
 The static site is deployed to Cloudflare Pages. All admin/worker API endpoints are implemented as Cloudflare Pages Functions under `/api/worker/`. No server-side rendering is used at runtime; all pages are pre-rendered.
- Open Graph tags
- Twitter Card tags
 ## Development
 
 ### Running the Worker/Admin Area Locally
 
 To develop or test the admin/worker area:
 - Start the dev server: `npm run dev`
 - Access the admin UI at `/worker`
 - All API calls for admin tools go to `/api/worker/`
ISC
## Export-on-Publish Content Flow
 ## API Endpoint Migration
 
 As of January 2026, all admin API endpoints have moved from `/api/admin/` to `/api/worker/`. The old endpoints now return a 410 Gone response. Update any scripts, integrations, or bookmarks to use the new `/worker` endpoints.
This project uses a semi-automatic export system to keep the public site’s JSON content in sync with published records in your Cloudflare D1 database. This ensures only published content is visible, and changes are tracked in git.

### How It Works

1. **Admin publishes/unpublishes content** (Series, Books, Worlds, Characters) in the admin UI (backed by D1).
2. **Export flag is set**: The D1 table `export_state` is updated to indicate that an export is needed.
3. **Export script runs** ([scripts/export-d1-to-json.ts](scripts/export-d1-to-json.ts)):
    - Reads only published records from D1
    - Maps DB rows to the frontend JSON schema (including nested fields and relationships)
    - Writes to `src/content/series.json`, `books.json`, `worlds.json`, `characters.json`
    - Only writes if content changed (prevents noisy diffs)
    - Resets export flag if any file changed
4. **GitHub Action** ([.github/workflows/export-content.yml](.github/workflows/export-content.yml)) runs nightly and on manual trigger:
    - Runs the export script
    - Commits and pushes changes if any content files changed

### Required GitHub Secrets

Set these in your repository’s GitHub Actions secrets:

- `CF_API_TOKEN`: Cloudflare API token with D1 read access (must have permission to query your D1 database)
- `CF_ACCOUNT_ID`: Your Cloudflare account ID (find in Cloudflare dashboard)
- `D1_DATABASE_ID`: The D1 database ID

> **Tip:** The API token should have at least `D1:Edit` or `D1:Read` permissions for the target database.

### Manual Export

You can trigger a manual export from the GitHub Actions tab by running the **Export Published Content** workflow. This is useful if you want to force a sync outside the nightly schedule.

### Troubleshooting & Recovery

If content is not exporting (e.g., `needs_export` is stuck at 1):

1. Check the `export_state` table in D1. There should be a single row with `id=1`.
2. You can manually reset the flag:
    - Update `needs_export` to 0 and set `updated_at` to current time.
3. Rerun the export workflow if needed.
4. Check GitHub Actions logs for errors or permission issues.

### Implementation Notes

- Only published content is exported; drafts are never exported.
- The export script will initialize the `export_state` row if missing.
- Images remain static in `/public/images` and are managed via git.
- All export logic is in [`scripts/export-d1-to-json.ts`](scripts/export-d1-to-json.ts).
- Automation is handled by [`export-content.yml`](.github/workflows/export-content.yml).

# CRT Stories Admin & Content Model

## Overview
CRT Stories is a static author website built with Vite, React, TypeScript, and Vike. All content (books, series, worlds, characters) is managed via JSON and a Cloudflare D1 database, with strict validation and a modern admin UI.

## Data Model & Relationships

### Entity Relationship Diagram

```
[Series] 1---* [Books] *---1 [Worlds]
                    |
                    * 
                [Characters]
```

- **[Series] 1---* [Books]**: One series can have many books; a book can belong to one series or none.
- **[Worlds] 1---* [Books]**: One world can have many books; a book can belong to one world or none.
- **[Worlds] 1---* [Characters]**: One world can have many characters; a character can belong to one world or none.
- **[Books] *---* [Characters]**: No direct enforced relationship, but characters and books can be linked via world.

### Field Requirements Table

| Entity     | Field         | Required | Notes                                 |
|------------|--------------|----------|---------------------------------------|
| Series     | slug         | Yes      | Unique, lowercase, hyphens            |
|            | title        | Yes      |                                       |
|            | description  | No       |                                       |
|            | published    | No       | Boolean                               |
| Book       | slug         | Yes      | Unique, lowercase, hyphens            |
|            | title        | Yes      |                                       |
|            | description  | No       |                                       |
|            | cover_image  | No       | URL or path                           |
|            | publish_date | No       | YYYY-MM-DD                            |
|            | amazon_url   | No       |                                       |
|            | kindle_url   | No       |                                       |
|            | excerpt      | No       |                                       |
|            | world_slug   | No       | FK to worlds.slug                     |
|            | series_id    | No       | FK to series.id                       |
|            | published    | No       | Boolean                               |
| World      | slug         | Yes      | Unique, lowercase, hyphens            |
|            | title        | Yes      |                                       |
|            | description  | No       |                                       |
|            | published    | No       | Boolean                               |
| Character  | slug         | Yes      | Unique, lowercase, hyphens            |
|            | name         | Yes      |                                       |
|            | description  | No       |                                       |
|            | world_slug   | No       | FK to worlds.slug                     |
|            | published    | No       | Boolean                               |

## Admin UI Features
- Modal-based CRUD for all entities
- Helper text, examples, and placeholders for all fields
- Responsive, scrollable, and columnar modals for long forms
- Navigation between admin sections

## Content Validation
- All content is validated at build time and on API submission
- Slugs must be unique, lowercase, alphanumeric, hyphens only
- Required fields enforced for each entity

## Deployment
- Static site output, pre-rendered for Cloudflare Pages
- D1 database for admin CRUD and content management

## Development
- `npm install` to install dependencies
- `npm run dev` to start the dev server
- `npm run build` to build and validate content
- `npm run preview` to serve the built site

---

## Visual Diagram

![Entity Relationship Diagram](docs/entity-relationship.png)

> See the ASCII diagram above for a quick reference. For a visual PNG/SVG, see `docs/entity-relationship.png` (to be added).
