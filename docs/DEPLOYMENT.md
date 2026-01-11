# CRT Stories: Deployment

## Cloudflare Pages
- Static output only (no SSR)
- Build command: `npm run build`
- Output directory: `dist/client`
- Connect repo to Cloudflare Pages for preview/prod

## Cloudflare Workers
- Internal API: deployed to /api/*
- Public API: deployed to /v1/*
- Use GitHub Actions for deployment if present

## Content Export
- Use `scripts/export-d1-to-json.ts` to sync D1 to JSON
- Automated via `.github/workflows/export-content.yml`

## Environment Variables
- All secrets (API tokens, DB IDs) must be set in Cloudflare/Actions, not in repo

---
For more, see README.md and PROJECT_RULES.md.
