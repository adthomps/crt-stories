# CRT Stories: Local Development

## Prerequisites
- Node.js 20+
- npm (pnpm/yarn not used)

## Setup
```bash
npm install
```

## Start Dev Server
```bash
npm run dev
```
- Runs Vite dev server (default port 5173)
- Access at http://localhost:5173

## Build & Preview
```bash
npm run build
npm run preview
```

## Content Validation
- All content in `src/content/` is validated at build time
- Build fails on any invalid content

## Scripts
- See `scripts/` for D1 migration/export scripts

---
For more, see README.md and ARCHITECTURE.md.
