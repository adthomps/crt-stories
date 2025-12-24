# CRT Stories: Project Architecture

- **Framework:** Vite + React + TypeScript + Vike (Static Site Generation)
- **Content:** All books, worlds, characters, and author info are managed via JSON in `src/content/`
- **Pages:** Located in `src/pages/` using Vike conventions (`+Page.tsx`, `+Head.tsx`, etc.)
- **Assets:** Images in `public/images/{books,characters,worlds,author}/`
- **Config:** Global site config in `src/config.ts`
- **Validation:** Content validation in `src/content/validation.ts`
- **Deployment:** Static output for Cloudflare Pages
