# CRT Stories: Architecture, Design, and Style Reference

## Project Architecture

- **Framework:** Vite + React + TypeScript + Vike (Static Site Generation)
- **Content:** All books, worlds, characters, and author info are managed via JSON in `src/content/`
- **Pages:** Located in `src/pages/` using Vike conventions (`+Page.tsx`, `+Head.tsx`, etc.)
- **Assets:** Images in `public/images/{books,characters,worlds,author}/`
- **Config:** Global site config in `src/config.ts`
- **Validation:** Content validation in `src/content/validation.ts`
- **Deployment:** Static output for Cloudflare Pages

## Design & Style Guide

- **Layout:**
  - Flex layouts for detail pages (books, worlds, characters, about)
  - Consistent card grid for list pages
  - Responsive, mobile-friendly design
- **Typography:**
  - Headings: bold, clear hierarchy
  - Body: readable, modern sans-serif
- **Color Palette:**
  - Primary: #2d5a88 (blue)
  - Secondary: #e6eef7 (light blue)
  - Accent: #f7d774 (gold for badges)
  - Neutral: #f7f7f7, #444, #666
- **Buttons:**
  - Primary: solid blue, white text
  - Secondary: light blue, blue text
  - Consistent size, padding, and border-radius
- **Badges & Tags:**
  - Badges: gold background, bold text
  - Tags: light blue background, blue text
  - Consistent placement and spacing

## Reference Files

- `README.md`: Project overview, setup, and workflow
- `src/config.ts`: Site-wide settings (title, author, baseUrl, etc.)
- `src/content/validation.ts`: Content schema and validation logic
- `src/pages/Layout.css`: All layout, card, button, badge, and tag styles
- `src/pages/[entity]/index/+Page.tsx`: List pages for books, worlds, characters
- `src/pages/[entity]/@slug/+Page.tsx`: Detail pages for books, worlds, characters
- `src/pages/about/+Page.tsx`: About the Author page
- `src/content/author.json`: Author bio and metadata
- `src/content/books.json`, `worlds.json`, `characters.json`: Main content data

## Best Practices

- **Type Safety:** All content and config are strongly typed
- **Validation:** Strict validation at build time; build fails on invalid content
- **SEO:** Meta tags in each page's `+Head.tsx`
- **No runtime SSR:** All logic must be compatible with static output
- **Consistent UI:** Use shared CSS classes and patterns for all cards, buttons, badges, and tags

## Useful Links

- [Vike Documentation](https://vike.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

For any new code or content, follow the patterns and conventions in the files above. For design changes, update `Layout.css` and reference this guide for color, spacing, and component usage.
