# CRT Stories: Project Rules & Guardrails

This document defines the architecture, boundaries, and guardrails for the CRT Stories repository.

---

## Monorepo Boundaries
- **SPA:** All frontend code is in `src/` (Vite + React + Vike SSG)
- **API:**
  - Internal API worker: `functions/api/worker/` (serves `/api/*`)
  - Public API worker: `functions/api/public/` (serves `/v1/*`)
- **Business Logic:** All core logic and validation is in `src/content/` and `src/config.ts`
- **No cross-imports:** Do not import from `functions/` or `scripts/` into `src/` (and vice versa)
- **No runtime SSR:** All logic must be compatible with static output

## Data Layers
- **Cloudflare D1:**
  - Used for admin CRUD and content management
  - All published content is exported to JSON in `src/content/` via scripts
- **No direct DB access in SPA:** All data for the SPA is loaded from static JSON

## Validation
- **Centralized schemas:** All validation logic is in `src/content/validation.ts` and `src/content/validationSchemas.ts`
- **Build fails on invalid content:** All content must pass validation before deployment

## Routing & API
- **SPA fetches:** Use only relative fetch(`/api/...`) for internal API
- **Public API:** All public endpoints must be versioned under `/v1/`
- **No UI-specific logic in public API**

## Deployment
- **Cloudflare Pages:** Static site output only
- **Cloudflare Workers:** Used for API endpoints only
- **GitHub Actions:** Used for automated content export and deployment

## Security
- **Admin UI:** Only accessible via `/worker` route, protected by authentication
- **No secrets in repo:** All secrets must be managed via environment variables or GitHub Actions secrets

---

For more details, see `ARCHITECTURE.md`, `README.md`, and `.github/copilot-instructions.md`.
