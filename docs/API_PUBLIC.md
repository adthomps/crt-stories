# CRT Stories: Public API

## Overview
- All public API endpoints are served from `/api/public/*` via Cloudflare Pages Functions in `functions/api/public/`
- Stable, versioned endpoints for public consumption

## Endpoints
- `/api/public/books` – Public book data
- `/api/public/worlds` – Public world data
- `/api/public/characters` – Public character data
- `/api/public/series` – Public series data

## Conventions
- No UI-specific logic or view models
- Must be stable and backward compatible

---
For more, see PROJECT_RULES.md and src/content/validation.ts.
