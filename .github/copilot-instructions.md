# Copilot Instructions for CRT Stories

## Project Overview
- **Static author website** built with Vite, React, TypeScript, and Vike (Static Site Generation framework)
- **All content** (books, worlds, characters) is managed via JSON files in `src/content/` and validated at build time
- **No server-side rendering at runtime**; all pages are pre-rendered for Cloudflare Pages

## Key Architecture & Patterns
- **Pages**: Located in `src/pages/` using Vike conventions (`+Page.tsx`, `+Head.tsx`, `+onBeforePrerenderStart.ts`)
  - Dynamic routes: `/books/:slug`, `/worlds/:slug`, `/characters/:slug`
  - Each entity type has an `index/` (list) and `@slug/` (detail) subfolder
- **Content Validation**: Implemented in `src/content/validation.ts` and enforced in `src/content/index.ts`
  - Build fails if content is invalid (missing fields, bad slugs, duplicate slugs, etc.)
- **Site config**: `src/config.ts` holds global site settings (title, description, baseUrl, author)
- **Assets**: Images are in `public/images/{books,characters,worlds}/`

## Developer Workflows
- **Install**: `npm install`
- **Dev server**: `npm run dev` (default Vite port, can override with `npx vite --port=4000`)
- **Build**: `npm run build` (runs content validation)
- **Preview**: `npm run preview` (serves built static site)
- **Deploy**: Optimized for Cloudflare Pages (`dist/client` output)

## Project-Specific Conventions
- **Slugs**: Lowercase, alphanumeric, hyphens only; must be unique across all content
- **Content**: Add/edit JSON in `src/content/`; validation is strict and automatic
- **Type Safety**: All content and config are strongly typed with TypeScript interfaces
- **SEO**: Each page defines meta tags in `+Head.tsx` (see `src/pages/`)
- **No runtime SSR**: All logic must be compatible with static site output

## Integration Points
- **Vike**: Handles routing, page config, and static site generation
- **Cloudflare Pages**: Deployment target; no server code required

## Examples
- To add a new book: Edit `src/content/books.json` and add a new object with required fields
- To add a new page: Create a new folder in `src/pages/` following Vike's conventions
- To update site-wide settings: Edit `src/config.ts`

## References
- See `src/content/validation.ts` and `src/content/index.ts` for validation logic
- See `src/pages/` for routing and page structure
- See `README.md` for more details on workflows and content structure

---
For any new code, follow the established patterns in `src/pages/` and `src/content/`. Ensure all content changes pass validation before building or deploying.
